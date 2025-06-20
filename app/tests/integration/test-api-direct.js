/**
 * 直接API呼び出しテストスクリプト
 * 問題記述のPythonコードをJavaScriptで再現してAPIをテスト
 */

async function testApiDirect() {
  console.log('=== Direct API Test (based on Python example) ===');
  
  const url = "https://gitsearch-analytics-backend-0be9d52ca264.herokuapp.com/api/search";
  const payload = { "query": "next.js" };
  const headers = { "Content-Type": "application/json" };

  try {
    console.log(`Making request to: ${url}`);
    console.log(`Payload:`, payload);
    
    const response = await fetch(url, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(payload)
    });

    console.log(`Response status: ${response.status} ${response.statusText}`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    console.log('\n✅ API Response received successfully!');
    console.log('\n📋 Response structure:');
    console.log(`- github_query: ${data.github_query}`);
    console.log(`- total_count: ${data.total_count}`);
    console.log(`- response_time_ms: ${data.response_time_ms}`);
    console.log(`- session_id: ${data.session_id}`);
    console.log(`- repositories count: ${data.repositories?.length || 0}`);
    
    if (data.repositories && data.repositories.length > 0) {
      console.log('\n📊 First repository details:');
      const repo = data.repositories[0];
      console.log(`- Name: ${repo.name}`);
      console.log(`- Full name: ${repo.full_name}`);
      console.log(`- Description: ${repo.description}`);
      console.log(`- Stars: ${repo.stargazers_count}`);
      console.log(`- Forks: ${repo.forks_count}`);
      console.log(`- Language: ${repo.language}`);
      console.log(`- Owner: ${repo.owner.login} (${repo.owner.type})`);
      console.log(`- URL: ${repo.html_url}`);
      console.log(`- Topics: ${repo.topics?.join(', ') || 'None'}`);
      console.log(`- License: ${repo.license?.name || 'None'}`);
    }
    
    console.log('\n🎉 Direct API test completed successfully!');
    return data;
    
  } catch (error) {
    console.error('❌ Direct API test failed:', error);
    throw error;
  }
}

// Node.js環境での実行
if (typeof require !== 'undefined') {
  // Node.js環境では fetch が利用できない場合があるので、適切なライブラリを使用
  testApiDirect().catch(console.error);
}

// ブラウザ環境での実行
if (typeof window !== 'undefined') {
  window.testApiDirect = testApiDirect;
  console.log('Direct API test function loaded. Call testApiDirect() to run the test.');
}

module.exports = { testApiDirect };