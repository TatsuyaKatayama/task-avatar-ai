require('dotenv').config();
const OpenAIProvider = require('../../services/llm/openai');
const GeminiProvider = require('../../services/llm/gemini');

const isValidKey = (key) => {
  const result = typeof key === 'string' && 
         key.trim().length > 0 && 
         key.trim() !== 'xxxx' && 
         key.trim() !== 'dummy_key' &&
         key.trim() !== 'undefined';
  return !!result;
};

const hasOpenAIKey = isValidKey(process.env.OPENAI_API_KEY);
const hasGeminiKey = isValidKey(process.env.GOOGLE_GENERATIVE_AI_API_KEY);

// 共通のテストプロンプト
const systemPrompt = `
返答は必ず以下のJSON形式で行ってください。
{
  "emotion": "smile | neutral",
  "text": "返答テキスト"
}
あなたは「挨拶bot」です。ユーザーが挨拶したら、必ず笑顔（smile）で挨拶を返してください。
`;

describe('LLM Integration Tests', () => {
  // タイムアウトを長めに設定（API呼び出しのため）
  jest.setTimeout(30000);

  (hasOpenAIKey ? test : test.skip)('OpenAI Provider should return valid JSON and smile', async () => {
    try {
      const provider = new OpenAIProvider(process.env.OPENAI_API_KEY);
      const response = await provider.generateResponse(systemPrompt, 'こんにちは！');

      console.log('[OpenAI Response]:', response);

      expect(response).toHaveProperty('emotion');
      expect(response).toHaveProperty('text');
      expect(response.emotion).toBe('smile');
    } catch (error) {
      if (error.status === 401 || error.status === 404 || error.message.includes('404')) {
        console.warn('Skipping OpenAI Test due to API key permission or model access issue:', error.message);
      } else {
        throw error;
      }
    }
  });

  (hasGeminiKey ? test : test.skip)('Gemini Provider should return valid JSON and smile', async () => {
    try {
      const provider = new GeminiProvider(process.env.GOOGLE_GENERATIVE_AI_API_KEY);
      const response = await provider.generateResponse(systemPrompt, 'こんにちは！');

      console.log('[Gemini Response]:', response);

      expect(response).toHaveProperty('emotion');
      expect(response).toHaveProperty('text');
      expect(response.emotion).toBe('smile');
    } catch (error) {
      if (error.status === 401 || error.status === 403 || error.status === 404 || error.message.includes('404')) {
        console.warn('Skipping Gemini Test due to API key permission or model access issue:', error.message);
      } else {
        throw error;
      }
    }
  });
});

