#!/usr/bin/env python3
"""Re-apply the shared header/footer (tools/page-template.html) to every page.

The pages in the repo root are the source of truth for CONTENT. Only use this
when you change something shared (nav, header, footer, fonts, script tags):
edit tools/page-template.html, then run  python3 tools/reshell.py  from the
repo root. Each page's <title>, description, sidebar setting, and <main>
content are preserved.
"""
import pathlib, re, sys
root = pathlib.Path(__file__).resolve().parent.parent
tpl = (root / "tools" / "page-template.html").read_text()
for f in sorted(root.glob("*.html")):
    src = f.read_text()
    m = re.search(r"<main class=\"content\" id=\"main\">\n?(.*?)\n?  </main>", src, re.S)
    if not m:
        print("skip (no <main>):", f.name); continue
    body = m.group(1)
    title = re.search(r"<title>(.*?) · Everything FTC</title>", src)
    desc = re.search(r'<meta name="description" content="(.*?)">', src)
    noside = 'class="page no-side"' in src
    html = (tpl.replace("{{TITLE}}", title.group(1) if title else f.stem.title())
               .replace("{{DESC}}", desc.group(1) if desc else "")
               .replace("{{PAGECLASS}}", " no-side" if noside else "")
               .replace("{{SIDEBAR}}", "" if noside else '  <aside class="sidebar" aria-label="On this page"></aside>')
               .replace("{{BODY}}", body.strip()))
    if html != src:
        f.write_text(html); print("reshelled", f.name)
print("done")
