import glob
import re
import os

screens = glob.glob('src/screens/**/*.html', recursive=True)
screens.append('index.html')
print(f"Checking navigation links across {len(screens)} screens...")
broken_links = []
hash_links = []

for s in sorted(screens):
    with open(s, 'r', encoding='utf-8') as f:
        content = f.read()
    s_dir = os.path.dirname(s)
    # find all <a href=...>
    hrefs = re.findall(r'<a[^>]*href=["\']([^"\']+)["\']', content)
    for h in hrefs:
        if h == '#' or h.startswith('#'):
            # check if it's a valid local anchor in the page
            anchor = h[1:]
            if anchor and (f'id="{anchor}"' in content or f"id='{anchor}'" in content):
                continue
            hash_links.append((s, h))
        elif not h.startswith('http') and not h.startswith('mailto:') and not h.startswith('javascript:'):
            target = os.path.normpath(os.path.join(s_dir, h.split('?')[0].split('#')[0]))
            if not os.path.exists(target):
                broken_links.append((s, h, target))

    # find window.location.href or window.location.replace
    locs = re.findall(r'window\.location\.(?:href|replace)\s*=\s*["\']([^"\']+)["\']', content)
    for l in locs:
        if not l.startswith('http'):
            target = os.path.normpath(os.path.join(s_dir, l.split('?')[0].split('#')[0]))
            if not os.path.exists(target):
                broken_links.append((s, l, target))

print(f"Broken local links: {len(broken_links)}")
for b in broken_links:
    print("  FAIL:", b)

print(f"Dead hash links (#): {len(hash_links)}")
for hl in hash_links:
    print("  HASH:", hl)

if len(broken_links) == 0 and len(hash_links) == 0:
    print("ALL NAVIGATION LINKS AND REDIRECTS ARE 100% VALID AND REACHABLE!")
