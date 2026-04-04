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
    
    // UI 要素の取得
    this.taskSelect = document.getElementById('task-select');
    this.characterSelect = document.getElementById('character-select');
    this.providerSelect = document.getElementById('provider-select');
    
    // セッション ID は起動時に生成
    this._resetSession();

    this._setupHandlers();
    this._setupUIListeners();
  }

  _resetSession() {
    this.sessionId = `session-${Date.now()}`;
    console.log('Session reset:', this.sessionId);
  }

  async init(vrmUrl) {
    await this.avatar.init(vrmUrl);
  }

  _setupUIListeners() {
    // タスクや性格が変更されたらセッションをリセットして履歴をクリアする
    [this.taskSelect, this.characterSelect, this.providerSelect].forEach(el => {
      if (el) {
        el.addEventListener('change', () => this._resetSession());
      }
    });
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
          // UI から現在の設定を取得
          const taskId = this.taskSelect?.value || 'cook_rice_1cup';
          const avatarType = this.characterSelect?.value || 'gentle';
          const provider = this.providerSelect?.value || 'gemini';

          // 1. LLM API を呼び出す
          const result = await this.api.callLLM({
            sessionId: this.sessionId,
            userMessage: transcript,
            taskId,
            avatarType,
            provider
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
