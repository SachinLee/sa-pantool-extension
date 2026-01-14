/**
 * 常量定义
 */

// 夸克网盘相关常量
export const QUARK = {
  BASE_URL: 'https://drive-pc.quark.cn',
  SHARE_URL: 'https://pan.quark.cn',
  COMMON_PARAMS: {
    pr: 'ucpro',
    fr: 'pc',
    uc_param_str: ''
  }
}

// 百度网盘相关常量
export const BAIDU = {
  BASE_URL: 'https://pan.baidu.com',
  PCS_URL: 'https://pcs.baidu.com'
}

// 任务状态
export const TaskStatus = {
  PENDING: 'pending',
  RUNNING: 'running',
  SUCCESS: 'success',
  FAILED: 'failed',
  CANCELLED: 'cancelled'
}

// 错误码
export const ErrorCode = {
  // 通用错误
  UNKNOWN: -1,
  SUCCESS: 0,
  
  // Cookie相关
  COOKIE_EXPIRED: 1001,
  COOKIE_INVALID: 1002,
  
  // 网络相关
  NETWORK_ERROR: 2001,
  TIMEOUT: 2002,
  
  // 业务相关
  SHARE_NOT_FOUND: 3001,
  SHARE_EXPIRED: 3002,
  INVALID_CODE: 3003,
  CAPACITY_LIMIT: 3004,
  FILE_EXISTS: 3005,
  
  // API相关
  API_ERROR: 4001,
  RATE_LIMIT: 4002
}

// 错误信息映射
export const ErrorMessage = {
  [ErrorCode.UNKNOWN]: '未知错误',
  [ErrorCode.SUCCESS]: '成功',
  [ErrorCode.COOKIE_EXPIRED]: 'Cookie已过期，请重新登录',
  [ErrorCode.COOKIE_INVALID]: 'Cookie无效，请检查配置',
  [ErrorCode.NETWORK_ERROR]: '网络连接失败',
  [ErrorCode.TIMEOUT]: '请求超时',
  [ErrorCode.SHARE_NOT_FOUND]: '分享资源不存在',
  [ErrorCode.SHARE_EXPIRED]: '分享链接已过期',
  [ErrorCode.INVALID_CODE]: '提取码错误',
  [ErrorCode.CAPACITY_LIMIT]: '网盘容量不足',
  [ErrorCode.FILE_EXISTS]: '文件已存在',
  [ErrorCode.API_ERROR]: 'API调用失败',
  [ErrorCode.RATE_LIMIT]: '请求过于频繁，请稍后再试'
}

// 默认配置
export const DEFAULT_CONFIG = {
  defaultQuarkFolder: '0',
  defaultBaiduFolder: '/默认转存文件',
  bannedKeywords: ['广告', '推广', '关注', '公众号', '微信'],
  autoGetCookie: true,
  maxRetries: 3,
  retryDelay: 2000,
  taskPollInterval: 1000,
  maxPollRetries: 50
}

// HTTP请求默认配置
export const HTTP_CONFIG = {
  timeout: 30000,
  maxRetries: 3,
  retryDelay: 2000
}

export default {
  QUARK,
  BAIDU,
  TaskStatus,
  ErrorCode,
  ErrorMessage,
  DEFAULT_CONFIG,
  HTTP_CONFIG
}
