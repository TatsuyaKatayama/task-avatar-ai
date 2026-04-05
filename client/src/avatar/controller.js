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
    try {
      // 1. 既存アバターの完全破棄
      if (this.avatar) {
        if (typeof this.avatar.destroy === 'function') {
          this.avatar.destroy();
        }
        this.avatar = null;
      }
      if (this.container) {
        this.container.innerHTML = '';
      }

      // 2. 新規インスタンス作成 (idleアニメパスを明示)
      this.avatar = new AvatarSpeaker(this.container, {
        animations: {
          idle: '/assets/animations/standard_idle.vrma'
        }
      });

      // 3. 初期化とモデルロード
      await this.avatar.initialize();
      await this.avatar.setAvatar(vrmUrl);

      // 4. Canvasの配置調整
      const strayCanvas = document.querySelector('canvas:not(#avatar-canvas)');
      if (strayCanvas && this.container) {
        this.container.appendChild(strayCanvas);
        strayCanvas.id = 'avatar-canvas';
        strayCanvas.style.width = '100%';
        strayCanvas.style.height = '100%';
      }

      // 5. 描画とまばたきの開始
      this.avatar.isReady = true;
      if (typeof this.avatar.animate === 'function') {
        this.avatar.animate('/assets/animations/standard_idle.vrma');
      }
      
      if (this.avatar.blinkController) {
        this.avatar.blinkController.start();
      }

      // 初回のリサイズを強制
      window.dispatchEvent(new Event('resize'));
      
      // アニメーションボーンの準備が整うまでわずかに待機
      await new Promise(resolve => setTimeout(resolve, 500));
      console.log('[AvatarController] Init complete.');

    } catch (error) {
      console.error('[AvatarController] Init Error:', error);
    }
  }

  /**
   * アバターに喋らせる
   */
  async speak(text, emotion = 'neutral', audioUrl = null) {
    if (!this.avatar) return;
    this.applyEmotion(emotion);

    try {
      const speakMethod = this.avatar.say || this.avatar.speak;
      if (speakMethod) {
        if (audioUrl) {
          await speakMethod.call(this.avatar, text, { audio: audioUrl });
        } else {
          await speakMethod.call(this.avatar, text);
        }
      }
    } catch (e) {
      console.error('[AvatarController] Speak error:', e);
    } finally {
      // SDKの字幕を消去するハック
      setTimeout(() => {
        const popups = document.querySelectorAll('div[style*="background: rgba(0, 0, 0, 0.7)"]');
        popups.forEach(el => el.remove());
      }, 100);
    }
  }

  /**
   * 任意のアニメーションファイルを再生する
   */
  async playAnimation(url) {
    if (!this.avatar || !url) return;
    try {
      if (this.avatar.playAnimation) {
        await this.avatar.playAnimation(url);
      } else if (this.avatar.animationManager && this.avatar.animationManager.playAnimation) {
        await this.avatar.animationManager.playAnimation(url);
      }
    } catch (e) {
      console.error('[AvatarController] Animation error:', e);
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
