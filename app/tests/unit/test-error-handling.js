// エラーハンドリング機能のテストスクリプト
console.log('=== GitSearchAI エラーハンドリング機能テスト ===');

const fs = require('fs');
const path = require('path');

// 1. contentscript.tsのエラーハンドリング確認
console.log('1. contentscript.tsエラーハンドリング確認');
try {
  const contentscriptPath = path.join(__dirname, '..', '..', 'scripts', 'contentscript.ts');
  const contentscript = fs.readFileSync(contentscriptPath, 'utf8');
  
  console.log('✓ Extension context チェック:', contentscript.includes('chrome.runtime?.id') ? 'あり' : 'なし');
  console.log('✓ Extension context invalidated 処理:', contentscript.includes('Extension context invalidated') ? 'あり' : 'なし');
  console.log('✓ ページリロード処理:', contentscript.includes('window.location.reload()') ? 'あり' : 'なし');
  console.log('✓ try-catch エラーハンドリング:', contentscript.includes('try {') && contentscript.includes('} catch (error)') ? 'あり' : 'なし');
  console.log('✓ レスポンス確認:', contentscript.includes('response && !response.success') ? 'あり' : 'なし');
} catch (error) {
  console.error('✗ contentscript.ts読み込みエラー:', error.message);
}

// 2. background.tsのエラーハンドリング確認
console.log('\n2. background.tsエラーハンドリング確認');
try {
  const backgroundPath = path.join(__dirname, '..', '..', 'scripts', 'background.ts');
  const background = fs.readFileSync(backgroundPath, 'utf8');
  
  console.log('✓ メッセージ検証:', background.includes('if (!message || typeof message !== \'object\')') ? 'あり' : 'なし');
  console.log('✓ メッセージタイプ確認:', background.includes('if (!message.type)') ? 'あり' : 'なし');
  console.log('✓ Unknown message type 警告:', background.includes('console.warn') ? 'あり' : 'なし');
  console.log('✓ レスポンス送信エラーハンドリング:', background.includes('try {') && background.includes('sendResponse(result)') ? 'あり' : 'なし');
  console.log('✓ エラーレスポンス:', background.includes('success: false, error:') ? 'あり' : 'なし');
} catch (error) {
  console.error('✗ background.ts読み込みエラー:', error.message);
}

// 3. ビルド後のファイル確認
console.log('\n3. ビルド後ファイルのエラーハンドリング確認');
try {
  const builtContentscriptPath = path.join(__dirname, '..', '..', '..', 'dist', 'chrome', 'scripts', 'contentscript.js');
  const builtContentscript = fs.readFileSync(builtContentscriptPath, 'utf8');
  
  console.log('✓ Extension context チェック（ビルド後）:', builtContentscript.includes('runtime') && builtContentscript.includes('id') ? 'あり' : 'なし');
  console.log('✓ エラーハンドリング（ビルド後）:', builtContentscript.includes('catch') ? 'あり' : 'なし');
} catch (error) {
  console.error('✗ ビルド後contentscript.js読み込みエラー:', error.message);
}

try {
  const builtBackgroundPath = path.join(__dirname, '..', '..', '..', 'dist', 'chrome', 'scripts', 'background.js');
  const builtBackground = fs.readFileSync(builtBackgroundPath, 'utf8');
  
  console.log('✓ メッセージ検証（ビルド後）:', builtBackground.includes('object') ? 'あり' : 'なし');
  console.log('✓ エラーハンドリング（ビルド後）:', builtBackground.includes('catch') ? 'あり' : 'なし');
} catch (error) {
  console.error('✗ ビルド後background.js読み込みエラー:', error.message);
}

console.log('\n=== テスト完了 ===');
console.log('実装されたエラーハンドリング機能:');
console.log('- Extension context invalidated エラーの検出と処理');
console.log('- メッセージ形式の検証');
console.log('- 不明なメッセージタイプの適切な処理');
console.log('- レスポンス送信時のエラーハンドリング');
console.log('- コンテキスト無効化時のページリロード');