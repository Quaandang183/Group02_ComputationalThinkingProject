/**
 * TripWise - Main Local Development Server
 * Tự động khởi động local HTTP server và tự động mở trình duyệt với màn hình đăng nhập (login.html)
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

const PORT = process.env.PORT || 3000;
const ROOT_DIR = __dirname;

const MIME_TYPES = {
  '.html': 'text/html; charset=UTF-8',
  '.css': 'text/css; charset=UTF-8',
  '.js': 'application/javascript; charset=UTF-8',
  '.json': 'application/json; charset=UTF-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.webp': 'image/webp',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf'
};

const server = http.createServer((req, res) => {
  // Chuẩn hóa URL, loại bỏ query string
  let requestPath = decodeURI(req.url.split('?')[0]);

  // Nếu vào trang gốc '/', tự động phục vụ intro.html (đáp ứng yêu cầu mới vào ở màn hình đăng nhập)
  if (requestPath === '/' || requestPath === '') {
    requestPath = '/intro.html';
  }

  const filePath = path.join(ROOT_DIR, requestPath);

  // Bảo mật: ngăn directory traversal ra ngoài ROOT_DIR
  if (!filePath.startsWith(ROOT_DIR)) {
    res.writeHead(403, { 'Content-Type': 'text/plain; charset=UTF-8' });
    res.end('403 Forbidden');
    return;
  }

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      res.writeHead(404, { 'Content-Type': 'text/html; charset=UTF-8' });
      res.end(`
        <!DOCTYPE html>
        <html>
        <head><title>404 Not Found - TripWise</title></head>
        <body style="font-family: sans-serif; text-align: center; padding: 50px; background: #faf8f2; color: #1e3f20;">
          <h2>404 - Không tìm thấy trang</h2>
          <p>Đường dẫn <code>${requestPath}</code> không tồn tại.</p>
          <a href="/login.html" style="color: #0b8457; font-weight: bold;">Quay lại màn hình đăng nhập</a>
        </body>
        </html>
      `);
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    res.writeHead(200, {
      'Content-Type': contentType,
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Access-Control-Allow-Origin': '*'
    });

    const readStream = fs.createReadStream(filePath);
    readStream.pipe(res);
  });
});

server.listen(PORT, () => {
  const url = `http://localhost:${PORT}/intro.html`;
  console.log('====================================================');
  console.log('       TRIPWISE LOCAL WEB SERVER ĐANG CHẠY          ');
  console.log('====================================================');
  console.log(`- Địa chỉ máy chủ: ${url}`);
  console.log(`- Thư mục gốc:    ${ROOT_DIR}`);
  console.log(`- Màn hình khởi động mặc định: intro.html`);
  console.log('----------------------------------------------------');
  console.log('Nhấn Ctrl + C để dừng máy chủ.');
  console.log('====================================================\n');

  // Tự động mở trình duyệt mặc định trên Windows/macOS/Linux
  const startCmd = process.platform === 'win32'
    ? `start "" "${url}"`
    : process.platform === 'darwin'
      ? `open "${url}"`
      : `xdg-open "${url}"`;

  exec(startCmd, (error) => {
    if (error) {
      console.log(`Hãy mở trình duyệt và truy cập: ${url}`);
    } else {
      console.log('>> Đã tự động mở trình duyệt!');
    }
  });
});

