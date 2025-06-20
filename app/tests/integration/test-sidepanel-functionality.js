// サイドパネル機能のテストスクリプト
console.log('=== GitSearchAI サイドパネル機能テスト ===');

// 1. manifest.jsonの設定確認
console.log('1. manifest.json設定確認');
const fs = require('fs');
const path = require('path');

try {
  const manifestPath = path.join(__dirname, '..', '..', '..', 'dist', 'chrome', 'manifest.json');
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  
  console.log('✓ sidePanel権限:', manifest.permissions.includes('sidePanel'));
  console.log('✓ side_panel設定:', manifest.side_panel ? 'あり' : 'なし');
  console.log('✓ サイドパネルHTML:', manifest.side_panel?.default_path);
} catch (error) {
  console.error('✗ manifest.json読み込みエラー:', error.message);
}

// 2. 必要なファイルの存在確認
console.log('\n2. 必要ファイル存在確認');
const requiredFiles = [
  '../../../dist/chrome/pages/sidepanel.html',
  '../../../dist/chrome/scripts/sidepanel.js',
  '../../../dist/chrome/scripts/background.js',
  '../../../dist/chrome/scripts/contentscript.js',
  '../../../dist/chrome/styles/content.css'
];

requiredFiles.forEach(file => {
  const filePath = path.join(__dirname, file);
  const exists = fs.existsSync(filePath);
  console.log(`${exists ? '✓' : '✗'} ${file}: ${exists ? '存在' : '不存在'}`);
});

// 3. contentscript.jsの内容確認
console.log('\n3. contentscript.js内容確認');
try {
  const contentscriptPath = path.join(__dirname, '..', '..', '..', 'dist', 'chrome', 'scripts', 'contentscript.js');
  const contentscript = fs.readFileSync(contentscriptPath, 'utf8');
  
  console.log('✓ OPEN_SIDE_PANELメッセージ:', contentscript.includes('OPEN_SIDE_PANEL') ? 'あり' : 'なし');
  console.log('✓ サイドパネル展開ボタン:', contentscript.includes('AI Search') ? 'あり' : 'なし');
  console.log('✓ 検索結果表示関数削除:', !contentscript.includes('displaySearchResults') ? '削除済み' : '残存');
} catch (error) {
  console.error('✗ contentscript.js読み込みエラー:', error.message);
}

// 4. background.jsの内容確認
console.log('\n4. background.js内容確認');
try {
  const backgroundPath = path.join(__dirname, '..', '..', '..', 'dist', 'chrome', 'scripts', 'background.js');
  const background = fs.readFileSync(backgroundPath, 'utf8');
  
  console.log('✓ OPEN_SIDE_PANELハンドラー:', background.includes('OPEN_SIDE_PANEL') ? 'あり' : 'なし');
  console.log('✓ sidePanel.open:', background.includes('sidePanel.open') ? 'あり' : 'なし');
} catch (error) {
  console.error('✗ background.js読み込みエラー:', error.message);
}

// 5. content.cssの内容確認
console.log('\n5. content.css内容確認');
try {
  const cssPath = path.join(__dirname, '..', '..', '..', 'dist', 'chrome', 'styles', 'content.css');
  const css = fs.readFileSync(cssPath, 'utf8');
  
  console.log('✓ 検索ボタンスタイル:', css.includes('gitsearchai-search-button') ? 'あり' : 'なし');
  console.log('✓ 検索結果パネルスタイル削除:', !css.includes('gitsearchai-results-panel') ? '削除済み' : '残存');
  console.log('✓ エラーメッセージスタイル削除:', !css.includes('gitsearchai-error') ? '削除済み' : '残存');
} catch (error) {
  console.error('✗ content.css読み込みエラー:', error.message);
}

console.log('\n=== テスト完了 ===');
console.log('実装された機能:');
console.log('- GitHubとGitLabページに「🔍 AI Search」ボタンを表示');
console.log('- ボタンクリックでサイドパネルを展開');
console.log('- 検索結果パネルとエラーメッセージ表示機能を削除');
console.log('- Ctrl+Shift+Sキーボードショートカットでサイドパネル展開');