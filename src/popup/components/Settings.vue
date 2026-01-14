<template>
  <div class="settings">
    <!-- Cookie状态 -->
    <div class="settings-section">
      <h3 class="section-title">Cookie状态</h3>
      
      <div class="cookie-status">
        <div class="status-item">
          <span class="status-label">夸克网盘</span>
          <el-tag :type="configStore.hasQuarkCookie ? 'success' : 'danger'" size="small">
            {{ configStore.hasQuarkCookie ? '已配置' : '未配置' }}
          </el-tag>
        </div>
        <div class="status-item">
          <span class="status-label">百度网盘</span>
          <el-tag :type="configStore.hasBaiduCookie ? 'success' : 'danger'" size="small">
            {{ configStore.hasBaiduCookie ? '已配置' : '未配置' }}
          </el-tag>
        </div>
      </div>

      <div class="cookie-actions">
        <el-button type="primary" size="small" @click="refreshCookies" :loading="refreshing">
          <el-icon><Refresh /></el-icon>
          刷新Cookie
        </el-button>
        <el-button size="small" @click="showCookieDialog = true">
          <el-icon><Edit /></el-icon>
          手动配置
        </el-button>
      </div>

      <div class="cookie-tip">
        <el-icon><InfoFilled /></el-icon>
        <span>请确保已登录夸克网盘和百度网盘</span>
      </div>
    </div>

    <!-- 自动获取Cookie -->
    <div class="settings-section">
      <div class="settings-item">
        <div class="item-left">
          <span class="item-label">自动获取Cookie</span>
          <span class="item-desc">每次打开插件时自动刷新</span>
        </div>
        <el-switch v-model="autoGetCookie" @change="handleAutoChange" />
      </div>
    </div>

    <!-- 默认转存目录 -->
    <div class="settings-section">
      <h3 class="section-title">默认转存目录</h3>
      
      <el-form label-position="top">
        <el-form-item label="百度网盘目录">
          <el-input 
            v-model="baiduFolder" 
            placeholder="/默认转存文件"
            @change="saveFolders"
          />
        </el-form-item>
      </el-form>
    </div>

    <!-- 过滤关键词 -->
    <div class="settings-section">
      <h3 class="section-title">广告过滤关键词</h3>
      <el-input
        v-model="bannedKeywordsText"
        type="textarea"
        :rows="3"
        placeholder="输入关键词，用英文逗号分隔"
        @change="saveBannedKeywords"
      />
      <div class="keywords-tip">含有这些关键词的文件将被自动过滤</div>
    </div>

    <!-- 关于 -->
    <div class="settings-section">
      <h3 class="section-title">关于</h3>
      <div class="about-info">
        <div class="about-item">
          <span>版本</span>
          <span>v1.0.0</span>
        </div>
        <div class="about-item">
          <span>作者</span>
          <span>sa-pantool</span>
        </div>
      </div>
    </div>

    <!-- Cookie配置对话框 -->
    <el-dialog
      v-model="showCookieDialog"
      title="手动配置Cookie"
      width="90%"
    >
      <el-form label-position="top">
        <el-form-item label="夸克网盘Cookie">
          <el-input
            v-model="manualQuarkCookie"
            type="textarea"
            :rows="3"
            placeholder="粘贴夸克网盘Cookie"
          />
        </el-form-item>
        <el-form-item label="百度网盘Cookie">
          <el-input
            v-model="manualBaiduCookie"
            type="textarea"
            :rows="3"
            placeholder="粘贴百度网盘Cookie"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showCookieDialog = false">取消</el-button>
        <el-button type="primary" @click="saveManualCookies">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Refresh, Edit, InfoFilled } from '@element-plus/icons-vue'
import { useConfigStore } from '../store/config'

const configStore = useConfigStore()

const refreshing = ref(false)
const showCookieDialog = ref(false)
const manualQuarkCookie = ref('')
const manualBaiduCookie = ref('')

// 自动获取Cookie开关
const autoGetCookie = ref(true)

// 百度目录
const baiduFolder = ref('/默认转存文件')

// 过滤关键词
const bannedKeywordsText = computed({
  get: () => configStore.bannedKeywords.join(','),
  set: () => {}
})

// 刷新Cookie
const refreshCookies = async () => {
  refreshing.value = true
  try {
    await configStore.refreshCookies()
    ElMessage.success('Cookie刷新成功')
  } catch (error) {
    ElMessage.error('刷新失败: ' + error.message)
  } finally {
    refreshing.value = false
  }
}

// 处理自动获取开关变化
const handleAutoChange = async (value) => {
  configStore.autoGetCookie = value
  await configStore.saveConfig()
}

// 保存目录设置
const saveFolders = async () => {
  await configStore.setDefaultFolders(undefined, baiduFolder.value)
  ElMessage.success('保存成功')
}

// 保存过滤关键词
const saveBannedKeywords = async (value) => {
  const keywords = value.split(',').map(k => k.trim()).filter(k => k)
  await configStore.setBannedKeywords(keywords)
  ElMessage.success('保存成功')
}

// 保存手动配置的Cookie
const saveManualCookies = async () => {
  if (manualQuarkCookie.value) {
    await configStore.setQuarkCookie(manualQuarkCookie.value)
  }
  if (manualBaiduCookie.value) {
    await configStore.setBaiduCookie(manualBaiduCookie.value)
  }
  showCookieDialog.value = false
  ElMessage.success('Cookie保存成功')
}

// 初始化
onMounted(async () => {
  await configStore.loadConfig()
  autoGetCookie.value = configStore.autoGetCookie
  baiduFolder.value = configStore.defaultBaiduFolder
})
</script>

<style scoped>
.settings {
  padding: 16px 0;
}

.settings-section {
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--border-color);
}

.settings-section:last-child {
  border-bottom: none;
  margin-bottom: 0;
}

.section-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 12px;
}

.cookie-status {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 12px;
}

.status-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  background: #f5f7fa;
  border-radius: 6px;
}

.status-label {
  font-size: 13px;
  color: var(--text-primary);
}

.cookie-actions {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
}

.cookie-tip {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: var(--text-secondary);
}

.settings-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
}

.item-left {
  display: flex;
  flex-direction: column;
}

.item-label {
  font-size: 14px;
  color: var(--text-primary);
}

.item-desc {
  font-size: 12px;
  color: var(--text-secondary);
  margin-top: 2px;
}

.keywords-tip {
  font-size: 12px;
  color: var(--text-secondary);
  margin-top: 8px;
}

.about-info {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.about-item {
  display: flex;
  justify-content: space-between;
  font-size: 13px;
  color: var(--text-secondary);
}
</style>
