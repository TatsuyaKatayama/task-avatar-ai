const OpenAIProvider = require('./openai');
const GeminiProvider = require('./gemini');

class LLMFactory {
  static create(providerName) {
    switch (providerName.toLowerCase()) {
      case 'openai':
        return new OpenAIProvider(process.env.OPENAI_API_KEY);
      case 'gemini':
        return new GeminiProvider(process.env.GOOGLE_GENERATIVE_AI_API_KEY);
      default:
        throw new Error(`Unsupported LLM provider: ${providerName}`);
    }
  }
}

module.exports = LLMFactory;
