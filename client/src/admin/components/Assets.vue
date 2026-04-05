<template>
  <div class="assets-view">
    <h2>アセット管理 (.vrm / .vrma)</h2>
    <div class="card">
      <h3>ファイルのアップロード</h3>
      <input type="file" ref="fileInput" accept=".vrm,.vrma" />
      <button @click="uploadFile" :disabled="uploading">{{ uploading ? 'アップロード中...' : 'アップロード' }}</button>
      <p v-if="message" class="msg">{{ message }}</p>
    </div>

    <div class="card">
      <h3>アップロード済みアセット</h3>
      <button @click="fetchAssets">再読み込み</button>
      <div class="asset-lists">
        <div>
          <h4>VRM モデル</h4>
          <ul><li v-for="m in assets.models" :key="m">{{ m }}</li></ul>
        </div>
        <div>
          <h4>VRMA アニメーション</h4>
          <ul><li v-for="a in assets.animations" :key="a">{{ a }}</li></ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';

const fileInput = ref(null);
const uploading = ref(false);
const message = ref('');
const assets = ref({ models: [], animations: [] });

const fetchAssets = async () => {
  try {
    const res = await fetch('http://localhost:3000/api/admin/assets');
    assets.value = await res.json();
  } catch (e) {
    console.error(e);
  }
};

const uploadFile = async () => {
  const file = fileInput.value.files[0];
  if (!file) return;

  uploading.value = true;
  message.value = '';
  
  const formData = new FormData();
  formData.append('file', file);

  try {
    const res = await fetch('http://localhost:3000/api/admin/upload', {
      method: 'POST',
      body: formData
    });
    const data = await res.json();
    if (res.ok) {
      message.value = `成功: ${data.path}`;
      fileInput.value.value = '';
      fetchAssets();
    } else {
      message.value = `エラー: ${data.error}`;
    }
  } catch (e) {
    message.value = `エラー: ${e.message}`;
  } finally {
    uploading.value = false;
  }
};

onMounted(fetchAssets);
</script>

<style scoped>
.card { background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; box-shadow: 0 2px 4px rgba(0,0,0,0.05); }
.msg { color: #0066cc; margin-top: 10px; }
.asset-lists { display: flex; gap: 40px; }
li { color: #555; margin-bottom: 5px; font-family: monospace; }
</style>