<template>
  <div class="prompts-view">
    <h2>プロンプト部品管理</h2>
    
    <div class="card form-card">
      <h3>{{ editingId ? 'プロンプトの編集' : '新しい部品の追加' }}</h3>
      <select v-model="form.category">
        <option value="character">性格 (Character)</option>
        <option value="task_instruction">業務手順 (Task)</option>
        <option value="safety">安全基準 (Safety)</option>
        <option value="base">基本ルール (Base)</option>
      </select>
      <input v-model="form.name" placeholder="部品名 (例: 優しい家庭教師)" />
      <textarea v-model="form.content" placeholder="プロンプト本文..." rows="8"></textarea>
      
      <div class="form-actions">
        <button @click="savePrompt" class="save-btn">{{ editingId ? '更新する' : '保存する' }}</button>
        <button v-if="editingId" @click="cancelEdit" class="cancel-btn">キャンセル</button>
      </div>
    </div>

    <div class="card list-card">
      <h3>部品一覧</h3>
      <div v-for="cat in ['character', 'task_instruction', 'safety', 'base']" :key="cat" class="category-section">
        <h4>{{ cat.toUpperCase() }}</h4>
        <ul>
          <li v-for="p in fragments.filter(f => f.category === cat)" :key="p.id">
            <div class="list-item-header">
              <strong>{{ p.name }}</strong>
              <div class="actions">
                <button @click="editPrompt(p)" class="edit-btn">編集</button>
                <button @click="duplicatePrompt(p)" class="dup-btn">複製</button>
                <button @click="deletePrompt(p.id)" class="del-btn">削除</button>
              </div>
            </div>
            <pre>{{ p.content }}</pre>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';

const fragments = ref([]);
const editingId = ref(null);
const form = ref({ category: 'character', name: '', content: '' });

const fetchPrompts = async () => {
  const res = await fetch('http://localhost:3000/api/admin/fragments');
  fragments.value = await res.json();
};

const editPrompt = (p) => {
  editingId.value = p.id;
  form.value = { ...p };
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

const duplicatePrompt = (p) => {
  editingId.value = null;
  const copy = { ...p };
  delete copy.id;
  form.value = { ...copy, name: `${p.name} (コピー)` };
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

const cancelEdit = () => {
  editingId.value = null;
  form.value = { category: 'character', name: '', content: '' };
};

const savePrompt = async () => {
  if (!form.value.name || !form.value.content) return alert('入力してください');
  
  const url = editingId.value 
    ? `http://localhost:3000/api/admin/fragments/${editingId.value}`
    : 'http://localhost:3000/api/admin/fragments';
  const method = editingId.value ? 'PUT' : 'POST';

  const res = await fetch(url, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(form.value)
  });

  if (res.ok) {
    cancelEdit();
    fetchPrompts();
  } else {
    const err = await res.json();
    alert(`エラー: ${err.error}`);
  }
};

const deletePrompt = async (id) => {
  if (!confirm('削除しますか？')) return;
  await fetch(`http://localhost:3000/api/admin/fragments/${id}`, { method: 'DELETE' });
  fetchPrompts();
};

onMounted(fetchPrompts);
</script>

<style scoped>
.card { background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; box-shadow: 0 2px 4px rgba(0,0,0,0.05); }
input, select, textarea { width: 100%; margin-bottom: 10px; padding: 8px; box-sizing: border-box; }
.form-actions { display: flex; gap: 10px; }
button { padding: 8px 16px; cursor: pointer; border: none; border-radius: 4px; }
.save-btn { background: #0066cc; color: white; }
.cancel-btn { background: #666; color: white; }
.edit-btn { background: #ff9900; color: white; font-size: 0.8rem; margin-left: 5px; }
.dup-btn { background: #4caf50; color: white; font-size: 0.8rem; margin-left: 5px; }
.del-btn { background: #cc0000; color: white; font-size: 0.8rem; margin-left: 5px; }
.list-item-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 5px; }
.category-section { margin-bottom: 30px; }
.category-section h4 { border-left: 4px solid #0066cc; padding-left: 10px; margin-bottom: 15px; color: #333; }
pre { background: #f5f5f5; padding: 10px; font-size: 0.85rem; white-space: pre-wrap; border: 1px solid #eee; border-radius: 4px; }
li { margin-bottom: 20px; border-bottom: 1px solid #eee; padding-bottom: 15px; list-style: none; }
ul { padding: 0; }
</style>