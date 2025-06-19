/**
 * バックグラウンドスクリプト - Chrome拡張機能のサービスワーカー
 * 拡張機能のライフサイクル管理、メッセージング、ストレージ操作を担当
 */

import { executeWithErrorHandling } from './lib/utils';
import { StorageManager } from './lib/storage';
import { API_ENDPOINTS, DEFAULT_SETTINGS } from './lib/constants';

// サイドパネルの開閉状態を管理するMap（ウィンドウIDをキーとする）
const sidePanelStates = new Map<number, boolean>();

// サービスワーカーのインストール時の処理
chrome.runtime.onInstalled.addListener(async (details) => {
  await executeWithErrorHandling(async () => {
    console.log('GitSearchAI extension installed:', details.reason);

    // デフォルト設定の初期化
    await StorageManager.initializeDefaultSettings(DEFAULT_SETTINGS);

    // コンテキストメニューの設定
    await setupContextMenus();
  }, 'Extension installation');
});

// ウィンドウが閉じられた時のクリーンアップ処理
chrome.windows.onRemoved.addListener((windowId) => {
  // サイドパネル状態をクリーンアップ
  sidePanelStates.delete(windowId);
  console.log(`Cleaned up side panel state for window ${windowId}`);
});

// 拡張機能の起動時の処理
chrome.runtime.onStartup.addListener(async () => {
  await executeWithErrorHandling(async () => {
    console.log('GitSearchAI extension started');

    // 必要に応じて初期化処理を実行
    await performStartupTasks();
  }, 'Extension startup');
});

// コンテンツスクリプトからのメッセージ処理
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  handleMessage(message, sender, sendResponse);
  return true; // 非同期レスポンスを示す
});

// サイドパネルからのポート接続処理（クローズ検知用）
chrome.runtime.onConnect.addListener((port) => {
  if (port.name === 'mySidepanel') {
    console.log('Side panel port connected');

    // ポート切断時の処理（サイドパネルがクローズされた時）
    port.onDisconnect.addListener(async () => {
      console.log('Side panel closed - port disconnected');

      // 現在のタブ情報を取得してサイドパネル状態を更新
      try {
        const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
        if (tabs.length > 0 && tabs[0] && typeof tabs[0].windowId === 'number') {
          const windowId = tabs[0].windowId;
          sidePanelStates.set(windowId, false);
          console.log(`Side panel state updated for window ${windowId}: closed`);

          // ストレージからTabIdを削除（再訪問時に自動で開かないようにする）
          await chrome.storage.local.remove([`sidePanelOpen_${windowId}`]);
        }
      } catch (error) {
        console.error('Error updating side panel state on disconnect:', error);
      }
    });
  }
});

/**
 * メッセージハンドラー - コンテンツスクリプトとの通信を管理
 */
async function handleMessage(
  message: any, 
  sender: chrome.runtime.MessageSender, 
  sendResponse: (response: any) => void
): Promise<void> {
  // メッセージの基本的な検証
  if (!message || typeof message !== 'object') {
    console.error('Invalid message received:', message);
    sendResponse({ success: false, error: 'Invalid message format' });
    return;
  }

  if (!message.type) {
    console.error('Message type is missing:', message);
    sendResponse({ success: false, error: 'Message type is required' });
    return;
  }

  // デバッグ用ログ追加
  console.log(`[DEBUG] Received message type: ${message.type}`, message);

  const result = await executeWithErrorHandling(async () => {
    switch (message.type) {
      case 'SEARCH_REPOSITORIES':
        console.log('[DEBUG] Processing SEARCH_REPOSITORIES');
        return await handleSearchRepositories(message.data);

      case 'GET_SETTINGS':
        console.log('[DEBUG] Processing GET_SETTINGS');
        return await StorageManager.getSettings();

      case 'UPDATE_SETTINGS':
        console.log('[DEBUG] Processing UPDATE_SETTINGS');
        return await StorageManager.updateSettings(message.data);

      case 'CLEAR_CACHE':
        console.log('[DEBUG] Processing CLEAR_CACHE');
        return await StorageManager.clearCache();

      case 'OPEN_SIDE_PANEL':
        console.log('[DEBUG] Processing OPEN_SIDE_PANEL');
        return await handleOpenSidePanel(sender);

      case 'TOGGLE_SIDE_PANEL':
        console.log('[DEBUG] Processing TOGGLE_SIDE_PANEL');
        return await handleToggleSidePanel(sender);

      default:
        console.warn(`Unknown message type received: ${message.type}`);
        throw new Error(`Unknown message type: ${message.type}`);
    }
  }, `Message handling: ${message.type}`);

  // レスポンスの送信（Extension contextが有効な場合のみ）
  try {
    sendResponse(result);
  } catch (error) {
    console.error('Failed to send response:', error);
  }
}

/**
 * サイドパネル展開処理
 */
async function handleOpenSidePanel(sender: chrome.runtime.MessageSender): Promise<any> {
  if (sender.tab?.windowId) {
    await (chrome as any).sidePanel.open({ windowId: sender.tab.windowId });
    sidePanelStates.set(sender.tab.windowId, true);
    return { success: true, message: 'Side panel opened' };
  } else {
    throw new Error('Unable to determine window ID');
  }
}

/**
 * サイドパネルトグル処理（開閉切り替え）
 */
async function handleToggleSidePanel(sender: chrome.runtime.MessageSender): Promise<any> {
  if (!sender.tab?.windowId) {
    throw new Error('Unable to determine window ID');
  }

  const windowId = sender.tab.windowId;
  const isCurrentlyOpen = sidePanelStates.get(windowId) || false;

  if (isCurrentlyOpen) {
    // サイドパネルが開いている場合は閉じる
    try {
      // Chrome API にはsidePanel.close()がないため、setOptions で無効化する
      await (chrome as any).sidePanel.setOptions({
        windowId: windowId,
        enabled: false
      });
      // 少し待ってから再度有効化（次回開けるようにする）
      setTimeout(async () => {
        await (chrome as any).sidePanel.setOptions({
          windowId: windowId,
          enabled: true
        });
      }, 100);

      sidePanelStates.set(windowId, false);
      return { success: true, message: 'Side panel closed' };
    } catch (error) {
      // フォールバック: 状態のみリセット
      sidePanelStates.set(windowId, false);
      return { success: true, message: 'Side panel state reset' };
    }
  } else {
    // サイドパネルが閉じている場合は開く
    await (chrome as any).sidePanel.open({ windowId: windowId });
    sidePanelStates.set(windowId, true);
    return { success: true, message: 'Side panel opened' };
  }
}

/**
 * リポジトリ検索処理
 */
async function handleSearchRepositories(searchData: any): Promise<any> {
  const settings = await StorageManager.getSettings();

  // APIキーの確認
  if (!settings.apiKey) {
    throw new Error('API key is not configured');
  }

  // 検索実行
  const searchResults = await performRepositorySearch(searchData, settings);

  // 結果をキャッシュに保存
  await StorageManager.cacheSearchResults(searchData.query, searchResults);

  return searchResults;
}

/**
 * 実際のリポジトリ検索API呼び出し
 */
async function performRepositorySearch(searchData: any, settings: any): Promise<any> {
  const response = await fetch(API_ENDPOINTS.SEARCH, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${settings.apiKey}`
    },
    body: JSON.stringify({
      query: searchData.query,
      limit: settings.searchLimit || 25,
      filters: searchData.filters || {}
    })
  });

  if (!response.ok) {
    throw new Error(`Search API error: ${response.status} ${response.statusText}`);
  }

  return await response.json();
}

/**
 * コンテキストメニューの設定
 */
async function setupContextMenus(): Promise<void> {
  // サイドパネルを開くメニュー項目
  chrome.contextMenus.create({
    id: 'openGitSearchAISidebar',
    title: 'GitSearchAI サイドバーを開く',
    contexts: ['page', 'selection']
  });

  // 選択されたテキストで検索するメニュー項目
  chrome.contextMenus.create({
    id: 'searchWithGitSearchAI',
    title: 'GitSearchAI で検索',
    contexts: ['selection']
  });

  chrome.contextMenus.onClicked.addListener(async (info, tab) => {
    if (info.menuItemId === 'openGitSearchAISidebar') {
      await executeWithErrorHandling(async () => {
        // サイドパネルを開く
        if (tab?.windowId) {
          await (chrome as any).sidePanel.open({ windowId: tab.windowId });

          // 選択されたテキストがある場合は、サイドパネルに送信
          if (info.selectionText && tab?.id) {
            // 少し遅延を入れてサイドパネルが開いてから送信
            setTimeout(() => {
              chrome.tabs.sendMessage(tab.id!, {
                type: 'SET_SEARCH_QUERY',
                data: { query: info.selectionText }
              });
            }, 500);
          }
        }
      }, 'Open sidebar from context menu');
    } else if (info.menuItemId === 'searchWithGitSearchAI' && info.selectionText) {
      await executeWithErrorHandling(async () => {
        // サイドパネルを開いて検索を実行
        if (tab?.windowId) {
          await (chrome as any).sidePanel.open({ windowId: tab.windowId });

          // 選択されたテキストで検索を実行
          const searchResults = await handleSearchRepositories({
            query: info.selectionText,
            source: 'context_menu'
          });

          // 結果をサイドパネルに送信
          if (tab?.id) {
            setTimeout(() => {
              chrome.tabs.sendMessage(tab.id!, {
                type: 'DISPLAY_SEARCH_RESULTS',
                data: searchResults
              });
            }, 500);
          }
        }
      }, 'Context menu search');
    }
  });
}

/**
 * 起動時のタスク実行
 */
async function performStartupTasks(): Promise<void> {
  // 古いキャッシュデータのクリーンアップ
  await StorageManager.cleanupExpiredCache();

  // 設定の妥当性チェック
  await validateSettings();
}

/**
 * 設定の妥当性チェック
 */
async function validateSettings(): Promise<void> {
  const settings = await StorageManager.getSettings();

  // 必要に応じて設定の修正や警告の表示
  if (settings.cacheTimeout < 1 || settings.cacheTimeout > 1440) {
    await StorageManager.updateSettings({
      ...settings,
      cacheTimeout: DEFAULT_SETTINGS.cacheTimeout
    });
  }
}

/**
 * アイコンクリック時のサイドパネル展開処理
 */
chrome.action.onClicked.addListener(async (tab) => {
  await executeWithErrorHandling(async () => {
    if (tab.windowId) {
      await (chrome as any).sidePanel.open({ windowId: tab.windowId });
    } else {
      throw new Error('Unable to determine window ID for side panel');
    }
  }, 'Open side panel from action click');
});

// エラーハンドリングとログ出力
chrome.runtime.onSuspend.addListener(() => {
  console.log('GitSearchAI extension is being suspended');
});

// 未処理のエラーをキャッチ
self.addEventListener('error', (event) => {
  console.error('Unhandled error in background script:', event.error);
});

self.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection in background script:', event.reason);
});
