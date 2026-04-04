import { Orchestrator } from './orchestrator';

/**
 * アプリケーションのエントリーポイント。
 */
document.addEventListener('DOMContentLoaded', async () => {
  const orchestrator = new Orchestrator();

  // アバターの初期化 (VRM モデルのロード)
  // public/assets/models/avatar.vrm が存在することを前提とします
  const vrmUrl = '/assets/models/avatar.vrm'; 
  console.log('Attempting to load avatar from:', vrmUrl);
  
  try {
    await orchestrator.init(vrmUrl);
    console.log('✅ Avatar loaded successfully.');
  } catch (error) {
    console.error('❌ Failed to load avatar:', error);
    alert('アバターの読み込みに失敗しました。詳細はコンソールを確認してください。');
  }

  // ボタンイベントの紐付け
  const startBtn = document.getElementById('start-btn');
  if (startBtn) {
    startBtn.addEventListener('click', () => {
      orchestrator.startListening();
    });
  }
});
