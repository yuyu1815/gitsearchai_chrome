# tests - テスト実行方法とカバレッジ要件

## 概要
Chrome拡張機能の品質保証のためのテストスイートを管理します。単体テスト、統合テスト、E2Eテストを含み、継続的な品質向上を支援します。

## 主要ファイル
- `unit/`: 単体テストファイル
- `integration/`: 統合テストファイル
- `e2e/`: エンドツーエンドテストファイル

## 使用方法
```bash
# 全テストの実行
npm test

# 単体テストのみ実行
npm run test:unit

# 統合テストのみ実行
npm run test:integration

# E2Eテストのみ実行
npm run test:e2e

# カバレッジレポートの生成
npm run test:coverage
```

## 依存関係
- 内部依存: ../scripts/（テスト対象コード）
- 外部依存: Jest, Puppeteer, Chrome Extension Testing Library
- webextension-toolbox: テスト環境の構築

## 設定・権限
- テスト実行用の一時的な権限設定
- モック環境でのChrome API使用

## クロスブラウザ対応
- Chrome: Puppeteer + Chrome Extension Testing
- Firefox: WebDriver + Firefox Extension Testing
- 各ブラウザでのテスト自動化

## エラーハンドリング
- テスト失敗時の詳細なエラーレポート
- 非同期処理のタイムアウト管理
- テスト環境のクリーンアップ

## テスト
- テストカバレッジ80%以上を目標
- 重要な機能の回帰テスト
- パフォーマンステスト
- セキュリティテスト

## 拡張・カスタマイズ
- 新しいテストケースの追加ガイドライン
- カスタムマッチャーの実装
- テストデータの管理方法
- CI/CD統合の設定

## 注意事項
- テストは独立して実行可能である必要があります
- テスト用データは本番データと分離してください
- セキュリティに関わるテストは特に慎重に実装してください
- テスト実行時間を適切に管理してください
- テストの可読性と保守性を重視してください