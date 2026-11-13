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
        # Mặc định truy cập '/' sẽ đưa vào intro.html
        if self.path == '/' or self.path == '':
            self.path = '/intro.html'
        return super().do_GET()

def run():
    url = f"http://localhost:{PORT}/intro.html"
    print("=" * 52)
    print("       TRIPWISE PYTHON LOCAL WEB SERVER")
    print("=" * 52)
    print(f"- Địa chỉ: {url}")
    print(f"- Thư mục: {DIRECTORY}")
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

