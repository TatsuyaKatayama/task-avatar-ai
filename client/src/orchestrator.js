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
    this.chatInput = document.getElementById('chat-input');
    this.sendBtn = document.getElementById('send-btn');
    
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
        el.addEventListener('change', () => {
          this._resetSession();
          this._clearChatHistory();
        });
      }
    });

    // テキスト送信ボタンのクリックイベント
    if (this.sendBtn) {
      this.sendBtn.addEventListener('click', () => this._handleTextInput());
    }

    // Enter キーでも送信できるようにする
    if (this.chatInput) {
      this.chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') this._handleTextInput();
      });
    }
  }

  _clearChatHistory() {
    const historyEl = document.getElementById('chat-history');
    if (historyEl) historyEl.innerHTML = '';
  }

  _appendMessage(role, text) {
    const historyEl = document.getElementById('chat-history');
    if (!historyEl) return;

    const row = document.createElement('div');
    row.className = `message-row ${role}`; // 'user' or 'avatar'

    const label = document.createElement('div');
    label.className = 'message-label';
    label.innerText = role === 'user' ? '👤 あなた' : '🤖 アバター';

    const bubble = document.createElement('div');
    bubble.className = 'message-bubble';
    bubble.innerText = text;

    row.appendChild(label);
    row.appendChild(bubble);
    historyEl.appendChild(row);

    // 最新のメッセージまでスクロール
    historyEl.scrollTop = historyEl.scrollHeight;
  }

  async _handleTextInput() {
    const text = this.chatInput?.value.trim();
    if (!text) return;

    // 入力欄をクリア
    this.chatInput.value = '';
    
    // UIを更新
    this._appendMessage('user', text);

    // 処理開始
    await this._processMessage(text);
  }

  _setupHandlers() {
    // 音声認識の結果（確定時）を受け取る
    this.stt.onResult(async ({ transcript, isFinal }) => {
      if (isFinal) {
        console.log('[User Input (Voice)]:', transcript);
        this._appendMessage('user', transcript);
        await this._processMessage(transcript);
      }
    });
  }

  /**
   * メッセージの共通処理 (API呼び出し -> アバター発話)
   */
  async _processMessage(userMessage) {
    this._updateStatus('考え中...');
    
    try {
      // UI から現在の設定を取得
      const taskId = this.taskSelect?.value || 'cook_rice_1cup';
      const avatarType = this.characterSelect?.value || 'gentle';
      const provider = this.providerSelect?.value || 'gemini';

      // 1. LLM API を呼び出す
      const result = await this.api.callLLM({
        sessionId: this.sessionId,
        userMessage,
        taskId,
        avatarType,
        provider
      });

      console.log('[LLM Output]:', result);
      this._updateStatus('発話中...');

      // LLMの応答をチャット履歴に追加
      this._appendMessage('avatar', result.text);

      // 2. アバターに喋らせ、表情を変える
      await this.avatar.speak(result.text, result.emotion);

      this._updateStatus('待機中');

    } catch (error) {
      console.error('Orchestrator Error:', error);
      this._updateStatus(`エラー: ${error.message}`);
      
      // エラー発生時は悲しい表情で通知
      if (this.avatar) {
        this.avatar.applyEmotion('sad');
      }
    }
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
