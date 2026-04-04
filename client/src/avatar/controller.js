import { Avatar } from 'virtual-avatar';

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
   * @param {string} vrmUrl - .vrm ファイルへのパス
   */
  async init(vrmUrl) {
    this.avatar = new Avatar();
    await this.avatar.init(this.container, vrmUrl);
  }

  /**
   * アバターに喋らせる（感情とテキスト）
   * @param {string} text - 発話内容
   * @param {string} emotion - 感情 (smile, neutral, thinking, sad など)
   */
  async speak(text, emotion = 'neutral') {
    if (!this.avatar) return;

    // 感情を反映
    this.applyEmotion(emotion);

    // 発話 (SDK側で音声合成とリップシンクが行われる想定)
    await this.avatar.say(text);

    // 発話終了後に表情をリセット（必要に応じて）
    // this.applyEmotion('neutral');
  }

  /**
   * 表情を切り替える
   * @param {string} emotion 
   */
  applyEmotion(emotion) {
    if (!this.avatar) return;

    // virtual-avatar SDK の仕様に合わせてマッピング
    // ここでは基本的な喜怒哀楽を想定
    const emotionMap = {
      'smile': 'happy',
      'neutral': 'neutral',
      'thinking': 'relaxed',
      'sad': 'sad',
      'angry': 'angry'
    };

    const sdkEmotion = emotionMap[emotion] || 'neutral';
    this.avatar.setExpression(sdkEmotion);
  }
}
