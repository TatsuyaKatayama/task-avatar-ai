<template>
  <div class="settings-view">
    <h2>システム設定</h2>
    
    <div class="card form-card">
      <label>基本プロンプト (Base Rules)</label>
      <select v-model="settings.base_prompt_id">
        <option v-for="p in basePrompts" :key="p.id" :value="p.id">{{ p.name }}</option>
      </select>
      
      <button @click="saveSettings">設定を保存</button>
      <p v-if="message" class="msg">{{ message }}</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';

const settings = ref({ base_prompt_id: '' });
const basePrompts = ref([]);
const message = ref('');

const fetchData = async () => {
  const [setRes, fragRes] = await Promise.all([
    fetch('http://localhost:3000/api/admin/settings'),
    fetch('http://localhost:3000/api/admin/fragments')
  ]);
  settings.value = await setRes.json();
  const frags = await fragRes.json();
  basePrompts.value = frags.filter(f => f.category === 'base');
};

const saveSettings = async () => {
  const res = await fetch('http://localhost:3000/api/admin/settings', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ base_prompt_id: settings.value.base_prompt_id })
  });
  if (res.ok) {
    message.value = '保存しました';
    setTimeout(() => message.value = '', 3000);
  }
};

onMounted(fetchData);
</script>

<style scoped>
.card { background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.05); }
label { display: block; font-weight: bold; margin-bottom: 10px; color: #333; }
select { width: 100%; margin-bottom: 20px; padding: 10px; box-sizing: border-box; border: 1px solid #ddd; border-radius: 4px; }
button { padding: 10px 20px; background: #0066cc; color: white; border: none; border-radius: 4px; cursor: pointer; }
.msg { color: green; margin-top: 10px; }
</style>