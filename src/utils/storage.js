/**
 * Chrome Storage API 封装
 * 提供统一的存储接口
 */

export const storage = {
  /**
   * 获取存储数据
   * @param {string|string[]} keys - 要获取的键名
   * @returns {Promise<object>}
   */
  async get(keys) {
    return new Promise((resolve, reject) => {
      try {
        chrome.storage.local.get(keys, (result) => {
          if (chrome.runtime.lastError) {
            reject(new Error(chrome.runtime.lastError.message))
          } else {
            resolve(result)
          }
        })
      } catch (error) {
        reject(error)
      }
    })
  },

  /**
   * 设置存储数据
   * @param {object} data - 要存储的数据
   * @returns {Promise<void>}
   */
  async set(data) {
    return new Promise((resolve, reject) => {
      try {
        chrome.storage.local.set(data, () => {
          if (chrome.runtime.lastError) {
            reject(new Error(chrome.runtime.lastError.message))
          } else {
            resolve()
          }
        })
      } catch (error) {
        reject(error)
      }
    })
  },

  /**
   * 删除存储数据
   * @param {string|string[]} keys - 要删除的键名
   * @returns {Promise<void>}
   */
  async remove(keys) {
    return new Promise((resolve, reject) => {
      try {
        chrome.storage.local.remove(keys, () => {
          if (chrome.runtime.lastError) {
            reject(new Error(chrome.runtime.lastError.message))
          } else {
            resolve()
          }
        })
      } catch (error) {
        reject(error)
      }
    })
  },

  /**
   * 清空所有存储数据
   * @returns {Promise<void>}
   */
  async clear() {
    return new Promise((resolve, reject) => {
      try {
        chrome.storage.local.clear(() => {
          if (chrome.runtime.lastError) {
            reject(new Error(chrome.runtime.lastError.message))
          } else {
            resolve()
          }
        })
      } catch (error) {
        reject(error)
      }
    })
  },

  /**
   * 获取存储使用情况
   * @returns {Promise<{bytesInUse: number}>}
   */
  async getBytesInUse() {
    return new Promise((resolve, reject) => {
      try {
        chrome.storage.local.getBytesInUse(null, (bytesInUse) => {
          if (chrome.runtime.lastError) {
            reject(new Error(chrome.runtime.lastError.message))
          } else {
            resolve({ bytesInUse })
          }
        })
      } catch (error) {
        reject(error)
      }
    })
  },

  /**
   * 监听存储变化
   * @param {function} callback - 变化回调函数
   * @returns {function} - 取消监听函数
   */
  onChanged(callback) {
    const listener = (changes, areaName) => {
      if (areaName === 'local') {
        callback(changes)
      }
    }
    chrome.storage.onChanged.addListener(listener)
    return () => chrome.storage.onChanged.removeListener(listener)
  }
}

export default storage
