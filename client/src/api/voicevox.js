/**
 * Voicevox サーバーとの通信を管理するクライアントクラス。
 */
export class VoicevoxClient {
  constructor(baseUrl = 'http://localhost:50021') {
    this.baseUrl = baseUrl;
  }

  /**
   * テキストから音声を生成し、Blob 形式で返します。
   * @param {string} text 喋らせたいテキスト
   * @param {number} speakerId スピーカーID
   * @returns {Promise<Blob>} 音声データの Blob
   */
  async getAudioBlob(text, speakerId = 1) {
    try {
      // 1. クエリ作成
      const queryResponse = await fetch(
        `${this.baseUrl}/audio_query?text=${encodeURIComponent(text)}&speaker=${speakerId}`,
        { method: 'POST' }
      );
      if (!queryResponse.ok) throw new Error(`Voicevox query failed: ${queryResponse.status}`);
      const queryData = await queryResponse.json();

      // 2. 音声合成
      const synthesisResponse = await fetch(
        `${this.baseUrl}/synthesis?speaker=${speakerId}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(queryData),
        }
      );
      if (!synthesisResponse.ok) throw new Error(`Voicevox synthesis failed: ${synthesisResponse.status}`);

      return await synthesisResponse.blob();
    } catch (error) {
      console.error('[VoicevoxClient] Error:', error);
      throw error;
    }
  }
}
