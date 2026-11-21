import os
import re
import glob

print("=== PHASE 2: CSS & JS COMPONENTS IMAGE CHECK ===")
css_files = sorted(glob.glob('src/css/**/*.css', recursive=True))
for cf in css_files:
    txt = open(cf, encoding='utf-8').read()
    cdir = os.path.dirname(cf)
    urls = [u.strip('\'" ') for u in re.findall(r'url\(([^)]+)\)', txt)]
    local_urls = [u for u in urls if not u.startswith(('http', 'data:')) and not u.endswith('.css')]
    broken = []
    for u in local_urls:
        target = os.path.normpath(os.path.join(cdir, u))
        if not os.path.exists(target):
            broken.append((u, target))
    if local_urls or broken:
        print(f"  {cf}: {len(local_urls)} local image url(s), broken={len(broken)} -> {local_urls}")
        if broken:
            print("    BROKEN:", broken)

js_files = sorted(glob.glob('src/js/**/*.js', recursive=True)) + ['main.js']
for jf in js_files:
    txt = open(jf, encoding='utf-8').read()
    # Image paths rendered by JS components are evaluated relative to src/screens/<cluster>/*.html
    img_refs = re.findall(r'["\'`]([^"\'`]*images/[^"\'`]+)["\'`]', txt)
    if img_refs:
        broken = []
        for ir in img_refs:
            if '${' in ir:
                continue
            target = os.path.normpath(os.path.join('src/screens/trip', ir))
            if not os.path.exists(target):
                broken.append((ir, target))
        print(f"  {jf}: {len(img_refs)} image ref(s) (resolved from src/screens/*/), broken={len(broken)}")
        if broken:
            print("    BROKEN:", broken)

print("\n=== PHASE 3: PER-SCREEN IMAGE EXISTENCE VERIFICATION ===")
screens = sorted(glob.glob('src/screens/**/*.html', recursive=True))
for sf in screens:
    txt = open(sf, encoding='utf-8').read()
    sdir = os.path.dirname(sf)
    # Match src="..." / href="..." containing images/ and inline style url(...)
    refs = re.findall(r'(?:src|href)=["\']([^"\']*images/[^"\']+)["\']', txt)
    refs += [u.strip('\'" ') for u in re.findall(r'url\(([^)]*images/[^)]+)\)', txt)]
    broken = []
    for r in refs:
        if '${' in r:
            continue
        target = os.path.normpath(os.path.join(sdir, r.split('?')[0].split('#')[0]))
        if not os.path.exists(target):
            broken.append((r, target))
    print(f"  {sf:42s} | total_img_refs={len(refs):2d} | broken={len(broken)} | sample={refs[:1]}")
    if broken:
        print("    BROKEN:", broken)
