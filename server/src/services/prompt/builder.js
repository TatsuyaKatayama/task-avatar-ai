class PromptBuilder {
  static build(config) {
    const { base, safety, character, task } = config;
    
    return [
      "=== BASE RULES ===",
      base,
      "",
      "=== SAFETY GUIDELINES ===",
      safety,
      "",
      "=== CHARACTER SETTINGS ===",
      character,
      "",
      "=== TASK INFORMATION ===",
      task
    ].join('\n');
  }
}

module.exports = PromptBuilder;
