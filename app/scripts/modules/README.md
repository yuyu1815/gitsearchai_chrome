# modules - 機能モジュールと相互依存関係

## 概要
Chrome拡張機能の機能を論理的に分割したモジュールを管理します。認証、UI操作、データ処理など、特定の責任を持つ機能群を含みます。

## 主要ファイル
- `auth/`: 認証関連の機能モジュール
- `ui/`: UI操作とDOM制御モジュール
- `data/`: データ処理とAPI通信モジュール

## 使用方法
```typescript
// 認証モジュールの使用
import { authenticateUser } from './auth/auth';

// UI操作モジュールの使用
import { updatePopupUI } from './ui/popup-ui';

// データ処理モジュールの使用
import { fetchRepositoryData } from './data/fetch';
```

## 依存関係
- 内部依存: ../lib/（共通ライブラリ）, 各モジュール間の相互依存
- 外部依存: Chrome Extension APIs, 外部API
- webextension-toolbox: モジュールバンドリング

## 設定・権限
- 各モジュールが必要とする権限の集約
- API通信用のホスト権限
- ストレージアクセス権限

## クロスブラウザ対応
- 各モジュールでブラウザ固有の実装を抽象化
- webextension-toolboxによる統一API提供
- 条件分岐によるブラウザ別処理

## エラーハンドリング
- モジュール間のエラー伝播制御
- 統一されたエラーレポーティング
- 部分的な機能停止時の代替処理

## テスト
- 各モジュールの独立したテスト
- モジュール間の統合テスト
- 依存関係の循環参照チェック

## 拡張・カスタマイズ
- 新しい機能モジュールの追加ガイドライン
- モジュール間インターフェースの設計原則
- 既存モジュールの拡張方法

## 注意事項
- モジュール間の循環依存を避けてください
- 各モジュールは単一責任の原則に従ってください
- 共通機能は../lib/に配置してください
- モジュール間の結合度を低く保ってください