const { defineConfig } = require('vite');
const { resolve } = require('path');
const fs = require('fs');

/**
 * Custom Vite plugin để copy nguyên vẹn các tài nguyên tham chiếu động
 * (main.js non-module client runtime, src/images/** cho đường dẫn động/onerror,
 * src/js/**) sang dist/ nhằm đảm bảo 0 lỗi 404
 * trên cả Web Preview lẫn Capacitor Android WebView.
 */
function copyStaticRuntimeAssets() {
  return {
    name: 'copy-static-runtime-assets',
    closeBundle() {
      const rootDir = __dirname;
      const distDir = resolve(rootDir, 'dist');

      const copyRecursive = (src, dest) => {
        if (!fs.existsSync(src)) return;
        const stat = fs.statSync(src);
        if (stat.isDirectory()) {
          fs.mkdirSync(dest, { recursive: true });
          for (const entry of fs.readdirSync(src)) {
            copyRecursive(resolve(src, entry), resolve(dest, entry));
          }
        } else {
          fs.mkdirSync(resolve(dest, '..'), { recursive: true });
          fs.copyFileSync(src, dest);
        }
      };

      // 1. Copy main.js ở gốc -> dist/main.js (để <script src="../../../main.js" defer> hoạt động 100%)
      copyRecursive(resolve(rootDir, 'main.js'), resolve(distDir, 'main.js'));

      // 2. Copy toàn bộ src/images sang dist/src/images (và dist/images để tương thích đường dẫn động)
      copyRecursive(resolve(rootDir, 'src/images'), resolve(distDir, 'src/images'));
      copyRecursive(resolve(rootDir, 'src/images'), resolve(distDir, 'images'));

      // 3. Copy src/js (bao gồm core, services, features, components, native) sang dist/src/js
      copyRecursive(resolve(rootDir, 'src/js'), resolve(distDir, 'src/js'));
    }
  };
}

module.exports = defineConfig({
  base: './',
  plugins: [copyStaticRuntimeAssets()],
  server: {
    host: true,
    port: 5173
  },
  preview: {
    host: true,
    port: 4173
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        root: resolve(__dirname, 'index.html'),

        // Auth screens (3)
        authIntro: resolve(__dirname, 'src/screens/auth/intro.html'),
        authLogin: resolve(__dirname, 'src/screens/auth/login.html'),
        authRegister: resolve(__dirname, 'src/screens/auth/register.html'),

        // Trip screens (7)
        tripHome: resolve(__dirname, 'src/screens/trip/home.html'),
        tripPlan: resolve(__dirname, 'src/screens/trip/plan.html'),
        tripEditPlan: resolve(__dirname, 'src/screens/trip/edit_plan.html'),
        tripItinerary: resolve(__dirname, 'src/screens/trip/itinerary.html'),
        tripProposal: resolve(__dirname, 'src/screens/trip/proposal.html'),
        tripSuggestion: resolve(__dirname, 'src/screens/trip/suggestion.html'),
        tripMap: resolve(__dirname, 'src/screens/trip/map.html'),

        // Finance screens (2)
        financeBudget: resolve(__dirname, 'src/screens/finance/budget.html'),
        financeSpending: resolve(__dirname, 'src/screens/finance/spending.html'),

        // Account screens (2)
        accountProfile: resolve(__dirname, 'src/screens/account/profile.html'),
        accountDeleteAccount: resolve(__dirname, 'src/screens/account/delete_account.html')
      }
    }
  }
});
