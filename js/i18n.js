// ========================================
// 多言語対応（i18n）
// ========================================

const translations = {
    ja: {
        // ファイル操作
        'file-operations': 'ファイル操作',
        'open-pdf': 'PDFを開く',
        'save-pdf': 'PDFを保存',

        // 編集ツール
        'edit-tools': '編集ツール',
        'add-text': 'テキスト追加',
        'add-image': '画像挿入',
        'draw-shape': '図形描画',
        'highlight': 'ハイライト',
        'annotation': '注釈',

        // ページ操作
        'page-operations': 'ページ操作',
        'rotate': '回転',
        'delete-page': 'ページ削除',
        'merge': 'PDF結合',
        'split': 'PDF分割',

        // 高度な機能
        'advanced-features': '高度な機能',
        'ocr': 'OCR認識',
        'compress': 'PDF圧縮',
        'watermark': '透かし',
        'signature': '電子署名',
        'protect': 'パスワード保護',

        // 変換
        'convert': '変換',
        'pdf-to-image': 'PDF → 画像',
        'image-to-pdf': '画像 → PDF',

        // ビューアー
        'pages': 'ページ',
        'drop-file': 'PDFファイルをドラッグ&ドロップ',
        'or-click': 'または',
        'select-file': 'ファイルを選択',
        'privacy-note': 'すべての処理はブラウザ内で完結します。ファイルは外部に送信されません。',

        // メッセージ
        'processing': '処理中...',
        'loading': '読み込み中...',
        'success': '成功しました',
        'error': 'エラーが発生しました',
        'no-file': 'ファイルが選択されていません',
        'file-too-large': 'ファイルサイズが大きすぎます（推奨: 50MB以下）',
    },

    en: {
        // File operations
        'file-operations': 'File Operations',
        'open-pdf': 'Open PDF',
        'save-pdf': 'Save PDF',

        // Edit tools
        'edit-tools': 'Edit Tools',
        'add-text': 'Add Text',
        'add-image': 'Add Image',
        'draw-shape': 'Draw Shape',
        'highlight': 'Highlight',
        'annotation': 'Annotation',

        // Page operations
        'page-operations': 'Page Operations',
        'rotate': 'Rotate',
        'delete-page': 'Delete Page',
        'merge': 'Merge PDF',
        'split': 'Split PDF',

        // Advanced features
        'advanced-features': 'Advanced Features',
        'ocr': 'OCR',
        'compress': 'Compress',
        'watermark': 'Watermark',
        'signature': 'Signature',
        'protect': 'Password Protect',

        // Convert
        'convert': 'Convert',
        'pdf-to-image': 'PDF → Image',
        'image-to-pdf': 'Image → PDF',

        // Viewer
        'pages': 'Pages',
        'drop-file': 'Drag & Drop PDF File',
        'or-click': 'or',
        'select-file': 'Select File',
        'privacy-note': 'All processing is done in your browser. Files are never uploaded.',

        // Messages
        'processing': 'Processing...',
        'loading': 'Loading...',
        'success': 'Success',
        'error': 'An error occurred',
        'no-file': 'No file selected',
        'file-too-large': 'File is too large (recommended: under 50MB)',
    },

    zh: {
        // 文件操作
        'file-operations': '文件操作',
        'open-pdf': '打开PDF',
        'save-pdf': '保存PDF',

        // 编辑工具
        'edit-tools': '编辑工具',
        'add-text': '添加文本',
        'add-image': '插入图片',
        'draw-shape': '绘制图形',
        'highlight': '高亮',
        'annotation': '注释',

        // 页面操作
        'page-operations': '页面操作',
        'rotate': '旋转',
        'delete-page': '删除页面',
        'merge': '合并PDF',
        'split': '拆分PDF',

        // 高级功能
        'advanced-features': '高级功能',
        'ocr': 'OCR识别',
        'compress': '压缩PDF',
        'watermark': '水印',
        'signature': '电子签名',
        'protect': '密码保护',

        // 转换
        'convert': '转换',
        'pdf-to-image': 'PDF → 图片',
        'image-to-pdf': '图片 → PDF',

        // 查看器
        'pages': '页面',
        'drop-file': '拖放PDF文件',
        'or-click': '或',
        'select-file': '选择文件',
        'privacy-note': '所有处理均在浏览器中完成。文件不会上传到服务器。',

        // 消息
        'processing': '处理中...',
        'loading': '加载中...',
        'success': '成功',
        'error': '发生错误',
        'no-file': '未选择文件',
        'file-too-large': '文件太大（建议：50MB以下）',
    }
};

class I18n {
    constructor() {
        this.currentLanguage = this.detectLanguage();
        this.init();
    }

    detectLanguage() {
        // ローカルストレージから取得
        const saved = localStorage.getItem('language');
        if (saved && translations[saved]) {
            return saved;
        }

        // ブラウザの言語設定から検出
        const browserLang = navigator.language || navigator.userLanguage;
        if (browserLang.startsWith('ja')) return 'ja';
        if (browserLang.startsWith('zh')) return 'zh';
        return 'en';
    }

    init() {
        this.updatePageLanguage();
        this.setupLanguageSelector();
    }

    setLanguage(lang) {
        if (translations[lang]) {
            this.currentLanguage = lang;
            localStorage.setItem('language', lang);
            this.updatePageLanguage();
        }
    }

    translate(key) {
        return translations[this.currentLanguage][key] || key;
    }

    updatePageLanguage() {
        // data-i18n属性を持つすべての要素を更新
        document.querySelectorAll('[data-i18n]').forEach(element => {
            const key = element.getAttribute('data-i18n');
            const translation = this.translate(key);

            if (element.tagName === 'INPUT' && element.placeholder !== undefined) {
                element.placeholder = translation;
            } else {
                element.textContent = translation;
            }
        });

        // HTML lang属性を更新
        document.documentElement.lang = this.currentLanguage;
    }

    setupLanguageSelector() {
        const selector = document.getElementById('languageSelector');
        if (selector) {
            selector.value = this.currentLanguage;
            selector.addEventListener('change', (e) => {
                this.setLanguage(e.target.value);
            });
        }
    }
}

// グローバルインスタンス
const i18n = new I18n();
