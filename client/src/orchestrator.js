import { STTRecorder } from './stt/recorder';
import { AvatarController } from './avatar/controller';
import { APIClient } from './api/client';
import { VoicevoxClient } from './api/voicevox';

/**
 * クライアント側のアクションフローを統括するオーケストレーター。
 */
export class Orchestrator {
  constructor() {
    this.stt = new STTRecorder();
    this.avatar = new AvatarController('canvas-container');
    this.api = new APIClient();
    this.voicevox = new VoicevoxClient();
    
    // UI 要素の取得
    this.taskSelect = document.getElementById('task-select');
    this.characterSelect = document.getElementById('character-select');
    this.providerSelect = document.getElementById('provider-select');
    this.chatInput = document.getElementById('chat-input');
    this.sendBtn = document.getElementById('send-btn');
    this.creditBtn = document.getElementById('credit-btn');
    this.creditModal = document.getElementById('credit-modal');
    this.closeCredit = document.getElementById('close-credit');
    
    console.log('[Orchestrator] Elements:', {
      creditBtn: !!this.creditBtn,
      creditModal: !!this.creditModal,
      closeCredit: !!this.closeCredit
    });
    
    this.presets = { avatars: [], tasks: [] };

    // セッション ID は起動時に生成
    this._resetSession();

    this._setupHandlers();
    this._setupUIListeners();
  }

  async showCredits() {
    console.log('[Orchestrator] showCredits called');
    if (!this.creditModal) {
      console.error('[Orchestrator] creditModal is null');
      return;
    }
    
    // まず表示する
    this.creditModal.style.display = 'flex';

    try {
      const res = await fetch('http://localhost:3000/api/credits');
      const data = await res.json();
      const display = document.getElementById('credit-text-display');
      if (display) {
        if (data.credits && data.credits.length > 0) {
          // 内容 (content) のみを結合して表示
          display.innerText = data.credits.map(c => c.content).join('\n\n');
        } else {
          display.innerText = 'クレジット情報が設定されていません。';
        }
      }
    } catch (e) {
      console.error('[Orchestrator] showCredits error:', e);
    }
  }

  _resetSession() {
    this.sessionId = `session-${Date.now()}`;
    console.log('Session reset:', this.sessionId);
  }

  async loadPresets() {
    try {
      const res = await fetch('http://localhost:3000/api/presets');
      this.presets = await res.json();
      
      // Update UI Selects
      if (this.characterSelect) {
        this.characterSelect.innerHTML = this.presets.avatars.map(a => `<option value="${a.id}">${a.name}</option>`).join('');
      }
      if (this.taskSelect) {
        this.taskSelect.innerHTML = this.presets.tasks.map(t => `<option value="${t.id}">${t.name}</option>`).join('');
      }
    } catch (e) {
      console.error('Failed to load presets:', e);
      this._updateStatus('初期データの読み込みに失敗しました');
    }
  }

  async init(vrmUrl) {
    // 1. プリセットデータをロード
    await this.loadPresets();

    // 2. 初期アバターの決定 (引数指定がなければ最初のプリセット)
    let targetUrl = vrmUrl;
    let initialPreset = this.presets.avatars.length > 0 ? this.presets.avatars[0] : null;

    if (!targetUrl && initialPreset) {
      targetUrl = initialPreset.vrm_url;
    }

    if (targetUrl) {
      // モデルを初期化（AvatarController側の500ms待機を含む）
      await this.avatar.init(targetUrl);
      
      // 初期挨拶アニメーション (準備が完全に整うよう、ここでもわずかに待機)
      if (initialPreset && initialPreset.startup_anim_url) {
        console.log('[Orchestrator] Requesting startup animation:', initialPreset.startup_anim_url);
        setTimeout(async () => {
          await this.avatar.playAnimation(initialPreset.startup_anim_url);
        }, 100);
      }
    }
  }

  _setupUIListeners() {
    // クレジット表示
    if (this.creditBtn) {
      this.creditBtn.addEventListener('click', () => this.showCredits());
    }
    if (this.closeCredit) {
      this.closeCredit.addEventListener('click', () => {
        this.creditModal.style.display = 'none';
      });
    }
    window.addEventListener('click', (e) => {
      if (e.target === this.creditModal) this.creditModal.style.display = 'none';
    });

    // タスク変更
    if (this.taskSelect) {
      this.taskSelect.addEventListener('change', () => {
        this._resetSession();
        this._clearChatHistory();
      });
    }

    // アバター変更
    if (this.characterSelect) {
      this.characterSelect.addEventListener('change', async () => {
        const presetId = parseInt(this.characterSelect.value);
        const preset = this.presets.avatars.find(a => a.id === presetId);
        
        if (preset) {
          this._resetSession();
          this._clearChatHistory();
          this._updateStatus('アバター切替中...');
          
          // モデルの再ロード
          await this.avatar.init(preset.vrm_url);
          
          // 挨拶アニメーション再生
          if (preset.startup_anim_url) {
            await this.avatar.playAnimation(preset.startup_anim_url);
          }
          
          this._updateStatus('待機中');
        }
      });
    }

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
      const taskPresetId = this.taskSelect?.value;
      const avatarPresetId = this.characterSelect?.value;
      const provider = this.providerSelect?.value || 'gemini';

      if (!taskPresetId || !avatarPresetId) {
        throw new Error('プリセットが選択されていません');
      }

      // 1. LLM API を呼び出す
      const result = await this.api.callLLM({
        sessionId: this.sessionId,
        userMessage,
        taskPresetId,
        avatarPresetId,
        provider
      });

      console.log('[LLM Output]:', result);
      this._updateStatus('発話中...');

      // LLMの応答をチャット履歴に追加
      this._appendMessage('avatar', result.text);

      this._updateStatus('音声生成中...');
      
      // バックエンドから返された Voicevox の設定を使用する
      const { speakerId, speed, pitch } = result.voiceConfig || { speakerId: 1, speed: 1.0, pitch: 0.0 };
      
      const audioBlob = await this.voicevox.getAudioBlob(result.text, speakerId);
      const audioUrl = URL.createObjectURL(audioBlob);

      this._updateStatus('発話中...');

      // 2. アバターに喋らせ、表情を変える
      await this.avatar.speak(result.text, result.emotion, audioUrl);

      // メモリリークを防ぐため、少し待ってからURLを解放
      setTimeout(() => URL.revokeObjectURL(audioUrl), 10000);

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
