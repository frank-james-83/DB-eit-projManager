import './assets/main.css'

import { createApp } from 'vue'

import App from './ProjectManagement.vue'

// 引入 Element Plus
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'

// 引入 Element Plus 图标
import * as ElementPlusIconsVue from '@element-plus/icons-vue'

// 引入 Echarts
import ECharts from 'vue-echarts'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { LineChart } from 'echarts/charts'
import { GridComponent, ToolboxComponent, TitleComponent } from 'echarts/components'

// 配置 Echarts
use([CanvasRenderer, LineChart, GridComponent, ToolboxComponent, TitleComponent])

const app = createApp(App)

// 注册 Echarts 组件
app.component('v-chart', ECharts)

// 注册图标组件
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

// app.use(router)
app.use(ElementPlus)

app.mount('#app')
