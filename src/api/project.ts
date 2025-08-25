// 未来用于和后台API交互的项目相关接口
// 示例：获取项目列表、添加项目、更新项目、删除项目等

// 这里先导出空方法，后续可用axios等库实现

// 项目相关的API接口(模拟)
import { mockProjects } from '../mock/mockProjects';

// 获取项目列表
export async function getProjects() {
  // 实际项目中应该调用真实的API接口
  // 示例: GET /api/projects/
  try {
    // 模拟API调用
    const response = await new Promise((resolve) => {
      setTimeout(() => {
        resolve(mockProjects);
      }, 500);
    });

    return response;
  } catch (error) {
    throw new Error('获取项目列表失败');
  }
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
