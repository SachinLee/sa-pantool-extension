/**
 * Background Service Worker
 * 处理插件后台逻辑
 */

import { MessageType } from '../utils/message.js'

console.log('Background Service Worker 启动')

// 监听来自popup的消息
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('收到消息:', message)
  
  const { type, data } = message
  
  // 根据消息类型处理
  switch (type) {
    case 'transfer':
      handleTransfer(data).then(sendResponse).catch(err => {
        sendResponse({ success: false, message: err.message })
      })
      return true // 保持通道打开
      
    case 'get_cookies':
      handleGetCookies().then(sendResponse).catch(err => {
        sendResponse({ success: false, message: err.message })
      })
      return true
      
    case 'refresh_cookies':
      handleRefreshCookies().then(sendResponse).catch(err => {
        sendResponse({ success: false, message: err.message })
      })
      return true
      
    default:
      sendResponse({ success: false, message: '未知的消息类型' })
  }
})

/**
 * 处理转存请求
 * 这里只是占位，完整实现将在第二阶段完成
 */
async function handleTransfer(data) {
  console.log('处理转存请求:', data)
  
  // TODO: 实现完整的转存逻辑
  // 1. 解析链接
  // 2. 调用夸克API获取资源信息
  // 3. 转存到夸克网盘
  // 4. 创建夸克分享
  // 5. 转存到百度网盘
  // 6. 创建百度分享
  
  // 临时返回模拟结果
  return {
    success: false,
    message: '转存功能开发中，请等待第二阶段完成'
  }
}

/**
 * 获取Cookie
 */
async function handleGetCookies() {
  try {
    // 获取夸克网盘Cookie
    const quarkCookies = await chrome.cookies.getAll({ domain: '.quark.cn' })
    const quarkCookie = quarkCookies.map(c => `${c.name}=${c.value}`).join('; ')
    
    // 获取百度网盘Cookie
    const baiduCookies = await chrome.cookies.getAll({ domain: '.baidu.com' })
    const baiduCookie = baiduCookies.map(c => `${c.name}=${c.value}`).join('; ')
    
    return {
      success: true,
      data: {
        quarkCookie,
        baiduCookie
      }
    }
  } catch (error) {
    console.error('获取Cookie失败:', error)
    return {
      success: false,
      message: error.message
    }
  }
}

/**
 * 刷新Cookie
 */
async function handleRefreshCookies() {
  return handleGetCookies()
}

// 插件安装时的处理
chrome.runtime.onInstalled.addListener((details) => {
  console.log('插件安装/更新:', details.reason)
  
  if (details.reason === 'install') {
    // 首次安装，可以打开欢迎页面或设置页面
    console.log('首次安装插件')
  } else if (details.reason === 'update') {
    // 更新时的处理
    console.log('插件已更新到版本:', chrome.runtime.getManifest().version)
  }
})

// 保持Service Worker活跃（用于长时间任务）
chrome.alarms.create('keepAlive', { periodInMinutes: 1 })
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'keepAlive') {
    console.log('Keep alive alarm triggered')
  }
})
