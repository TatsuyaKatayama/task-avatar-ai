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
   * @param {string} params.taskId - 実行中のタスクID (例: cook_rice_1cup)
   * @param {string} params.avatarType - アバターの性格タイプ (gentle, strict)
   * @param {string} [params.provider='gemini'] - 使用する LLM プロバイダー
   * @param {Object} [params.overrides={}] - プロンプトの上書き設定
   * @returns {Promise<Object>} - { emotion: string, text: string }
   */
  async callLLM({ sessionId, userMessage, taskId, avatarType, provider = 'gemini', overrides = {} }) {
    const response = await fetch(`${this.baseUrl}/api/llm`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sessionId,
        userMessage,
        taskId,
        avatarType,
        provider,
        overrides
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'API 呼び出し中にエラーが発生しました');
    }

    return await response.json();
  }
}
