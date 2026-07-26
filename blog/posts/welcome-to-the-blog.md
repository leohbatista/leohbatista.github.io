---
title: Welcome to the Blog
date: 2026-07-22
author: Leonardo H. Batista
---

# Welcome

This is the first post. Content lives in a markdown file per post, named after
its `slug`, and is fetched and rendered client-side when this page loads.

## How it works

- The list page reads `blog/posts.json` for the title, description and slug of each post.
- Each entry links to `/blog/post.html?slug=<slug>`.
- This page reads the `slug` from the URL, fetches `posts/<slug>.md`, strips the
  metadata block above, and renders the rest as HTML.

Basic **bold**, *italic* and `inline code` all work, along with [links](/index.html).

```
Code blocks work too.
```
