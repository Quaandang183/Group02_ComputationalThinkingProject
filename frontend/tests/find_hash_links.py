with open('src/screens/auth/login.html', 'r', encoding='utf-8') as f:
    for i, line in enumerate(f):
        if 'href="#"' in line or "href='#'" in line:
            print(f"login.html:{i+1}: {line.strip()}")

with open('src/screens/trip/home.html', 'r', encoding='utf-8') as f:
    for i, line in enumerate(f):
        if 'href="#"' in line or "href='#'" in line:
            print(f"home.html:{i+1}: {line.strip()}")
