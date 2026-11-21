import os
import re
import glob
import json

print("=== [W1-1] STRUCTURE & SOURCE FILES CHECK ===")
expected_screens = {
    'auth': ['intro.html', 'login.html', 'register.html'],
    'trip': ['home.html', 'plan.html', 'proposal.html', 'itinerary.html', 'edit_plan.html', 'suggestion.html', 'map.html'],
    'finance': ['budget.html', 'spending.html'],
    'account': ['profile.html', 'delete_account.html']
}
missing_screens = []
viewport_missing = []
for folder, files in expected_screens.items():
    for f in files:
        p = os.path.join('src', 'screens', folder, f)
        if not os.path.exists(p):
            missing_screens.append(p)
        else:
            txt = open(p, encoding='utf-8').read()
            if not re.search(r'<meta[^>]+name=["\']viewport["\'][^>]+viewport-fit=cover', txt):
                viewport_missing.append(p)

print("Missing screens:", missing_screens)
print("Missing viewport-fit=cover:", viewport_missing)

expected_css_pages = ['auth.css', 'home.css', 'plan.css', 'itinerary.css', 'map.css', 'edit.css', 'budget.css', 'profile.css']
missing_css = [c for c in expected_css_pages if not os.path.exists(os.path.join('src', 'css', 'pages', c))]
print("base.css exists:", os.path.exists('src/css/base.css'))
print("components css count:", len(glob.glob('src/css/components/*.css')))
print("Missing page css:", missing_css)

base_css = open('src/css/base.css', encoding='utf-8').read()
print("base.css has safe-area-inset-top:", 'safe-area-inset-top' in base_css)
print("base.css has safe-area-inset-bottom:", 'safe-area-inset-bottom' in base_css)
print("base.css has 100dvh:", '100dvh' in base_css)

js_dirs = ['core', 'services', 'features', 'components', 'native']
print("src/js dirs exist:", {d: os.path.isdir(os.path.join('src', 'js', d)) for d in js_dirs})
print("src/images subdirs:", sorted(os.listdir('src/images')))
print("index.html exists:", os.path.exists('index.html'))

print("\n=== [W1-2] CONFIGS & LEGACY FALLBACK CHECK ===")
pkg = json.load(open('package.json', encoding='utf-8'))
print("package scripts:", pkg.get('scripts'))
print("package deps:", list(pkg.get('dependencies', {}).keys()), list(pkg.get('devDependencies', {}).keys()))
print("capacitor.config.ts exists:", os.path.exists('capacitor.config.ts'))
print("android/ exists:", os.path.isdir('android'))
print(".env.example exists:", os.path.exists('.env.example'))
print(".gitignore exists:", os.path.exists('.gitignore'))
gi = open('.gitignore', encoding='utf-8').read()
print(".gitignore ignores:", [x for x in ['node_modules/', 'dist/', '.vite/', '.env'] if x in gi])
print("legacy files:", {f: os.path.exists(f) for f in ['HowToRunFrontend.md', 'run.bat', 'main.js', 'main.py']})

print("\n=== [W1-6] DOCS CHECK ===")
print("docs/frontend-ui-inventory.md exists:", os.path.exists('docs/frontend-ui-inventory.md'))
print("README.md exists:", os.path.exists('README.md'))
print("tests/smoke-test-week1.md exists:", os.path.exists('tests/smoke-test-week1.md'))
