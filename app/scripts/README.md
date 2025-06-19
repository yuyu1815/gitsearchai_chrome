# scripts - TypeScriptスクリプトと依存関係

## 概要
Chrome拡張機能のメインロジックを含むTypeScriptファイルを管理します。バックグラウンドスクリプト、コンテンツスクリプト、UI制御スクリプトなどを含みます。

## 主要ファイル
- `background.ts`: バックグラウンドで動作するサービスワーカー
- `contentscript.ts`: ウェブページに注入されるコンテンツスクリプト
- `popup.ts`: ポップアップUIの制御（将来追加予定）
- `options.ts`: オプションページの制御（将来追加予定）

## 使用方法
```typescript
// バックグラウンドスクリプトでのメッセージ処理
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  // メッセージ処理ロジック
});

// コンテンツスクリプトでのDOM操作
document.addEventListener('DOMContentLoaded', () => {
  // DOM操作ロジック
});
```

## 依存関係
- 内部依存: lib/（共通ライブラリ）, modules/（機能モジュール）
- 外部依存: Chrome Extension APIs, TypeScript
- webextension-toolbox: TypeScriptコンパイルとバンドル

## 設定・権限
- manifest.jsonでbackground.service_workerとcontent_scriptsを設定
- 必要な権限: storage, activeTab, scripting
- ホスト権限: github.com, gitlab.com

## クロスブラウザ対応
- webextension-toolboxによる自動ポリフィル
- Chrome: chrome.* API
- Firefox: browser.* API（自動変換）
- Edge: chrome.* API
- Safari: browser.* API（自動変換）

## エラーハンドリング
- chrome.runtime.lastErrorの確認
- 非同期処理のエラーキャッチ
- ユーザーフレンドリーなエラーメッセージ

## テスト
- 各スクリプトの単体テスト
- Chrome API呼び出しのモックテスト
- クロスブラウザ動作確認

## 拡張・カスタマイズ
- 新しい機能モジュールの追加
- TypeScript設定の最適化
- パフォーマンス監視の実装

## 注意事項
- Manifest V3の制約に準拠してください
- セキュリティベストプラクティスに従ってください
- メモリリークを防ぐため適切なクリーンアップを実装してください
- 各ブラウザでの動作テストを実施してください