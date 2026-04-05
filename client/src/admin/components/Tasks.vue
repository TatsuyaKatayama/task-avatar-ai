<template>
  <div class="tasks-view">
    <h2>タスクプリセット管理</h2>
    
    <div class="card form-card">
      <h3>{{ editingId ? 'タスクの編集' : '新しいタスクの作成' }}</h3>
      <input v-model="form.name" placeholder="表示名 (例: 安全な配線作業)" />

      <label>業務手順プロンプト</label>
      <select v-model="form.task_prompt_id">
        <option v-for="p in taskPrompts" :key="p.id" :value="p.id">{{ p.name }}</option>
      </select>

      <label>安全基準プロンプト</label>
      <select v-model="form.safety_prompt_id">
        <option v-for="p in safetyPrompts" :key="p.id" :value="p.id">{{ p.name }}</option>
      </select>

      <div class="form-actions">
        <button @click="saveTask" class="save-btn">{{ editingId ? '更新する' : '保存する' }}</button>
        <button v-if="editingId" @click="cancelEdit" class="cancel-btn">キャンセル</button>
      </div>
    </div>

    <div class="card list-card">
      <h3>タスク一覧</h3>
      <ul>
        <li v-for="t in tasks" :key="t.id">
          <div class="list-item-header">
            <strong>{{ t.name }}</strong>
            <div class="actions">
              <button @click="editTask(t)" class="edit-btn">編集</button>
              <button @click="duplicateTask(t)" class="dup-btn">複製</button>
              <button @click="deleteTask(t.id)" class="del-btn">削除</button>
            </div>
          </div>
          <div class="details">
            手順: {{ getPromptName(taskPrompts, t.task_prompt_id) }}<br>
            安全: {{ getPromptName(safetyPrompts, t.safety_prompt_id) }}
          </div>
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';

const tasks = ref([]);
const taskPrompts = ref([]);
const safetyPrompts = ref([]);
const editingId = ref(null);

const form = ref({ name: '', task_prompt_id: '', safety_prompt_id: '' });

const fetchData = async () => {
  const [taskRes, fragRes] = await Promise.all([
    fetch('http://localhost:3000/api/admin/tasks'),
    fetch('http://localhost:3000/api/admin/fragments')
  ]);
  tasks.value = await taskRes.json();
  const frags = await fragRes.json();
  taskPrompts.value = frags.filter(f => f.category === 'task_instruction');
  safetyPrompts.value = frags.filter(f => f.category === 'safety');
};

const getPromptName = (list, id) => list.find(p => p.id === id)?.name || 'Unknown';

const editTask = (t) => {
  editingId.value = t.id;
  form.value = { ...t };
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

const duplicateTask = (t) => {
  editingId.value = null;
  const copy = { ...t };
  delete copy.id;
  form.value = { ...copy, name: `${t.name} (コピー)` };
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

const cancelEdit = () => {
  editingId.value = null;
  form.value = { name: '', task_prompt_id: '', safety_prompt_id: '' };
};

const saveTask = async () => {
  if (!form.value.name || !form.value.task_prompt_id) return alert('入力してください');
  const url = editingId.value ? `http://localhost:3000/api/admin/tasks/${editingId.value}` : 'http://localhost:3000/api/admin/tasks';
  const method = editingId.value ? 'PUT' : 'POST';

  await fetch(url, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(form.value)
  });
  cancelEdit();
  fetchData();
};

const deleteTask = async (id) => {
  if (!confirm('削除しますか？')) return;
  await fetch(`http://localhost:3000/api/admin/tasks/${id}`, { method: 'DELETE' });
  fetchData();
};

onMounted(fetchData);
</script>

<style scoped>
.card { background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; box-shadow: 0 2px 4px rgba(0,0,0,0.05); }
input, select { width: 100%; margin-bottom: 10px; padding: 8px; box-sizing: border-box; }
label { display: block; font-size: 0.8rem; color: #666; margin-bottom: 3px; }
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