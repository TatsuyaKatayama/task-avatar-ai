const { extractJSON } = require('../../utils/jsonParser');
const { OpenAI } = require('openai');

class OpenAIProvider {
  constructor(apiKey) {
    this.client = new OpenAI({ apiKey });
  }

  async generateResponse(systemPrompt, userMessage, history = []) {
    const messages = [
      { role: "system", content: systemPrompt },
      ...history.map(msg => ({
        role: msg.role === 'assistant' ? 'assistant' : 'user',
        content: msg.content
      })),
      { role: "user", content: userMessage }
    ];

    let response = await this.client.chat.completions.create({
      model: "gpt-4-turbo",
      messages,
      response_format: { type: "json_object" },
      temperature: 0.7,
    });

    let rawText = response.choices[0].message.content;
    let json = extractJSON(rawText);

    // リトライ処理: JSONでなければもう一度だけ厳格なフォーマット指定で依頼
    if (!json) {
      console.warn("Retrying OpenAI due to JSON parse failure...");
      messages.push({ role: "assistant", content: rawText });
      messages.push({ role: "system", content: "【フォーマットエラー】謝罪や形式に関する説明を一切含まず、本来の回答内容（ユーザーへの案内）のみを指定のJSON形式（emotion, text）で再出力してください。" });

      response = await this.client.chat.completions.create({
        model: "gpt-4-turbo",
        messages,
        response_format: { type: "json_object" },
        temperature: 0.2, // リトライ時は決定性を高める
      });

      rawText = response.choices[0].message.content;
      json = extractJSON(rawText);
    }

    // 2回目もダメならフォールバック
    return json || { emotion: "neutral", text: "すみません、うまく認識できませんでした。" };
  }
}

module.exports = OpenAIProvider;
