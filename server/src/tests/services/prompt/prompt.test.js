const path = require('path');
const PromptRegistry = require('../../../services/prompt/registry');
const PromptBuilder = require('../../../services/prompt/builder');

describe('Prompt Logic', () => {
  const promptsDir = path.join(__dirname, '../../../prompts');
  const registry = new PromptRegistry(promptsDir);

  test('Registry should load default prompts correctly', async () => {
    const config = { safetyLevel: 1, avatarType: 'gentle', taskId: 'cook_rice_1cup' };
    const result = await registry.getFullPromptConfig(config);

    expect(result.base).toContain('JSON形式');
    expect(result.character).toContain('優しい家庭教師');
    expect(result.safety).toContain('Level 1');
    expect(result.task).toContain('1合のご飯を炊く');
  });

  test('Registry should apply overrides if provided', async () => {
    const config = { safetyLevel: 1, avatarType: 'gentle', taskId: 'cook_rice_1cup' };
    const overrides = { character: 'You are a robot.' };
    const result = await registry.getFullPromptConfig(config, overrides);

    expect(result.character).toBe('You are a robot.');
    expect(result.base).toContain('JSON形式'); // overridesされていないものはデフォルト
  });

  test('Builder should combine layers with separators', () => {
    const config = {
      base: 'B',
      safety: 'S',
      character: 'C',
      task: 'T'
    };
    const result = PromptBuilder.build(config);

    expect(result).toContain('=== BASE RULES ===\nB');
    expect(result).toContain('=== SAFETY GUIDELINES ===\nS');
    expect(result).toContain('=== CHARACTER SETTINGS ===\nC');
    expect(result).toContain('=== TASK INFORMATION ===\nT');
  });
});
