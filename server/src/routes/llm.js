const express = require('express');
const router = express.Router();
const PromptRegistry = require('../services/prompt/registry');
const PromptBuilder = require('../services/prompt/builder');
const LLMFactory = require('../services/llm/factory');
const sessionStore = require('../services/session/store');

const registry = new PromptRegistry();

router.post('/llm', async (req, res) => {
  const { 
    sessionId, 
    userMessage, 
    avatarPresetId,
    taskPresetId,
    provider = 'gemini' 
  } = req.body;

  if (!sessionId || !userMessage || !avatarPresetId || !taskPresetId) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    // 1. セッション履歴の取得
    const history = sessionStore.getHistory(sessionId);

    // 2. プロンプトの合成
    const promptConfig = await registry.getFullPromptConfig(avatarPresetId, taskPresetId);
    const systemPrompt = PromptBuilder.build(promptConfig);

    // 3. LLMの呼び出し
    const llm = LLMFactory.create(provider);
    const result = await llm.generateResponse(systemPrompt, userMessage, history);

    // 4. 履歴の更新
    sessionStore.addMessage(sessionId, 'user', userMessage);
    sessionStore.addMessage(sessionId, 'assistant', result.text);

    // 5. レスポンスの返却 (LLM結果に加えて、音声設定とアニメーション設定も含める)
    res.json({
      ...result,
      voiceConfig: promptConfig.voiceConfig,
      animations: promptConfig.animations
    });
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
});

module.exports = router;
