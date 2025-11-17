# 貢献ガイドライン

PDFEditプロジェクトへの貢献に興味を持っていただき、ありがとうございます！

## 行動規範

このプロジェクトに参加するすべての人は、尊重と協力の精神を持って行動することを期待されます。

## 貢献方法

### バグ報告

バグを見つけた場合:

1. [Issues](https://github.com/masaspc/PDFEdit/issues) で既存の報告を確認
2. 新しいIssueを作成
3. 以下の情報を含める:
   - バグの説明
   - 再現手順
   - 期待される動作
   - 実際の動作
   - ブラウザとバージョン
   - スクリーンショット（可能であれば）

### 機能リクエスト

新機能を提案する場合:

1. [Issues](https://github.com/masaspc/PDFEdit/issues) で提案
2. ユースケースを説明
3. 実装方法の提案（任意）

### プルリクエスト

コードを貢献する場合:

1. リポジトリをフォーク
2. フィーチャーブランチを作成
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. 変更を加える
4. コードをコミット
   ```bash
   git commit -m "feat: add amazing feature"
   ```
5. ブランチにプッシュ
   ```bash
   git push origin feature/amazing-feature
   ```
6. プルリクエストを作成

### コミットメッセージ規約

Conventional Commits形式を使用:

- `feat:` 新機能
- `fix:` バグ修正
- `docs:` ドキュメント変更
- `style:` コードフォーマット
- `refactor:` リファクタリング
- `test:` テスト追加
- `chore:` ビルド・設定変更

例:
```
feat: add PDF encryption feature
fix: resolve page rotation bug
docs: update installation guide
```

## 開発環境セットアップ

```bash
# リポジトリをクローン
git clone https://github.com/masaspc/PDFEdit.git
cd PDFEdit

# ローカルサーバーで起動
python -m http.server 8000

# ブラウザで開く
open http://localhost:8000
```

## コーディング規約

### JavaScript

- ES6+構文を使用
- セミコロンを使用
- インデント: スペース4つ
- 変数名: camelCase
- クラス名: PascalCase
- 定数: UPPER_CASE

### CSS

- BEM命名規則を推奨
- CSSカスタムプロパティ（CSS Variables）を使用
- モバイルファーストアプローチ

### HTML

- セマンティックHTMLを使用
- アクセシビリティ（ARIA属性）を考慮
- 適切なalt属性を提供

## テスト

プルリクエスト前に以下を確認:

- [ ] すべてのブラウザで動作確認
- [ ] モバイルデバイスでの動作確認
- [ ] コンソールエラーがない
- [ ] パフォーマンス問題がない
- [ ] アクセシビリティ基準を満たす

## ライセンス

貢献したコードはMITライセンスの下で公開されます。

## 質問

質問がある場合:

- [GitHub Discussions](https://github.com/masaspc/PDFEdit/discussions)
- Email: support@pdfedit.example.com

ありがとうございます！🙏
