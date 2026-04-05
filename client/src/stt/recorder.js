/**
 * Web Speech API (SpeechRecognition) をラップした音声認識クラス。
 */
export class STTRecorder {
  constructor() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      throw new Error('このブラウザは Web Speech API をサポートしていません。');
    }

    this.recognition = new SpeechRecognition();
    this.recognition.lang = 'ja-JP';
    this.recognition.interimResults = true; // 中間結果も取得
    this.recognition.continuous = false;   // 1文ごとに停止

    this.isListening = false;
    this.onResultCallback = null;
    this.onEndCallback = null;

    this._setupListeners();
  }

  _setupListeners() {
    this.recognition.onresult = (event) => {
      const transcript = Array.from(event.results)
        .map(result => result[0].transcript)
        .join('');

      const isFinal = event.results[event.results.length - 1].isFinal;

      if (this.onResultCallback) {
        this.onResultCallback({ transcript, isFinal });
      }
    };

    this.recognition.onend = () => {
      this.isListening = false;
      if (this.onEndCallback) {
        this.onEndCallback();
      }
    };

    this.recognition.onerror = (event) => {
      console.error('STT Error:', event.error);
      this.isListening = false;
    };
  }

  start() {
    if (this.isListening) return;
    this.recognition.start();
    this.isListening = true;
  }

  stop() {
    if (!this.isListening) return;
    this.recognition.stop();
    this.isListening = false;
  }

  onResult(callback) {
    this.onResultCallback = callback;
  }

  onEnd(callback) {
    this.onEndCallback = callback;
  }
}
