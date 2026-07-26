const PAGE_SIZE = 5;

function cardTemplate(post) {
  return `
    <a href="/blog/post.html?slug=${encodeURIComponent(post.slug)}"
      class="group block p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:border-primary-400 dark:hover:border-primary-600 bg-zinc-50 dark:bg-zinc-900 hover:bg-primary-50 dark:hover:bg-primary-950 transition-all">
      <h3 class="font-semibold text-lg mb-1 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">${post.title}</h3>
      <p class="text-sm text-zinc-500 dark:text-zinc-400">${post.description}</p>
    </a>`;
}

function renderPagination(page, totalPages) {
  const el = document.getElementById('pagination');
  if (totalPages <= 1) { el.innerHTML = ''; return; }

  const prevDisabled = page <= 1;
  const nextDisabled = page >= totalPages;

  el.innerHTML = `
    <a href="?page=${page - 1}" aria-disabled="${prevDisabled}"
      class="px-3 py-1.5 rounded-md text-sm font-medium border border-zinc-300 dark:border-zinc-700 ${prevDisabled ? 'pointer-events-none opacity-40' : 'hover:bg-zinc-100 dark:hover:bg-zinc-800'}">Previous</a>
    <span class="text-sm text-zinc-500 dark:text-zinc-400">Page ${page} of ${totalPages}</span>
    <a href="?page=${page + 1}" aria-disabled="${nextDisabled}"
      class="px-3 py-1.5 rounded-md text-sm font-medium border border-zinc-300 dark:border-zinc-700 ${nextDisabled ? 'pointer-events-none opacity-40' : 'hover:bg-zinc-100 dark:hover:bg-zinc-800'}">Next</a>`;
}

async function initBlogList() {
  const container = document.getElementById('post-list');
  const page = Math.max(1, parseInt(new URLSearchParams(location.search).get('page'), 10) || 1);

  let posts;
  try {
    const res = await fetch('/blog/posts.json');
    posts = await res.json();
  } catch (err) {
    container.innerHTML = '<p class="text-zinc-500 dark:text-zinc-400">Could not load posts.</p>';
    return;
  }

  const totalPages = Math.max(1, Math.ceil(posts.length / PAGE_SIZE));
  const start = (page - 1) * PAGE_SIZE;
  const pagePosts = posts.slice(start, start + PAGE_SIZE);

  container.innerHTML = pagePosts.length
    ? pagePosts.map(cardTemplate).join('')
    : '<p class="text-zinc-500 dark:text-zinc-400">No posts yet.</p>';

  renderPagination(page, totalPages);
}

initBlogList();
