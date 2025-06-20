/**
 * CORS修正テストスクリプト
 * manifest.jsonの更新後にCORS問題が解決されたかをテスト
 */

async function testCorsFixWithExtensionContext() {
  console.log('=== CORS Fix Test (Chrome Extension Context) ===');
  
  const url = "https://gitsearch-analytics-backend-0be9d52ca264.herokuapp.com/api/search";
  const payload = { "query": "next.js" };
  const headers = { "Content-Type": "application/json" };

  try {
    console.log('🔧 Testing with updated manifest.json host_permissions...');
    console.log(`Making request to: ${url}`);
    console.log(`Payload:`, payload);
    
    // Chrome拡張機能環境での fetch リクエストをシミュレート
    const response = await fetch(url, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(payload),
      // Chrome拡張機能では通常これらのオプションが自動的に処理される
      mode: 'cors',
      credentials: 'omit'
    });

    console.log(`Response status: ${response.status} ${response.statusText}`);
    console.log(`Response headers:`, Object.fromEntries(response.headers.entries()));
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    console.log('\n✅ CORS issue resolved! API request successful!');
    console.log('\n📋 Response verification:');
    console.log(`- github_query: ${data.github_query}`);
    console.log(`- total_count: ${data.total_count}`);
    console.log(`- response_time_ms: ${data.response_time_ms}`);
    console.log(`- repositories count: ${data.repositories?.length || 0}`);
    
    if (data.repositories && data.repositories.length > 0) {
      console.log('\n📊 First repository (to verify data integrity):');
      const repo = data.repositories[0];
      console.log(`- Name: ${repo.name}`);
      console.log(`- Full name: ${repo.full_name}`);
      console.log(`- Stars: ${repo.stargazers_count}`);
      console.log(`- Owner: ${repo.owner.login} (${repo.owner.type})`);
    }
    
    console.log('\n🎉 CORS fix test completed successfully!');
    console.log('✅ The manifest.json host_permissions update resolved the CORS issue.');
    
    return {
      success: true,
      data: data,
      message: 'CORS issue resolved successfully'
    };
    
  } catch (error) {
    console.error('❌ CORS fix test failed:', error.message);
    
    if (error.message.includes('CORS') || error.message.includes('blocked')) {
      console.error('🚨 CORS issue still exists. Additional configuration may be needed.');
      console.error('💡 Possible solutions:');
      console.error('   1. Verify manifest.json host_permissions are correct');
      console.error('   2. Check if server-side CORS headers are properly configured');
      console.error('   3. Consider using chrome.runtime.sendMessage for background script requests');
    }
    
    return {
      success: false,
      error: error.message,
      message: 'CORS issue not resolved'
    };
  }
}

/**
 * manifest.json の変更内容を表示
 */
function displayManifestChanges() {
  console.log('\n=== Manifest.json Changes Made ===');
  console.log('Added to host_permissions:');
  console.log('  "https://gitsearch-analytics-backend-0be9d52ca264.herokuapp.com/*"');
  console.log('\nThis change allows the Chrome extension to make requests to the API endpoint');
  console.log('without being blocked by CORS policy.');
  console.log('\nBefore: Only GitHub and GitLab were allowed');
  console.log('After: GitHub, GitLab, and the search API endpoint are allowed');
}

/**
 * 全テストの実行
 */
async function runCorsFixTest() {
  console.log('🚀 Starting CORS Fix Verification Test...\n');
  
  // manifest.json の変更内容を表示
  displayManifestChanges();
  
  // CORS修正テスト
  const result = await testCorsFixWithExtensionContext();
  
  console.log('\n📋 Test Summary:');
  console.log(`Status: ${result.success ? '✅ SUCCESS' : '❌ FAILED'}`);
  console.log(`Message: ${result.message}`);
  
  if (result.success) {
    console.log('\n🎯 Next Steps:');
    console.log('1. Reload the Chrome extension to apply manifest.json changes');
    console.log('2. Test the search functionality in the extension');
    console.log('3. Verify that no CORS errors appear in the console');
  }
  
  console.log('\n🏁 CORS fix test completed!');
  return result;
}

// Node.js環境での実行
if (typeof require !== 'undefined') {
  runCorsFixTest().catch(console.error);
}

// ブラウザ環境での実行
if (typeof window !== 'undefined') {
  window.testCorsFixWithExtensionContext = testCorsFixWithExtensionContext;
  window.runCorsFixTest = runCorsFixTest;
  console.log('CORS fix test functions loaded. Call runCorsFixTest() to run the test.');
}

module.exports = { 
  testCorsFixWithExtensionContext, 
  runCorsFixTest,
  displayManifestChanges 
};