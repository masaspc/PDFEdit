# 無料PDF編集ツール - Free PDF Editor

<div align="center">

完全無料のクライアントサイドPDF編集ツール
サーバー不要 | プライバシー保護 | オープンソース

[![GitHub Pages](https://img.shields.io/badge/demo-live-success)](https://masaspc.github.io/PDFEdit/)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)

**[🚀 デモを見る](https://masaspc.github.io/PDFEdit/)** | [📖 機能一覧](#機能) | [💡 使い方](#使い方) | [🐛 トラブルシューティング](TROUBLESHOOTING.md) | [🤝 貢献](#貢献) | [📦 デプロイ](DEPLOY.md)

</div>

---

## 📖 概要

**無料PDF編集ツール**は、100%クライアントサイドで動作する完全無料のPDF編集アプリケーションです。すべての処理はユーザーのブラウザ内で完結するため、ファイルが外部サーバーに送信されることはありません。

### 🌟 主な特徴

- **🔒 完全プライバシー保護** - ファイルは外部に送信されません
- **💰 完全無料** - サーバーコスト不要、永久無料
- **⚡ 高速処理** - サーバーとの通信なし、即座に処理
- **📱 PWA対応** - オフラインでも動作、インストール可能
- **🌍 多言語対応** - 日本語、英語、中国語に対応
- **🎨 モダンUI** - 直感的で使いやすいインターフェース
- **🌙 ダークモード** - 目に優しいダークテーマ搭載

---

## ✨ 機能

### 基本編集機能

- ✅ **テキスト追加** - カスタムフォントサイズ・色でテキスト挿入
- ✅ **画像挿入** - PNG、JPEG画像の追加
- ✅ **図形描画** - 四角形、線などの描画
- ✅ **ハイライト** - 重要箇所をマーク
- ✅ **注釈追加** - コメント・メモの追加

### ページ操作

- ✅ **ページ回転** - 90度ずつページを回転
- ✅ **ページ削除** - 不要なページを削除
- ✅ **PDF結合** - 複数のPDFファイルを1つに統合
- ✅ **PDF分割** - 指定ページでPDFを分割

### 高度な機能

- ✅ **OCR（光学文字認識）** - 画像からテキストを抽出（100+言語対応）
- ✅ **PDF圧縮** - ファイルサイズを削減
- ✅ **透かし追加** - カスタム透かしテキストを追加
- ✅ **電子署名** - デジタル署名機能（開発中）
- ✅ **パスワード保護** - PDF暗号化（制限付き）

### 変換機能

- ✅ **PDF → 画像** - 各ページをPNG/JPEG画像に変換
- ✅ **画像 → PDF** - 複数画像からPDF作成
- ✅ **HTML → PDF** - Webページをプリント（開発中）

---

## 🚀 使い方

### オンライン版（推奨）

1. **[https://masaspc.github.io/PDFEdit/](https://masaspc.github.io/PDFEdit/)** にアクセス
2. PDFファイルをドラッグ&ドロップ、または「ファイルを選択」
3. サイドバーから編集機能を選択
4. 編集完了後、「PDFを保存」でダウンロード

> 💡 **インストール不要**: ブラウザだけで動作します！
> 🔒 **完全プライバシー**: ファイルは外部に送信されません

### ローカルインストール

```bash
# リポジトリをクローン
git clone https://github.com/masaspc/PDFEdit.git

# ディレクトリに移動
cd PDFEdit

# 任意のHTTPサーバーで起動（例：Python）
python -m http.server 8000

# ブラウザで開く
open http://localhost:8000
```

### PWAとしてインストール

1. Chromeでサイトにアクセス
2. アドレスバーの「インストール」アイコンをクリック
3. デスクトップアプリとして使用可能

---

## 🛠️ 技術スタック

### コアライブラリ

| ライブラリ | 用途 | ライセンス |
|-----------|------|-----------|
| [PDF.js](https://mozilla.github.io/pdf.js/) | PDF表示・レンダリング | Apache 2.0 |
| [pdf-lib](https://pdf-lib.js.org/) | PDF作成・編集 | MIT |
| [Tesseract.js](https://tesseract.projectnaptha.com/) | OCR（文字認識） | Apache 2.0 |
| [jsPDF](https://github.com/parallax/jsPDF) | PDF生成 | MIT |

### フロントエンド技術

- **HTML5** - セマンティックマークアップ
- **CSS3** - モダンレイアウト（Flexbox、Grid）
- **Vanilla JavaScript** - フレームワーク不要
- **WebAssembly** - 高速処理
- **Service Worker** - オフライン対応

---

## ⌨️ キーボードショートカット

| ショートカット | 動作 |
|--------------|------|
| `←` / `PageUp` | 前のページ |
| `→` / `PageDown` | 次のページ |
| `Home` | 最初のページ |
| `End` | 最後のページ |
| `Ctrl/Cmd + +` | ズームイン |
| `Ctrl/Cmd + -` | ズームアウト |
| `Ctrl/Cmd + 0` | ズームリセット |
| `Ctrl/Cmd + Z` | 元に戻す |
| `Ctrl/Cmd + Shift + Z` | やり直し |
| `F1` / `Shift + ?` | ヘルプ表示 |

---

## 📁 プロジェクト構造

```
PDFEdit/
├── index.html              # メインHTML
├── manifest.json           # PWA設定
├── sw.js                   # Service Worker
├── css/
│   └── style.css          # スタイルシート
├── js/
│   ├── app.js             # メインアプリケーション
│   ├── pdf-viewer.js      # PDFビューアー機能
│   ├── pdf-editor.js      # PDF編集機能
│   ├── pdf-utils.js       # ユーティリティ関数
│   └── i18n.js            # 多言語対応
└── assets/
    └── icons/             # PWAアイコン
```

---

## 🌐 ブラウザサポート

| ブラウザ | 最小バージョン | サポート状況 |
|---------|--------------|------------|
| Chrome | 90+ | ✅ 完全サポート |
| Firefox | 88+ | ✅ 完全サポート |
| Safari | 14+ | ✅ 完全サポート |
| Edge | 90+ | ✅ 完全サポート |
| Opera | 76+ | ✅ 完全サポート |

**必須機能:**
- FileReader API
- Canvas API
- WebAssembly
- Web Workers
- LocalStorage

---

## 🤝 貢献

プロジェクトへの貢献を歓迎します！

### 貢献方法

1. このリポジトリをフォーク
2. フィーチャーブランチを作成 (`git checkout -b feature/AmazingFeature`)
3. 変更をコミット (`git commit -m 'Add some AmazingFeature'`)
4. ブランチにプッシュ (`git push origin feature/AmazingFeature`)
5. プルリクエストを作成

### バグ報告・機能リクエスト

[Issues](https://github.com/masaspc/PDFEdit/issues) でバグ報告や機能リクエストを受け付けています。

---

## 📄 ライセンス

このプロジェクトは **MIT License** の下で公開されています。詳細は [LICENSE](LICENSE) ファイルをご覧ください。

---

## 🙏 謝辞

このプロジェクトは以下のオープンソースプロジェクトによって支えられています:

- [Mozilla PDF.js](https://mozilla.github.io/pdf.js/) チーム
- [pdf-lib](https://pdf-lib.js.org/) 開発者
- [Tesseract.js](https://tesseract.projectnaptha.com/) コミュニティ
- すべてのコントリビューター

---

## 📞 サポート

質問やサポートが必要な場合:

- 📧 Email: support@pdfedit.example.com
- 💬 Discussions: [GitHub Discussions](https://github.com/masaspc/PDFEdit/discussions)
- 🐛 Issues: [GitHub Issues](https://github.com/masaspc/PDFEdit/issues)

---

## 🗺️ ロードマップ

### バージョン 1.x（現在）
- [x] 基本PDF編集機能
- [x] ページ操作
- [x] OCR機能
- [x] PDF圧縮
- [x] 多言語対応
- [x] ダークモード
- [x] PWA対応

### バージョン 2.x（計画中）
- [ ] 高度な電子署名
- [ ] PDFフォーム作成・編集
- [ ] クラウド連携（オプション）
- [ ] バッチ処理
- [ ] APIエンドポイント
- [ ] ブラウザ拡張機能

---

## 📊 統計

- **ファイルサイズ**: ~200KB（圧縮前）
- **依存関係**: 0（ランタイム）
- **サポート言語**: 3言語（日本語、英語、中国語）
- **OCR対応言語**: 100+言語

---

## ⚠️ 制限事項

- **大容量ファイル**: 100MB超のPDFは処理に時間がかかる場合があります
- **複雑なPDF**: 一部の高度なPDF機能は未対応の可能性があります
- **暗号化**: 完全なPDF暗号化はサーバーサイド処理が推奨されます
- **OCR精度**: スキャン品質に依存します

---

## 🌟 スター履歴

[![Star History Chart](https://api.star-history.com/svg?repos=masaspc/PDFEdit&type=Date)](https://star-history.com/#masaspc/PDFEdit&Date)

---

<div align="center">

Made with ❤️ by the PDFEdit Team

[⬆ トップに戻る](#無料pdf編集ツール---free-pdf-editor)

</div>
