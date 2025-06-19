/**
 * Chrome拡張機能の検索機能テストスクリプト
 * 更新された型定義でChrome拡張機能の検索機能をテスト
 */

// シンプルなモック環境を作成（Chrome拡張機能のAPIをシミュレート）
const mockChrome = {
  runtime: {
    onMessage: {
      addListener: () => {}
    }
  }
};

// グローバルにchromeオブジェクトを設定
global.chrome = mockChrome;

// fetchのモック（Node.js環境用）
global.fetch = async (url, options) => {
  if (url.includes('gitsearch-analytics-backend')) {
    // 実際のAPIを呼び出し
    const https = require('https');
    const querystring = require('querystring');
    
    return new Promise((resolve, reject) => {
      const data = JSON.stringify(JSON.parse(options.body));
      
      const req = https.request(url, {
        method: options.method,
        headers: options.headers
      }, (res) => {
        let body = '';
        res.on('data', chunk => body += chunk);
        res.on('end', () => {
          resolve({
            ok: res.statusCode >= 200 && res.statusCode < 300,
            status: res.statusCode,
            json: () => Promise.resolve(JSON.parse(body))
          });
        });
      });
      
      req.on('error', reject);
      req.write(data);
      req.end();
    });
  }
  
  throw new Error('Unsupported URL');
};

// DOM環境のモック
global.document = {
  getElementById: (id) => ({
    value: '',
    addEventListener: () => {},
    style: {},
    innerHTML: '',
    disabled: false,
    textContent: ''
  }),
  addEventListener: () => {}
};

global.window = {};

async function testExtensionSearch() {
  console.log('=== Chrome Extension Search Test ===');
  
  try {
    // 動的にモジュールをインポート（ES6モジュールをCommonJSで使用）
    const { gitHubSearchApi } = await import('./app/scripts/modules/data/search-api.js');
    
    console.log('✅ Search API module loaded successfully');
    
    // クエリ検証テスト
    console.log('\n📋 Testing query validation...');
    const validationTests = [
      { query: 'next.js', expected: true },
      { query: '', expected: false },
      { query: 'react', expected: true }
    ];
    
    validationTests.forEach(test => {
      const result = gitHubSearchApi.validateQuery(test.query);
      const status = result.isValid === test.expected ? '✅' : '❌';
      console.log(`${status} Query "${test.query}": ${result.isValid ? 'Valid' : `Invalid (${result.error})`}`);
    });
    
    // 実際の検索テスト
    console.log('\n🔍 Testing repository search...');
    const searchResult = await gitHubSearchApi.searchRepositories('next.js');
    
    if (searchResult.success && searchResult.data) {
      console.log(`✅ Search successful! Found ${searchResult.data.length} repositories`);
      
      // 最初の結果の詳細表示
      if (searchResult.data.length > 0) {
        const repo = searchResult.data[0];
        console.log('\n📊 First repository (simplified format):');
        console.log(`  ID: ${repo.id}`);
        console.log(`  Title: ${repo.title}`);
        console.log(`  Description: ${repo.description}`);
        console.log(`  URL: ${repo.url}`);
        console.log(`  Language: ${repo.language || 'N/A'}`);
        console.log(`  Stars: ${repo.stars}`);
        console.log(`  Forks: ${repo.forks}`);
        console.log(`  Last Updated: ${repo.lastUpdated}`);
        console.log(`  Owner: ${repo.owner.name} (${repo.owner.type})`);
        console.log(`  Topics: ${repo.topics.join(', ') || 'None'}`);
        console.log(`  License: ${repo.license || 'None'}`);
      }
      
      console.log('\n🎉 Extension search test completed successfully!');
    } else {
      console.error('❌ Search failed:', searchResult.error);
    }
    
  } catch (error) {
    console.error('❌ Extension search test failed:', error.message);
    
    // フォールバック: 直接APIテストを実行
    console.log('\n🔄 Falling back to direct API test...');
    const { testApiDirect } = require('./test-api-direct.js');
    await testApiDirect();
  }
}

// テスト実行
testExtensionSearch().catch(console.error);