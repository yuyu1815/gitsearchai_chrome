/**
 * 定数定義 - アプリケーション全体で使用される定数を管理
 * 設定値、API エンドポイント、メッセージタイプなどを定義
 */

// API エンドポイント設定
export const API_ENDPOINTS = {
  SEARCH: 'https://gitsearch-backend-werv.onrender.com/api/search',
  REPOSITORIES: 'https://api.gitsearchai.com/v1/repositories',
  USER_PROFILE: 'https://api.gitsearchai.com/v1/user',
  ANALYTICS: 'https://api.gitsearchai.com/v1/analytics'
} as const;

// デフォルト設定値
export const DEFAULT_SETTINGS = {
  apiKey: '',
  searchLimit: 25,
  enableNotifications: true,
  autoSearch: false,
  cacheTimeout: 30, // 分単位
  debugMode: false,
  theme: 'light',
  language: 'en'
} as const;

// メッセージタイプ定義
export const MESSAGE_TYPES = {
  // 検索関連
  SEARCH_REPOSITORIES: 'SEARCH_REPOSITORIES',
  DISPLAY_SEARCH_RESULTS: 'DISPLAY_SEARCH_RESULTS',
  CLEAR_SEARCH_RESULTS: 'CLEAR_SEARCH_RESULTS',

  // 設定関連
  GET_SETTINGS: 'GET_SETTINGS',
  UPDATE_SETTINGS: 'UPDATE_SETTINGS',
  RESET_SETTINGS: 'RESET_SETTINGS',

  // キャッシュ関連
  CLEAR_CACHE: 'CLEAR_CACHE',
  GET_CACHE_STATUS: 'GET_CACHE_STATUS',

  // UI関連
  SHOW_NOTIFICATION: 'SHOW_NOTIFICATION',
  UPDATE_BADGE: 'UPDATE_BADGE',
  TOGGLE_POPUP: 'TOGGLE_POPUP',

  // エラー関連
  ERROR_OCCURRED: 'ERROR_OCCURRED',
  LOG_ERROR: 'LOG_ERROR'
} as const;

// ストレージキー定義
export const STORAGE_KEYS = {
  SETTINGS: 'gitsearchai_settings',
  CACHE: 'gitsearchai_cache',
  USER_DATA: 'gitsearchai_user_data',
  SEARCH_HISTORY: 'gitsearchai_search_history',
  ANALYTICS: 'gitsearchai_analytics'
} as const;

// キャッシュ設定
export const CACHE_CONFIG = {
  MAX_ENTRIES: 100,
  DEFAULT_TTL: 30 * 60 * 1000, // 30分（ミリ秒）
  CLEANUP_INTERVAL: 60 * 60 * 1000, // 1時間（ミリ秒）
  MAX_SIZE_MB: 10
} as const;

// UI設定
export const UI_CONFIG = {
  POPUP_WIDTH: 400,
  POPUP_HEIGHT: 600,
  SEARCH_DEBOUNCE_MS: 300,
  NOTIFICATION_DURATION_MS: 5000,
  LOADING_TIMEOUT_MS: 30000
} as const;

// 検索設定
export const SEARCH_CONFIG = {
  MIN_QUERY_LENGTH: 2,
  MAX_QUERY_LENGTH: 200,
  MAX_RESULTS_PER_PAGE: 100,
  DEFAULT_SORT_ORDER: 'relevance',
  SUPPORTED_FILE_TYPES: [
    'js', 'ts', 'jsx', 'tsx', 'py', 'java', 'cpp', 'c', 'cs', 'php',
    'rb', 'go', 'rs', 'swift', 'kt', 'scala', 'html', 'css', 'scss',
    'less', 'json', 'xml', 'yaml', 'yml', 'md', 'txt'
  ]
} as const;

// エラーメッセージ
export const ERROR_MESSAGES = {
  API_KEY_MISSING: 'API key is not configured. Please set it in the options page.',
  API_REQUEST_FAILED: 'Failed to communicate with the search API.',
  INVALID_QUERY: 'Search query is invalid or too short.',
  NETWORK_ERROR: 'Network connection error. Please check your internet connection.',
  RATE_LIMIT_EXCEEDED: 'API rate limit exceeded. Please try again later.',
  UNAUTHORIZED: 'Invalid API key. Please check your credentials.',
  SERVER_ERROR: 'Server error occurred. Please try again later.',
  CACHE_ERROR: 'Failed to access cache storage.',
  SETTINGS_ERROR: 'Failed to load or save settings.'
} as const;

// 成功メッセージ
export const SUCCESS_MESSAGES = {
  SETTINGS_SAVED: 'Settings saved successfully.',
  CACHE_CLEARED: 'Cache cleared successfully.',
  SEARCH_COMPLETED: 'Search completed successfully.',
  EXTENSION_UPDATED: 'Extension updated successfully.'
} as const;

// 正規表現パターン
export const REGEX_PATTERNS = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  URL: /^https?:\/\/.+/,
  GITHUB_REPO: /^https:\/\/github\.com\/[^\/]+\/[^\/]+/,
  GITLAB_REPO: /^https:\/\/gitlab\.com\/[^\/]+\/[^\/]+/,
  API_KEY: /^[a-zA-Z0-9_-]{20,}$/
} as const;

// パフォーマンス設定
export const PERFORMANCE_CONFIG = {
  MAX_CONCURRENT_REQUESTS: 3,
  REQUEST_TIMEOUT_MS: 10000,
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY_MS: 1000,
  BATCH_SIZE: 10
} as const;

// セキュリティ設定
export const SECURITY_CONFIG = {
  ALLOWED_ORIGINS: [
    'https://github.com',
    'https://gitlab.com',
    'https://api.gitsearchai.com'
  ],
  CSP_DIRECTIVES: {
    'default-src': "'self'",
    'script-src': "'self'",
    'style-src': "'self' 'unsafe-inline'",
    'img-src': "'self' data: https:",
    'connect-src': "'self' https://api.gitsearchai.com"
  }
} as const;

// 開発・デバッグ設定
export const DEBUG_CONFIG = {
  LOG_LEVELS: ['error', 'warn', 'info', 'debug'] as const,
  DEFAULT_LOG_LEVEL: 'info',
  MAX_LOG_ENTRIES: 1000,
  ENABLE_PERFORMANCE_MONITORING: false
} as const;

// バージョン情報
export const VERSION_INFO = {
  CURRENT_VERSION: '1.0.0',
  MIN_CHROME_VERSION: '88',
  API_VERSION: 'v1',
  MANIFEST_VERSION: 3
} as const;

// 型定義のエクスポート
export type MessageType = typeof MESSAGE_TYPES[keyof typeof MESSAGE_TYPES];
export type StorageKey = typeof STORAGE_KEYS[keyof typeof STORAGE_KEYS];
export type ErrorMessage = typeof ERROR_MESSAGES[keyof typeof ERROR_MESSAGES];
export type SuccessMessage = typeof SUCCESS_MESSAGES[keyof typeof SUCCESS_MESSAGES];
export type LogLevel = typeof DEBUG_CONFIG.LOG_LEVELS[number];
