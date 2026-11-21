import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { spawn } from 'node:child_process';

const ROOT_DIR = path.resolve('dist');
const PORT = 4173;
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const CDP_PORT = 9305;

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

// 1. Static Web Server serving dist/
function startServer() {
  const server = http.createServer((req, res) => {
    let reqPath = decodeURI(req.url.split('?')[0].split('#')[0]);
    if (reqPath === '/' || reqPath === '') reqPath = '/index.html';

    let filePath = path.join(ROOT_DIR, reqPath);
    if (!fs.existsSync(filePath)) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=UTF-8' });
      res.end(`404 Not Found: ${reqPath}`);
      return;
    }

    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      filePath = path.join(filePath, 'index.html');
      if (!fs.existsSync(filePath)) {
        res.writeHead(404, { 'Content-Type': 'text/plain; charset=UTF-8' });
        res.end(`404 Not Found: ${reqPath}`);
        return;
      }
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';
    res.writeHead(200, { 'Content-Type': contentType, 'Access-Control-Allow-Origin': '*' });
    fs.createReadStream(filePath).pipe(res);
  });

  return new Promise((resolve) => {
    server.listen(PORT, '127.0.0.1', () => {
      console.log(`[Preview Server] Serving dist/ on http://127.0.0.1:${PORT}`);
      resolve(server);
    });
  });
}

// 2. CDP Client
class CDPClient {
  constructor(wsUrl) {
    this.ws = new WebSocket(wsUrl);
    this.id = 1;
    this.pending = new Map();
    this.listeners = new Map();
    this.ready = new Promise((resolve, reject) => {
      this.ws.onopen = resolve;
      this.ws.onerror = reject;
    });
    this.ws.onmessage = (ev) => {
      const msg = JSON.parse(ev.data);
      if (msg.id && this.pending.has(msg.id)) {
        const { resolve, reject } = this.pending.get(msg.id);
        this.pending.delete(msg.id);
        if (msg.error) reject(new Error(msg.error.message));
        else resolve(msg.result);
      } else if (msg.method && this.listeners.has(msg.method)) {
        for (const fn of this.listeners.get(msg.method)) fn(msg.params);
      }
    };
  }
  send(method, params = {}) {
    return new Promise((resolve, reject) => {
      const id = this.id++;
      this.pending.set(id, { resolve, reject });
      this.ws.send(JSON.stringify({ id, method, params }));
    });
  }
  on(method, fn) {
    if (!this.listeners.has(method)) this.listeners.set(method, []);
    this.listeners.get(method).push(fn);
  }
  close() {
    this.ws.close();
  }
}

async function getWsUrl(port) {
  for (let i = 0; i < 40; i++) {
    try {
      const res = await fetch(`http://127.0.0.1:${port}/json/list`);
      if (res.ok) {
        const list = await res.json();
        const page = list.find((t) => t.type === 'page');
        if (page) return page.webSocketDebuggerUrl;
      }
    } catch {}
    await new Promise((r) => setTimeout(r, 200));
  }
  throw new Error('Chrome DevTools failed to respond');
}

const SCREENS = [
  // Auth (3)
  { id: 'auth_intro', name: 'Giới thiệu', path: '/src/screens/auth/intro.html', cluster: 'auth' },
  { id: 'auth_login', name: 'Đăng nhập', path: '/src/screens/auth/login.html', cluster: 'auth' },
  { id: 'auth_register', name: 'Đăng ký', path: '/src/screens/auth/register.html', cluster: 'auth' },
  // Trip (7)
  { id: 'trip_home', name: 'Trang chủ', path: '/src/screens/trip/home.html', cluster: 'trip' },
  { id: 'trip_plan', name: 'Lập kế hoạch', path: '/src/screens/trip/plan.html', cluster: 'trip' },
  { id: 'trip_proposal', name: 'Đề xuất lịch trình', path: '/src/screens/trip/proposal.html', cluster: 'trip' },
  { id: 'trip_itinerary', name: 'Lịch trình chi tiết', path: '/src/screens/trip/itinerary.html', cluster: 'trip' },
  { id: 'trip_edit_plan', name: 'Chỉnh sửa kế hoạch', path: '/src/screens/trip/edit_plan.html', cluster: 'trip' },
  { id: 'trip_suggestion', name: 'Gợi ý AI', path: '/src/screens/trip/suggestion.html', cluster: 'trip' },
  { id: 'trip_map', name: 'Bản đồ', path: '/src/screens/trip/map.html', cluster: 'trip' },
  // Finance (2)
  { id: 'finance_budget', name: 'Tổng quan ngân sách', path: '/src/screens/finance/budget.html', cluster: 'finance' },
  { id: 'finance_spending', name: 'Quản lý chi tiêu', path: '/src/screens/finance/spending.html', cluster: 'finance' },
  // Account (2)
  { id: 'account_profile', name: 'Hồ sơ cá nhân', path: '/src/screens/account/profile.html', cluster: 'account' },
  { id: 'account_delete', name: 'Xóa tài khoản', path: '/src/screens/account/delete_account.html', cluster: 'account' }
];

const VIEWPORTS = [
  { label: '360x800', width: 360, height: 800 },
  { label: '393x852', width: 393, height: 852 },
  { label: '412x915', width: 412, height: 915 }
];

const DOM_INSPECTOR_JS = `(() => {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const scrollW = document.documentElement.scrollWidth;
  const hasMetaViewport = !!document.querySelector('meta[name="viewport"][content*="viewport-fit=cover"]');

  // Check overflow culprits
  const overflowElements = [];
  const all = document.querySelectorAll('*');
  all.forEach(el => {
    const rect = el.getBoundingClientRect();
    if (rect.right > vw + 1) {
      overflowElements.push({
        tag: el.tagName.toLowerCase(),
        cls: (el.className || '').toString().slice(0, 40),
        id: el.id || '',
        right: Math.round(rect.right)
      });
    }
  });

  // Check interactive elements (buttons, inputs)
  const smallTouchTargets = [];
  document.querySelectorAll('button, input[type="text"], input[type="password"], input[type="email"], select, a.btn, a.btn-primary').forEach(el => {
    const rect = el.getBoundingClientRect();
    if (rect.width > 0 && rect.height > 0) {
      if (rect.height < 40 || rect.width < 40) {
        // filter out hidden or tiny utility links
        if (!el.closest('.profile-item-arrow') && !el.classList.contains('auth-link')) {
          smallTouchTargets.push({
            tag: el.tagName.toLowerCase(),
            text: (el.textContent || el.placeholder || el.value || '').trim().slice(0, 25),
            width: Math.round(rect.width),
            height: Math.round(rect.height)
          });
        }
      }
    }
  });

  // Header & BottomBar detection
  const hasHeader = !!document.querySelector('app-header, .traveler-header, .profile-top-bar, .auth-top-nav, .plan-header');
  const hasBottomBar = !!document.querySelector('app-bottom-bar, .bottom-nav-bar, .itinerary-bottom-bar');

  return {
    vw,
    vh,
    scrollW,
    noOverflow: scrollW <= vw,
    hasMetaViewport,
    overflowCount: overflowElements.length,
    smallTouchCount: smallTouchTargets.length,
    hasHeader,
    hasBottomBar
  };
})()`;

async function main() {
  const server = await startServer();
  const userDataDir = fs.mkdtempSync(path.join(os.tmpdir(), 'chrome-audit-w1-'));

  console.log(`[Chrome] Spawning headless Chrome on port ${CDP_PORT}...`);
  const chrome = spawn(CHROME_PATH, [
    '--headless=new',
    `--remote-debugging-port=${CDP_PORT}`,
    `--user-data-dir=${userDataDir}`,
    '--no-first-run',
    '--no-default-browser-check',
    '--disable-gpu',
    '--window-size=412,915',
    'about:blank'
  ], { stdio: 'ignore' });

  try {
    const wsUrl = await getWsUrl(CDP_PORT);
    const client = new CDPClient(wsUrl);
    await client.ready;

    await client.send('Page.enable');
    await client.send('Network.enable');
    await client.send('Runtime.enable');

    const results = {
      timestamp: new Date().toISOString(),
      summary: {
        totalScreens: SCREENS.length,
        viewportsTested: VIEWPORTS.map(v => v.label),
        totalChecks: SCREENS.length * VIEWPORTS.length,
        passedChecks: 0,
        failedChecks: 0,
        total404s: 0,
        totalConsoleErrors: 0,
        rootRedirectPass: false,
        lovedModalPass: false
      },
      screenResults: []
    };

    // 1. Audit Root Redirect
    console.log('\n--- 1. Testing Root Redirect (index.html ➔ intro.html) ---');
    let redirect404s = [];
    client.on('Network.responseReceived', (p) => {
      if (p.response.status === 404) redirect404s.push(p.response.url);
    });

    await client.send('Page.navigate', { url: `http://127.0.0.1:${PORT}/` });
    await new Promise(r => setTimeout(r, 1200));
    const urlEval = await client.send('Runtime.evaluate', { expression: 'window.location.href' });
    const finalUrl = urlEval.result.value || '';
    const redirectSuccess = finalUrl.includes('intro.html');
    results.summary.rootRedirectPass = redirectSuccess;
    console.log(`Root redirect result: ${redirectSuccess ? 'PASS' : 'FAIL'} (Landed on: ${finalUrl})`);

    // 2. Audit 14 Screens across 3 Viewports
    console.log('\n--- 2. Auditing 14 Screens across 3 Viewports ---');

    for (const screen of SCREENS) {
      const screenReport = {
        id: screen.id,
        name: screen.name,
        path: screen.path,
        cluster: screen.cluster,
        viewports: {}
      };

      for (const vp of VIEWPORTS) {
        const errors404 = [];
        const consoleErrors = [];

        const onResp = (p) => {
          if (p.response.status === 404) {
            errors404.push(p.response.url);
          }
        };
        const onConsole = (p) => {
          if (p.type === 'error') {
            consoleErrors.push(p.text || (p.args && p.args[0] && p.args[0].value) || 'Error');
          }
        };
        const onException = (p) => {
          consoleErrors.push(p.exceptionDetails.text + ': ' + (p.exceptionDetails.exception?.description || ''));
        };

        client.on('Network.responseReceived', onResp);
        client.on('Runtime.consoleAPICalled', onConsole);
        client.on('Runtime.exceptionThrown', onException);

        // Set device metrics
        await client.send('Emulation.setDeviceMetricsOverride', {
          width: vp.width,
          height: vp.height,
          deviceScaleFactor: 2,
          mobile: true
        });

        // Navigate
        const fullUrl = `http://127.0.0.1:${PORT}${screen.path}`;
        await client.send('Page.navigate', { url: fullUrl });
        await new Promise(r => setTimeout(r, 800));

        // Evaluate DOM metrics
        const evalRes = await client.send('Runtime.evaluate', {
          expression: DOM_INSPECTOR_JS,
          returnByValue: true
        });
        const dom = evalRes.result.value || {};

        // Remove listeners
        client.listeners.set('Network.responseReceived', []);
        client.listeners.set('Runtime.consoleAPICalled', []);
        client.listeners.set('Runtime.exceptionThrown', []);

        const isPass = dom.noOverflow && errors404.length === 0 && consoleErrors.length === 0 && dom.hasMetaViewport;

        if (isPass) results.summary.passedChecks++;
        else results.summary.failedChecks++;

        results.summary.total404s += errors404.length;
        results.summary.totalConsoleErrors += consoleErrors.length;

        screenReport.viewports[vp.label] = {
          pass: isPass,
          vw: dom.vw,
          scrollW: dom.scrollW,
          noOverflow: dom.noOverflow,
          hasMetaViewport: dom.hasMetaViewport,
          errors404,
          consoleErrors,
          hasHeader: dom.hasHeader,
          hasBottomBar: dom.hasBottomBar
        };
      }

      const allVpPass = Object.values(screenReport.viewports).every(v => v.pass);
      console.log(`[${allVpPass ? 'PASS' : 'FAIL'}] ${screen.name.padEnd(25)} (${screen.path})`);
      results.screenResults.push(screenReport);
    }

    // 3. Audit LovedModal & Interactivity
    console.log('\n--- 3. Testing LovedModal Interaction on home.html ---');
    await client.send('Emulation.setDeviceMetricsOverride', {
      width: 393,
      height: 852,
      deviceScaleFactor: 2,
      mobile: true
    });
    await client.send('Page.navigate', { url: `http://127.0.0.1:${PORT}/src/screens/trip/home.html` });
    await new Promise(r => setTimeout(r, 800));

    const modalTestJs = `(() => {
      const openBtn = document.querySelector('#btnOpenHeaderLoved, #btnOpenLovedModal, [data-open="loved-modal"]');
      if (openBtn) openBtn.click();
      const modal = document.querySelector('#modalLovedPlaces, loved-modal, #lovedModal, .loved-places-dialog');
      const isVisible = modal ? (modal.classList.contains('active') || getComputedStyle(modal).display !== 'none') : false;
      const closeBtn = document.querySelector('#btnCloseLovedPlaces, .btn-modal-close');
      if (closeBtn) closeBtn.click();
      const isClosed = modal ? (!modal.classList.contains('active') || getComputedStyle(modal).display === 'none') : false;
      return { hasOpenBtn: !!openBtn, hasModal: !!modal, isVisible, hasCloseBtn: !!closeBtn, isClosed };
    })()`;
    const modalRes = await client.send('Runtime.evaluate', { expression: modalTestJs, returnByValue: true });
    const mData = modalRes.result.value || {};
    results.summary.lovedModalPass = mData.hasOpenBtn && mData.hasModal && mData.isVisible;
    console.log(`LovedModal test result: ${results.summary.lovedModalPass ? 'PASS' : 'FAIL'} (open: ${mData.hasOpenBtn}, modal: ${mData.hasModal}, visible: ${mData.isVisible}, closedAfterClick: ${mData.isClosed})`);

    // Save final report
    fs.writeFileSync('tests/audit-results-week1.json', JSON.stringify(results, null, 2), 'utf-8');
    console.log('\n======================================================');
    console.log('            WEEK 1 FULL AUDIT SUMMARY                 ');
    console.log('======================================================');
    console.log(`Total Screen-Viewport Checks: ${results.summary.totalChecks}`);
    console.log(`Passed Checks:               ${results.summary.passedChecks} / ${results.summary.totalChecks}`);
    console.log(`Failed Checks:               ${results.summary.failedChecks}`);
    console.log(`Total 404s:                  ${results.summary.total404s}`);
    console.log(`Total Console Errors:        ${results.summary.totalConsoleErrors}`);
    console.log(`Root Redirect (intro.html):  ${results.summary.rootRedirectPass ? 'PASS' : 'FAIL'}`);
    console.log(`LovedModal Registered:       ${results.summary.lovedModalPass ? 'PASS' : 'FAIL'}`);
    console.log('======================================================\n');

    client.close();
  } finally {
    chrome.kill();
    server.close();
    try {
      fs.rmSync(userDataDir, { recursive: true, force: true });
    } catch {}
  }
}

main().catch(err => {
  console.error('[Audit Error]', err);
  process.exit(1);
});
