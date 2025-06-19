# en - 英語ローカライゼーション

## 概要
英語圏ユーザー向けの多言語対応ファイルを管理します。拡張機能のUI要素、メッセージ、エラーテキストの英語翻訳を提供します。

## 主要ファイル
- `messages.json`: 英語メッセージ定義ファイル

## 使用方法
```typescript
// メッセージの取得例
const message = chrome.i18n.getMessage('extensionName');
const description = chrome.i18n.getMessage('extensionDescription');
```

## 依存関係
- 内部依存: ../messages.json（ベースメッセージ）
- 外部依存: Chrome i18n API
- webextension-toolbox: 多言語ビルド処理

## 設定・権限
- 特別な権限は不要（Chrome i18n APIは標準機能）

## クロスブラウザ対応
- Chrome: chrome.i18n API
- Firefox: browser.i18n API（自動変換）
- 統一されたメッセージ取得インターフェース

## エラーハンドリング
- 未定義メッセージキーの処理
- フォールバック言語の設定
- 翻訳欠損時のデフォルト表示

## テスト
- メッセージキーの整合性確認
- 翻訳品質の検証
- UI表示の確認

## 拡張・カスタマイズ
- 新しいメッセージキーの追加
- 地域固有の表現の調整
- 複数形対応の実装

## 注意事項
- メッセージキーは他言語ファイルと統一してください
- 文字数制限を考慮した翻訳を行ってください
- 文化的配慮を含めた適切な表現を使用してください
- プレースホルダーの使用方法を統一してください