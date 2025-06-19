/**
 * サイドパネルスクリプト - GitSearchAI Chrome拡張機能のサイドパネル制御
 * 検索機能、結果表示、オプション画面への遷移を管理
 */

import { executeWithErrorHandling, OperationResult } from './lib/utils';
import { LogLevel } from './lib/constants';
import { gitHubSearchApi } from './modules/data/search-api';
import { SimplifiedSearchResult } from './modules/data/github-api-types';

/**
 * 検索結果の型定義（SimplifiedSearchResultのエイリアス）
 */
type SearchResult = SimplifiedSearchResult;

/**
 * サイドパネルクラス - UI制御とイベント管理
 */
class SidePanelController {
  private searchInput!: HTMLInputElement;
  private searchButton!: HTMLButtonElement;
  private resultsSection!: HTMLElement;
  private loadingSection!: HTMLElement;
  private sidepanelHeader!: HTMLElement;
  private isSearching: boolean = false;

  constructor() {
    this.initializeElements();
    this.setupEventListeners();
    this.loadInitialState();
    this.establishPortConnection();
  }

  /**
   * DOM要素の初期化
   */
  private initializeElements(): void {
    this.searchInput = document.getElementById('searchInput') as HTMLInputElement;
    this.searchButton = document.getElementById('searchButton') as HTMLButtonElement;
    this.resultsSection = document.getElementById('resultsSection') as HTMLElement;
    this.loadingSection = document.getElementById('loadingSection') as HTMLElement;
    this.sidepanelHeader = document.querySelector('.sidepanel-header') as HTMLElement;

    if (!this.searchInput || !this.searchButton || !this.resultsSection || 
        !this.loadingSection || !this.sidepanelHeader) {
      throw new Error('Required DOM elements not found');
    }
  }

  /**
   * イベントリスナーの設定
   */
  private setupEventListeners(): void {
    // 検索ボタンクリック
    this.searchButton.addEventListener('click', () => {
      this.handleSearch();
    });

    // 検索入力でEnterキー
    this.searchInput.addEventListener('keypress', (event) => {
      if (event.key === 'Enter') {
        this.handleSearch();
      }
    });

    // 検索入力の変更
    this.searchInput.addEventListener('input', () => {
      this.handleInputChange();
    });

    // サイドパネルヘッダークリック - GitSearchAIサイトへリダイレクト
    this.sidepanelHeader.addEventListener('click', () => {
      this.openUrl('https://www.gitsearchai.com/');
    });

    // backgroundからのメッセージを受信
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      this.handleBackgroundMessage(message, sender, sendResponse);
      return true; // 非同期レスポンスを示す
    });
  }

  /**
   * ポート接続の確立（サイドパネルクローズ検知用）
   */
  private establishPortConnection(): void {
    try {
      // サイドパネル用のポート接続を確立
      const port = chrome.runtime.connect({ name: 'mySidepanel' });
      console.log('Side panel port connection established');

      // ポート切断時のハンドリング（オプション）
      port.onDisconnect.addListener(() => {
        console.log('Side panel port disconnected');
      });
    } catch (error) {
      console.error('Failed to establish port connection:', error);
    }
  }

  /**
   * backgroundからのメッセージ処理
   */
  private async handleBackgroundMessage(
    message: any,
    sender: chrome.runtime.MessageSender,
    sendResponse: (response: any) => void
  ): Promise<void> {
    const result = await executeWithErrorHandling(async () => {
      switch (message.type) {
        case 'SET_SEARCH_QUERY':
          // 検索クエリを設定
          if (message.data?.query) {
            this.searchInput.value = message.data.query;
            this.handleInputChange();
            // 自動的に検索を実行
            await this.handleSearch();
          }
          return { success: true };

        case 'DISPLAY_SEARCH_RESULTS':
          // 検索結果を表示
          if (message.data) {
            this.displayResults(message.data);
          }
          return { success: true };

        default:
          throw new Error(`Unknown message type: ${message.type}`);
      }
    }, `Message handling: ${message.type}`);

    sendResponse(result);
  }

  /**
   * 初期状態の読み込み
   */
  private async loadInitialState(): Promise<void> {
    const result = await executeWithErrorHandling(async () => {
      // 前回の検索クエリを復元
      const storage = await chrome.storage.local.get(['lastSearchQuery']);
      if (storage['lastSearchQuery']) {
        this.searchInput.value = storage['lastSearchQuery'];
      }

      // 初期メッセージを表示
      this.showEmptyState();
    }, 'loadInitialState');

    if (!result.success) {
      this.showError('初期化に失敗しました');
    }
  }

  /**
   * 検索処理
   */
  private async handleSearch(): Promise<void> {
    const query = this.searchInput.value.trim();
    if (!query) {
      this.showError('検索キーワードを入力してください');
      return;
    }

    if (this.isSearching) {
      return;
    }

    this.isSearching = true;
    this.showLoading();
    this.updateSearchButton(true);

    const result = await executeWithErrorHandling(async () => {
      // 検索クエリを保存
      await chrome.storage.local.set({ lastSearchQuery: query });

      // 検索実行（実際のAPI呼び出しは後で実装）
      const searchResults = await this.performSearch(query);
      return searchResults;
    }, 'handleSearch');

    this.isSearching = false;
    this.hideLoading();
    this.updateSearchButton(false);

    if (result.success && result.data) {
      this.displayResults(result.data);
    } else {
      this.showError(result.error || '検索に失敗しました');
    }
  }

  /**
   * 実際の検索処理（GitHub検索APIを使用）
   */
  private async performSearch(query: string): Promise<SearchResult[]> {
    // クエリの妥当性を検証
    const validation = gitHubSearchApi.validateQuery(query);
    if (!validation.isValid) {
      throw new Error(validation.error || '無効な検索クエリです');
    }

    // GitHub検索APIを呼び出し
    const result = await gitHubSearchApi.searchRepositories(query);

    if (!result.success) {
      throw new Error(result.error || '検索に失敗しました');
    }

    return result.data || [];
  }

  /**
   * 検索結果の表示
   */
  private displayResults(results: SearchResult[]): void {
    if (results.length === 0) {
      this.showEmptyState('検索結果が見つかりませんでした');
      return;
    }

    const resultsHtml = results.map(result => `
      <div class="result-item" data-url="${result.url}" tabindex="0">
        <div class="result-header">
          <div class="result-title">
            <span>${this.escapeHtml(result.title)}</span>
          </div>
          <div class="result-owner">
            <img src="${result.owner.avatar}" alt="${this.escapeHtml(result.owner.name)}" class="owner-avatar" width="16" height="16">
            <span class="owner-name">${this.escapeHtml(result.owner.name)}</span>
            <span class="owner-type">${result.owner.type === 'Organization' ? '🏢' : '👤'}</span>
          </div>
        </div>
        <div class="result-description">
          ${this.escapeHtml(result.description)}
        </div>
        <div class="result-meta">
          ${result.language ? `<div class="result-meta-item">📝 ${result.language}</div>` : ''}
          <div class="result-meta-item">⭐ ${result.stars}</div>
          <div class="result-meta-item">🍴 ${result.forks}</div>
          <div class="result-meta-item">📅 ${result.lastUpdated}</div>
          ${result.license ? `<div class="result-meta-item">📄 ${this.escapeHtml(result.license)}</div>` : ''}
        </div>
        ${result.topics.length > 0 ? `
          <div class="result-topics">
            ${result.topics.slice(0, 5).map(topic => `<span class="topic-tag">${this.escapeHtml(topic)}</span>`).join('')}
            ${result.topics.length > 5 ? `<span class="topic-more">+${result.topics.length - 5} more</span>` : ''}
          </div>
        ` : ''}
        <div class="result-actions">
          <button class="external-service-button uithub" data-service="uithub" data-url="${result.url}">
            🔗 UIthub
          </button>
          <button class="external-service-button gitingest" data-service="gitingest" data-url="${result.url}">
            📄 GitIngest
          </button>
          <button class="external-service-button deepwiki" data-service="deepwiki" data-url="${result.url}">
            📚 DeepWiki
          </button>
        </div>
      </div>
    `).join('');

    this.resultsSection.innerHTML = resultsHtml;

    // 結果アイテムのクリックイベントを設定
    this.resultsSection.querySelectorAll('.result-item').forEach(item => {
      item.addEventListener('click', () => {
        const url = item.getAttribute('data-url');
        if (url) {
          this.openUrl(url);
        }
      });

      item.addEventListener('keypress', (event: Event) => {
        const keyboardEvent = event as KeyboardEvent;
        if (keyboardEvent.key === 'Enter') {
          const url = item.getAttribute('data-url');
          if (url) {
            this.openUrl(url);
          }
        }
      });
    });

    // 外部サービスボタンのクリックイベントを設定
    this.resultsSection.querySelectorAll('.external-service-button').forEach(button => {
      button.addEventListener('click', (event: Event) => {
        event.stopPropagation(); // 親要素のクリックイベントを防ぐ
        const service = button.getAttribute('data-service');
        const githubUrl = button.getAttribute('data-url');
        if (service && githubUrl) {
          const externalUrl = this.transformToExternalServiceUrl(githubUrl, service);
          this.openUrl(externalUrl);
        }
      });
    });
  }

  /**
   * 入力変更時の処理
   */
  private handleInputChange(): void {
    const query = this.searchInput.value.trim();
    this.searchButton.disabled = !query || this.isSearching;
  }

  /**
   * ローディング表示
   */
  private showLoading(): void {
    this.loadingSection.style.display = 'flex';
    this.resultsSection.innerHTML = '';
  }

  /**
   * ローディング非表示
   */
  private hideLoading(): void {
    this.loadingSection.style.display = 'none';
  }

  /**
   * 検索ボタンの状態更新
   */
  private updateSearchButton(isSearching: boolean): void {
    this.searchButton.disabled = isSearching || !this.searchInput.value.trim();
    this.searchButton.textContent = isSearching ? 'Searching...' : 'Search';
  }

  /**
   * エラー表示
   */
  private showError(message: string): void {
    this.resultsSection.innerHTML = `
      <div class="error-message">
        ${this.escapeHtml(message)}
      </div>
    `;
  }

  /**
   * 空の状態表示
   */
  private showEmptyState(message: string = 'GitHubやGitLabのリポジトリを検索してください'): void {
    this.resultsSection.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-title">検索を開始</div>
        <div class="empty-state-description">${this.escapeHtml(message)}</div>
      </div>
    `;
  }

  /**
   * URLを開く
   */
  private async openUrl(url: string): Promise<void> {
    const result = await executeWithErrorHandling(async () => {
      await chrome.tabs.create({ url });
    }, 'openUrl');

    if (!result.success) {
      this.showError('URLを開けませんでした');
    }
  }

  /**
   * GitHubのURLを外部サービスのURLに変換
   */
  private transformToExternalServiceUrl(githubUrl: string, service: string): string {
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
   * HTMLエスケープ
   */
  private escapeHtml(text: string): string {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}

// DOM読み込み完了後にサイドパネルを初期化
document.addEventListener('DOMContentLoaded', () => {
  try {
    new SidePanelController();
  } catch (error) {
    console.error('SidePanel initialization failed:', error);
  }
});
