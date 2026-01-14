import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { storage } from '@/utils/storage'

// 任务状态枚举
export const TaskStatus = {
  PENDING: 'pending',       // 等待中
  RUNNING: 'running',       // 执行中
  SUCCESS: 'success',       // 成功
  FAILED: 'failed',         // 失败
  CANCELLED: 'cancelled'    // 已取消
}

export const useTaskStore = defineStore('task', () => {
  // 状态
  const taskList = ref([])
  const currentTaskId = ref(null)

  // 计算属性
  const currentTask = computed(() => {
    return taskList.value.find(t => t.id === currentTaskId.value)
  })

  const pendingTasks = computed(() => {
    return taskList.value.filter(t => t.status === TaskStatus.PENDING)
  })

  const runningTasks = computed(() => {
    return taskList.value.filter(t => t.status === TaskStatus.RUNNING)
  })

  const completedTasks = computed(() => {
    return taskList.value.filter(t => 
      t.status === TaskStatus.SUCCESS || 
      t.status === TaskStatus.FAILED ||
      t.status === TaskStatus.CANCELLED
    )
  })

  // 生成唯一ID
  function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2)
  }

  // 加载任务列表
  async function loadTasks() {
    try {
      const data = await storage.get(['taskList', 'currentTaskId'])
      if (data.taskList) taskList.value = data.taskList
      if (data.currentTaskId) currentTaskId.value = data.currentTaskId
    } catch (error) {
      console.error('加载任务列表失败:', error)
    }
  }

  // 保存任务列表
  async function saveTasks() {
    try {
      await storage.set({
        taskList: taskList.value,
        currentTaskId: currentTaskId.value
      })
    } catch (error) {
      console.error('保存任务列表失败:', error)
    }
  }

  // 添加任务
  async function addTask(task) {
    const newTask = {
      id: generateId(),
      url: task.url,
      code: task.code || '',
      title: task.title || '未知资源',
      status: TaskStatus.PENDING,
      progress: 0,
      message: '等待中...',
      result: null,
      createdAt: Date.now(),
      updatedAt: Date.now()
    }
    taskList.value.unshift(newTask)
    await saveTasks()
    return newTask.id
  }

  // 更新任务
  async function updateTask(taskId, updates) {
    const index = taskList.value.findIndex(t => t.id === taskId)
    if (index !== -1) {
      taskList.value[index] = {
        ...taskList.value[index],
        ...updates,
        updatedAt: Date.now()
      }
      await saveTasks()
    }
  }

  // 设置当前任务
  async function setCurrentTask(taskId) {
    currentTaskId.value = taskId
    await saveTasks()
  }

  // 删除任务
  async function removeTask(taskId) {
    const index = taskList.value.findIndex(t => t.id === taskId)
    if (index !== -1) {
      taskList.value.splice(index, 1)
      if (currentTaskId.value === taskId) {
        currentTaskId.value = null
      }
      await saveTasks()
    }
  }

  // 清除已完成任务
  async function clearCompletedTasks() {
    taskList.value = taskList.value.filter(t => 
      t.status !== TaskStatus.SUCCESS && 
      t.status !== TaskStatus.FAILED &&
      t.status !== TaskStatus.CANCELLED
    )
    await saveTasks()
  }

  // 取消任务
  async function cancelTask(taskId) {
    await updateTask(taskId, {
      status: TaskStatus.CANCELLED,
      message: '已取消'
    })
  }

  return {
    // 状态
    taskList,
    currentTaskId,
    // 计算属性
    currentTask,
    pendingTasks,
    runningTasks,
    completedTasks,
    // 方法
    loadTasks,
    saveTasks,
    addTask,
    updateTask,
    setCurrentTask,
    removeTask,
    clearCompletedTasks,
    cancelTask
  }
})
