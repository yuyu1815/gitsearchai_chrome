# _locales - 多言語対応とローカライゼーション

## 概要
Chrome拡張機能の国際化（i18n）機能を管理し、複数言語での表示をサポートします。現在は英語（en）と日本語（ja）に対応しています。

## 主要ファイル
- `en/messages.json`: 英語のメッセージ定義
- `ja/messages.json`: 日本語のメッセージ定義

## 使用方法
```javascript
// メッセージの取得
const message = chrome.i18n.getMessage('messageKey');

// プレースホルダー付きメッセージの取得
const messageWithPlaceholder = chrome.i18n.getMessage('messageKey', ['置換文字列']);
```

## 依存関係
- 内部依存: manifest.jsonのdefault_locale設定
- 外部依存: Chrome i18n API
- webextension-toolbox: 多言語ビルド対応

## 設定・権限
- manifest.jsonで`default_locale`を設定
- 特別な権限は不要

## クロスブラウザ対応
- Chrome: chrome.i18n API
- Firefox: browser.i18n API（webextension-toolboxが自動変換）
- Edge: chrome.i18n API
- Safari: browser.i18n API（webextension-toolboxが自動変換）

## エラーハンドリング
- 存在しないメッセージキーの場合は空文字列を返す
- ロケールファイルが見つからない場合はdefault_localeにフォールバック

## テスト
- 各言語でのメッセージ表示確認
- プレースホルダーの正しい置換確認
- 存在しないキーのハンドリング確認

## 拡張・カスタマイズ
- 新しい言語の追加：対応する言語コードのディレクトリとmessages.jsonを作成
- メッセージの追加：各言語のmessages.jsonに同じキーで追加

## 注意事項
- すべての言語ファイルで同じメッセージキーを定義する必要があります
- プレースホルダーの数と順序は全言語で統一してください
- メッセージキーは英数字とアンダースコアのみ使用可能です