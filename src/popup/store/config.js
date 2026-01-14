import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { storage } from '@/utils/storage'

export const useConfigStore = defineStore('config', () => {
  // 状态
  const quarkCookie = ref('')
  const baiduCookie = ref('')
  const defaultQuarkFolder = ref('0')
  const defaultBaiduFolder = ref('/默认转存文件')
  const bannedKeywords = ref(['广告', '推广', '关注'])
  const autoGetCookie = ref(true)

  // 计算属性
  const hasCookies = computed(() => {
    return !!(quarkCookie.value && baiduCookie.value)
  })

  const hasQuarkCookie = computed(() => !!quarkCookie.value)
  const hasBaiduCookie = computed(() => !!baiduCookie.value)

  // 加载配置
  async function loadConfig() {
    try {
      const config = await storage.get([
        'quarkCookie',
        'baiduCookie',
        'defaultQuarkFolder',
        'defaultBaiduFolder',
        'bannedKeywords',
        'autoGetCookie'
      ])

      if (config.quarkCookie) quarkCookie.value = config.quarkCookie
      if (config.baiduCookie) baiduCookie.value = config.baiduCookie
      if (config.defaultQuarkFolder) defaultQuarkFolder.value = config.defaultQuarkFolder
      if (config.defaultBaiduFolder) defaultBaiduFolder.value = config.defaultBaiduFolder
      if (config.bannedKeywords) bannedKeywords.value = config.bannedKeywords
      if (config.autoGetCookie !== undefined) autoGetCookie.value = config.autoGetCookie

      // 如果开启自动获取Cookie，尝试自动获取
      if (autoGetCookie.value) {
        await refreshCookies()
      }
    } catch (error) {
      console.error('加载配置失败:', error)
    }
  }

  // 保存配置
  async function saveConfig() {
    try {
      await storage.set({
        quarkCookie: quarkCookie.value,
        baiduCookie: baiduCookie.value,
        defaultQuarkFolder: defaultQuarkFolder.value,
        defaultBaiduFolder: defaultBaiduFolder.value,
        bannedKeywords: bannedKeywords.value,
        autoGetCookie: autoGetCookie.value
      })
    } catch (error) {
      console.error('保存配置失败:', error)
      throw error
    }
  }

  // 设置夸克Cookie
  async function setQuarkCookie(cookie) {
    quarkCookie.value = cookie
    await saveConfig()
  }

  // 设置百度Cookie
  async function setBaiduCookie(cookie) {
    baiduCookie.value = cookie
    await saveConfig()
  }

  // 自动刷新Cookie（从浏览器获取）
  async function refreshCookies() {
    try {
      // 获取夸克网盘Cookie
      const quarkCookies = await chrome.cookies.getAll({ domain: '.quark.cn' })
      if (quarkCookies.length > 0) {
        const cookieString = quarkCookies.map(c => `${c.name}=${c.value}`).join('; ')
        quarkCookie.value = cookieString
      }

      // 获取百度网盘Cookie
      const baiduCookies = await chrome.cookies.getAll({ domain: '.baidu.com' })
      if (baiduCookies.length > 0) {
        const cookieString = baiduCookies.map(c => `${c.name}=${c.value}`).join('; ')
        baiduCookie.value = cookieString
      }

      // 保存到storage
      await saveConfig()
    } catch (error) {
      console.error('刷新Cookie失败:', error)
    }
  }

  // 设置禁用关键词
  async function setBannedKeywords(keywords) {
    bannedKeywords.value = keywords
    await saveConfig()
  }

  // 设置默认文件夹
  async function setDefaultFolders(quarkFolder, baiduFolder) {
    if (quarkFolder !== undefined) defaultQuarkFolder.value = quarkFolder
    if (baiduFolder !== undefined) defaultBaiduFolder.value = baiduFolder
    await saveConfig()
  }

  return {
    // 状态
    quarkCookie,
    baiduCookie,
    defaultQuarkFolder,
    defaultBaiduFolder,
    bannedKeywords,
    autoGetCookie,
    // 计算属性
    hasCookies,
    hasQuarkCookie,
    hasBaiduCookie,
    // 方法
    loadConfig,
    saveConfig,
    setQuarkCookie,
    setBaiduCookie,
    refreshCookies,
    setBannedKeywords,
    setDefaultFolders
  }
})
