/**
 * 认证相关API接口
 */

// 获取访问令牌
export async function login(username, password) {
  // 实际项目中应该调用真实的API接口
  // 示例: POST /api/token/
  try {
    // 模拟API调用
    const response = await new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          access: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImFkbWluIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c',
          refresh: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImFkbWluIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c'
        });
      }, 1000);
    });

    return response;
  } catch (error) {
    throw new Error('登录失败，请检查用户名和密码');
  }
}

// 刷新访问令牌
export async function refreshToken(refresh) {
  // 实际项目中应该调用真实的API接口
  // 示例: POST /api/token/refresh/
  try {
    // 模拟API调用
    const response = await new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          access: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImFkbWluIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c'
        });
      }, 1000);
    });

    return response;
  } catch (error) {
    throw new Error('令牌刷新失败');
  }
}

// 检查令牌是否有效
export function isTokenValid(token) {
  if (!token) return false;
  
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const currentTime = Date.now() / 1000;
    return payload.exp > currentTime;
  } catch (e) {
    return false;
  }
}