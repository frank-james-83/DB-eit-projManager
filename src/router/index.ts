import { createRouter, createWebHistory } from 'vue-router'
import Login from '../views/Login.vue'
import Home from '../views/Home.vue'
import Projects from '../views/Projects.vue'

const routes = [
  {
    path: '/',
    redirect: '/login'
  },
  {
    path: '/login',
    name: 'Login',
    component: Login
  },
  {
    path: '/home',
    name: 'Home',
    component: Home,
    children: [
      {
        path: '/home/projects',
        name: 'Projects',
        component: Projects
      },
      {
        path: '',
        name: 'HomeRedirect',
        redirect: '/home/projects'
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 全局前置守卫
router.beforeEach((to, from, next) => {
  // 检查是否需要认证
  const requiresAuth = to.path !== '/login'
  
  // 获取访问令牌
  const accessToken = localStorage.getItem('access_token')
  
  if (requiresAuth && !accessToken) {
    // 如果需要认证但没有令牌，重定向到登录页
    next('/login')
  } else if (to.path === '/login' && accessToken) {
    // 如果已登录且访问登录页，重定向到主页
    next('/home/projects')
  } else {
    // 其他情况正常跳转
    next()
  }
})

export default router