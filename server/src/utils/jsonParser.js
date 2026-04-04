function extractJSON(text) {
  try {
    // Markdownのコードブロックを削除してJSONを取り出す
    const match = text.match(/```json\s*([\s\S]*?)\s*```/) || text.match(/```\s*([\s\S]*?)\s*```/);
    const jsonString = match ? match[1] : text;
    return JSON.parse(jsonString.trim());
  } catch (error) {
    return null; // 失敗時はnullを返し、呼び出し側にリトライを促す
  }
}

module.exports = { extractJSON };
