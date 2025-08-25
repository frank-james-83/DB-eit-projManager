/**
 * 认证工具函数
 */

import { refreshToken as refreshApi } from '../api/auth.ts'

// 获取访问令牌
export function getAccessToken() {
  return localStorage.getItem('access_token')
}

// 获取刷新令牌
export function getRefreshToken() {
  return localStorage.getItem('refresh_token')
}

// 设置访问令牌
export function setAccessToken(token) {
  localStorage.setItem('access_token', token)
}

// 设置刷新令牌
export function setRefreshToken(token) {
  localStorage.setItem('refresh_token', token)
}

// 清除所有令牌
export function clearTokens() {
  localStorage.removeItem('access_token')
  localStorage.removeItem('refresh_token')
  localStorage.removeItem('user')
}

// 刷新访问令牌
export async function refreshAccessToken() {
  try {
    const refreshToken = getRefreshToken()
    if (!refreshToken) {
      throw new Error('没有刷新令牌')
    }

    const response = await refreshApi(refreshToken)
    setAccessToken(response.access)
    return response.access
  } catch (error) {
    clearTokens()
    throw error
  }
}

// 检查访问令牌是否即将过期（提前5分钟刷新）
export function isTokenExpiringSoon(token) {
  if (!token) return true
  
  try {
    const payload = JSON.parse(atob(token.split('.')[1]))
    const expTime = payload.exp * 1000
    const currentTime = Date.now()
    // 提前5分钟刷新令牌
    return expTime - currentTime < 5 * 60 * 1000
  } catch (e) {
    return true
  }
}