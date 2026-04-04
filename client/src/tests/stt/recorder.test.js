import { STTRecorder } from '../../stt/recorder';

describe('STTRecorder', () => {
  // SpeechRecognition のモッククラス
  class MockSpeechRecognition {
    constructor() {
      this.lang = '';
      this.interimResults = false;
      this.continuous = false;
      this.onresult = null;
      this.onend = null;
      this.onerror = null;
      
      this.start = jest.fn();
      this.stop = jest.fn();
    }
    
    // テスト用のヘルパー関数：モック側から結果イベントを発火させる
    triggerResult(transcript, isFinal) {
      if (this.onresult) {
        const event = {
          results: [
            [ { transcript } ]
          ]
        };
        event.results[0].isFinal = isFinal;
        this.onresult(event);
      }
    }
    
    triggerEnd() {
      if (this.onend) this.onend();
    }
  }

  beforeEach(() => {
    // グローバルにモックをセット
    global.window = global.window || {};
    global.window.SpeechRecognition = MockSpeechRecognition;
    global.window.webkitSpeechRecognition = undefined; // 念のため
  });

  afterEach(() => {
    delete global.window.SpeechRecognition;
  });

  test('SpeechRecognitionがサポートされていない場合はエラーを投げること', () => {
    delete global.window.SpeechRecognition;
    
    expect(() => {
      new STTRecorder();
    }).toThrow('このブラウザは Web Speech API をサポートしていません。');
  });

  test('正常に初期化され、start/stopが呼べること', () => {
    const recorder = new STTRecorder();
    
    expect(recorder.isListening).toBe(false);
    
    recorder.start();
    expect(recorder.isListening).toBe(true);
    expect(recorder.recognition.start).toHaveBeenCalledTimes(1);
    
    recorder.stop();
    expect(recorder.isListening).toBe(false);
    expect(recorder.recognition.stop).toHaveBeenCalledTimes(1);
  });

  test('onresultイベントがコールバックをトリガーすること', () => {
    const recorder = new STTRecorder();
    const mockCallback = jest.fn();
    
    recorder.onResult(mockCallback);
    
    // 音声認識オブジェクト内部からイベントをモック発火
    recorder.recognition.triggerResult('こんにちは', true);
    
    expect(mockCallback).toHaveBeenCalledTimes(1);
    expect(mockCallback).toHaveBeenCalledWith({
      transcript: 'こんにちは',
      isFinal: true
    });
  });

  test('onendイベントでisListeningがfalseになること', () => {
    const recorder = new STTRecorder();
    const mockEndCallback = jest.fn();
    
    recorder.onEnd(mockEndCallback);
    recorder.start();
    
    expect(recorder.isListening).toBe(true);
    
    recorder.recognition.triggerEnd();
    
    expect(recorder.isListening).toBe(false);
    expect(mockEndCallback).toHaveBeenCalledTimes(1);
  });
});
