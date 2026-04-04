import { Orchestrator } from './orchestrator';

/**
 * アプリケーションのエントリーポイント。
 */
document.addEventListener('DOMContentLoaded', async () => {
  const orchestrator = new Orchestrator();

  // アバターの初期化 (VRM モデルのロード)
  // TODO: 公開されている無料のVRMモデルなどのパスを指定してください
  const vrmUrl = '/assets/models/avatar.vrm'; 
  
  try {
    await orchestrator.init(vrmUrl);
    console.log('Avatar loaded successfully.');
  } catch (error) {
    console.error('Failed to load avatar:', error);
  }

  // ボタンイベントの紐付け
  const startBtn = document.getElementById('start-btn');
  if (startBtn) {
    startBtn.addEventListener('click', () => {
      orchestrator.startListening();
    });
  }
});
