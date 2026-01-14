<template>
  <div class="task-list">
    <!-- 工具栏 -->
    <div class="task-toolbar">
      <span class="task-count">共 {{ taskStore.taskList.length }} 个任务</span>
      <el-button
        v-if="taskStore.completedTasks.length > 0"
        type="danger"
        size="small"
        text
        @click="clearCompleted"
      >
        清除已完成
      </el-button>
    </div>

    <!-- 任务列表 -->
    <div class="task-items" v-if="taskStore.taskList.length > 0">
      <div
        v-for="task in taskStore.taskList"
        :key="task.id"
        class="task-item"
        :class="'task-' + task.status"
      >
        <!-- 状态图标 -->
        <div class="task-status">
          <el-icon v-if="task.status === 'pending'" class="status-pending">
            <Clock />
          </el-icon>
          <el-icon v-else-if="task.status === 'running'" class="status-running is-loading">
            <Loading />
          </el-icon>
          <el-icon v-else-if="task.status === 'success'" class="status-success">
            <CircleCheck />
          </el-icon>
          <el-icon v-else-if="task.status === 'failed'" class="status-failed">
            <CircleClose />
          </el-icon>
          <el-icon v-else class="status-cancelled">
            <Remove />
          </el-icon>
        </div>

        <!-- 任务信息 -->
        <div class="task-info">
          <div class="task-title">{{ task.title || '未知资源' }}</div>
          <div class="task-message">{{ task.message }}</div>
          <div class="task-time">{{ formatTime(task.createdAt) }}</div>
        </div>

        <!-- 操作按钮 -->
        <div class="task-actions">
          <el-button
            v-if="task.status === 'success' && task.result?.share_url"
            type="primary"
            size="small"
            text
            @click="copyShareUrl(task)"
          >
            复制链接
          </el-button>
          <el-button
            v-if="task.status === 'pending' || task.status === 'running'"
            type="warning"
            size="small"
            text
            @click="cancelTask(task.id)"
          >
            取消
          </el-button>
          <el-button
            v-if="task.status !== 'running'"
            type="danger"
            size="small"
            text
            @click="removeTask(task.id)"
          >
            删除
          </el-button>
        </div>
      </div>
    </div>

    <!-- 空状态 -->
    <el-empty v-else description="暂无任务" :image-size="80" />
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { 
  Clock, 
  Loading, 
  CircleCheck, 
  CircleClose,
  Remove 
} from '@element-plus/icons-vue'
import { useTaskStore } from '../store/task'

const taskStore = useTaskStore()

// 格式化时间
const formatTime = (timestamp) => {
  const date = new Date(timestamp)
  const now = new Date()
  const diff = now - date
  
  if (diff < 60000) {
    return '刚刚'
  } else if (diff < 3600000) {
    return Math.floor(diff / 60000) + '分钟前'
  } else if (diff < 86400000) {
    return Math.floor(diff / 3600000) + '小时前'
  } else {
    return date.toLocaleDateString()
  }
}

// 复制分享链接
const copyShareUrl = async (task) => {
  if (task.result?.share_url) {
    try {
      await navigator.clipboard.writeText(task.result.share_url)
      ElMessage.success('链接已复制')
    } catch {
      ElMessage.error('复制失败')
    }
  }
}

// 取消任务
const cancelTask = async (taskId) => {
  await taskStore.cancelTask(taskId)
  ElMessage.info('任务已取消')
}

// 删除任务
const removeTask = async (taskId) => {
  await taskStore.removeTask(taskId)
}

// 清除已完成
const clearCompleted = async () => {
  await taskStore.clearCompletedTasks()
  ElMessage.success('已清除完成的任务')
}

// 加载任务列表
onMounted(async () => {
  await taskStore.loadTasks()
})
</script>

<style scoped>
.task-list {
  padding: 16px 0;
}

.task-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--border-color);
}

.task-count {
  font-size: 13px;
  color: var(--text-secondary);
}

.task-items {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.task-item {
  display: flex;
  align-items: flex-start;
  padding: 12px;
  background: #f5f7fa;
  border-radius: 8px;
  gap: 12px;
}

.task-item.task-running {
  background: #ecf5ff;
}

.task-item.task-success {
  background: #f0f9eb;
}

.task-item.task-failed {
  background: #fef0f0;
}

.task-status {
  flex-shrink: 0;
  font-size: 20px;
}

.status-pending {
  color: #909399;
}

.status-running {
  color: #409eff;
}

.status-success {
  color: #67c23a;
}

.status-failed {
  color: #f56c6c;
}

.status-cancelled {
  color: #909399;
}

.is-loading {
  animation: rotating 2s linear infinite;
}

@keyframes rotating {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.task-info {
  flex: 1;
  min-width: 0;
}

.task-title {
  font-size: 14px;
  font-weight: 500;
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.task-message {
  font-size: 12px;
  color: var(--text-secondary);
  margin-top: 4px;
}

.task-time {
  font-size: 11px;
  color: #c0c4cc;
  margin-top: 4px;
}

.task-actions {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
</style>
