// ========================================
// メインアプリケーション
// ========================================

class App {
    constructor() {
        this.darkMode = false;
        this.sidebarOpen = false;
        this.thumbnailsOpen = false;

        this.init();
    }

    init() {
        this.loadSettings();
        this.setupEventListeners();
        this.checkBrowserCompatibility();
        console.log('PDF Editor initialized');
    }

    loadSettings() {
        // ダークモード設定を読み込み
        const savedDarkMode = localStorage.getItem('darkMode');
        if (savedDarkMode === 'true') {
            this.enableDarkMode();
        }

        // サイドバー状態を読み込み（モバイル用）
        const savedSidebar = localStorage.getItem('sidebarOpen');
        if (savedSidebar === 'true' && window.innerWidth > 1024) {
            this.toggleSidebar();
        }
    }

    setupEventListeners() {
        // ダークモード切り替え
        const darkModeToggle = document.getElementById('darkModeToggle');
        if (darkModeToggle) {
            darkModeToggle.addEventListener('click', () => {
                this.toggleDarkMode();
            });
        }

        // サイドバー切り替え（モバイル）
        const sidebar = document.querySelector('.sidebar');
        if (sidebar && window.innerWidth <= 1024) {
            const toggleBtn = document.createElement('button');
            toggleBtn.className = 'icon-btn sidebar-toggle';
            toggleBtn.innerHTML = '<i class="fas fa-bars"></i>';
            toggleBtn.style.position = 'fixed';
            toggleBtn.style.bottom = '20px';
            toggleBtn.style.left = '20px';
            toggleBtn.style.zIndex = '1100';
            document.body.appendChild(toggleBtn);

            toggleBtn.addEventListener('click', () => {
                this.toggleSidebar();
            });
        }

        // サムネイルパネル切り替え
        const closeThumbnails = document.getElementById('closeThumbnails');
        if (closeThumbnails) {
            closeThumbnails.addEventListener('click', () => {
                this.toggleThumbnails();
            });
        }

        // ウィンドウリサイズ対応
        window.addEventListener('resize', () => {
            this.handleResize();
        });

        // ページ離脱時の警告
        window.addEventListener('beforeunload', (e) => {
            if (pdfViewer && pdfViewer.pdfDoc) {
                e.preventDefault();
                e.returnValue = '編集中の内容が失われる可能性があります。本当にページを離れますか？';
            }
        });

        // キーボードショートカットのヘルプ
        document.addEventListener('keydown', (e) => {
            if (e.key === 'F1' || (e.key === '?' && e.shiftKey)) {
                e.preventDefault();
                this.showKeyboardShortcuts();
            }
        });
    }

    toggleDarkMode() {
        if (this.darkMode) {
            this.disableDarkMode();
        } else {
            this.enableDarkMode();
        }
    }

    enableDarkMode() {
        document.body.classList.add('dark-mode');
        this.darkMode = true;
        localStorage.setItem('darkMode', 'true');

        const icon = document.querySelector('#darkModeToggle i');
        if (icon) {
            icon.className = 'fas fa-sun';
        }
    }

    disableDarkMode() {
        document.body.classList.remove('dark-mode');
        this.darkMode = false;
        localStorage.setItem('darkMode', 'false');

        const icon = document.querySelector('#darkModeToggle i');
        if (icon) {
            icon.className = 'fas fa-moon';
        }
    }

    toggleSidebar() {
        const sidebar = document.querySelector('.sidebar');
        if (sidebar) {
            sidebar.classList.toggle('active');
            this.sidebarOpen = !this.sidebarOpen;
            localStorage.setItem('sidebarOpen', this.sidebarOpen);
        }
    }

    toggleThumbnails() {
        const panel = document.getElementById('thumbnailPanel');
        if (panel) {
            panel.classList.toggle('active');
            this.thumbnailsOpen = !this.thumbnailsOpen;
        }
    }

    handleResize() {
        // レスポンシブ対応の処理
        if (window.innerWidth > 1024) {
            const sidebar = document.querySelector('.sidebar');
            if (sidebar && this.sidebarOpen) {
                sidebar.classList.add('active');
            }
        }
    }

    checkBrowserCompatibility() {
        // 必要な機能をチェック
        const checks = {
            'FileReader': typeof FileReader !== 'undefined',
            'Canvas': document.createElement('canvas').getContext !== undefined,
            'WebAssembly': typeof WebAssembly !== 'undefined',
            'Worker': typeof Worker !== 'undefined',
            'LocalStorage': typeof Storage !== 'undefined',
        };

        const failed = Object.entries(checks)
            .filter(([name, supported]) => !supported)
            .map(([name]) => name);

        if (failed.length > 0) {
            console.warn('以下の機能がサポートされていません:', failed.join(', '));
            alert('お使いのブラウザは一部の機能をサポートしていません。最新のブラウザをご使用ください。');
        }
    }

    showKeyboardShortcuts() {
        const shortcuts = `
キーボードショートカット:

ナビゲーション:
  ← / PageUp     - 前のページ
  → / PageDown   - 次のページ
  Home           - 最初のページ
  End            - 最後のページ

ズーム:
  Ctrl/Cmd + +   - ズームイン
  Ctrl/Cmd + -   - ズームアウト
  Ctrl/Cmd + 0   - ズームリセット

編集:
  Ctrl/Cmd + Z   - 元に戻す
  Ctrl/Cmd + Shift + Z - やり直し

その他:
  F1 / Shift + ? - このヘルプを表示
        `.trim();

        alert(shortcuts);
    }

    showAbout() {
        const about = `
無料PDF編集ツール v1.0

完全無料のクライアントサイドPDF編集ツールです。
すべての処理はブラウザ内で完結し、ファイルは外部に送信されません。

主な機能:
- PDF表示・ナビゲーション
- テキスト・画像の追加
- ページ操作（回転、削除、結合、分割）
- OCR（文字認識）
- PDF圧縮
- 透かし・注釈追加
- PDF⇔画像変換

使用技術:
- PDF.js (Mozilla)
- pdf-lib
- Tesseract.js
- jsPDF

ライセンス: MIT
        `.trim();

        alert(about);
    }

    async generatePDFReport() {
        // アプリケーション統計を生成
        const stats = {
            browserInfo: navigator.userAgent,
            screenResolution: `${screen.width}x${screen.height}`,
            language: navigator.language,
            platform: navigator.platform,
            onlineStatus: navigator.onLine ? 'オンライン' : 'オフライン',
        };

        console.log('Application Stats:', stats);
    }
}

// ========================================
// ユーティリティ関数
// ========================================

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function throttle(func, limit) {
    let inThrottle;
    return function(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// ========================================
// アプリケーション起動
// ========================================

let app;

document.addEventListener('DOMContentLoaded', () => {
    app = new App();

    // コンソールにウェルカムメッセージ
    console.log('%c無料PDF編集ツール', 'font-size: 20px; font-weight: bold; color: #2563eb;');
    console.log('%cすべての処理はブラウザ内で完結します', 'font-size: 14px; color: #64748b;');
    console.log('%cGitHub: https://github.com/yourusername/PDFEdit', 'font-size: 12px; color: #10b981;');
});

// エラーハンドリング
window.addEventListener('error', (e) => {
    console.error('Global error:', e.error);
});

window.addEventListener('unhandledrejection', (e) => {
    console.error('Unhandled promise rejection:', e.reason);
});

// パフォーマンス監視
if (window.performance && window.performance.timing) {
    window.addEventListener('load', () => {
        setTimeout(() => {
            const perfData = window.performance.timing;
            const pageLoadTime = perfData.loadEventEnd - perfData.navigationStart;
            console.log(`ページ読み込み時間: ${pageLoadTime}ms`);
        }, 0);
    });
}
