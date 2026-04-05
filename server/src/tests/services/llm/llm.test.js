const OpenAIProvider = require('../../../services/llm/openai');

// OpenAIのモック
jest.mock('openai', () => {
  return {
    OpenAI: jest.fn().mockImplementation(() => ({
      chat: {
        completions: {
          create: jest.fn()
            .mockResolvedValueOnce({
              choices: [{ message: { content: "不正なレスポンス" } }]
            })
            .mockResolvedValueOnce({
              choices: [{ message: { content: JSON.stringify({ emotion: "happy", text: "成功" }) } }]
            })
        }
      }
    }))
  };
});

describe('OpenAIProvider with Retry', () => {
  test('should retry once if first response is not valid JSON', async () => {
    const provider = new OpenAIProvider('fake-key');
    const response = await provider.generateResponse('system', 'user');

    expect(response).toEqual({ emotion: "happy", text: "成功" });
  });
});
