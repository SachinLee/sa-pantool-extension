<template>
  <div class="transfer-form">
    <!-- 链接输入 -->
    <el-form :model="form" :rules="rules" ref="formRef" label-position="top">
      <el-form-item label="夸克分享链接" prop="url">
        <el-input
          v-model="form.url"
          placeholder="请输入夸克网盘分享链接"
          clearable
        >
          <template #prefix>
            <el-icon><Link /></el-icon>
          </template>
        </el-input>
      </el-form-item>

      <el-form-item label="提取码（可选）" prop="code">
        <el-input
          v-model="form.code"
          placeholder="如果有提取码请输入"
          maxlength="4"
          clearable
        >
          <template #prefix>
            <el-icon><Key /></el-icon>
          </template>
        </el-input>
      </el-form-item>

      <!-- 转存按钮 -->
      <el-form-item>
        <el-button
          type="primary"
          :loading="loading"
          :disabled="!canTransfer"
          class="transfer-btn"
          @click="handleTransfer"
        >
          <el-icon v-if="!loading"><Upload /></el-icon>
          {{ loading ? '转存中...' : '开始转存' }}
        </el-button>
      </el-form-item>
    </el-form>

    <!-- Cookie状态提示 -->
    <div v-if="!configStore.hasCookies" class="cookie-warning">
      <el-alert
        title="请先配置Cookie"
        type="warning"
        :closable="false"
        show-icon
      >
        <template #default>
          <p>请先登录夸克网盘和百度网盘，然后点击"刷新Cookie"按钮</p>
          <el-button size="small" type="primary" @click="refreshCookies">
            刷新Cookie
          </el-button>
        </template>
      </el-alert>
    </div>

    <!-- 进度显示 -->
    <div v-if="currentProgress.visible" class="progress-section">
      <el-progress
        :percentage="currentProgress.percentage"
        :status="currentProgress.status"
        :stroke-width="8"
      />
      <p class="progress-text">{{ currentProgress.text }}</p>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { Link, Key, Upload } from '@element-plus/icons-vue'
import { useConfigStore } from '../store/config'
import { useTaskStore } from '../store/task'
import { sendMessage } from '@/utils/message'

const configStore = useConfigStore()
const taskStore = useTaskStore()

const formRef = ref(null)
const loading = ref(false)

const form = reactive({
  url: '',
  code: ''
})

const rules = {
  url: [
    { required: true, message: '请输入分享链接', trigger: 'blur' },
    { 
      pattern: /pan\.quark\.cn\/s\/[a-zA-Z0-9]+/,
      message: '请输入有效的夸克网盘分享链接',
      trigger: 'blur'
    }
  ]
}

const currentProgress = reactive({
  visible: false,
  percentage: 0,
  status: '',
  text: ''
})

// 是否可以转存
const canTransfer = computed(() => {
  return configStore.hasCookies && form.url && !loading.value
})

// 刷新Cookie
const refreshCookies = async () => {
  try {
    await configStore.refreshCookies()
    ElMessage.success('Cookie刷新成功')
  } catch (error) {
    ElMessage.error('Cookie刷新失败: ' + error.message)
  }
}

// 处理转存
const handleTransfer = async () => {
  if (!formRef.value) return

  try {
    await formRef.value.validate()
  } catch {
    return
  }

  if (!configStore.hasCookies) {
    ElMessage.warning('请先配置Cookie')
    return
  }

  loading.value = true
  currentProgress.visible = true
  currentProgress.percentage = 0
  currentProgress.status = ''
  currentProgress.text = '准备转存...'

  try {
    // 添加任务
    const taskId = await taskStore.addTask({
      url: form.url,
      code: form.code
    })

    // 发送消息给background执行转存
    const result = await sendMessage('transfer', {
      taskId,
      url: form.url,
      code: form.code
    })

    if (result.success) {
      currentProgress.percentage = 100
      currentProgress.status = 'success'
      currentProgress.text = '转存成功！'
      ElMessage.success('转存成功')
      
      // 清空表单
      form.url = ''
      form.code = ''
    } else {
      currentProgress.status = 'exception'
      currentProgress.text = result.message || '转存失败'
      ElMessage.error(result.message || '转存失败')
    }
  } catch (error) {
    currentProgress.status = 'exception'
    currentProgress.text = error.message || '转存失败'
    ElMessage.error(error.message || '转存失败')
  } finally {
    loading.value = false
    // 3秒后隐藏进度条
    setTimeout(() => {
      currentProgress.visible = false
    }, 3000)
  }
}
</script>

<style scoped>
.transfer-form {
  padding: 16px 0;
}

.transfer-btn {
  width: 100%;
  height: 40px;
  font-size: 15px;
}

.cookie-warning {
  margin-top: 16px;
}

.cookie-warning p {
  margin: 8px 0;
  font-size: 12px;
  color: #909399;
}

.progress-section {
  margin-top: 20px;
  padding: 16px;
  background: #f5f7fa;
  border-radius: 8px;
}

.progress-text {
  margin-top: 8px;
  font-size: 13px;
  color: #606266;
  text-align: center;
}
</style>
