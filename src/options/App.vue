<template>
  <div class="options-container">
    <header class="options-header">
      <h1>网盘转存助手 - 设置</h1>
    </header>

    <main class="options-main">
      <el-card class="settings-card">
        <template #header>
          <div class="card-header">
            <el-icon><Setting /></el-icon>
            <span>基本设置</span>
          </div>
        </template>
        
        <el-form label-position="left" label-width="120px">
          <el-form-item label="自动获取Cookie">
            <el-switch v-model="config.autoGetCookie" />
            <span class="form-tip">每次打开插件时自动从浏览器获取Cookie</span>
          </el-form-item>
          
          <el-form-item label="百度转存目录">
            <el-input v-model="config.baiduFolder" placeholder="/默认转存文件" />
          </el-form-item>
          
          <el-form-item label="广告过滤关键词">
            <el-input
              v-model="config.bannedKeywords"
              type="textarea"
              :rows="3"
              placeholder="输入关键词，用英文逗号分隔"
            />
            <span class="form-tip">含有这些关键词的文件将被自动过滤</span>
          </el-form-item>
        </el-form>
        
        <div class="form-actions">
          <el-button type="primary" @click="saveConfig">保存设置</el-button>
          <el-button @click="resetConfig">重置</el-button>
        </div>
      </el-card>

      <el-card class="settings-card">
        <template #header>
          <div class="card-header">
            <el-icon><Key /></el-icon>
            <span>Cookie管理</span>
          </div>
        </template>
        
        <div class="cookie-section">
          <div class="cookie-item">
            <div class="cookie-label">
              <span>夸克网盘</span>
              <el-tag :type="hasQuarkCookie ? 'success' : 'danger'" size="small">
                {{ hasQuarkCookie ? '已配置' : '未配置' }}
              </el-tag>
            </div>
            <el-input
              v-model="config.quarkCookie"
              type="textarea"
              :rows="3"
              placeholder="夸克网盘Cookie"
            />
          </div>
          
          <div class="cookie-item">
            <div class="cookie-label">
              <span>百度网盘</span>
              <el-tag :type="hasBaiduCookie ? 'success' : 'danger'" size="small">
                {{ hasBaiduCookie ? '已配置' : '未配置' }}
              </el-tag>
            </div>
            <el-input
              v-model="config.baiduCookie"
              type="textarea"
              :rows="3"
              placeholder="百度网盘Cookie"
            />
          </div>
          
          <div class="form-actions">
            <el-button type="primary" @click="refreshCookies" :loading="refreshing">
              自动获取Cookie
            </el-button>
            <el-button @click="saveCookies">保存Cookie</el-button>
          </div>
        </div>
      </el-card>
    </main>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Setting, Key } from '@element-plus/icons-vue'
import { storage } from '../utils/storage'

const refreshing = ref(false)

const config = reactive({
  autoGetCookie: true,
  baiduFolder: '/默认转存文件',
  bannedKeywords: '广告,推广,关注',
  quarkCookie: '',
  baiduCookie: ''
})

const hasQuarkCookie = computed(() => !!config.quarkCookie)
const hasBaiduCookie = computed(() => !!config.baiduCookie)

// 加载配置
const loadConfig = async () => {
  try {
    const data = await storage.get([
      'autoGetCookie',
      'defaultBaiduFolder',
      'bannedKeywords',
      'quarkCookie',
      'baiduCookie'
    ])
    
    if (data.autoGetCookie !== undefined) config.autoGetCookie = data.autoGetCookie
    if (data.defaultBaiduFolder) config.baiduFolder = data.defaultBaiduFolder
    if (data.bannedKeywords) config.bannedKeywords = data.bannedKeywords.join(',')
    if (data.quarkCookie) config.quarkCookie = data.quarkCookie
    if (data.baiduCookie) config.baiduCookie = data.baiduCookie
  } catch (error) {
    console.error('加载配置失败:', error)
  }
}

// 保存配置
const saveConfig = async () => {
  try {
    await storage.set({
      autoGetCookie: config.autoGetCookie,
      defaultBaiduFolder: config.baiduFolder,
      bannedKeywords: config.bannedKeywords.split(',').map(k => k.trim()).filter(k => k)
    })
    ElMessage.success('设置已保存')
  } catch (error) {
    ElMessage.error('保存失败: ' + error.message)
  }
}

// 重置配置
const resetConfig = () => {
  config.autoGetCookie = true
  config.baiduFolder = '/默认转存文件'
  config.bannedKeywords = '广告,推广,关注'
}

// 保存Cookie
const saveCookies = async () => {
  try {
    await storage.set({
      quarkCookie: config.quarkCookie,
      baiduCookie: config.baiduCookie
    })
    ElMessage.success('Cookie已保存')
  } catch (error) {
    ElMessage.error('保存失败: ' + error.message)
  }
}

// 自动获取Cookie
const refreshCookies = async () => {
  refreshing.value = true
  try {
    // 获取夸克Cookie
    const quarkCookies = await chrome.cookies.getAll({ domain: '.quark.cn' })
    if (quarkCookies.length > 0) {
      config.quarkCookie = quarkCookies.map(c => `${c.name}=${c.value}`).join('; ')
    }
    
    // 获取百度Cookie
    const baiduCookies = await chrome.cookies.getAll({ domain: '.baidu.com' })
    if (baiduCookies.length > 0) {
      config.baiduCookie = baiduCookies.map(c => `${c.name}=${c.value}`).join('; ')
    }
    
    // 保存到storage
    await saveCookies()
    ElMessage.success('Cookie获取成功')
  } catch (error) {
    ElMessage.error('获取失败: ' + error.message)
  } finally {
    refreshing.value = false
  }
}

onMounted(() => {
  loadConfig()
})
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  background: #f5f7fa;
  min-height: 100vh;
}
</style>

<style scoped>
.options-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.options-header {
  text-align: center;
  padding: 20px 0 30px;
}

.options-header h1 {
  font-size: 24px;
  color: #303133;
}

.options-main {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.settings-card {
  border-radius: 8px;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  font-weight: 600;
}

.form-tip {
  display: block;
  font-size: 12px;
  color: #909399;
  margin-top: 4px;
}

.form-actions {
  display: flex;
  gap: 12px;
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #ebeef5;
}

.cookie-section {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.cookie-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.cookie-label {
  display: flex;
  align-items: center;
  gap: 12px;
  font-weight: 500;
}
</style>
