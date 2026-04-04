const fs = require('fs').promises;
const path = require('path');

class PromptRegistry {
  constructor(promptsDir) {
    this.promptsDir = promptsDir;
  }

  async getPrompt(layer, name, override = null) {
    if (override) return override;
    
    let filePath;
    if (layer === 'base') {
      filePath = path.join(this.promptsDir, 'base.txt');
    } else {
      filePath = path.join(this.promptsDir, layer, `${name}.txt`);
    }

    try {
      return await fs.readFile(filePath, 'utf-8');
    } catch (error) {
      console.warn(`Warning: Could not load prompt ${layer}/${name}. Using empty string.`);
      return '';
    }
  }

  async getFullPromptConfig(config, overrides = {}) {
    const [base, safety, character, task] = await Promise.all([
      this.getPrompt('base', null, overrides.base),
      this.getPrompt('safety', `level${config.safetyLevel}`, overrides.safety),
      this.getPrompt('characters', config.avatarType, overrides.character),
      this.getPrompt('tasks', config.taskId, overrides.task)
    ]);

    return { base, safety, character, task };
  }
}

module.exports = PromptRegistry;
