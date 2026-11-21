import os
import re
import glob

screens = sorted(glob.glob('src/screens/**/*.html', recursive=True))
for s in screens:
    txt = open(s, encoding='utf-8').read()
    sdir = os.path.dirname(s)
    # 1. CSS order check
    css_links = [m for m in re.findall(r'<link[^>]+href=["\']([^"\']+\.css)["\']', txt)]
    base_idx = next((i for i, c in enumerate(css_links) if 'base.css' in c), -1)
    comp_idxs = [i for i, c in enumerate(css_links) if 'css/components' in c]
    page_idxs = [i for i, c in enumerate(css_links) if 'css/pages' in c]
    css_ok = (base_idx == 0) and (not comp_idxs or max(comp_idxs) > base_idx) and (not page_idxs or min(page_idxs) > (max(comp_idxs) if comp_idxs else base_idx))

    # 2. Check all local src/href files exist
    missing_assets = []
    for attr in re.findall(r'(?:src|href)=["\']([^"\']+)["\']', txt):
        if attr.startswith(('http', 'mailto:', 'javascript:', 'data:', '#')):
            continue
        target = os.path.normpath(os.path.join(sdir, attr.split('?')[0].split('#')[0]))
        if not os.path.exists(target):
            missing_assets.append((attr, target))

    # 3. Check script tags
    scripts = re.findall(r'<script[^>]+src=["\']([^"\']+)["\']', txt)
    bad_scripts = [sc for sc in scripts if ('components/' in sc or 'services/' in sc) and 'js/' not in sc]

    # 4. Check bottom bar active tab if present
    bbar = re.findall(r'<app-bottom-bar[^>]*>', txt)

    print(f"{os.path.basename(s):20s} | CSS_ORDER={css_ok} | MISSING={len(missing_assets)} | BAD_SCRIPTS={len(bad_scripts)} | SCRIPTS={scripts} | BBAR={bbar}")
    if missing_assets:
        print("   MISSING:", missing_assets)
