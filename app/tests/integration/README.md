# integration - 統合テスト

## 概要
複数のコンポーネント間の連携や外部APIとの統合をテストする統合テストを管理します。Chrome拡張機能の実際の動作環境に近い条件でのテストが含まれます。

## 主要ファイル
- `test-api-direct.js`: 外部API（GitSearch Analytics Backend）への直接呼び出しテスト
- `test-cors-fix.js`: CORS問題の修正確認とmanifest.json設定テスト
- `test-extension-search.js`: Chrome拡張機能の検索機能統合テスト
- `test-sidepanel-functionality.js`: サイドパネル機能の統合テスト
- `test-toggle-functionality.js`: サイドパネルトグル機能の統合テスト

## 使用方法
```bash
# 個別テストの実行
node app/tests/integration/test-api-direct.js
node app/tests/integration/test-cors-fix.js
node app/tests/integration/test-extension-search.js
node app/tests/integration/test-sidepanel-functionality.js
node app/tests/integration/test-toggle-functionality.js

# 全統合テストの実行
cd app/tests/integration
for file in *.js; do node "$file"; done
```

## 依存関係
- 内部依存: app/scripts/modules/data/search-api.js, manifest.json, ビルド後ファイル
- 外部依存: GitSearch Analytics Backend API, Node.js https, fs, path モジュール
- webextension-toolbox: ビルドプロセスとファイル生成

## 設定・権限
- インターネット接続が必要（API呼び出しのため）
- ファイルシステムアクセス権限が必要
- Chrome拡張機能のmanifest.json設定確認

## クロスブラウザ対応
- Chrome拡張機能環境のシミュレート
- CORS設定の検証
- 各ブラウザでのmanifest.json互換性

## エラーハンドリング
- API呼び出し失敗時の適切なエラーメッセージ
- ネットワークエラーの処理
- ファイル読み込み失敗時の対処
- CORS問題の診断と解決提案

## テスト
各テストファイルは以下の項目を検証します：

### test-api-direct.js
- GitSearch Analytics Backend APIへの直接呼び出し
- APIレスポンスの構造と内容の検証
- エラーハンドリングの確認

### test-cors-fix.js
- manifest.jsonのhost_permissions設定確認
- CORS問題の解決状況検証
- Chrome拡張機能環境でのAPI呼び出し

### test-extension-search.js
- Chrome拡張機能の検索APIモジュールテスト
- モック環境での動作確認
- クエリ検証とレスポンス処理

### test-sidepanel-functionality.js
- サイドパネル機能の実装確認
- manifest.json設定の検証
- 必要ファイルの存在確認
- ビルド後ファイルの内容検証

### test-toggle-functionality.js
- サイドパネルトグル機能の実装確認
- 状態管理機能の検証
- ウィンドウクリーンアップ処理の確認

## 拡張・カスタマイズ
- 新しいAPI統合テストの追加
- モック機能の拡張
- エラーシナリオテストの追加
- パフォーマンステストの実装
- 自動化CI/CDパイプラインとの統合

## 注意事項
- テスト実行前にプロジェクトをビルドしてください
- インターネット接続が必要です
- 外部APIの可用性に依存します
- 実際のChrome拡張機能環境とは異なる場合があります
- APIレート制限に注意してください