import { AvatarSpeaker } from 'virtual-avatar';

/**
 * virtual-avatar SDK を使用したアバター制御クラス。
 */
export class AvatarController {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.avatar = null;
  }

  /**
   * アバターの初期化
   */
  async init(vrmUrl) {
    const statusEl = document.getElementById('loading-status');
    const updateStatus = (text) => {
      console.log(`[AvatarController] ${text}`);
      if (statusEl) statusEl.innerText = text;
    };

    try {
      updateStatus('SDK インスタンス作成中...');
      this.avatar = new AvatarSpeaker(this.container);

      updateStatus('初期化中...');
      await this.avatar.initialize();

      updateStatus('モデル読み込み中...');
      await this.avatar.setAvatar(vrmUrl);

      // Canvas 救出（SDKがbody直下などに作ったCanvasをコンテナに移動）
      const strayCanvas = document.querySelector('canvas:not(#avatar-canvas)');
      if (strayCanvas && this.container) {
        console.log('[AvatarController] Rescuing canvas...');
        this.container.appendChild(strayCanvas);
      }

      // 強制的に描画フラグを立ててループ開始
      this.avatar.isReady = true; 
      this.avatar.animate();

      // サイズを強制的にフィットさせる
      const fitCanvas = () => {
        const strayCanvas = this.container.querySelector('canvas');
        if (strayCanvas) {
          strayCanvas.style.width = '100%';
          strayCanvas.style.height = '100%';
          window.dispatchEvent(new Event('resize'));
        }
      };
      
      // 描画が落ち着くまで数回実行
      fitCanvas();
      setTimeout(fitCanvas, 500);
      setTimeout(fitCanvas, 1000);
      
      if (statusEl) statusEl.style.display = 'none';
      console.log('[AvatarController] Init complete.');

    } catch (error) {
      updateStatus(`エラー発生: ${error.message}`);
      console.error('[AvatarController] Init Error:', error);
    }
  }

  /**
   * アバターに喋らせる
   */
  async speak(text, emotion = 'neutral') {
    if (!this.avatar) return;
    this.applyEmotion(emotion);

    try {
      // 存在する発話メソッドを呼び出す
      const speakMethod = this.avatar.say || this.avatar.speak;
      if (speakMethod) {
        await speakMethod.call(this.avatar, text);
      }
    } catch (e) {
      console.error('[AvatarController] Speak error:', e);
    } finally {
      // ハック: SDK が勝手に生成した字幕ポップアップを消去する
      setTimeout(() => {
        const popups = document.querySelectorAll('div[style*="background: rgba(0, 0, 0, 0.7)"]');
        popups.forEach(el => el.remove());
      }, 100);
    }
  }

  /**
   * 表情を切り替える
   */
  applyEmotion(emotion) {
    if (!this.avatar) return;

    const emotionMap = {
      'smile': 'smile',
      'neutral': 'neutral',
      'thinking': 'neutral',
      'sad': 'sad',
      'angry': 'angry'
    };

    const methodName = emotionMap[emotion] || 'neutral';
    if (typeof this.avatar[methodName] === 'function') {
      try {
        this.avatar[methodName]();
      } catch (e) {
        console.warn(`[AvatarController] Expression error (${methodName}):`, e);
      }
    }
  }
}
