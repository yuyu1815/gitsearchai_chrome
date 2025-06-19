/**
 * GitHub検索API通信モジュール
 * GitHubリポジトリ検索APIとの通信を管理
 */

import { API_ENDPOINTS, PERFORMANCE_CONFIG, ERROR_MESSAGES } from '../../lib/constants';
import { executeWithErrorHandling, OperationResult } from '../../lib/utils';
import { 
  GitHubSearchApiResponse, 
  GitHubSearchRequest, 
  SimplifiedSearchResult, 
  convertToSimplifiedResult,
  GitHubApiError 
} from './github-api-types';

/**
 * 検索APIサービスクラス
 */
export class GitHubSearchApiService {
  private readonly apiUrl: string;
  private readonly timeout: number;
  private readonly maxRetries: number;

  constructor() {
    this.apiUrl = API_ENDPOINTS.SEARCH;
    this.timeout = PERFORMANCE_CONFIG.REQUEST_TIMEOUT_MS;
    this.maxRetries = PERFORMANCE_CONFIG.RETRY_ATTEMPTS;
  }

  /**
   * リポジトリ検索を実行
   * @param query 検索クエリ文字列
   * @returns 検索結果のPromise
   */
  async searchRepositories(query: string): Promise<OperationResult<SimplifiedSearchResult[]>> {
    return executeWithErrorHandling(async () => {
      // 入力検証
      if (!query || query.trim().length === 0) {
        throw new Error(ERROR_MESSAGES.INVALID_QUERY);
      }

      const trimmedQuery = query.trim();

      // APIリクエストの実行
      const response = await this.makeApiRequest(trimmedQuery);

      // レスポンスの変換
      const simplifiedResults = response.repositories.map(convertToSimplifiedResult);

      return simplifiedResults;
    }, 'GitHubSearchApiService.searchRepositories');
  }

  /**
   * 実際のAPI呼び出しを実行
   * @param query 検索クエリ
   * @returns APIレスポンス
   */
  private async makeApiRequest(query: string): Promise<GitHubSearchApiResponse> {
    const requestPayload: GitHubSearchRequest = { query };

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestPayload),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        await this.handleApiError(response);
      }

      const data: GitHubSearchApiResponse = await response.json();

      // レスポンスの基本検証
      if (!data.repositories || !Array.isArray(data.repositories)) {
        throw new Error('Invalid API response format');
      }

      return data;
    } catch (error) {
      clearTimeout(timeoutId);

      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw new Error('Request timeout');
        }
        if (error.message.includes('Failed to fetch')) {
          throw new Error(ERROR_MESSAGES.NETWORK_ERROR);
        }
      }

      throw error;
    }
  }

  /**
   * APIエラーレスポンスを処理
   * @param response HTTPレスポンス
   */
  private async handleApiError(response: Response): Promise<never> {
    let errorMessage: string = ERROR_MESSAGES.API_REQUEST_FAILED;

    try {
      const errorData: GitHubApiError = await response.json();
      errorMessage = errorData.message || errorMessage;
    } catch {
      // JSONパースに失敗した場合はデフォルトメッセージを使用
    }

    switch (response.status) {
      case 400:
        throw new Error(ERROR_MESSAGES.INVALID_QUERY);
      case 401:
        throw new Error(ERROR_MESSAGES.UNAUTHORIZED);
      case 403:
        throw new Error(ERROR_MESSAGES.RATE_LIMIT_EXCEEDED);
      case 500:
      case 502:
      case 503:
      case 504:
        throw new Error(ERROR_MESSAGES.SERVER_ERROR);
      default:
        throw new Error(`${errorMessage} (Status: ${response.status})`);
    }
  }

  /**
   * APIの健全性をチェック
   * @returns 健全性チェック結果
   */
  async healthCheck(): Promise<OperationResult<boolean>> {
    return executeWithErrorHandling(async () => {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5秒タイムアウト

      try {
        const response = await fetch(this.apiUrl, {
          method: 'HEAD',
          signal: controller.signal
        });

        clearTimeout(timeoutId);
        return response.ok;
      } catch {
        clearTimeout(timeoutId);
        return false;
      }
    }, 'GitHubSearchApiService.healthCheck');
  }

  /**
   * 検索クエリの妥当性を検証
   * @param query 検索クエリ
   * @returns 妥当性チェック結果
   */
  validateQuery(query: string): { isValid: boolean; error?: string } {
    if (!query || typeof query !== 'string') {
      return { isValid: false, error: 'Query must be a non-empty string' };
    }

    const trimmedQuery = query.trim();

    if (trimmedQuery.length === 0) {
      return { isValid: false, error: 'Query cannot be empty' };
    }

    if (trimmedQuery.length > 200) {
      return { isValid: false, error: 'Query is too long (max 200 characters)' };
    }

    return { isValid: true };
  }
}

/**
 * シングルトンインスタンス
 */
export const gitHubSearchApi = new GitHubSearchApiService();
