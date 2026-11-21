import os
import re
import json
import glob

print("=== CHECKING SCREENS ===")
screens = glob.glob('src/screens/**/*.html', recursive=True)
print(f"Total screens found: {len(screens)}")
for s in sorted(screens):
    with open(s, 'r', encoding='utf-8') as f:
        content = f.read()
    scripts = re.findall(r'<script[^>]*src=[\"\']([^\"\']+)[\"\']', content)
    links = [l for l in re.findall(r'<link[^>]*href=[\"\']([^\"\']+)[\"\']', content) if not l.startswith('http')]
    imgs = re.findall(r'<img[^>]*src=[\"\']([^\"\']+)[\"\']', content)
    print(f"\n{s}:")
    print(f"  Scripts: {scripts}")
    print(f"  Links: {links}")
    print(f"  Img sample: {imgs[:2]} (total imgs: {len(imgs)})")

print("\n=== CHECKING PACKAGE.JSON ===")
if os.path.exists('package.json'):
    with open('package.json', 'r', encoding='utf-8') as f:
        pkg = json.load(f)
    print("scripts:", pkg.get("scripts"))
    print("dependencies:", list(pkg.get("dependencies", {}).keys()))
    print("devDependencies:", list(pkg.get("devDependencies", {}).keys()))

print("\n=== CHECKING VITE.CONFIG.JS ===")
if os.path.exists('vite.config.js'):
    with open('vite.config.js', 'r', encoding='utf-8') as f:
        print(f.read())

print("\n=== CHECKING CAPACITOR CONFIG ===")
for c_file in ['capacitor.config.json', 'capacitor.config.ts', 'capacitor.config.js']:
    if os.path.exists(c_file):
        print(f"Found {c_file}")
        with open(c_file, 'r', encoding='utf-8') as f:
            print(f.read())

print("\n=== CHECKING ROOT INDEX.HTML ===")
if os.path.exists('index.html'):
    with open('index.html', 'r', encoding='utf-8') as f:
        print(f.read())

print("\n=== CHECKING .ENV.EXAMPLE & .GITIGNORE ===")
print(".env.example exists:", os.path.exists('.env.example'))
print(".gitignore exists:", os.path.exists('.gitignore'))
if os.path.exists('.gitignore'):
    with open('.gitignore', 'r', encoding='utf-8') as f:
        print(f.read())
