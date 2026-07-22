// Minimal markdown + front-matter parsing, dependency-free by design.

function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function parseFrontMatter(raw) {
  const match = raw.match(/^---\s*\n([\s\S]*?)\n---\s*\n?/);
  if (!match) return { metadata: {}, body: raw };

  const metadata = {};
  match[1].split('\n').forEach((line) => {
    const idx = line.indexOf(':');
    if (idx === -1) return;
    const key = line.slice(0, idx).trim();
    const value = line.slice(idx + 1).trim().replace(/^["']|["']$/g, '');
    metadata[key] = value;
  });

  return { metadata, body: raw.slice(match[0].length) };
}

function renderImage(alt, src, width, height) {
  const attrs = [`src="${src}"`, `alt="${alt}"`];
  if (width) attrs.push(`width="${width}"`);
  if (height) attrs.push(`height="${height}"`);
  return `<img ${attrs.join(' ')}>`;
}

function renderInline(text) {
  let html = escapeHtml(text);
  // ![alt](src =WxH) — size suffix is optional; W and/or H may be omitted (e.g. =300x, =x200, =300x200).
  html = html.replace(/!\[([^\]]*)\]\(([^)\s]+)(?:\s+=(\d+)?x(\d+)?)?\)/g, (match, alt, src, width, height) =>
    renderImage(alt, src, width, height)
  );
  html = html.replace(/`([^`]+)`/g, '<code>$1</code>');
  html = html.replace(/~~([^~]+)~~/g, '<del>$1</del>');
  html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/(?<!\*)\*([^*]+)\*(?!\*)/g, '<em>$1</em>');
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');
  return html;
}

const HR_RE = /^ {0,3}((?:-\s*){3,}|(?:\*\s*){3,}|(?:_\s*){3,})$/;
const ORDERED_ITEM_RE = /^\d+\.\s+/;
const TABLE_SEP_RE = /^\s*\|?\s*:?-+:?\s*(\|\s*:?-+:?\s*)*\|?\s*$/;

function splitTableRow(line) {
  let trimmed = line.trim();
  if (trimmed.startsWith('|')) trimmed = trimmed.slice(1);
  if (trimmed.endsWith('|')) trimmed = trimmed.slice(0, -1);
  return trimmed.split('|').map((cell) => cell.trim());
}

function parseAlign(cell) {
  const left = cell.startsWith(':');
  const right = cell.endsWith(':');
  if (left && right) return 'center';
  if (right) return 'right';
  if (left) return 'left';
  return null;
}

function renderMarkdown(markdown) {
  const lines = markdown.replace(/\r\n/g, '\n').split('\n');
  const htmlParts = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    if (line.trim() === '') { i++; continue; }

    if (line.startsWith('```')) {
      const code = [];
      i++;
      while (i < lines.length && !lines[i].startsWith('```')) {
        code.push(lines[i]);
        i++;
      }
      i++; // skip closing fence
      htmlParts.push(`<pre><code>${escapeHtml(code.join('\n'))}</code></pre>`);
      continue;
    }

    const heading = line.match(/^(#{1,6})\s+(.*)$/);
    if (heading) {
      const level = heading[1].length;
      htmlParts.push(`<h${level}>${renderInline(heading[2])}</h${level}>`);
      i++;
      continue;
    }

    if (HR_RE.test(line)) {
      htmlParts.push('<hr>');
      i++;
      continue;
    }

    if (line.match(/^>\s?/)) {
      const quote = [];
      while (i < lines.length && lines[i].match(/^>\s?/)) {
        quote.push(lines[i].replace(/^>\s?/, ''));
        i++;
      }
      htmlParts.push(`<blockquote>${renderInline(quote.join(' '))}</blockquote>`);
      continue;
    }

    if (line.includes('|') && i + 1 < lines.length && TABLE_SEP_RE.test(lines[i + 1])) {
      const headerCells = splitTableRow(line);
      const aligns = splitTableRow(lines[i + 1]).map(parseAlign);
      i += 2;

      const bodyRows = [];
      while (i < lines.length && lines[i].trim() !== '' && lines[i].includes('|')) {
        bodyRows.push(splitTableRow(lines[i]));
        i++;
      }

      const alignStyle = (index) => (aligns[index] ? ` style="text-align:${aligns[index]}"` : '');
      const headHtml = headerCells.map((cell, index) => `<th${alignStyle(index)}>${renderInline(cell)}</th>`).join('');
      const bodyHtml = bodyRows.map((row) => `<tr>${row.map((cell, index) => `<td${alignStyle(index)}>${renderInline(cell)}</td>`).join('')}</tr>`).join('');

      htmlParts.push(`<table><thead><tr>${headHtml}</tr></thead><tbody>${bodyHtml}</tbody></table>`);
      continue;
    }

    if (line.match(/^[-*]\s+/)) {
      const items = [];
      while (i < lines.length && lines[i].match(/^[-*]\s+/)) {
        items.push(`<li>${renderInline(lines[i].replace(/^[-*]\s+/, ''))}</li>`);
        i++;
      }
      htmlParts.push(`<ul>${items.join('')}</ul>`);
      continue;
    }

    if (ORDERED_ITEM_RE.test(line)) {
      const items = [];
      while (i < lines.length && ORDERED_ITEM_RE.test(lines[i])) {
        items.push(`<li>${renderInline(lines[i].replace(ORDERED_ITEM_RE, ''))}</li>`);
        i++;
      }
      htmlParts.push(`<ol>${items.join('')}</ol>`);
      continue;
    }

    const paragraph = [];
    while (
      i < lines.length &&
      lines[i].trim() !== '' &&
      !lines[i].match(/^(#{1,6})\s+|^```|^[-*]\s+|^>\s?/) &&
      !ORDERED_ITEM_RE.test(lines[i]) &&
      !HR_RE.test(lines[i]) &&
      !(lines[i].includes('|') && i + 1 < lines.length && TABLE_SEP_RE.test(lines[i + 1]))
    ) {
      paragraph.push(lines[i]);
      i++;
    }
    htmlParts.push(`<p>${renderInline(paragraph.join(' '))}</p>`);
  }

  return htmlParts.join('\n');
}
