import { APIClient } from '../../api/client';

// グローバルの fetch をモック化する
global.fetch = jest.fn();

describe('APIClient', () => {
  let client;

  beforeEach(() => {
    // 各テストの前に fetch のモックをクリアし、クライアントを初期化する
    fetch.mockClear();
    client = new APIClient('http://localhost:3000');
  });

  test('正常系: callLLMが正しいパラメータでfetchを呼び出し、結果を返すこと', async () => {
    // モックのレスポンスを設定
    const mockResponseData = { emotion: 'smile', text: 'こんにちは' };
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponseData,
    });

    const params = {
      sessionId: 'test-session-123',
      userMessage: 'テストメッセージ',
      taskId: 'test_task',
      avatarType: 'gentle',
      provider: 'openai',
      overrides: { character: 'test override' }
    };

    const result = await client.callLLM(params);

    // fetch が正しく呼び出されたか検証
    expect(fetch).toHaveBeenCalledTimes(1);
    expect(fetch).toHaveBeenCalledWith('http://localhost:3000/api/llm', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    });

    // 結果が正しく返されたか検証
    expect(result).toEqual(mockResponseData);
  });

  test('異常系: APIエラー時に適切に例外がスローされること', async () => {
    // エラーレスポンスのモック
    const errorMessage = 'サーバーエラーが発生しました';
    fetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: errorMessage }),
    });

    const params = {
      sessionId: 'test-session',
      userMessage: 'hello',
      taskId: 'task1',
      avatarType: 'strict'
    };

    // 例外がスローされることを検証
    await expect(client.callLLM(params)).rejects.toThrow(errorMessage);
  });
});
