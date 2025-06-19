/**
 * サイドパネルクローズイベントのテストスクリプト
 * このスクリプトは、サイドパネルのクローズイベントが正しく動作するかをテストします
 */

// テスト用の関数：サイドパネルの状態を確認
async function testSidePanelCloseEvent(): Promise<void> {
  console.log('=== サイドパネルクローズイベントテスト開始 ===');

  try {
    // 現在のタブ情報を取得
    const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tabs.length === 0 || !tabs[0] || typeof tabs[0].windowId !== 'number') {
      console.error('アクティブなタブが見つかりません');
      return;
    }

    const windowId = tabs[0].windowId;
    console.log(`テスト対象ウィンドウID: ${windowId}`);

    // サイドパネルを開く
    console.log('1. サイドパネルを開いています...');
    await (chrome as any).sidePanel.open({ windowId: windowId });

    // 少し待機
    await new Promise(resolve => setTimeout(resolve, 2000));

    // ストレージの状態を確認
    const storage = await chrome.storage.local.get([`sidePanelOpen_${windowId}`]);
    console.log('2. ストレージの状態:', storage);

    console.log('3. サイドパネルの×ボタンをクリックしてクローズしてください');
    console.log('4. ポート切断イベントがコンソールに表示されることを確認してください');
    console.log('5. ストレージからTabIdが削除されることを確認してください');

    // 定期的にストレージの状態をチェック
    const checkInterval = setInterval(async () => {
      const currentStorage = await chrome.storage.local.get([`sidePanelOpen_${windowId}`]);
      if (!currentStorage[`sidePanelOpen_${windowId}`]) {
        console.log('✓ ストレージからTabIdが削除されました - テスト成功！');
        clearInterval(checkInterval);
      }
    }, 1000);

    // 30秒後にタイムアウト
    setTimeout(() => {
      clearInterval(checkInterval);
      console.log('⚠ テストタイムアウト（30秒）');
    }, 30000);

  } catch (error) {
    console.error('テスト実行中にエラーが発生しました:', error);
  }
}

// テスト実行用のメッセージリスナー
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'TEST_SIDEPANEL_CLOSE') {
    testSidePanelCloseEvent();
    sendResponse({ success: true, message: 'テスト開始' });
  }
});

console.log('サイドパネルクローズイベントテストスクリプトが読み込まれました');
console.log('テストを開始するには、以下のコマンドをコンソールで実行してください:');
console.log('chrome.runtime.sendMessage({ type: "TEST_SIDEPANEL_CLOSE" });');
