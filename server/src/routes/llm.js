const express = require('express');
const router = express.Router();
const path = require('path');
const PromptRegistry = require('../services/prompt/registry');
const PromptBuilder = require('../services/prompt/builder');
const LLMFactory = require('../services/llm/factory');
const sessionStore = require('../services/session/store');

const promptsDir = path.join(__dirname, '../prompts');
const registry = new PromptRegistry(promptsDir);

router.post('/llm', async (req, res) => {
  const { 
    sessionId, 
    userMessage, 
    taskId, 
    avatarType, 
    overrides = {}, 
    provider = 'gemini' 
  } = req.body;

  if (!sessionId || !userMessage || !taskId || !avatarType) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    // 1. セッション履歴の取得
    const history = sessionStore.getHistory(sessionId);

    // 2. プロンプトの合成 (SafetyLevelは一旦固定値1、将来的にtask定義から取得)
    const taskConfig = { safetyLevel: 1, taskId, avatarType };
    const promptConfig = await registry.getFullPromptConfig(taskConfig, overrides);
    const systemPrompt = PromptBuilder.build(promptConfig);

    // 3. LLMの呼び出し
    const llm = LLMFactory.create(provider);
    const result = await llm.generateResponse(systemPrompt, userMessage, history);

    // 4. 履歴の更新
    sessionStore.addMessage(sessionId, 'user', userMessage);
    sessionStore.addMessage(sessionId, 'assistant', result.text);

    // 5. レスポンスの返却
    res.json(result);
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
});

module.exports = router;
