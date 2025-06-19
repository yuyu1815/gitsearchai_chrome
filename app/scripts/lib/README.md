# Library Directory - Core Utilities and Common Functions

## Overview
このディレクトリには、GitSearchAI Chrome拡張機能全体で使用される共通ライブラリとユーティリティ関数が含まれています。エラーハンドリング、ストレージ管理、定数定義、Chrome API ラッパーなどの基盤機能を提供します。

## Key Files
- `utils.ts`: 汎用ユーティリティ関数とエラーハンドリング
- `constants.ts`: アプリケーション全体で使用される定数定義
- `storage.ts`: Chrome ストレージ API の管理とキャッシュ機能
- `api.ts`: Chrome API のラッパー関数（予定）

## File Specifications

### utils.ts
**Purpose**: 汎用的なユーティリティ関数とエラーハンドリング機能

**Key Functions**:
- `executeWithErrorHandling<T>()`: 非同期操作の安全な実行とエラー処理
- `getUserFriendlyMessage()`: ユーザーフレンドリーなエラーメッセージ生成
- `debounce()`: 関数呼び出しの遅延実行
- `throttle()`: 関数実行頻度の制限
- `deepClone()`: オブジェクトの深いクローン作成
- `deepMerge()`: オブジェクトの深いマージ
- `validateString`: 文字列バリデーション関数群
- `validateNumber`: 数値バリデーション関数群
- `arrayUtils`: 配列操作ユーティリティ
- `dateUtils`: 日時操作ユーティリティ
- `withTimeout()`: Promise のタイムアウト処理
- `withRetry()`: リトライ機能付き非同期実行

**Usage Examples**:
```typescript
// エラーハンドリング付きの非同期実行
const result = await executeWithErrorHandling(async () => {
  return await someAsyncOperation();
}, 'Operation context');

// デバウンス処理
const debouncedSearch = debounce(performSearch, 300);

// バリデーション
const isValid = validateString.email('user@example.com');
```

### constants.ts
**Purpose**: アプリケーション全体で使用される定数の一元管理

**Key Constants**:
- `API_ENDPOINTS`: API エンドポイント URL
- `DEFAULT_SETTINGS`: デフォルト設定値
- `MESSAGE_TYPES`: メッセージタイプ定義
- `STORAGE_KEYS`: ストレージキー定義
- `CACHE_CONFIG`: キャッシュ設定
- `UI_CONFIG`: UI 関連設定
- `SEARCH_CONFIG`: 検索機能設定
- `ERROR_MESSAGES`: エラーメッセージ定義
- `SUCCESS_MESSAGES`: 成功メッセージ定義
- `REGEX_PATTERNS`: 正規表現パターン
- `PERFORMANCE_CONFIG`: パフォーマンス設定
- `SECURITY_CONFIG`: セキュリティ設定

**Usage Examples**:
```typescript
// API エンドポイントの使用
const response = await fetch(API_ENDPOINTS.SEARCH, options);

// デフォルト設定の適用
const settings = { ...DEFAULT_SETTINGS, ...userSettings };

// メッセージタイプの使用
chrome.runtime.sendMessage({ type: MESSAGE_TYPES.SEARCH_REPOSITORIES });
```

### storage.ts
**Purpose**: Chrome ストレージ API の管理とキャッシュ機能

**Key Classes/Functions**:
- `StorageManager`: ストレージ操作の中央管理クラス
- `Settings`: 設定データの型定義
- `CacheEntry`: キャッシュエントリの型定義
- `SearchHistoryEntry`: 検索履歴の型定義

**Key Methods**:
- `initializeDefaultSettings()`: デフォルト設定の初期化
- `getSettings()`: 設定の取得
- `updateSettings()`: 設定の更新
- `cacheData()`: データのキャッシュ保存
- `getCachedData()`: キャッシュからのデータ取得
- `cacheSearchResults()`: 検索結果のキャッシュ
- `clearCache()`: キャッシュのクリア
- `cleanupExpiredCache()`: 期限切れキャッシュの削除
- `addSearchHistory()`: 検索履歴の追加
- `getStorageUsage()`: ストレージ使用量の取得

**Usage Examples**:
```typescript
// 設定の取得と更新
const settings = await StorageManager.getSettings();
await StorageManager.updateSettings({ searchLimit: 50 });

// キャッシュ操作
await StorageManager.cacheSearchResults(query, results);
const cachedResults = await StorageManager.getCachedSearchResults(query);
```

## Dependencies

### Internal Dependencies
- 各ファイル間での相互依存関係
- `utils.ts` → `constants.ts` (定数の参照)
- `storage.ts` → `utils.ts`, `constants.ts` (ユーティリティと定数の使用)

### External Dependencies
- Chrome Extensions API (`chrome.storage`, `chrome.runtime`)
- TypeScript 型定義
- webextension-toolbox による変換とポリフィル

### webextension-toolbox Integration
- TypeScript から JavaScript への自動変換
- ブラウザ間の API 差異の自動調整
- 開発時のホットリロード対応

## API Reference

### Error Handling
```typescript
interface OperationResult<T> {
  success: boolean;
  data?: T;
  error?: string;
  context?: string;
}

interface ErrorInfo {
  message: string;
  stack?: string;
  timestamp: string;
  context?: string;
}
```

### Storage Types
```typescript
interface Settings {
  apiKey: string;
  searchLimit: number;
  enableNotifications: boolean;
  autoSearch: boolean;
  cacheTimeout: number;
  debugMode: boolean;
  theme: 'light' | 'dark';
  language: 'en' | 'ja';
}
```

## Configuration & Settings

### Cache Configuration
- **Max Entries**: 100 エントリ
- **Default TTL**: 30分
- **Max Size**: 10MB
- **Cleanup Interval**: 1時間

### Performance Settings
- **Max Concurrent Requests**: 3
- **Request Timeout**: 10秒
- **Retry Attempts**: 3回
- **Retry Delay**: 1秒（指数バックオフ）

## Cross-browser Compatibility

### Chrome Extensions API
- `chrome.storage.sync` / `chrome.storage.local`
- `chrome.runtime.sendMessage`
- `chrome.contextMenus`

### WebExtensions Polyfill
webextension-toolbox が自動的に以下を提供:
- Firefox での `browser.*` API サポート
- Edge での互換性確保
- Safari での制限された機能サポート

## Error Handling Strategy

### Comprehensive Error Handling
- すべての非同期操作でエラーハンドリング実装
- ユーザーフレンドリーなエラーメッセージ
- 詳細なログ出力（デバッグモード時）
- 適切なフォールバック処理

### Chrome API Error Handling
- `chrome.runtime.lastError` の確認
- 権限エラーへの対応
- API 制限エラーの処理

## Testing Guidelines

### Unit Test Coverage
- 各ユーティリティ関数の個別テスト
- エラーケースのテスト
- 境界値テスト
- モック使用による Chrome API テスト

### Test Examples
```typescript
// utils.test.ts
describe('executeWithErrorHandling', () => {
  it('should return success result for successful operation', async () => {
    const result = await executeWithErrorHandling(
      async () => 'success',
      'test context'
    );
    expect(result.success).toBe(true);
    expect(result.data).toBe('success');
  });
});
```

## Extension & Customization

### Adding New Utilities
1. 新しい関数を適切なファイルに追加
2. TypeScript 型定義を含める
3. JSDoc コメントで詳細を記述
4. 対応するテストを作成
5. README を更新

### Adding New Constants
1. `constants.ts` に新しい定数を追加
2. 適切なカテゴリに分類
3. 型定義をエクスポート
4. 使用例をドキュメント化

## Notes

### Performance Considerations
- 大きなオブジェクトのクローン操作は重い
- キャッシュサイズの監視が重要
- デバウンス/スロットルの適切な使用

### Security Considerations
- ユーザー入力の適切なバリデーション
- API キーの安全な保存
- XSS 攻撃の防止

### Limitations
- Chrome ストレージの容量制限
- 同期ストレージの制限（100KB）
- ローカルストレージの制限（5MB）

### Future Enhancements
- より高度なキャッシュ戦略
- オフライン対応の強化
- パフォーマンス監視機能
- 詳細なアナリティクス機能