# unit - ユニットテスト

## 概要
個別のコンポーネントや関数の動作を検証するユニットテストを管理します。ソースコードの特定の機能や実装の詳細を確認するテストが含まれます。

## 主要ファイル
- `test-debug-logs.js`: デバッグログ機能の実装確認テスト
- `test-error-handling.js`: エラーハンドリング機能の実装確認テスト
- `test-toggle-message.js`: TOGGLE_SIDE_PANELメッセージ処理の詳細テスト

## 使用方法
```bash
# 個別テストの実行
node app/tests/unit/test-debug-logs.js
node app/tests/unit/test-error-handling.js
node app/tests/unit/test-toggle-message.js

# 全ユニットテストの実行
cd app/tests/unit
for file in *.js; do node "$file"; done
```

## 依存関係
- 内部依存: app/scripts/background.ts, app/scripts/contentscript.ts
- 外部依存: Node.js fs, path モジュール
- webextension-toolbox: ビルド後ファイルの検証

## 設定・権限
- 特別な権限は不要
- ファイルシステムアクセス権限が必要

## クロスブラウザ対応
- Node.js環境での実行を前提
- ソースファイルとビルド後ファイルの両方を検証

## エラーハンドリング
- ファイル読み込み失敗時の適切なエラーメッセージ
- 存在しないファイルへの対処
- パス解決エラーの処理

## テスト
各テストファイルは以下の項目を検証します：

### test-debug-logs.js
- ソースファイルでのデバッグログの存在確認
- ビルド後ファイルでのデバッグログの保持確認
- エラーハンドリングとデバッグログの統合確認

### test-error-handling.js
- Extension context invalidated エラーの検出と処理
- メッセージ形式の検証機能
- 不明なメッセージタイプの適切な処理
- レスポンス送信時のエラーハンドリング

### test-toggle-message.js
- TOGGLE_SIDE_PANELメッセージの実装確認
- メッセージハンドラーでの適切な処理
- ソースコードとビルド後ファイルでの一貫性

## 拡張・カスタマイズ
- 新しいユニットテストの追加
- テストカバレッジの向上
- モック機能の実装
- 自動化テストスイートとの統合

## 注意事項
- テスト実行前にプロジェクトをビルドしてください
- パス参照は相対パスを使用しています
- ファイルの存在を前提としたテストが含まれています
- Node.js環境での実行が必要です