const request = require('supertest');
const express = require('express');
const cors = require('cors');
const llmRoutes = require('../../routes/llm');
const sessionStore = require('../../services/session/store');

// モック: LLMFactory が偽の Provider を返すようにする
jest.mock('../../services/llm/factory', () => ({
  create: jest.fn().mockReturnValue({
    generateResponse: jest.fn().mockResolvedValue({ emotion: 'smile', text: 'OK' })
  })
}));

const app = express();
app.use(express.json());
app.use('/api', llmRoutes);

describe('API Route /api/llm', () => {
  beforeEach(() => {
    sessionStore.clearSession('test-session');
  });

  test('POST /api/llm should return 200 and JSON response', async () => {
    const response = await request(app)
      .post('/api/llm')
      .send({
        sessionId: 'test-session',
        userMessage: 'Hello',
        taskId: 'cook_rice_1cup',
        avatarType: 'gentle',
        provider: 'gemini'
      });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ emotion: 'smile', text: 'OK' });

    // セッション履歴が更新されているか
    const history = sessionStore.getHistory('test-session');
    expect(history).toHaveLength(2);
    expect(history[0].content).toBe('Hello');
  });

  test('POST /api/llm should return 400 for missing fields', async () => {
    const response = await request(app)
      .post('/api/llm')
      .send({ sessionId: 'test-session' }); // userMessage などが欠けている

    expect(response.status).toBe(400);
    expect(response.body.error).toBe('Missing required fields');
  });
});
