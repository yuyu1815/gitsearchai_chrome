/**
 * 検索API機能のテストスクリプト
 * 開発時にAPI機能をテストするためのスクリプト
 */

import { gitHubSearchApi } from './modules/data/search-api';

/**
 * 検索APIのテスト実行
 */
async function testSearchApi() {
  console.log('=== GitHub Search API Test ===');

  try {
    // テストクエリ
    const testQuery = 'next.js';
    console.log(`Testing search with query: "${testQuery}"`);

    // 検索実行
    const result = await gitHubSearchApi.searchRepositories(testQuery);

    if (result.success && result.data) {
      console.log(`✅ Search successful! Found ${result.data.length} repositories`);

      // 最初の結果を詳細表示
      if (result.data.length > 0) {
        const firstResult = result.data[0];
        if (firstResult) {
          console.log('\n📋 First result details:');
          console.log(`  Title: ${firstResult.title}`);
          console.log(`  Description: ${firstResult.description}`);
          console.log(`  Owner: ${firstResult.owner.name} (${firstResult.owner.type})`);
          console.log(`  Language: ${firstResult.language || 'N/A'}`);
          console.log(`  Stars: ${firstResult.stars}`);
          console.log(`  Forks: ${firstResult.forks}`);
          console.log(`  License: ${firstResult.license || 'N/A'}`);
          console.log(`  Topics: ${firstResult.topics.join(', ') || 'None'}`);
          console.log(`  URL: ${firstResult.url}`);
          console.log(`  Last Updated: ${firstResult.lastUpdated}`);
        }
      }

      // 全結果のサマリー
      console.log('\n📊 Results summary:');
      result.data.forEach((repo, index) => {
        console.log(`  ${index + 1}. ${repo.title} (⭐${repo.stars} 🍴${repo.forks})`);
      });

    } else {
      console.error('❌ Search failed:', result.error);
    }

  } catch (error) {
    console.error('❌ Test failed with error:', error);
  }
}

/**
 * クエリ検証のテスト
 */
function testQueryValidation() {
  console.log('\n=== Query Validation Test ===');

  const testCases = [
    { query: '', expected: false, description: 'Empty string' },
    { query: '   ', expected: false, description: 'Whitespace only' },
    { query: 'a', expected: true, description: 'Single character' },
    { query: 'react', expected: true, description: 'Valid query' },
    { query: 'a'.repeat(201), expected: false, description: 'Too long query' },
  ];

  testCases.forEach(testCase => {
    const result = gitHubSearchApi.validateQuery(testCase.query);
    const status = result.isValid === testCase.expected ? '✅' : '❌';
    console.log(`${status} ${testCase.description}: "${testCase.query.substring(0, 20)}${testCase.query.length > 20 ? '...' : ''}" -> ${result.isValid ? 'Valid' : `Invalid (${result.error})`}`);
  });
}

/**
 * API健全性チェックのテスト
 */
async function testHealthCheck() {
  console.log('\n=== API Health Check Test ===');

  try {
    const result = await gitHubSearchApi.healthCheck();

    if (result.success) {
      console.log(`✅ API Health Check: ${result.data ? 'Healthy' : 'Unhealthy'}`);
    } else {
      console.log(`❌ API Health Check failed: ${result.error}`);
    }
  } catch (error) {
    console.error('❌ Health check failed with error:', error);
  }
}

/**
 * 全テストの実行
 */
async function runAllTests() {
  console.log('🚀 Starting GitHub Search API Tests...\n');

  // クエリ検証テスト
  testQueryValidation();

  // API健全性チェック
  await testHealthCheck();

  // 検索APIテスト
  await testSearchApi();

  console.log('\n🏁 All tests completed!');
}

// テスト実行（ブラウザ環境でのみ）
if (typeof window !== 'undefined') {
  // ページ読み込み後にテスト実行
  document.addEventListener('DOMContentLoaded', () => {
    runAllTests().catch(console.error);
  });
}

// Node.js環境での実行をサポート
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    testSearchApi,
    testQueryValidation,
    testHealthCheck,
    runAllTests
  };
}
