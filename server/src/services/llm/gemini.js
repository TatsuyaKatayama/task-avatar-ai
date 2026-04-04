const { extractJSON } = require('../../utils/jsonParser');
const { GoogleGenerativeAI } = require('@google/generative-ai');

class GeminiProvider {
  constructor(apiKey) {
    this.genAI = new GoogleGenerativeAI(apiKey);
  }

  async generateResponse(systemPrompt, userMessage, history = []) {
    const model = this.genAI.getGenerativeModel({
      model: "gemini-2.5-flash-lite",
      systemInstruction: systemPrompt,
    });

    const formattedHistory = history.map(msg => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }]
    }));

    const chat = model.startChat({ history: formattedHistory });
    let result = await chat.sendMessage(userMessage);
    let rawText = result.response.text();
    let json = extractJSON(rawText);

    // リトライ処理: JSONでなければもう一度だけ厳格なフォーマット指定で依頼
    if (!json) {
      console.warn("Retrying Gemini due to JSON parse failure...");
      // 再試行用のメッセージを送信
      const retryMessage = "出力は必ず指定されたJSON形式（フィールド: emotion, text）にしてください。余計な文章や、コードブロックは一切含めないでください。";
      result = await chat.sendMessage(retryMessage);
      rawText = result.response.text();
      json = extractJSON(rawText);
    }

    // 2回目もダメならフォールバック
    return json || { emotion: "neutral", text: "すみません、うまく認識できませんでした。" };
  }
}

module.exports = GeminiProvider;
