const { db } = require('../../db/init');

class PromptRegistry {
  async getPromptById(id) {
    if (!id) return '';
    try {
      const row = db.prepare('SELECT content FROM prompt_fragments WHERE id = ?').get(id);
      return row ? row.content : '';
    } catch (error) {
      console.warn(`Warning: Could not load prompt ID ${id}. Using empty string.`);
      return '';
    }
  }

  async getFullPromptConfig(avatarPresetId, taskPresetId) {
    // 1. Get Avatar Preset
    const avatar = db.prepare('SELECT * FROM avatar_presets WHERE id = ?').get(avatarPresetId);
    if (!avatar) throw new Error('Avatar preset not found');

    // 2. Get Task Preset
    const task = db.prepare('SELECT * FROM task_presets WHERE id = ?').get(taskPresetId);
    if (!task) throw new Error('Task preset not found');

    // 3. Get System Settings
    const system = db.prepare('SELECT * FROM system_settings WHERE id = 1').get();

    // 4. Fetch fragments
    const [base, safety, character, taskInstruction] = await Promise.all([
      this.getPromptById(system?.base_prompt_id),
      this.getPromptById(task.safety_prompt_id),
      this.getPromptById(avatar.character_prompt_id),
      this.getPromptById(task.task_prompt_id)
    ]);

    return { 
      base, 
      safety, 
      character, 
      task: taskInstruction,
      voiceConfig: {
        speakerId: avatar.voice_speaker_id,
        speed: avatar.voice_speed,
        pitch: avatar.voice_pitch
      },
      animations: {
        startup: avatar.startup_anim_url,
        shutdown: avatar.shutdown_anim_url
      }
    };
  }
}

module.exports = PromptRegistry;
