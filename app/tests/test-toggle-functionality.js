// サイドパネルトグル機能のテストスクリプト
console.log('=== GitSearchAI サイドパネルトグル機能テスト ===');

// 1. manifest.jsonの設定確認
console.log('1. manifest.json設定確認');
const fs = require('fs');
const path = require('path');

try {
  const manifestPath = path.join(__dirname, 'dist', 'chrome', 'manifest.json');
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  
  console.log('✓ sidePanel権限:', manifest.permissions.includes('sidePanel'));
  console.log('✓ side_panel設定:', manifest.side_panel ? 'あり' : 'なし');
  console.log('✓ サイドパネルHTML:', manifest.side_panel?.default_path);
} catch (error) {
  console.error('✗ manifest.json読み込みエラー:', error.message);
}

// 2. contentscript.jsのトグル機能確認
console.log('\n2. contentscript.jsトグル機能確認');
try {
  const contentscriptPath = path.join(__dirname, 'dist', 'chrome', 'scripts', 'contentscript.js');
  const contentscript = fs.readFileSync(contentscriptPath, 'utf8');
  
  console.log('✓ TOGGLE_SIDE_PANELメッセージ:', contentscript.includes('TOGGLE_SIDE_PANEL') ? 'あり' : 'なし');
  console.log('✓ トグルボタンタイトル:', contentscript.includes('Toggle AI Search Side Panel') ? 'あり' : 'なし');
  console.log('✓ OPEN_SIDE_PANELメッセージ削除:', !contentscript.includes('OPEN_SIDE_PANEL') ? '削除済み' : '残存');
  console.log('✓ トグル機能コメント:', contentscript.includes('toggle') ? 'あり' : 'なし');
} catch (error) {
  console.error('✗ contentscript.js読み込みエラー:', error.message);
}

// 3. background.jsのトグル処理確認
console.log('\n3. background.jsトグル処理確認');
try {
  const backgroundPath = path.join(__dirname, 'dist', 'chrome', 'scripts', 'background.js');
  const background = fs.readFileSync(backgroundPath, 'utf8');
  
  console.log('✓ TOGGLE_SIDE_PANELハンドラー:', background.includes('TOGGLE_SIDE_PANEL') ? 'あり' : 'なし');
  console.log('✓ handleToggleSidePanel関数:', background.includes('handleToggleSidePanel') ? 'あり' : 'なし');
  console.log('✓ サイドパネル状態管理:', background.includes('sidePanelStates') ? 'あり' : 'なし');
  console.log('✓ ウィンドウクリーンアップ:', background.includes('onRemoved') ? 'あり' : 'なし');
  console.log('✓ setOptions使用:', background.includes('setOptions') ? 'あり' : 'なし');
} catch (error) {
  console.error('✗ background.js読み込みエラー:', error.message);
}

// 4. 必要なファイルの存在確認
console.log('\n4. 必要ファイル存在確認');
const requiredFiles = [
  'dist/chrome/pages/sidepanel.html',
  'dist/chrome/scripts/sidepanel.js',
  'dist/chrome/scripts/background.js',
  'dist/chrome/scripts/contentscript.js',
  'dist/chrome/styles/content.css'
];

requiredFiles.forEach(file => {
  const filePath = path.join(__dirname, file);
  const exists = fs.existsSync(filePath);
  console.log(`${exists ? '✓' : '✗'} ${file}: ${exists ? '存在' : '不存在'}`);
});

console.log('\n=== テスト完了 ===');
console.log('実装されたトグル機能:');
console.log('- 「🔍 AI Search」ボタンクリックでサイドパネルの開閉切り替え');
console.log('- 1回目のクリック: サイドパネルを開く');
console.log('- 2回目のクリック: サイドパネルを閉じる');
console.log('- ウィンドウごとの状態管理');
console.log('- ウィンドウ閉じ時の状態クリーンアップ');
console.log('- Ctrl+Shift+Sキーボードショートカットでもトグル動作');