# pages - HTMLページとUI仕様

## 概要
Chrome拡張機能のHTMLページを管理します。ポップアップUIなど、ユーザーが直接操作するインターフェースを含みます。

## 主要ファイル
- `popup.html`: 拡張機能アイコンクリック時に表示されるポップアップUI
- `sidepanel.html`: サイドパネルUI

## 使用方法
```javascript
// ポップアップページの制御
// popup.tsでDOM操作とイベントハンドリング

// サイドパネルページの制御
// sidepanel.tsでDOM操作とイベントハンドリング
```

## 依存関係
- 内部依存: scripts/popup.ts, scripts/sidepanel.ts, styles/popup.css, styles/sidepanel.css
- 外部依存: Chrome Storage API, Chrome i18n API
- webextension-toolbox: HTMLファイルのビルド処理

## 設定・権限
- manifest.jsonでaction.default_popupとside_panelを設定
- storage権限（設定保存用）

## クロスブラウザ対応
- 標準的なHTML5とCSS3を使用
- ブラウザ固有のスタイルを避ける
- webextension-toolboxによる自動調整

## エラーハンドリング
- DOM要素が見つからない場合の処理
- 設定読み込み失敗時のデフォルト値設定
- ユーザー入力の検証とエラー表示

## テスト
- 各ページの正常な表示確認
- フォーム入力の検証テスト
- レスポンシブデザインの確認
- 多言語表示の確認

## 拡張・カスタマイズ
- UIコンポーネントの拡張
- テーマ機能の実装
- アクセシビリティの向上
- 新しいページの追加

## 注意事項
- インラインスクリプトは使用せず、外部ファイルに分離してください
- Content Security Policyに準拠したコードを記述してください
- ユーザビリティを考慮したUI設計を心がけてください
- 各ブラウザでの表示確認を行ってください
