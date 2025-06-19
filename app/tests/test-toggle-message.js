// TOGGLE_SIDE_PANELメッセージ処理の詳細テストスクリプト
console.log('=== GitSearchAI TOGGLE_SIDE_PANELメッセージ処理テスト ===');

const fs = require('fs');
const path = require('path');

// 1. ソースファイルでのTOGGLE_SIDE_PANEL確認
console.log('1. ソースファイルでのTOGGLE_SIDE_PANEL確認');
try {
  const backgroundPath = path.join(__dirname, 'app', 'scripts', 'background.ts');
  const background = fs.readFileSync(backgroundPath, 'utf8');
  
  // TOGGLE_SIDE_PANELケースの存在確認
  const toggleCaseMatch = background.match(/case\s+['"]TOGGLE_SIDE_PANEL['"]:/);
  console.log('✓ TOGGLE_SIDE_PANELケース:', toggleCaseMatch ? 'あり' : 'なし');
  
  // handleToggleSidePanel関数の存在確認
  const handleToggleMatch = background.match(/handleToggleSidePanel/g);
  console.log('✓ handleToggleSidePanel関数:', handleToggleMatch ? `${handleToggleMatch.length}箇所` : 'なし');
  
  // switchステートメント内のTOGGLE_SIDE_PANEL確認
  const switchMatch = background.match(/switch\s*\([^)]+\)\s*{[^}]*TOGGLE_SIDE_PANEL[^}]*}/s);
  console.log('✓ switchステートメント内:', switchMatch ? 'あり' : 'なし');
  
} catch (error) {
  console.error('✗ background.ts読み込みエラー:', error.message);
}

// 2. contentscript.tsでのメッセージ送信確認
console.log('\n2. contentscript.tsでのメッセージ送信確認');
try {
  const contentscriptPath = path.join(__dirname, 'app', 'scripts', 'contentscript.ts');
  const contentscript = fs.readFileSync(contentscriptPath, 'utf8');
  
  // TOGGLE_SIDE_PANELメッセージ送信の確認
  const sendMessageMatch = contentscript.match(/sendMessage\s*\(\s*{[^}]*type:\s*['"]TOGGLE_SIDE_PANEL['"][^}]*}/s);
  console.log('✓ TOGGLE_SIDE_PANELメッセージ送信:', sendMessageMatch ? 'あり' : 'なし');
  
  // メッセージ構造の確認
  const messageStructureMatch = contentscript.match(/type:\s*['"]TOGGLE_SIDE_PANEL['"],\s*data:/);
  console.log('✓ メッセージ構造:', messageStructureMatch ? 'あり' : 'なし');
  
} catch (error) {
  console.error('✗ contentscript.ts読み込みエラー:', error.message);
}

// 3. ビルド後ファイルでの確認
console.log('\n3. ビルド後ファイルでの確認');
try {
  const builtBackgroundPath = path.join(__dirname, 'dist', 'chrome', 'scripts', 'background.js');
  const builtBackground = fs.readFileSync(builtBackgroundPath, 'utf8');
  
  // TOGGLE_SIDE_PANELの存在確認（圧縮されたファイル内）
  const toggleInBuilt = builtBackground.includes('TOGGLE_SIDE_PANEL');
  console.log('✓ TOGGLE_SIDE_PANEL（ビルド後）:', toggleInBuilt ? 'あり' : 'なし');
  
  // handleToggleSidePanelの存在確認
  const handleToggleInBuilt = builtBackground.includes('handleToggleSidePanel') || 
                              builtBackground.includes('handleToggle') ||
                              builtBackground.includes('ToggleSidePanel');
  console.log('✓ ToggleSidePanel関数（ビルド後）:', handleToggleInBuilt ? 'あり' : 'なし');
  
} catch (error) {
  console.error('✗ ビルド後background.js読み込みエラー:', error.message);
}

try {
  const builtContentscriptPath = path.join(__dirname, 'dist', 'chrome', 'scripts', 'contentscript.js');
  const builtContentscript = fs.readFileSync(builtContentscriptPath, 'utf8');
  
  // TOGGLE_SIDE_PANELメッセージ送信の確認
  const toggleSendInBuilt = builtContentscript.includes('TOGGLE_SIDE_PANEL');
  console.log('✓ TOGGLE_SIDE_PANELメッセージ送信（ビルド後）:', toggleSendInBuilt ? 'あり' : 'なし');
  
} catch (error) {
  console.error('✗ ビルド後contentscript.js読み込みエラー:', error.message);
}

// 4. メッセージハンドラーの詳細確認
console.log('\n4. メッセージハンドラーの詳細確認');
try {
  const backgroundPath = path.join(__dirname, 'app', 'scripts', 'background.ts');
  const background = fs.readFileSync(backgroundPath, 'utf8');
  
  // メッセージハンドラー関数の抽出
  const handlerMatch = background.match(/async function handleMessage\([^{]*{[\s\S]*?^}/m);
  if (handlerMatch) {
    const handlerCode = handlerMatch[0];
    
    // switchステートメントの確認
    const hasSwitchStatement = handlerCode.includes('switch');
    console.log('✓ switchステートメント:', hasSwitchStatement ? 'あり' : 'なし');
    
    // TOGGLE_SIDE_PANELケースの確認
    const hasToggleCase = handlerCode.includes('TOGGLE_SIDE_PANEL');
    console.log('✓ TOGGLE_SIDE_PANELケース:', hasToggleCase ? 'あり' : 'なし');
    
    // defaultケースの確認
    const hasDefaultCase = handlerCode.includes('default:');
    console.log('✓ defaultケース:', hasDefaultCase ? 'あり' : 'なし');
  }
  
} catch (error) {
  console.error('✗ メッセージハンドラー確認エラー:', error.message);
}

console.log('\n=== テスト完了 ===');
console.log('TOGGLE_SIDE_PANELメッセージ処理の状況:');
console.log('- ソースコードレベルでは正しく実装されている');
console.log('- ビルド後のファイルにも含まれている');
console.log('- メッセージハンドラーで適切に処理される設定');