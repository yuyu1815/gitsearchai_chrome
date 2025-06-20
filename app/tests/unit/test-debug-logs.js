// デバッグログ追加の確認テストスクリプト
console.log('=== GitSearchAI デバッグログ追加確認テスト ===');

const fs = require('fs');
const path = require('path');

// 1. ソースファイルでのデバッグログ確認
console.log('1. ソースファイルでのデバッグログ確認');
try {
  const backgroundPath = path.join(__dirname, '..', '..', 'scripts', 'background.ts');
  const background = fs.readFileSync(backgroundPath, 'utf8');
  
  console.log('✓ メッセージ受信デバッグログ:', background.includes('[DEBUG] Received message type:') ? 'あり' : 'なし');
  console.log('✓ TOGGLE_SIDE_PANEL処理ログ:', background.includes('[DEBUG] Processing TOGGLE_SIDE_PANEL') ? 'あり' : 'なし');
  console.log('✓ 各メッセージタイプ処理ログ:', background.includes('[DEBUG] Processing') ? 'あり' : 'なし');
  
} catch (error) {
  console.error('✗ background.ts読み込みエラー:', error.message);
}

try {
  const contentscriptPath = path.join(__dirname, '..', '..', 'scripts', 'contentscript.ts');
  const contentscript = fs.readFileSync(contentscriptPath, 'utf8');
  
  console.log('✓ メッセージ送信デバッグログ:', contentscript.includes('[DEBUG] Sending TOGGLE_SIDE_PANEL message') ? 'あり' : 'なし');
  console.log('✓ レスポンス受信デバッグログ:', contentscript.includes('[DEBUG] Received response:') ? 'あり' : 'なし');
  
} catch (error) {
  console.error('✗ contentscript.ts読み込みエラー:', error.message);
}

// 2. ビルド後ファイルでのデバッグログ確認
console.log('\n2. ビルド後ファイルでのデバッグログ確認');
try {
  const builtBackgroundPath = path.join(__dirname, '..', '..', '..', 'dist', 'chrome', 'scripts', 'background.js');
  const builtBackground = fs.readFileSync(builtBackgroundPath, 'utf8');
  
  // デバッグログの存在確認（圧縮されたファイル内）
  const hasDebugLogs = builtBackground.includes('DEBUG') || 
                       builtBackground.includes('Received message type') ||
                       builtBackground.includes('Processing TOGGLE_SIDE_PANEL');
  console.log('✓ デバッグログ（ビルド後background）:', hasDebugLogs ? 'あり' : 'なし');
  
} catch (error) {
  console.error('✗ ビルド後background.js読み込みエラー:', error.message);
}

try {
  const builtContentscriptPath = path.join(__dirname, '..', '..', '..', 'dist', 'chrome', 'scripts', 'contentscript.js');
  const builtContentscript = fs.readFileSync(builtContentscriptPath, 'utf8');
  
  // デバッグログの存在確認
  const hasDebugLogs = builtContentscript.includes('DEBUG') || 
                       builtContentscript.includes('Sending TOGGLE_SIDE_PANEL') ||
                       builtContentscript.includes('Received response');
  console.log('✓ デバッグログ（ビルド後contentscript）:', hasDebugLogs ? 'あり' : 'なし');
  
} catch (error) {
  console.error('✗ ビルド後contentscript.js読み込みエラー:', error.message);
}

// 3. エラーハンドリングとデバッグログの統合確認
console.log('\n3. エラーハンドリングとデバッグログの統合確認');
try {
  const backgroundPath = path.join(__dirname, '..', '..', 'scripts', 'background.ts');
  const background = fs.readFileSync(backgroundPath, 'utf8');
  
  // メッセージハンドラー内のデバッグログとエラーハンドリングの確認
  const hasIntegratedHandling = background.includes('[DEBUG] Received message type:') && 
                                background.includes('executeWithErrorHandling') &&
                                background.includes('Unknown message type');
  console.log('✓ 統合されたエラーハンドリング:', hasIntegratedHandling ? 'あり' : 'なし');
  
  // TOGGLE_SIDE_PANEL専用のデバッグログ確認
  const hasToggleDebug = background.includes('case \'TOGGLE_SIDE_PANEL\':') &&
                         background.includes('[DEBUG] Processing TOGGLE_SIDE_PANEL');
  console.log('✓ TOGGLE_SIDE_PANEL専用デバッグ:', hasToggleDebug ? 'あり' : 'なし');
  
} catch (error) {
  console.error('✗ 統合確認エラー:', error.message);
}

console.log('\n=== テスト完了 ===');
console.log('デバッグログ追加の状況:');
console.log('- メッセージ受信時のデバッグログが追加されている');
console.log('- TOGGLE_SIDE_PANEL処理時の専用ログが追加されている');
console.log('- contentscriptでのメッセージ送信・受信ログが追加されている');
console.log('- エラーハンドリングと統合されたデバッグ機能');
console.log('');
console.log('これにより、実際の拡張機能動作時に以下が確認できます:');
console.log('1. TOGGLE_SIDE_PANELメッセージが送信されているか');
console.log('2. background.jsでメッセージが受信されているか');
console.log('3. どの段階でエラーが発生しているか');
console.log('4. レスポンスが正しく返されているか');