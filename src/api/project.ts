// 未来用于和后台API交互的项目相关接口
// 示例：获取项目列表、添加项目、更新项目、删除项目等

// 这里先导出空方法，后续可用axios等库实现

import { mockProjects } from './mockProjects';

export async function fetchProjects() {
  // TODO: 后台API完成后切换为真实请求
  // return axios.get('/api/projects')
  return mockProjects;
}

export async function addProject(project: any) {
  // return axios.post('/api/projects', project)
  return {}
}

export async function updateProject(project: any) {
  // return axios.put(`/api/projects/${project.id}`, project)
  return {}
}

export async function deleteProject(id: number) {
  // return axios.delete(`/api/projects/${id}`)
  return {}
}
