/**
 * Chrome Extension 消息通信工具
 * 用于popup和background之间的通信
 */

// 消息类型定义
export const MessageType = {
  // 转存相关
  TRANSFER: 'transfer',
  TRANSFER_PROGRESS: 'transfer_progress',
  TRANSFER_COMPLETE: 'transfer_complete',
  
  // Cookie相关
  GET_COOKIES: 'get_cookies',
  REFRESH_COOKIES: 'refresh_cookies',
  
  // 配置相关
  GET_CONFIG: 'get_config',
  SAVE_CONFIG: 'save_config',
  
  // 任务相关
  GET_TASKS: 'get_tasks',
  CANCEL_TASK: 'cancel_task'
}

/**
 * 发送消息到background
 * @param {string} type - 消息类型
 * @param {object} data - 消息数据
 * @returns {Promise<any>}
 */
export async function sendMessage(type, data = {}) {
  return new Promise((resolve, reject) => {
    try {
      chrome.runtime.sendMessage(
        { type, data, timestamp: Date.now() },
        (response) => {
          if (chrome.runtime.lastError) {
            reject(new Error(chrome.runtime.lastError.message))
          } else if (response && response.error) {
            reject(new Error(response.error))
          } else {
            resolve(response)
          }
        }
      )
    } catch (error) {
      reject(error)
    }
  })
}

/**
 * 监听来自background的消息
 * @param {function} callback - 消息回调函数
 * @returns {function} - 取消监听函数
 */
export function onMessage(callback) {
  const listener = (message, sender, sendResponse) => {
    // 只处理来自background的消息
    if (!sender.tab) {
      const result = callback(message, sender)
      if (result instanceof Promise) {
        result.then(sendResponse).catch(err => sendResponse({ error: err.message }))
        return true // 保持通道打开
      } else {
        sendResponse(result)
      }
    }
  }
  
  chrome.runtime.onMessage.addListener(listener)
  return () => chrome.runtime.onMessage.removeListener(listener)
}

/**
 * 发送消息到指定tab的content script
 * @param {number} tabId - 标签页ID
 * @param {string} type - 消息类型
 * @param {object} data - 消息数据
 * @returns {Promise<any>}
 */
export async function sendToTab(tabId, type, data = {}) {
  return new Promise((resolve, reject) => {
    try {
      chrome.tabs.sendMessage(
        tabId,
        { type, data, timestamp: Date.now() },
        (response) => {
          if (chrome.runtime.lastError) {
            reject(new Error(chrome.runtime.lastError.message))
          } else if (response && response.error) {
            reject(new Error(response.error))
          } else {
            resolve(response)
          }
        }
      )
    } catch (error) {
      reject(error)
    }
  })
}

/**
 * 广播消息到所有popup和content script
 * @param {string} type - 消息类型
 * @param {object} data - 消息数据
 */
export async function broadcast(type, data = {}) {
  // 发送到所有tabs
  const tabs = await chrome.tabs.query({})
  for (const tab of tabs) {
    if (tab.id) {
      try {
        await sendToTab(tab.id, type, data)
      } catch {
        // 忽略未注入content script的tab
      }
    }
  }
}

export default {
  MessageType,
  sendMessage,
  onMessage,
  sendToTab,
  broadcast
}
