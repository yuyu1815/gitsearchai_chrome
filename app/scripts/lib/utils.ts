/**
 * ユーティリティ関数 - 汎用的な機能を提供
 * エラーハンドリング、データ変換、バリデーション、デバウンス処理など
 */

import { DEBUG_CONFIG, REGEX_PATTERNS, LogLevel } from './constants';

/**
 * 操作結果の型定義
 */
export interface OperationResult<T> {
  success: boolean;
  data?: T;
  error?: string;
  context?: string;
}

/**
 * エラー情報の型定義
 */
export interface ErrorInfo {
  message: string;
  stack?: string | undefined;
  timestamp: string;
  context?: string | undefined;
}

/**
 * 汎用的なエラーハンドリング関数
 * 非同期操作を安全に実行し、エラーを適切に処理する
 */
export async function executeWithErrorHandling<T>(
  operation: () => Promise<T>,
  context: string
): Promise<OperationResult<T>> {
  try {
    const result = await operation();
    return { success: true, data: result };
  } catch (error) {
    const errorInfo: ErrorInfo = {
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString(),
      context: context
    };

    logError(errorInfo);

    return {
      success: false,
      error: getUserFriendlyMessage(error),
      context: context
    };
  }
}

/**
 * ユーザーフレンドリーなエラーメッセージを生成
 */
export function getUserFriendlyMessage(error: unknown): string {
  if (error instanceof Error) {
    // 特定のエラータイプに基づいてメッセージをカスタマイズ
    if (error.message.includes('fetch')) {
      return 'Network connection error. Please check your internet connection.';
    }
    if (error.message.includes('API key')) {
      return 'API key is invalid or missing. Please check your settings.';
    }
    if (error.message.includes('rate limit')) {
      return 'Too many requests. Please try again later.';
    }
    return error.message;
  }
  return 'An unexpected error occurred. Please try again.';
}

/**
 * エラーログの出力
 */
export function logError(errorInfo: ErrorInfo): void {
  const logMessage = `[${errorInfo.timestamp}] Error in ${errorInfo.context}: ${errorInfo.message}`;

  console.error(logMessage);

  if (errorInfo.stack) {
    console.error('Stack trace:', errorInfo.stack);
  }

  // デバッグモードが有効な場合、追加情報を出力
  if (DEBUG_CONFIG.ENABLE_PERFORMANCE_MONITORING) {
    console.error('Full error info:', errorInfo);
  }
}

/**
 * デバウンス関数 - 連続した関数呼び出しを制御
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout;

  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
}

/**
 * スロットル関数 - 関数の実行頻度を制限
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;

  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

/**
 * 深いオブジェクトのクローンを作成
 */
export function deepClone<T>(obj: T): T {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }

  if (obj instanceof Date) {
    return new Date(obj.getTime()) as unknown as T;
  }

  if (obj instanceof Array) {
    return obj.map(item => deepClone(item)) as unknown as T;
  }

  if (typeof obj === 'object') {
    const clonedObj = {} as T;
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        clonedObj[key] = deepClone(obj[key]);
      }
    }
    return clonedObj;
  }

  return obj;
}

/**
 * オブジェクトのマージ（深いマージ）
 */
export function deepMerge<T extends Record<string, any>>(target: T, source: Partial<T>): T {
  const result = deepClone(target);

  for (const key in source) {
    if (source.hasOwnProperty(key)) {
      const sourceValue = source[key];
      const targetValue = result[key];

      if (isObject(sourceValue) && isObject(targetValue)) {
        result[key] = deepMerge(targetValue, sourceValue as Partial<typeof targetValue>);
      } else {
        result[key] = sourceValue as T[Extract<keyof T, string>];
      }
    }
  }

  return result;
}

/**
 * オブジェクトかどうかを判定
 */
function isObject(item: any): item is Record<string, any> {
  return item && typeof item === 'object' && !Array.isArray(item);
}

/**
 * 文字列のバリデーション
 */
export const validateString = {
  email: (email: string): boolean => REGEX_PATTERNS.EMAIL.test(email),
  url: (url: string): boolean => REGEX_PATTERNS.URL.test(url),
  apiKey: (key: string): boolean => REGEX_PATTERNS.API_KEY.test(key),
  notEmpty: (str: string): boolean => str.trim().length > 0,
  minLength: (str: string, min: number): boolean => str.length >= min,
  maxLength: (str: string, max: number): boolean => str.length <= max
};

/**
 * 数値のバリデーション
 */
export const validateNumber = {
  isPositive: (num: number): boolean => num > 0,
  isInRange: (num: number, min: number, max: number): boolean => num >= min && num <= max,
  isInteger: (num: number): boolean => Number.isInteger(num)
};

/**
 * 配列のユーティリティ
 */
export const arrayUtils = {
  /**
   * 配列を指定されたサイズのチャンクに分割
   */
  chunk: <T>(array: T[], size: number): T[][] => {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  },

  /**
   * 配列から重複を除去
   */
  unique: <T>(array: T[]): T[] => [...new Set(array)],

  /**
   * 配列をシャッフル
   */
  shuffle: <T>(array: T[]): T[] => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const temp = shuffled[i]!;
      shuffled[i] = shuffled[j]!;
      shuffled[j] = temp;
    }
    return shuffled;
  }
};

/**
 * 日時のユーティリティ
 */
export const dateUtils = {
  /**
   * 現在のタイムスタンプを取得
   */
  now: (): number => Date.now(),

  /**
   * 日時を指定されたフォーマットで文字列に変換
   */
  format: (date: Date, format: string = 'YYYY-MM-DD HH:mm:ss'): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');

    return format
      .replace('YYYY', String(year))
      .replace('MM', month)
      .replace('DD', day)
      .replace('HH', hours)
      .replace('mm', minutes)
      .replace('ss', seconds);
  },

  /**
   * 相対時間を取得（例：2 hours ago）
   */
  getRelativeTime: (date: Date): string => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMinutes < 1) return 'just now';
    if (diffMinutes < 60) return `${diffMinutes} minute${diffMinutes > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  }
};

/**
 * ストレージサイズの計算
 */
export function calculateStorageSize(data: any): number {
  return new Blob([JSON.stringify(data)]).size;
}

/**
 * ストレージサイズを人間が読みやすい形式に変換
 */
export function formatStorageSize(bytes: number): string {
  const units = ['B', 'KB', 'MB', 'GB'];
  let size = bytes;
  let unitIndex = 0;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }

  return `${size.toFixed(2)} ${units[unitIndex]}`;
}

/**
 * Promise のタイムアウト処理
 */
export function withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error(`Operation timed out after ${timeoutMs}ms`)), timeoutMs);
    })
  ]);
}

/**
 * リトライ機能付きの非同期実行
 */
export async function withRetry<T>(
  operation: () => Promise<T>,
  maxAttempts: number = 3,
  delayMs: number = 1000
): Promise<T> {
  let lastError: Error;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      if (attempt === maxAttempts) {
        throw lastError;
      }

      // 指数バックオフでリトライ間隔を調整
      const delay = delayMs * Math.pow(2, attempt - 1);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw lastError!;
}
