/**
 * ストレージ管理 - Chrome拡張機能のストレージ操作を管理
 * 設定、キャッシュ、ユーザーデータの永続化と取得を担当
 */

import { 
  STORAGE_KEYS, 
  DEFAULT_SETTINGS, 
  CACHE_CONFIG,
  StorageKey 
} from './constants';
import { 
  executeWithErrorHandling, 
  deepMerge, 
  calculateStorageSize,
  dateUtils 
} from './utils';

/**
 * 設定データの型定義
 */
export interface Settings {
  apiKey: string;
  searchLimit: number;
  enableNotifications: boolean;
  autoSearch: boolean;
  cacheTimeout: number;
  debugMode: boolean;
  theme: 'light' | 'dark';
  language: 'en' | 'ja';
}

/**
 * キャッシュエントリの型定義
 */
export interface CacheEntry<T = any> {
  data: T;
  timestamp: number;
  ttl: number;
  size: number;
}

/**
 * キャッシュストレージの型定義
 */
export interface CacheStorage {
  [key: string]: CacheEntry;
}

/**
 * 検索履歴エントリの型定義
 */
export interface SearchHistoryEntry {
  query: string;
  timestamp: number;
  results: number;
  source: 'popup' | 'context_menu' | 'content_script';
}

/**
 * ストレージ管理クラス
 */
export class StorageManager {
  /**
   * デフォルト設定の初期化
   */
  static async initializeDefaultSettings(defaultSettings: typeof DEFAULT_SETTINGS): Promise<void> {
    const result = await executeWithErrorHandling(async () => {
      const existingSettings = await chrome.storage.sync.get(STORAGE_KEYS.SETTINGS);
      
      if (!existingSettings[STORAGE_KEYS.SETTINGS]) {
        await chrome.storage.sync.set({
          [STORAGE_KEYS.SETTINGS]: defaultSettings
        });
        console.log('Default settings initialized');
      }
    }, 'Initialize default settings');
    
    if (!result.success) {
      throw new Error(`Failed to initialize settings: ${result.error}`);
    }
  }

  /**
   * 設定の取得
   */
  static async getSettings(): Promise<Settings> {
    const result = await executeWithErrorHandling(async () => {
      const data = await chrome.storage.sync.get(STORAGE_KEYS.SETTINGS);
      const settings = data[STORAGE_KEYS.SETTINGS] || DEFAULT_SETTINGS;
      
      // デフォルト設定とマージして不足している設定を補完
      return deepMerge(DEFAULT_SETTINGS, settings) as Settings;
    }, 'Get settings');
    
    if (!result.success) {
      console.warn('Failed to get settings, using defaults:', result.error);
      return DEFAULT_SETTINGS as Settings;
    }
    
    return result.data!;
  }

  /**
   * 設定の更新
   */
  static async updateSettings(newSettings: Partial<Settings>): Promise<void> {
    const result = await executeWithErrorHandling(async () => {
      const currentSettings = await this.getSettings();
      const updatedSettings = deepMerge(currentSettings, newSettings);
      
      await chrome.storage.sync.set({
        [STORAGE_KEYS.SETTINGS]: updatedSettings
      });
      
      console.log('Settings updated successfully');
    }, 'Update settings');
    
    if (!result.success) {
      throw new Error(`Failed to update settings: ${result.error}`);
    }
  }

  /**
   * 設定のリセット
   */
  static async resetSettings(): Promise<void> {
    const result = await executeWithErrorHandling(async () => {
      await chrome.storage.sync.set({
        [STORAGE_KEYS.SETTINGS]: DEFAULT_SETTINGS
      });
      
      console.log('Settings reset to defaults');
    }, 'Reset settings');
    
    if (!result.success) {
      throw new Error(`Failed to reset settings: ${result.error}`);
    }
  }

  /**
   * キャッシュへのデータ保存
   */
  static async cacheData<T>(key: string, data: T, ttl?: number): Promise<void> {
    const result = await executeWithErrorHandling(async () => {
      const cache = await this.getCache();
      const timestamp = dateUtils.now();
      const size = calculateStorageSize(data);
      const entryTtl = ttl || CACHE_CONFIG.DEFAULT_TTL;
      
      // キャッシュサイズの制限チェック
      await this.ensureCacheSpace(size);
      
      cache[key] = {
        data,
        timestamp,
        ttl: entryTtl,
        size
      };
      
      await chrome.storage.local.set({
        [STORAGE_KEYS.CACHE]: cache
      });
      
      console.log(`Data cached with key: ${key}`);
    }, 'Cache data');
    
    if (!result.success) {
      console.warn(`Failed to cache data for key ${key}:`, result.error);
    }
  }

  /**
   * キャッシュからのデータ取得
   */
  static async getCachedData<T>(key: string): Promise<T | null> {
    const result = await executeWithErrorHandling(async () => {
      const cache = await this.getCache();
      const entry = cache[key];
      
      if (!entry) {
        return null;
      }
      
      // TTLチェック
      const now = dateUtils.now();
      if (now - entry.timestamp > entry.ttl) {
        // 期限切れのエントリを削除
        delete cache[key];
        await chrome.storage.local.set({
          [STORAGE_KEYS.CACHE]: cache
        });
        return null;
      }
      
      return entry.data as T;
    }, 'Get cached data');
    
    if (!result.success) {
      console.warn(`Failed to get cached data for key ${key}:`, result.error);
      return null;
    }
    
    return result.data!;
  }

  /**
   * 検索結果のキャッシュ
   */
  static async cacheSearchResults(query: string, results: any): Promise<void> {
    const cacheKey = `search_${this.hashString(query)}`;
    await this.cacheData(cacheKey, results);
  }

  /**
   * キャッシュされた検索結果の取得
   */
  static async getCachedSearchResults(query: string): Promise<any | null> {
    const cacheKey = `search_${this.hashString(query)}`;
    return await this.getCachedData(cacheKey);
  }

  /**
   * キャッシュ全体の取得
   */
  private static async getCache(): Promise<CacheStorage> {
    const data = await chrome.storage.local.get(STORAGE_KEYS.CACHE);
    return data[STORAGE_KEYS.CACHE] || {};
  }

  /**
   * キャッシュのクリア
   */
  static async clearCache(): Promise<void> {
    const result = await executeWithErrorHandling(async () => {
      await chrome.storage.local.remove(STORAGE_KEYS.CACHE);
      console.log('Cache cleared successfully');
    }, 'Clear cache');
    
    if (!result.success) {
      throw new Error(`Failed to clear cache: ${result.error}`);
    }
  }

  /**
   * 期限切れキャッシュのクリーンアップ
   */
  static async cleanupExpiredCache(): Promise<void> {
    const result = await executeWithErrorHandling(async () => {
      const cache = await this.getCache();
      const now = dateUtils.now();
      let cleanedCount = 0;
      
      for (const [key, entry] of Object.entries(cache)) {
        if (now - entry.timestamp > entry.ttl) {
          delete cache[key];
          cleanedCount++;
        }
      }
      
      if (cleanedCount > 0) {
        await chrome.storage.local.set({
          [STORAGE_KEYS.CACHE]: cache
        });
        console.log(`Cleaned up ${cleanedCount} expired cache entries`);
      }
    }, 'Cleanup expired cache');
    
    if (!result.success) {
      console.warn('Failed to cleanup expired cache:', result.error);
    }
  }

  /**
   * キャッシュ容量の確保
   */
  private static async ensureCacheSpace(requiredSize: number): Promise<void> {
    const cache = await this.getCache();
    const entries = Object.entries(cache);
    
    // 現在のキャッシュサイズを計算
    let currentSize = entries.reduce((total, [, entry]) => total + entry.size, 0);
    const maxSizeBytes = CACHE_CONFIG.MAX_SIZE_MB * 1024 * 1024;
    
    // 容量制限チェック
    if (currentSize + requiredSize > maxSizeBytes) {
      // 古いエントリから削除（LRU方式）
      const sortedEntries = entries.sort((a, b) => a[1].timestamp - b[1].timestamp);
      
      for (const [key, entry] of sortedEntries) {
        delete cache[key];
        currentSize -= entry.size;
        
        if (currentSize + requiredSize <= maxSizeBytes) {
          break;
        }
      }
      
      await chrome.storage.local.set({
        [STORAGE_KEYS.CACHE]: cache
      });
    }
    
    // エントリ数制限チェック
    const remainingEntries = Object.entries(cache);
    if (remainingEntries.length >= CACHE_CONFIG.MAX_ENTRIES) {
      const sortedEntries = remainingEntries.sort((a, b) => a[1].timestamp - b[1].timestamp);
      const entriesToRemove = sortedEntries.slice(0, remainingEntries.length - CACHE_CONFIG.MAX_ENTRIES + 1);
      
      for (const [key] of entriesToRemove) {
        delete cache[key];
      }
      
      await chrome.storage.local.set({
        [STORAGE_KEYS.CACHE]: cache
      });
    }
  }

  /**
   * 検索履歴の追加
   */
  static async addSearchHistory(entry: SearchHistoryEntry): Promise<void> {
    const result = await executeWithErrorHandling(async () => {
      const data = await chrome.storage.local.get(STORAGE_KEYS.SEARCH_HISTORY);
      const history: SearchHistoryEntry[] = data[STORAGE_KEYS.SEARCH_HISTORY] || [];
      
      // 新しいエントリを先頭に追加
      history.unshift(entry);
      
      // 履歴の上限を設定（例：100件）
      const maxHistoryEntries = 100;
      if (history.length > maxHistoryEntries) {
        history.splice(maxHistoryEntries);
      }
      
      await chrome.storage.local.set({
        [STORAGE_KEYS.SEARCH_HISTORY]: history
      });
    }, 'Add search history');
    
    if (!result.success) {
      console.warn('Failed to add search history:', result.error);
    }
  }

  /**
   * 検索履歴の取得
   */
  static async getSearchHistory(): Promise<SearchHistoryEntry[]> {
    const result = await executeWithErrorHandling(async () => {
      const data = await chrome.storage.local.get(STORAGE_KEYS.SEARCH_HISTORY);
      return data[STORAGE_KEYS.SEARCH_HISTORY] || [];
    }, 'Get search history');
    
    if (!result.success) {
      console.warn('Failed to get search history:', result.error);
      return [];
    }
    
    return result.data!;
  }

  /**
   * 検索履歴のクリア
   */
  static async clearSearchHistory(): Promise<void> {
    const result = await executeWithErrorHandling(async () => {
      await chrome.storage.local.remove(STORAGE_KEYS.SEARCH_HISTORY);
      console.log('Search history cleared');
    }, 'Clear search history');
    
    if (!result.success) {
      throw new Error(`Failed to clear search history: ${result.error}`);
    }
  }

  /**
   * ストレージ使用量の取得
   */
  static async getStorageUsage(): Promise<{ sync: number; local: number }> {
    const result = await executeWithErrorHandling(async () => {
      const [syncUsage, localUsage] = await Promise.all([
        chrome.storage.sync.getBytesInUse(),
        chrome.storage.local.getBytesInUse()
      ]);
      
      return {
        sync: syncUsage,
        local: localUsage
      };
    }, 'Get storage usage');
    
    if (!result.success) {
      console.warn('Failed to get storage usage:', result.error);
      return { sync: 0, local: 0 };
    }
    
    return result.data!;
  }

  /**
   * 文字列のハッシュ化（簡易版）
   */
  private static hashString(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // 32bit整数に変換
    }
    return Math.abs(hash).toString(36);
  }

  /**
   * 全ストレージデータのエクスポート（デバッグ用）
   */
  static async exportAllData(): Promise<any> {
    const result = await executeWithErrorHandling(async () => {
      const [syncData, localData] = await Promise.all([
        chrome.storage.sync.get(),
        chrome.storage.local.get()
      ]);
      
      return {
        sync: syncData,
        local: localData,
        timestamp: dateUtils.now()
      };
    }, 'Export all data');
    
    if (!result.success) {
      throw new Error(`Failed to export data: ${result.error}`);
    }
    
    return result.data!;
  }
}