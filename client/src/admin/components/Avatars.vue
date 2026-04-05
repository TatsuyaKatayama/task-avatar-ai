<template>
  <div class="avatars-view">
    <h2>アバタープリセット管理</h2>
    
    <div class="card form-card">
      <h3>{{ editingId ? 'アバターの編集' : '新しいアバターの作成' }}</h3>
      <input v-model="form.name" placeholder="表示名 (例: 優しいメタん)" />
      
      <label>VRMモデル</label>
      <select v-model="form.vrm_url">
        <option v-for="m in assets.models" :key="m" :value="m">{{ m }}</option>
      </select>

      <label>性格プロンプト</label>
      <select v-model="form.character_prompt_id">
        <option v-for="p in characters" :key="p.id" :value="p.id">{{ p.name }}</option>
      </select>

      <div class="voice-settings">
        <div>
          <label>Voicevox ID</label>
          <input type="number" v-model="form.voice_speaker_id" />
        </div>
        <div>
          <label>スピード</label>
          <input type="number" step="0.1" v-model="form.voice_speed" />
        </div>
        <div>
          <label>ピッチ</label>
          <input type="number" step="0.1" v-model="form.voice_pitch" />
        </div>
      </div>

      <label>起動時アニメーション</label>
      <select v-model="form.startup_anim_url">
        <option value="">なし</option>
        <option v-for="a in assets.animations" :key="a" :value="a">{{ a }}</option>
      </select>

      <label>終了時アニメーション</label>
      <select v-model="form.shutdown_anim_url">
        <option value="">なし</option>
        <option v-for="a in assets.animations" :key="a" :value="a">{{ a }}</option>
      </select>

      <div class="form-actions">
        <button @click="saveAvatar" class="save-btn">{{ editingId ? '更新する' : '保存する' }}</button>
        <button v-if="editingId" @click="cancelEdit" class="cancel-btn">キャンセル</button>
      </div>
    </div>

    <div class="card list-card">
      <h3>アバター一覧</h3>
      <ul>
        <li v-for="a in avatars" :key="a.id">
          <div class="list-item-header">
            <strong>{{ a.name }}</strong>
            <div class="actions">
              <button @click="editAvatar(a)" class="edit-btn">編集</button>
              <button @click="duplicateAvatar(a)" class="dup-btn">複製</button>
              <button @click="deleteAvatar(a.id)" class="del-btn">削除</button>
            </div>
          </div>
          <div class="details">
            モデル: {{ a.vrm_url }}<br>
            性格: {{ getPromptName(a.character_prompt_id) }}<br>
            声: ID:{{ a.voice_speaker_id }} (Spd:{{ a.voice_speed }} Pch:{{ a.voice_pitch }})
          </div>
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';

const avatars = ref([]);
const characters = ref([]);
const assets = ref({ models: [], animations: [] });
const editingId = ref(null);

const form = ref({
  name: '', vrm_url: '', character_prompt_id: '',
  voice_speaker_id: 1, voice_speed: 1.0, voice_pitch: 0.0,
  startup_anim_url: '', shutdown_anim_url: ''
});

const fetchData = async () => {
  const [avRes, fragRes, assetRes] = await Promise.all([
    fetch('http://localhost:3000/api/admin/avatars'),
    fetch('http://localhost:3000/api/admin/fragments'),
    fetch('http://localhost:3000/api/admin/assets')
  ]);
  avatars.value = await avRes.json();
  const frags = await fragRes.json();
  characters.value = frags.filter(f => f.category === 'character');
  assets.value = await assetRes.json();
};

const getPromptName = (id) => characters.value.find(c => c.id === id)?.name || 'Unknown';

const editAvatar = (a) => {
  editingId.value = a.id;
  form.value = { ...a };
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

const duplicateAvatar = (a) => {
  editingId.value = null;
  const copy = { ...a };
  delete copy.id;
  form.value = { ...copy, name: `${a.name} (コピー)` };
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

const cancelEdit = () => {
  editingId.value = null;
  form.value = {
    name: '', vrm_url: '', character_prompt_id: '',
    voice_speaker_id: 1, voice_speed: 1.0, voice_pitch: 0.0,
    startup_anim_url: '', shutdown_anim_url: ''
  };
};

const saveAvatar = async () => {
  if (!form.value.name || !form.value.vrm_url) return alert('入力してください');
  const url = editingId.value ? `http://localhost:3000/api/admin/avatars/${editingId.value}` : 'http://localhost:3000/api/admin/avatars';
  const method = editingId.value ? 'PUT' : 'POST';

  await fetch(url, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(form.value)
  });
  cancelEdit();
  fetchData();
};

const deleteAvatar = async (id) => {
  if (!confirm('削除しますか？')) return;
  await fetch(`http://localhost:3000/api/admin/avatars/${id}`, { method: 'DELETE' });
  fetchData();
};

onMounted(fetchData);
</script>

<style scoped>
.card { background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; box-shadow: 0 2px 4px rgba(0,0,0,0.05); }
input, select { width: 100%; margin-bottom: 10px; padding: 8px; box-sizing: border-box; }
label { display: block; font-size: 0.8rem; color: #666; margin-bottom: 3px; }
.voice-settings { display: flex; gap: 10px; margin-bottom: 10px; }
.form-actions { display: flex; gap: 10px; margin-top: 10px; }
button { padding: 8px 16px; cursor: pointer; border: none; border-radius: 4px; }
.save-btn { background: #0066cc; color: white; }
.cancel-btn { background: #666; color: white; }
.edit-btn { background: #ff9900; color: white; font-size: 0.8rem; margin-left: 5px; }
.dup-btn { background: #4caf50; color: white; font-size: 0.8rem; margin-left: 5px; }
.del-btn { background: #cc0000; color: white; font-size: 0.8rem; margin-left: 5px; }
.list-item-header { display: flex; justify-content: space-between; align-items: center; }
.details { font-size: 0.8rem; color: #777; margin-top: 5px; border-left: 2px solid #eee; padding-left: 10px; }
li { margin-bottom: 15px; border-bottom: 1px solid #eee; padding-bottom: 10px; list-style: none; }
ul { padding: 0; }
</style>