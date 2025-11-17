# GitHub Pages デプロイガイド

このガイドでは、PDF編集ツールをGitHub Pagesで公開する方法を説明します。

## 📋 前提条件

- GitHubアカウント
- リポジトリへのpush権限
- 現在のコミットがpush済み

## 🚀 デプロイ方法

### 方法1: GitHubのWeb UIを使用（推奨・最も簡単）

#### ステップ1: メインブランチにマージ

1. **プルリクエストを作成**
   - GitHubのリポジトリページにアクセス
   - 「Pull requests」タブをクリック
   - 「New pull request」をクリック
   - Base: `main` (または `master`) ← Compare: `claude/free-pdf-editor-01LurhbRLfVkhWWFKGYkJroq`
   - 「Create pull request」をクリック

2. **マージする**
   - プルリクエストをレビュー
   - 「Merge pull request」をクリック
   - 「Confirm merge」をクリック

#### ステップ2: GitHub Pagesを有効化

1. **リポジトリ設定を開く**
   - リポジトリのトップページで「Settings」タブをクリック

2. **Pagesセクションに移動**
   - 左サイドバーの「Pages」をクリック

3. **ソースを設定**
   - **Source**: 「Deploy from a branch」を選択
   - **Branch**: `main` を選択
   - **Folder**: `/ (root)` を選択
   - 「Save」をクリック

4. **デプロイを待つ**
   - 数分待つと、ページ上部に公開URLが表示されます
   - 例: `https://masaspc.github.io/PDFEdit/`

### 方法2: GitHub Actionsを使用（自動化）

より高度な自動デプロイを設定できます。

#### ワークフローファイルを作成

コマンドラインで以下を実行:

```bash
# ワークフローディレクトリを作成
mkdir -p .github/workflows

# デプロイワークフローを作成
cat > .github/workflows/deploy.yml << 'EOF'
name: Deploy to GitHub Pages

on:
  push:
    branches:
      - main
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: "pages"
  cancel-in-progress: false

jobs:
  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Pages
        uses: actions/configure-pages@v4

      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: '.'

      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
EOF

# コミットしてプッシュ
git add .github/workflows/deploy.yml
git commit -m "ci: add GitHub Pages deploy workflow"
git push
```

その後、GitHub Settings > Pages で:
- Source: 「GitHub Actions」を選択

### 方法3: gh-pagesブランチを使用

専用のデプロイブランチを作成する方法:

```bash
# gh-pagesブランチを作成
git checkout --orphan gh-pages

# 不要なファイルを削除
git rm -rf .

# メインブランチからファイルをコピー
git checkout main -- .

# コミット
git add .
git commit -m "docs: initial GitHub Pages deployment"

# プッシュ
git push -u origin gh-pages

# メインブランチに戻る
git checkout main
```

GitHub Settings > Pages:
- Branch: `gh-pages` を選択
- Folder: `/ (root)` を選択

## 🔧 デプロイ後の設定

### カスタムドメインの設定（オプション）

1. **ドメインを追加**
   - Settings > Pages > Custom domain
   - ドメイン名を入力（例: `pdfedit.example.com`）
   - 「Save」をクリック

2. **DNSレコードを設定**

   CNAMEレコード:
   ```
   Type: CNAME
   Name: pdfedit (または www)
   Value: masaspc.github.io
   ```

   または Aレコード:
   ```
   Type: A
   Name: @
   Value: 185.199.108.153
   Value: 185.199.109.153
   Value: 185.199.110.153
   Value: 185.199.111.153
   ```

3. **HTTPS を有効化**
   - 「Enforce HTTPS」にチェック

### 環境変数の設定

PWAアイコンのURLを修正する必要がある場合:

```bash
# manifest.jsonのURLを更新
sed -i 's|"/assets/|"./assets/|g' manifest.json

# index.htmlのパスを確認
# 相対パスになっていることを確認

# コミット
git add manifest.json
git commit -m "fix: update asset paths for GitHub Pages"
git push
```

## 📊 デプロイ状況の確認

### デプロイログを確認

1. リポジトリの「Actions」タブをクリック
2. 最新のワークフロー実行をクリック
3. ステータスとログを確認

### 公開URLにアクセス

デプロイ完了後、以下のURLでアクセス可能:
```
https://masaspc.github.io/PDFEdit/
```

## 🐛 トラブルシューティング

### 問題1: 404エラー

**原因**: ブランチやフォルダ設定が間違っている

**解決策**:
- Settings > Pages で正しいブランチとフォルダを選択
- リポジトリ名が正しいか確認

### 問題2: CSSやJSが読み込まれない

**原因**: パスが絶対パスになっている

**解決策**:
```bash
# すべてのパスを相対パスに変更
# index.htmlで確認:
# ❌ href="/css/style.css"
# ✅ href="css/style.css" または href="./css/style.css"
```

### 問題3: Service Workerエラー

**原因**: HTTPSが必須

**解決策**:
- GitHub Pagesは自動的にHTTPSを提供
- ローカルテストではlocalhost使用

### 問題4: マニフェストエラー

**原因**: アイコンファイルが存在しない

**解決策**:
```bash
# ダミーアイコンを作成（一時的）
# または manifest.json からアイコンセクションを削除
```

## 🔄 更新プロセス

コードを更新してデプロイする手順:

```bash
# 1. 変更を加える
# ... ファイルを編集 ...

# 2. コミット
git add .
git commit -m "feat: add new feature"

# 3. プッシュ
git push origin main

# 4. 自動デプロイ（GitHub Actionsの場合）
# または手動でSettings > Pagesから再デプロイ

# 5. 数分待ってサイトを確認
```

## ✅ デプロイチェックリスト

デプロイ前に以下を確認:

- [ ] すべてのファイルがコミット済み
- [ ] すべてのパスが相対パス
- [ ] PWAアイコンが配置済み（または manifest.json から削除）
- [ ] Service Workerのパスが正しい
- [ ] READMEにデプロイURLを記載
- [ ] プライバシーポリシー・利用規約を追加（必要に応じて）
- [ ] Google Analytics設定（オプション）
- [ ] OGPメタタグ設定（SNS共有用）

## 📈 アクセス解析（オプション）

### Google Analytics追加

index.htmlの `<head>` に追加:

```html
<!-- Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-XXXXXXXXXX');
</script>
```

## 🎉 完了！

デプロイが完了すると、以下のようにアクセスできます:

**公開URL**: `https://masaspc.github.io/PDFEdit/`

このURLを世界中の誰とでも共有できます！
