/**
 * コンテンツスクリプト - GitHubとGitLabページでのサイドパネル展開機能
 * ページのDOM操作、サイドパネル展開ボタン表示、バックグラウンドスクリプトとの通信を担当
 */

import { executeWithErrorHandling } from './lib/utils';
import { StorageManager } from './lib/storage';

// ページ読み込み完了時の初期化処理
document.addEventListener('DOMContentLoaded', async () => {
  await executeWithErrorHandling(async () => {
    console.log('GitSearchAI content script loaded');
    await initializeContentScript();
  }, 'Content script initialization');
});

// 動的に読み込まれるページにも対応
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeContentScript);
} else {
  initializeContentScript();
}

/**
 * コンテンツスクリプトの初期化
 */
async function initializeContentScript(): Promise<void> {
  // 現在のページがGitHubまたはGitLabかチェック
  const currentSite = detectCurrentSite();
  if (!currentSite) {
    console.log('GitSearchAI: Not on a supported site');
    return;
  }

  console.log(`GitSearchAI: Initializing on ${currentSite}`);

  // 検索UIの挿入
  await insertSearchUI(currentSite);

  // イベントリスナーの設定
  setupEventListeners();
}

/**
 * 現在のサイトを検出
 */
function detectCurrentSite(): 'github' | 'gitlab' | 'gitsearchai' | null {
  const hostname = window.location.hostname;

  if (hostname.includes('github.com')) {
    return 'github';
  } else if (hostname.includes('gitlab.com')) {
    return 'gitlab';
  } else if (hostname.includes('gitsearchai.com')) {
    return 'gitsearchai';
  }

  return null;
}

/**
 * サイドパネル展開UIをページに挿入
 */
async function insertSearchUI(site: 'github' | 'gitlab' | 'gitsearchai'): Promise<void> {
  if (site === 'gitsearchai') {
    // gitsearchai.comの場合は既存のリポジトリカードにボタンを追加
    addExternalServiceButtonsToGitSearchAI();

    // 動的コンテンツの監視を開始
    setupGitSearchAIMutationObserver();
    return;
  }

  // 既存のUIが存在する場合は削除
  const existingUI = document.getElementById('gitsearchai-ui');
  if (existingUI) {
    existingUI.remove();
  }

  // サイドパネル展開UIコンテナを作成
  const searchContainer = document.createElement('div');
  searchContainer.id = 'gitsearchai-ui';
  searchContainer.className = 'gitsearchai-container';

  // サイドパネルトグルボタンを作成
  const searchButton = document.createElement('button');
  searchButton.id = 'gitsearchai-search-btn';
  searchButton.className = 'gitsearchai-search-button';
  searchButton.textContent = '🔍 AI Search';
  searchButton.title = 'Toggle AI Search Side Panel (Open/Close)';

  searchContainer.appendChild(searchButton);

  // サイトに応じて適切な場所に挿入
  const insertionPoint = getInsertionPoint(site);
  if (insertionPoint) {
    insertionPoint.appendChild(searchContainer);
  } else {
    // フォールバック: bodyの最初に挿入
    document.body.insertBefore(searchContainer, document.body.firstChild);
  }
}

/**
 * gitsearchai.comのリポジトリカードに外部サービスボタンを追加
 */
function addExternalServiceButtonsToGitSearchAI(): void {
  // リポジトリカードを検索（提供されたHTMLの構造に基づく）
  const repoCards = document.querySelectorAll('.bg-white.rounded-lg.border.border-gray-200');

  repoCards.forEach(card => {
    // 既にボタンが追加されているかチェック
    if (card.querySelector('.gitsearchai-external-buttons')) {
      return;
    }

    // GitHubリンクを探す
    const githubLink = card.querySelector('a[href*="github.com"]') as HTMLAnchorElement;
    if (!githubLink) {
      return;
    }

    const githubUrl = githubLink.href;

    // ボタンコンテナを作成
    const buttonContainer = document.createElement('div');
    buttonContainer.className = 'gitsearchai-external-buttons';
    buttonContainer.style.cssText = `
      display: flex;
      gap: 8px;
      margin-top: 12px;
      padding-top: 12px;
      border-top: 1px solid #e2e8f0;
    `;

    // 外部サービスボタンを作成
    const services = [
      { name: 'UIthub', emoji: '🔗', service: 'uithub' },
      { name: 'GitIngest', emoji: '📄', service: 'gitingest' },
      { name: 'DeepWiki', emoji: '📚', service: 'deepwiki' }
    ];

    services.forEach(({ name, emoji, service }) => {
      const button = document.createElement('button');
      button.className = `gitsearchai-external-service-button ${service}`;
      button.textContent = `${emoji} ${name}`;
      button.style.cssText = `
        flex: 1;
        padding: 6px 12px;
        font-size: 12px;
        font-weight: 500;
        border: 1px solid #e2e8f0;
        border-radius: 4px;
        background: #ffffff;
        color: #64748b;
        cursor: pointer;
        transition: all 0.2s ease;
        text-decoration: none;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 4px;
      `;

      // サービス固有のスタイル
      if (service === 'uithub') {
        button.style.borderColor = '#10b981';
        button.style.color = '#10b981';
      } else if (service === 'deepwiki') {
        button.style.borderColor = '#3b82f6';
        button.style.color = '#3b82f6';
      } else if (service === 'gitingest') {
        button.style.borderColor = '#f59e0b';
        button.style.color = '#f59e0b';
      }

      // ホバー効果
      button.addEventListener('mouseenter', () => {
        button.style.transform = 'translateY(-1px)';
        button.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.1)';
        if (service === 'uithub') {
          button.style.background = '#ecfdf5';
          button.style.borderColor = '#059669';
          button.style.color = '#059669';
        } else if (service === 'deepwiki') {
          button.style.background = '#eff6ff';
          button.style.borderColor = '#2563eb';
          button.style.color = '#2563eb';
        } else if (service === 'gitingest') {
          button.style.background = '#fffbeb';
          button.style.borderColor = '#d97706';
          button.style.color = '#d97706';
        }
      });

      button.addEventListener('mouseleave', () => {
        button.style.transform = 'translateY(0)';
        button.style.boxShadow = 'none';
        button.style.background = '#ffffff';
        if (service === 'uithub') {
          button.style.borderColor = '#10b981';
          button.style.color = '#10b981';
        } else if (service === 'deepwiki') {
          button.style.borderColor = '#3b82f6';
          button.style.color = '#3b82f6';
        } else if (service === 'gitingest') {
          button.style.borderColor = '#f59e0b';
          button.style.color = '#f59e0b';
        }
      });

      // クリックイベント
      button.addEventListener('click', (event) => {
        event.preventDefault();
        event.stopPropagation();
        const externalUrl = transformToExternalServiceUrl(githubUrl, service);
        window.open(externalUrl, '_blank');
      });

      buttonContainer.appendChild(button);
    });

    // カードの最後にボタンコンテナを追加
    card.appendChild(buttonContainer);
  });
}

/**
 * gitsearchai.comの動的コンテンツ監視を設定
 */
function setupGitSearchAIMutationObserver(): void {
  const observer = new MutationObserver((mutations) => {
    let shouldAddButtons = false;

    mutations.forEach((mutation) => {
      // 新しいノードが追加された場合
      if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            const element = node as Element;
            // リポジトリカードが追加されたかチェック
            if (element.matches('.bg-white.rounded-lg.border.border-gray-200') ||
                element.querySelector('.bg-white.rounded-lg.border.border-gray-200')) {
              shouldAddButtons = true;
            }
          }
        });
      }
    });

    if (shouldAddButtons) {
      // 少し遅延を入れてボタンを追加（DOMの更新完了を待つ）
      setTimeout(() => {
        addExternalServiceButtonsToGitSearchAI();
      }, 100);
    }
  });

  // ページ全体を監視
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
}

/**
 * GitHubのURLを外部サービスのURLに変換
 */
function transformToExternalServiceUrl(githubUrl: string, service: string): string {
  // GitHubのURLからパスを抽出 (例: https://github.com/cacay/MemoryPool → cacay/MemoryPool)
  const githubMatch = githubUrl.match(/github\.com\/(.+)/);
  if (!githubMatch) {
    return githubUrl; // GitHubのURLでない場合はそのまま返す
  }

  const repoPath = githubMatch[1];

  switch (service) {
    case 'uithub':
      return `https://uithub.com/${repoPath}`;
    case 'deepwiki':
      return `https://deepwiki.com/${repoPath}`;
    case 'gitingest':
      return `https://gitingest.com/${repoPath}`;
    default:
      return githubUrl;
  }
}

/**
 * サイトに応じた挿入ポイントを取得
 */
function getInsertionPoint(site: 'github' | 'gitlab'): Element | null {
  if (site === 'github') {
    // GitHubのヘッダー部分を探す
    return document.querySelector('.Header') || 
           document.querySelector('header') ||
           document.querySelector('.js-header-wrapper');
  } else if (site === 'gitlab') {
    // GitLabのヘッダー部分を探す
    return document.querySelector('.navbar') ||
           document.querySelector('header') ||
           document.querySelector('.top-bar');
  }

  return null;
}

/**
 * イベントリスナーの設定
 */
function setupEventListeners(): void {
  // 検索ボタンのクリックイベント
  const searchButton = document.getElementById('gitsearchai-search-btn');
  if (searchButton) {
    searchButton.addEventListener('click', handleSearchButtonClick);
  }

  // キーボードショートカット (Ctrl+Shift+S)
  document.addEventListener('keydown', (event) => {
    if (event.ctrlKey && event.shiftKey && event.key === 'S') {
      event.preventDefault();
      handleSearchButtonClick();
    }
  });
}

/**
 * サイドパネルトグルボタンクリック時の処理（開閉切り替え）
 */
async function handleSearchButtonClick(): Promise<void> {
  await executeWithErrorHandling(async () => {
    // Extension contextの有効性をチェック
    if (!chrome.runtime?.id) {
      console.warn('Extension context is invalidated, attempting to reload');
      window.location.reload();
      return;
    }

    try {
      // デバッグ用ログ追加
      console.log('[DEBUG] Sending TOGGLE_SIDE_PANEL message');

      // サイドパネルをトグル（開閉切り替え）
      const response = await chrome.runtime.sendMessage({
        type: 'TOGGLE_SIDE_PANEL',
        data: {
          source: 'content_script',
          currentUrl: window.location.href
        }
      });

      // デバッグ用ログ追加
      console.log('[DEBUG] Received response:', response);

      // レスポンスの確認
      if (response && !response.success) {
        console.error('Side panel toggle failed:', response.error);
      }
    } catch (error) {
      // Extension context invalidated エラーの処理
      if (error instanceof Error && error.message.includes('Extension context invalidated')) {
        console.warn('Extension context invalidated, reloading page');
        window.location.reload();
      } else {
        console.error('Failed to send message to background script:', error);
        throw error;
      }
    }
  }, 'Side panel toggle button click');
}


/**
 * バックグラウンドスクリプトからのメッセージを処理
 */
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  executeWithErrorHandling(async () => {
    switch (message.type) {
      case 'PING':
        sendResponse({ status: 'alive' });
        break;

      default:
        console.log('Unknown message type:', message.type);
    }
  }, `Message handling: ${message.type}`);

  return true; // 非同期レスポンスを示す
});

// ページの変更を監視（SPAに対応）
let currentUrl = window.location.href;
const observer = new MutationObserver(() => {
  if (window.location.href !== currentUrl) {
    currentUrl = window.location.href;
    // URL変更時に再初期化
    setTimeout(initializeContentScript, 1000);
  }
});

observer.observe(document.body, {
  childList: true,
  subtree: true
});

// エラーハンドリング
window.addEventListener('error', (event) => {
  console.error('GitSearchAI content script error:', event.error);
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('GitSearchAI content script unhandled rejection:', event.reason);
});
