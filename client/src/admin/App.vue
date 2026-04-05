<template>
  <div class="admin-layout">
    <aside class="sidebar">
      <h2>Admin Panel</h2>
      <ul>
        <li @click="currentTab = 'prompts'" :class="{ active: currentTab === 'prompts' }">プロンプト管理</li>
        <li @click="currentTab = 'avatars'" :class="{ active: currentTab === 'avatars' }">アバター作成</li>
        <li @click="currentTab = 'tasks'" :class="{ active: currentTab === 'tasks' }">タスク作成</li>
        <li @click="currentTab = 'assets'" :class="{ active: currentTab === 'assets' }">アセット管理</li>
        <li @click="currentTab = 'credits'" :class="{ active: currentTab === 'credits' }">クレジット管理</li>
        <li @click="currentTab = 'settings'" :class="{ active: currentTab === 'settings' }">システム設定</li>
      </ul>
      <div style="margin-top: auto; padding: 20px;">
        <a href="/" style="color: #666; text-decoration: none;">&larr; ユーザー画面へ</a>
      </div>
    </aside>

    <main class="content">
      <Prompts v-if="currentTab === 'prompts'" />
      <Avatars v-if="currentTab === 'avatars'" />
      <Tasks v-if="currentTab === 'tasks'" />
      <Assets v-if="currentTab === 'assets'" />
      <Credits v-if="currentTab === 'credits'" />
      <Settings v-if="currentTab === 'settings'" />
    </main>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import Prompts from './components/Prompts.vue';
import Avatars from './components/Avatars.vue';
import Tasks from './components/Tasks.vue';
import Assets from './components/Assets.vue';
import Credits from './components/Credits.vue';
import Settings from './components/SystemSettings.vue';

const currentTab = ref('prompts');
</script>

<style scoped>
.admin-layout {
  display: flex;
  width: 100%;
}
.sidebar {
  width: 250px;
  background: #fff;
  border-right: 1px solid #ddd;
  display: flex;
  flex-direction: column;
}
.sidebar h2 { padding: 20px; margin: 0; font-size: 1.2rem; border-bottom: 1px solid #eee; }
.sidebar ul { list-style: none; padding: 0; margin: 0; }
.sidebar li {
  padding: 15px 20px;
  cursor: pointer;
  border-bottom: 1px solid #eee;
}
.sidebar li:hover { background: #f9f9f9; }
.sidebar li.active { background: #e0f0ff; font-weight: bold; color: #0066cc; }
.content {
  flex: 1;
  padding: 30px;
  overflow-y: auto;
}
</style>