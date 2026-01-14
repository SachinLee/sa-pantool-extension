<template>
  <div class="app-container">
    <!-- 头部 -->
    <header class="app-header">
      <div class="header-left">
        <el-icon :size="24"><Connection /></el-icon>
        <h1>网盘转存助手</h1>
      </div>
      <el-button 
        :icon="Setting" 
        circle 
        size="small"
        @click="openOptions"
      />
    </header>

    <!-- 主内容区域 -->
    <main class="app-main">
      <!-- 标签页 -->
      <el-tabs v-model="activeTab" class="main-tabs">
        <!-- 转存标签页 -->
        <el-tab-pane label="转存" name="transfer">
          <TransferForm />
        </el-tab-pane>

        <!-- 任务标签页 -->
        <el-tab-pane label="任务" name="tasks">
          <TaskList />
        </el-tab-pane>

        <!-- 设置标签页 -->
        <el-tab-pane label="设置" name="settings">
          <Settings />
        </el-tab-pane>
      </el-tabs>
    </main>

    <!-- 底部 -->
    <footer class="app-footer">
      <span class="version">v1.0.0</span>
      <span class="status" :class="{ 'status-ok': isReady, 'status-error': !isReady }">
        {{ isReady ? '已就绪' : '未配置' }}
      </span>
    </footer>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { Setting, Connection } from '@element-plus/icons-vue'
import { useConfigStore } from './store/config'
import TransferForm from './components/TransferForm.vue'
import TaskList from './components/TaskList.vue'
import Settings from './components/Settings.vue'

const activeTab = ref('transfer')
const configStore = useConfigStore()

// 检查是否已配置Cookie
const isReady = computed(() => {
  return configStore.hasCookies
})

// 打开选项页
const openOptions = () => {
  chrome.runtime.openOptionsPage()
}

// 组件挂载时加载配置
onMounted(async () => {
  await configStore.loadConfig()
})
</script>

<style scoped>
.app-container {
  width: 400px;
  min-height: 500px;
  display: flex;
  flex-direction: column;
  background: var(--bg-color);
}

.app-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 8px;
}

.header-left h1 {
  font-size: 16px;
  font-weight: 600;
  margin: 0;
}

.app-main {
  flex: 1;
  padding: 0 16px;
  overflow-y: auto;
}

.main-tabs {
  height: 100%;
}

.app-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 16px;
  border-top: 1px solid var(--border-color);
  font-size: 12px;
  color: var(--text-secondary);
}

.version {
  color: #999;
}

.status {
  display: flex;
  align-items: center;
  gap: 4px;
}

.status::before {
  content: '';
  width: 6px;
  height: 6px;
  border-radius: 50%;
}

.status-ok::before {
  background: #67c23a;
}

.status-error::before {
  background: #f56c6c;
}
</style>
