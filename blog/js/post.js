async function initBlogPost() {
  const container = document.getElementById('post-content');
  const slug = new URLSearchParams(location.search).get('slug');

  if (!slug) {
    container.innerHTML = '<p class="text-zinc-500 dark:text-zinc-400">No post specified.</p>';
    return;
  }

  let raw;
  try {
    const res = await fetch(`/blog/posts/${encodeURIComponent(slug)}.md`);
    if (!res.ok) throw new Error('not found');
    raw = await res.text();
  } catch (err) {
    container.innerHTML = '<p class="text-zinc-500 dark:text-zinc-400">Post not found.</p>';
    return;
  }

  const { metadata, body } = parseFrontMatter(raw);

  if (metadata.title) document.title = `${metadata.title} · Blog`;

  const dateLine = metadata.date
    ? `<p class="text-sm text-zinc-400 dark:text-zinc-500 mb-8">${metadata.date}${metadata.author ? ' · ' + metadata.author : ''}</p>`
    : '';

  container.innerHTML = `
    <h1 class="text-3xl sm:text-4xl font-bold tracking-tight mb-2">${metadata.title || slug}</h1>
    ${dateLine}
    <div class="prose prose-zinc dark:prose-invert max-w-none">${renderMarkdown(body)}</div>`;
}

initBlogPost();
