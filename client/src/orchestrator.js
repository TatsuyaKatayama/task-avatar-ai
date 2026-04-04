import { STTRecorder } from './stt/recorder';
import { AvatarController } from './avatar/controller';
import { APIClient } from './api/client';

/**
 * クライアント側のアクションフローを統括するオーケストレーター。
 */
export class Orchestrator {
  constructor() {
    this.stt = new STTRecorder();
    this.avatar = new AvatarController('canvas-container');
    this.api = new APIClient();
    
    // セッション ID は起動時に一度だけ生成
    this.sessionId = `session-${Date.now()}`;
    
    // デフォルトの設定 (本来はUIから変更可能にする)
    this.taskId = 'cook_rice_1cup';
    this.avatarType = 'gentle';
    this.provider = 'gemini';

    this._setupHandlers();
  }

  async init(vrmUrl) {
    await this.avatar.init(vrmUrl);
  }

  _setupHandlers() {
    // 音声認識の結果（確定時）を受け取る
    this.stt.onResult(async ({ transcript, isFinal }) => {
      // 画面上の字幕表示用
      const transcriptEl = document.getElementById('transcript');
      if (transcriptEl) transcriptEl.innerText = transcript;

      if (isFinal) {
        console.log('[User Input]:', transcript);
        this._updateStatus('考え中...');
        
        try {
          // 1. LLM API を呼び出す
          const result = await this.api.callLLM({
            sessionId: this.sessionId,
            userMessage: transcript,
            taskId: this.taskId,
            avatarType: this.avatarType,
            provider: this.provider
          });

          console.log('[LLM Output]:', result);
          this._updateStatus('発話中...');

          // 2. アバターに喋らせ、表情を変える
          await this.avatar.speak(result.text, result.emotion);

          this._updateStatus('待機中 (ボタンを押して開始)');

        } catch (error) {
          console.error('Orchestrator Error:', error);
          this._updateStatus('エラーが発生しました');
        }
      }
    });
  }

  startListening() {
    this._updateStatus('聞き取り中...');
    this.stt.start();
  }

  _updateStatus(text) {
    const statusEl = document.getElementById('status');
    if (statusEl) statusEl.innerText = text;
  }
}
