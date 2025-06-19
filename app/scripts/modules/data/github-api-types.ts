/**
 * GitHub検索API レスポンス型定義
 * GitHubリポジトリ検索APIの完全な型定義を提供
 */

/**
 * APIレスポンスのルートレベル構造
 */
export interface GitHubSearchApiResponse {
  github_query: string;
  repositories: GitHubRepository[];
  response_time_ms: number;
  retry_info: RetryInfo;
  session_id: string;
  total_count: number;
}

/**
 * リトライ情報
 */
export interface RetryInfo {
  retry_attempts: number;
  success_on_retry: boolean;
  word_actions: string[];
}

/**
 * GitHubリポジトリの完全な情報
 */
export interface GitHubRepository {
  // 基本情報
  id: number;
  node_id: string;
  name: string;
  full_name: string;
  private: boolean;
  owner: RepositoryOwner;
  html_url: string;
  description: string | null;
  fork: boolean;
  url: string;
  created_at: string;
  updated_at: string;
  pushed_at: string;
  homepage: string | null;
  size: number;
  stargazers_count: number;
  watchers_count: number;
  watchers: number; // 追加: watchersフィールド（watchers_countと同じ値）
  language: string | null;
  has_issues: boolean;
  has_projects: boolean;
  has_downloads: boolean;
  has_wiki: boolean;
  has_pages: boolean;
  has_discussions: boolean;
  forks_count: number;
  forks: number; // 追加: forksフィールド（forks_countと同じ値）
  mirror_url: string | null;
  archived: boolean;
  disabled: boolean;
  open_issues_count: number;
  open_issues: number; // 追加: open_issuesフィールド（open_issues_countと同じ値）
  license: RepositoryLicense | null;
  allow_forking: boolean;
  is_template: boolean;
  web_commit_signoff_required: boolean; // 追加: コミット署名要求フラグ
  topics: string[];
  visibility: string;
  default_branch: string;
  score: number;

  // URL関連（テンプレートURL）
  archive_url: string;
  assignees_url: string;
  blobs_url: string;
  branches_url: string;
  clone_url: string;
  collaborators_url: string;
  comments_url: string;
  commits_url: string;
  compare_url: string;
  contents_url: string;
  contributors_url: string;
  deployments_url: string;
  downloads_url: string;
  events_url: string;
  forks_url: string;
  git_commits_url: string;
  git_refs_url: string;
  git_tags_url: string;
  hooks_url: string;
  issue_comment_url: string;
  issue_events_url: string;
  issues_url: string;
  keys_url: string;
  labels_url: string;
  languages_url: string;
  merges_url: string;
  milestones_url: string;
  notifications_url: string;
  pulls_url: string;
  releases_url: string;
  stargazers_url: string;
  statuses_url: string;
  subscribers_url: string;
  subscription_url: string;
  tags_url: string;
  teams_url: string;
  trees_url: string;
  svn_url: string;
  git_url: string;
  ssh_url: string;

  // 権限情報
  permissions: RepositoryPermissions;
}

/**
 * リポジトリ所有者情報
 */
export interface RepositoryOwner {
  login: string;
  id: number;
  node_id: string;
  avatar_url: string;
  gravatar_id: string;
  url: string;
  html_url: string;
  type: 'User' | 'Organization';
  site_admin: boolean;
  // 追加のURL関連フィールド
  events_url: string;
  followers_url: string;
  following_url: string;
  gists_url: string;
  organizations_url: string;
  received_events_url: string;
  repos_url: string;
  starred_url: string;
  subscriptions_url: string;
  user_view_type: string;
}

/**
 * ライセンス情報
 */
export interface RepositoryLicense {
  key: string;
  name: string;
  spdx_id: string | null;
  url: string | null;
  node_id: string;
}

/**
 * リポジトリ権限情報
 */
export interface RepositoryPermissions {
  admin: boolean;
  maintain: boolean;
  push: boolean;
  triage: boolean;
  pull: boolean;
}

/**
 * 検索リクエストの型定義
 */
export interface GitHubSearchRequest {
  query: string;
}

/**
 * 簡略化された検索結果（UI表示用）
 */
export interface SimplifiedSearchResult {
  id: string;
  title: string;
  description: string;
  url: string;
  language?: string;
  stars: number;
  forks: number;
  lastUpdated: string;
  owner: {
    name: string;
    avatar: string;
    type: 'User' | 'Organization';
  };
  topics: string[];
  license?: string;
}

/**
 * GitHubRepositoryをSimplifiedSearchResultに変換する関数
 */
export function convertToSimplifiedResult(repo: GitHubRepository): SimplifiedSearchResult {
  const result: SimplifiedSearchResult = {
    id: repo.id.toString(),
    title: repo.name,
    description: repo.description || 'No description available',
    url: repo.html_url,
    stars: repo.stargazers_count,
    forks: repo.forks_count,
    lastUpdated: new Date(repo.updated_at).toLocaleDateString('ja-JP'),
    owner: {
      name: repo.owner.login,
      avatar: repo.owner.avatar_url,
      type: repo.owner.type
    },
    topics: repo.topics
  };

  // 言語情報が存在する場合のみ追加
  if (repo.language) {
    result.language = repo.language;
  }

  // ライセンス情報が存在する場合のみ追加
  if (repo.license?.name) {
    result.license = repo.license.name;
  }

  return result;
}

/**
 * API エラーレスポンスの型定義
 */
export interface GitHubApiError {
  message: string;
  documentation_url?: string;
  errors?: Array<{
    resource: string;
    field: string;
    code: string;
  }>;
}
