<template>
  <div class="credits-view">
    <h2>クレジット管理</h2>
    
    <div class="card form-card">
      <h3>{{ editingId ? 'クレジットの編集' : '新しいクレジットの追加' }}</h3>
      <input v-model="form.name" placeholder="クレジット名 (例: VOICEVOX利用規約)" />
      <textarea v-model="form.content" placeholder="表示内容..." rows="5"></textarea>
      <label class="checkbox-label">
        <input type="checkbox" v-model="form.is_active" :true-value="1" :false-value="0" />
        ユーザー画面に表示する
      </label>
      <div class="form-actions">
        <button @click="saveCredit" class="save-btn">{{ editingId ? '更新する' : '保存する' }}</button>
        <button v-if="editingId" @click="cancelEdit" class="cancel-btn">キャンセル</button>
      </div>
    </div>

    <div class="card list-card">
      <h3>クレジット一覧</h3>
      <ul>
        <li v-for="c in credits" :key="c.id">
          <div class="list-item-header">
            <strong>{{ c.name }}</strong>
            <div class="actions">
              <label class="toggle">
                表示 <input type="checkbox" :checked="c.is_active === 1" @change="toggleActive(c)" />
              </label>
              <button @click="editCredit(c)" class="edit-btn">編集</button>
              <button @click="duplicateCredit(c)" class="dup-btn">複製</button>
              <button @click="deleteCredit(c.id)" class="del-btn">削除</button>
            </div>
          </div>
          <pre>{{ c.content }}</pre>
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';

const credits = ref([]);
const editingId = ref(null);
const form = ref({ name: '', content: '', is_active: 0 });

const fetchCredits = async () => {
  const res = await fetch('http://localhost:3000/api/admin/credits');
  credits.value = await res.json();
};

const editCredit = (credit) => {
  editingId.value = credit.id;
  form.value = { ...credit };
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

const duplicateCredit = (credit) => {
  editingId.value = null;
  const copy = { ...credit };
  delete copy.id;
  form.value = { ...copy, name: `${credit.name} (コピー)`, is_active: 0 };
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

const cancelEdit = () => {
  editingId.value = null;
  form.value = { name: '', content: '', is_active: 0 };
};

const saveCredit = async () => {
  if (!form.value.name || !form.value.content) return alert('入力してください');
  
  const url = editingId.value 
    ? `http://localhost:3000/api/admin/credits/${editingId.value}`
    : 'http://localhost:3000/api/admin/credits';
  const method = editingId.value ? 'PUT' : 'POST';

  const res = await fetch(url, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(form.value)
  });

  if (res.ok) {
    cancelEdit();
    fetchCredits();
  } else {
    const err = await res.json();
    alert(`エラー: ${err.error}`);
  }
};

const toggleActive = async (credit) => {
  const newStatus = credit.is_active === 1 ? 0 : 1;
  await fetch(`http://localhost:3000/api/admin/credits/${credit.id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...credit, is_active: newStatus })
  });
  fetchCredits();
};

const deleteCredit = async (id) => {
  if (!confirm('削除しますか？')) return;
  await fetch(`http://localhost:3000/api/admin/credits/${id}`, { method: 'DELETE' });
  fetchCredits();
};

onMounted(fetchCredits);
</script>

<style scoped>
.card { background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; box-shadow: 0 2px 4px rgba(0,0,0,0.05); }
input[type="text"], textarea { width: 100%; margin-bottom: 10px; padding: 8px; box-sizing: border-box; }
.checkbox-label { display: block; margin-bottom: 15px; font-size: 0.9rem; cursor: pointer; }
.form-actions { display: flex; gap: 10px; }
button { padding: 8px 16px; cursor: pointer; border: none; border-radius: 4px; transition: opacity 0.2s; }
button:hover { opacity: 0.8; }
.save-btn { background: #0066cc; color: white; }
.cancel-btn { background: #666; color: white; }
.edit-btn { background: #ff9900; color: white; font-size: 0.8rem; margin-left: 5px; }
.dup-btn { background: #4caf50; color: white; font-size: 0.8rem; margin-left: 5px; }
.del-btn { background: #cc0000; color: white; font-size: 0.8rem; margin-left: 5px; }
.list-item-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 5px; }
.actions { display: flex; align-items: center; }
.toggle { font-size: 0.85rem; color: #666; margin-right: 10px; cursor: pointer; }
pre { background: #f5f5f5; padding: 10px; font-size: 0.85rem; white-space: pre-wrap; margin-top: 10px; border-radius: 4px; border: 1px solid #eee; }
li { margin-bottom: 20px; border-bottom: 1px solid #eee; padding-bottom: 20px; list-style: none; }
ul { padding: 0; }
</style>