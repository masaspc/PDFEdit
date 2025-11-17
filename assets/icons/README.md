# PWAアイコン

このディレクトリにはPWA（Progressive Web App）用のアイコンを配置します。

## 必要なアイコンサイズ

以下のサイズのアイコンを用意してください:

- `icon-72x72.png`
- `icon-96x96.png`
- `icon-128x128.png`
- `icon-144x144.png`
- `icon-152x152.png`
- `icon-192x192.png`
- `icon-384x384.png`
- `icon-512x512.png`

## アイコン作成方法

### オンラインツール

1. [Favicon Generator](https://realfavicongenerator.net/)
2. [PWA Asset Generator](https://github.com/onderceylan/pwa-asset-generator)

### コマンドライン（推奨）

```bash
# pwa-asset-generatorをインストール
npm install -g pwa-asset-generator

# アイコンを生成（元画像が必要）
pwa-asset-generator logo.png ./assets/icons
```

### Photoshop/GIMP

1. 512x512pxの画像を作成
2. 各サイズにリサイズして保存
3. PNG形式で出力

## デザインガイドライン

- **背景**: 透明またはブランドカラー
- **パディング**: アイコンの周囲に10%の余白
- **形状**: 角丸正方形またはマスク可能
- **色**: ブランドカラー（#2563eb推奨）
- **内容**: シンプルで認識しやすいデザイン

## サンプル

PDF文書アイコンをベースにしたシンプルなデザインを推奨:

```
┌────────────┐
│  ┌──────┐  │
│  │ PDF  │  │
│  │ ✏️   │  │
│  └──────┘  │
└────────────┘
```

## 参考リンク

- [Web App Manifest Icons](https://developer.mozilla.org/en-US/docs/Web/Manifest/icons)
- [PWA Icon Guidelines](https://web.dev/add-manifest/)
