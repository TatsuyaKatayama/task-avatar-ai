/**
 * サーバー API との通信を管理するクライアントクラス。
 */
export class APIClient {
  constructor(baseUrl = 'http://localhost:3000') {
    this.baseUrl = baseUrl;
  }

  /**
   * LLM API を呼び出す
   * @param {Object} params 
   * @param {string} params.sessionId - セッションを一意に識別するID
   * @param {string} params.userMessage - ユーザーの音声入力テキスト
   * @param {string} params.taskPresetId - 選択されたタスクプリセットのID
   * @param {string} params.avatarPresetId - 選択されたアバタープリセットのID
   * @param {string} [params.provider='gemini'] - 使用する LLM プロバイダー
   * @returns {Promise<Object>} - { emotion, text, voiceConfig, animations }
   */
  async callLLM({ sessionId, userMessage, taskPresetId, avatarPresetId, provider = 'gemini' }) {
    const response = await fetch(`${this.baseUrl}/api/llm`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sessionId,
        userMessage,
        taskPresetId,
        avatarPresetId,
        provider
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'API 呼び出し中にエラーが発生しました');
    }

    return await response.json();
  }
}
