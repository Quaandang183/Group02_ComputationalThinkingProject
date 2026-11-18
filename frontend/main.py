import http.server
import socketserver
import webbrowser
import os
import sys

PORT = 3000
DIRECTORY = os.path.dirname(os.path.abspath(__file__))

class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)

    def do_GET(self):
        # Entry Point: Mặc định truy cập '/' hoặc rỗng hoặc '/index.html' sẽ đưa vào /src/screens/intro.html
        if self.path in ['/', '', '/index.html', '/intro.html']:
            self.path = '/src/screens/intro.html'
        else:
            rel_path = self.path.split('?')[0].split('#')[0].lstrip('/')
            # Nếu đường dẫn không tồn tại ở root, fallback sang src/screens/
            if not os.path.exists(os.path.join(DIRECTORY, rel_path)):
                screens_fallback = os.path.join(DIRECTORY, 'src', 'screens', rel_path)
                if os.path.exists(screens_fallback):
                    self.path = f"/src/screens/{rel_path}"
                else:
                    src_fallback = os.path.join(DIRECTORY, 'src', rel_path)
                    if os.path.exists(src_fallback):
                        self.path = f"/src/{rel_path}"

        return super().do_GET()

def run():
    url = f"http://localhost:{PORT}/src/screens/intro.html"
    print("=" * 52)
    print("       TRIPWISE PYTHON LOCAL WEB SERVER")
    print("=" * 52)
    print(f"- Địa chỉ: {url}")
    print(f"- Thư mục: {DIRECTORY}")
    print(f"- Màn hình khởi động mặc định (Entry point): /src/screens/intro.html")
    print("-" * 52)
    print("Nhấn Ctrl + C để dừng.")
    print("=" * 52)

    webbrowser.open(url)

    with socketserver.TCPServer(("", PORT), Handler) as httpd:
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nĐã tắt server.")
            sys.exit(0)

if __name__ == '__main__':
    run()
