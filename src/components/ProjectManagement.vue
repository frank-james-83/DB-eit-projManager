<template>
  <div class="project-management-container">
    <!-- 标题栏 -->
    <header class="app-header">
      <div class="logo">
        <el-icon :size="24"><Management /></el-icon>
        <span>EIT项目管理系统</span>
      </div>
      <div class="header-actions">
        <el-button type="primary" size="small" :icon="Plus">新建项目</el-button>
        <el-dropdown>
          <el-button size="small" :icon="Setting" class="ml-2">
            <el-icon :size="16" class="ml-1"><ArrowDown /></el-icon>
          </el-button>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item>系统设置</el-dropdown-item>
              <el-dropdown-item>用户中心</el-dropdown-item>
              <el-dropdown-item>退出登录</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </header>

    <div class="main-content">
      <!-- 左侧项目列表 -->
      <aside class="project-list-container">
        <div class="list-controls">
          <h2>项目列表</h2>
          <div class="controls-right">
            <!-- 列显示控制 -->
            <el-dropdown trigger="click" @command="handleColumnChange">
              <el-button size="small" :icon="DataAnalysis">
                列设置
              </el-button>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item :command="TableColumn.ProjectId" :disabled="!canHide(TableColumn.ProjectId)">
                    <el-checkbox v-model="DataAnalysis[TableColumn.ProjectId].visible">项目编号</el-checkbox>
                  </el-dropdown-item>
                  <el-dropdown-item :command="TableColumn.Name" :disabled="!canHide(TableColumn.Name)">
                    <el-checkbox v-model="DataAnalysis[TableColumn.Name].visible">项目名称</el-checkbox>
                  </el-dropdown-item>
                  <el-dropdown-item :command="TableColumn.Manager" :disabled="!canHide(TableColumn.Manager)">
                    <el-checkbox v-model="DataAnalysis[TableColumn.Manager].visible">项目经理</el-checkbox>
                  </el-dropdown-item>
                  <el-dropdown-item :command="TableColumn.PlannedHours" :disabled="!canHide(TableColumn.PlannedHours)">
                    <el-checkbox v-model="DataAnalysis[TableColumn.PlannedHours].visible">计划工时</el-checkbox>
                  </el-dropdown-item>
                  <el-dropdown-item :command="TableColumn.UsedHours" :disabled="!canHide(TableColumn.UsedHours)">
                    <el-checkbox v-model="DataAnalysis[TableColumn.UsedHours].visible">已用工时</el-checkbox>
                  </el-dropdown-item>
                  <el-dropdown-item :command="TableColumn.Progress" :disabled="!canHide(TableColumn.Progress)">
                    <el-checkbox v-model="DataAnalysis[TableColumn.Progress].visible">进度</el-checkbox>
                  </el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
            
            <!-- 搜索框 -->
            <el-input 
              placeholder="搜索项目" 
              size="small" 
              v-model="searchQuery"
              class="search-input"
            >
              <template #append>
                <el-button size="small" :icon="Search"></el-button>
              </template>
            </el-input>
          </div>
        </div>
        
        <!-- 项目表格 -->
        <el-table 
          :data="filteredProjects" 
          border 
          size="small"
          @row-click="handleProjectClick"
          class="project-table"
        >
          <el-table-column 
            v-if="DataAnalysis[TableColumn.ProjectId].visible"
            prop="projectId" 
            label="项目编号" 
            sortable
            :filters="[{text: 'EIT-2023', value: 'EIT-2023'}, {text: 'EIT-2024', value: 'EIT-2024'}]"
            :filter-method="(value:string, row:Project) => row.projectId.includes(value)"
          ></el-table-column>
          
          <el-table-column 
            v-if="DataAnalysis[TableColumn.Name].visible"
            prop="name" 
            label="项目名称" 
            sortable
            :filter-method="(value:string, row:Project) => row.name.includes(value)"
          >
          <template #default="{ row }">
              <span class="project-name" @click.stop="handleProjectNameClick(row)">{{ row.name }}</span>
            </template>
          </el-table-column>
          
          <el-table-column 
            v-if="DataAnalysis[TableColumn.Manager].visible"
            prop="manager" 
            label="项目经理" 
            sortable
            :filters="getUniqueManagers().map(m => ({text: m, value: m}))"
            :filter-method="(value:string, row:Project) => row.manager === value"
          ></el-table-column>
          
          <el-table-column 
            v-if="DataAnalysis[TableColumn.PlannedHours].visible"
            prop="plannedHours" 
            label="计划工时" 
            sortable
          ></el-table-column>
          
          <el-table-column 
            v-if="DataAnalysis[TableColumn.UsedHours].visible"
            prop="usedHours" 
            label="已用工时" 
            sortable
          ></el-table-column>
          
          <el-table-column 
            v-if="DataAnalysis[TableColumn.Progress].visible"
            prop="progress" 
            label="进度" 
            sortable
          >
            <template #default="{ row }">
              <el-progress 
                :percentage="row.progress" 
                stroke-width="6"
                :stroke-color="getProgressColor(row.progress)"
              ></el-progress>
            </template>
          </el-table-column>
        </el-table>
      </aside>

      <!-- 中间甘特图区域 -->
      <section class="gantt-container">
        <div class="gantt-controls">
          <h2>项目计划甘特图</h2>
          <div class="gantt-actions">
            <el-button-group size="small">
              <el-button :icon="ZoomOut" @click="zoomOut"></el-button>
              <el-button :icon="ZoomIn" @click="zoomIn"></el-button>
            </el-button-group>
            <el-select 
              v-model="timeRange" 
              size="small" 
              class="ml-2"
              @change="handleTimeRangeChange"
            >
              <el-option label="周视图" value="week"></el-option>
              <el-option label="月视图" value="month"></el-option>
              <el-option label="季度视图" value="quarter"></el-option>
              <el-option label="年视图" value="year"></el-option>
            </el-select>
            <el-date-picker
              v-model="dateRange"
              type="daterange"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              size="small"
              class="ml-2"
            ></el-date-picker>
          </div>
        </div>
        
        <!-- 甘特图组件 -->
        <div class="gantt-chart">
          <!-- 时间轴头部 -->
          <div class="gantt-timeline">
            <div v-for="(month, index) in timelineMonths" :key="index" class="timeline-month">
              {{ month }}
            </div>
          </div>
          
          <!-- 甘特图项目行 -->
          <div 
            v-for="project in filteredProjects" 
            :key="project.id" 
            class="gantt-row"
            :class="{ 'gantt-row-active': activeProjectId === project.id }"
          >
            <div class="gantt-task-bar" 
                 :style="{ 
                   left: `${project.startPosition}%`, 
                   width: `${project.duration}%`,
                   backgroundColor: project.color
                 }">
              <span class="task-label">{{ project.name }}</span>
            </div>
          </div>
        </div>
      </section>

      <!-- 右侧项目详情面板 -->
      <div class="detail-panel" :class="{ 'panel-open': isDetailOpen }">
        <div class="panel-header">
          <h2>{{ activeProject?.name || '项目详情' }}</h2>
          <el-button 
            :icon="Close" 
            size="small" 
            @click="closeDetailPanel"
          ></el-button>
        </div>
        
        <el-tabs v-if="activeProject" type="card" class="detail-tabs">
          <el-tab-pane label="基本信息">
            <el-descriptions column="1" border>
              <el-descriptions-item label="项目编号">{{ activeProject.projectId }}</el-descriptions-item>
              <el-descriptions-item label="项目名称">{{ activeProject.name }}</el-descriptions-item>
              <el-descriptions-item label="项目经理">{{ activeProject.manager }}</el-descriptions-item>
              <el-descriptions-item label="开始日期">{{ formatDate(activeProject.startDate) }}</el-descriptions-item>
              <el-descriptions-item label="结束日期">{{ formatDate(activeProject.endDate) }}</el-descriptions-item>
              <el-descriptions-item label="状态">{{ getStatusLabel(activeProject.status) }}</el-descriptions-item>
              <el-descriptions-item label="项目描述">{{ activeProject.description }}</el-descriptions-item>
            </el-descriptions>
          </el-tab-pane>
          
          <el-tab-pane label="财务数据">
            <el-descriptions column="2" border>
              <el-descriptions-item label="预算金额">{{ formatCurrency(activeProject.budget) }}</el-descriptions-item>
              <el-descriptions-item label="已使用金额">{{ formatCurrency(activeProject.spent) }}</el-descriptions-item>
              <el-descriptions-item label="预计总成本">{{ formatCurrency(activeProject.estimatedCost) }}</el-descriptions-item>
              <el-descriptions-item label="成本偏差">{{ formatCurrency(activeProject.costVariance) }}</el-descriptions-item>
            </el-descriptions>
            <!-- <el-chart :data="financialChartData" type="line" class="mt-4"></el-chart> -->
          </el-tab-pane>
          
          <el-tab-pane label="进度跟踪">
            <div class="progress-overview">
              <div class="progress-stats">
                <div class="stat-item">
                  <div class="stat-label">总体进度</div>
                  <div class="stat-value">{{ activeProject.progress }}%</div>
                </div>
                <div class="stat-item">
                  <div class="stat-label">计划工时</div>
                  <div class="stat-value">{{ activeProject.plannedHours }}h</div>
                </div>
                <div class="stat-item">
                  <div class="stat-label">已用工时</div>
                  <div class="stat-value">{{ activeProject.usedHours }}h</div>
                </div>
              </div>
              <el-progress 
                :percentage="activeProject.progress" 
                stroke-width="8"
                :stroke-color="getProgressColor(activeProject.progress)"
                class="mt-4"
              ></el-progress>
            </div>
            
            <h4 class="mt-4">关键里程碑</h4>
            <el-timeline>
              <el-timeline-item 
                v-for="(milestone, index) in activeProject.milestones" 
                :key="index"
                :timestamp="formatDate(milestone.date)"
                :status="milestone.completed ? 'success' : 'process'"
              >
                {{ milestone.name }}
                <el-tag :type="milestone.completed ? 'success' : 'info'" size="small" class="ml-2">
                  {{ milestone.completed ? '已完成' : '进行中' }}
                </el-tag>
              </el-timeline-item>
            </el-timeline>
          </el-tab-pane>
          
          <el-tab-pane label="工时统计">
            <el-table :data="activeProject.timeRecords" border size="small">
              <el-table-column prop="date" label="日期"></el-table-column>
              <el-table-column prop="user" label="人员"></el-table-column>
              <el-table-column prop="hours" label="工时"></el-table-column>
              <el-table-column prop="task" label="任务描述"></el-table-column>
            </el-table>
            
            <div class="hours-chart mt-4">
              <!-- <el-chart :data="hoursChartData" type="bar"></el-chart> -->
            </div>
          </el-tab-pane>
        </el-tabs>
      </div>
      
      <!-- 遮罩层 -->
      <div 
        class="panel-mask" 
        :class="{ 'mask-visible': isDetailOpen }"
        @click="closeDetailPanel"
      ></div>
    </div>
  </div>
</template>

<script setup lang='ts'>
import { ref, computed, onMounted } from 'vue';
import { 
  Management, Plus, Setting, ArrowDown, Search, 
  ZoomOut, ZoomIn, Close 
} from '@element-plus/icons-vue';

// 类型定义
enum TableColumn {
  ProjectId = 'projectId',
  Name = 'name',
  Manager = 'manager',
  PlannedHours = 'plannedHours',
  UsedHours = 'usedHours',
  Progress = 'progress'
}

type ProjectStatus = 'notStarted' | 'inProgress' | 'completed' | 'delayed';

interface Milestone {
  name: string;
  date: string;
  completed: boolean;
}

interface TimeRecord {
  date: string;
  user: string;
  hours: number;
  task: string;
}

interface Project {
  id: number;
  projectId: string;
  name: string;
  manager: string;
  startDate: string;
  endDate: string;
  startPosition: number;
  duration: number;
  color: string;
  plannedHours: number;
  usedHours: number;
  progress: number;
  status: ProjectStatus;
  budget: number;
  spent: number;
  estimatedCost: number;
  costVariance: number;
  description: string;
  milestones: Milestone[];
  timeRecords: TimeRecord[];
}

interface ColumnConfig {
  visible: boolean;
}

interface FinancialData {
  name: string;
  预算: number;
  实际: number;
}

interface HoursData {
  name: string;
  工时: number;
}

// 状态管理
const searchQuery = ref('');
const timeRange = ref<'week' | 'month' | 'quarter' | 'year'>('month');
const dateRange = ref<[Date, Date]>([new Date('2023-01-01'), new Date('2023-12-31')]);
const zoomLevel = ref(1);
const isDetailOpen = ref(false);
const activeProjectId = ref<number | null>(null);

// 列显示控制配置
const DataAnalysis = ref<Record<TableColumn, ColumnConfig>>({
  [TableColumn.ProjectId]: { visible: true },
  [TableColumn.Name]: { visible: true },
  [TableColumn.Manager]: { visible: true },
  [TableColumn.PlannedHours]: { visible: true },
  [TableColumn.UsedHours]: { visible: true },
  [TableColumn.Progress]: { visible: true }
});

// 项目数据
const projects = ref<Project[]>([
  {
    id: 1,
    projectId: 'EIT-2023-001',
    name: '智能工厂系统开发',
    manager: '张三',
    startDate: '2023-01-15',
    endDate: '2023-06-30',
    startPosition: 10,
    duration: 30,
    color: '#42b983',
    plannedHours: 2400,
    usedHours: 1800,
    progress: 75,
    status: 'inProgress',
    budget: 500000,
    spent: 350000,
    estimatedCost: 480000,
    costVariance: -20000,
    description: '为某汽车制造企业开发智能工厂管理系统，实现生产流程自动化与数据可视化',
    milestones: [
      { name: '需求分析完成', date: '2023-02-10', completed: true },
      { name: '系统设计完成', date: '2023-03-15', completed: true },
      { name: '核心模块开发', date: '2023-05-20', completed: false },
      { name: '系统上线', date: '2023-06-30', completed: false }
    ],
    timeRecords: [
      { date: '2023-05-01', user: '张三', hours: 8, task: '系统架构优化' },
      { date: '2023-05-02', user: '李四', hours: 6, task: '数据库设计' },
      { date: '2023-05-03', user: '王五', hours: 7, task: '前端界面开发' },
      { date: '2023-05-04', user: '赵六', hours: 8, task: '后端接口开发' }
    ]
  },
  {
    id: 2,
    projectId: 'EIT-2023-002',
    name: '数据分析平台建设',
    manager: '李四',
    startDate: '2023-03-01',
    endDate: '2023-09-30',
    startPosition: 25,
    duration: 40,
    color: '#3498db',
    plannedHours: 3600,
    usedHours: 1500,
    progress: 42,
    status: 'inProgress',
    budget: 800000,
    spent: 320000,
    estimatedCost: 750000,
    costVariance: -50000,
    description: '构建企业级数据分析平台，整合多源数据，提供实时分析与决策支持',
    milestones: [
      { name: '数据调研完成', date: '2023-03-20', completed: true },
      { name: '数据仓库搭建', date: '2023-05-30', completed: false },
      { name: '分析模型开发', date: '2023-08-15', completed: false },
      { name: '平台验收', date: '2023-09-30', completed: false }
    ],
    timeRecords: [
      { date: '2023-05-01', user: '李四', hours: 8, task: '数据模型设计' },
      { date: '2023-05-02', user: '王五', hours: 7, task: 'ETL流程开发' },
      { date: '2023-05-03', user: '赵六', hours: 6, task: '可视化组件开发' }
    ]
  },
  {
    id: 3,
    projectId: 'EIT-2023-003',
    name: '移动应用开发',
    manager: '王五',
    startDate: '2023-05-01',
    endDate: '2023-11-30',
    startPosition: 40,
    duration: 35,
    color: '#e74c3c',
    plannedHours: 1800,
    usedHours: 450,
    progress: 25,
    status: 'inProgress',
    budget: 300000,
    spent: 80000,
    estimatedCost: 290000,
    costVariance: -10000,
    description: '开发面向最终用户的移动应用，支持iOS和Android平台，提供便捷的业务操作功能',
    milestones: [
      { name: '原型设计完成', date: '2023-05-20', completed: false },
      { name: 'iOS版本开发', date: '2023-08-30', completed: false },
      { name: 'Android版本开发', date: '2023-09-30', completed: false },
      { name: '应用发布', date: '2023-11-30', completed: false }
    ],
    timeRecords: [
      { date: '2023-05-02', user: '王五', hours: 8, task: 'UI设计评审' },
      { date: '2023-05-03', user: '赵六', hours: 8, task: 'API接口对接' },
      { date: '2023-05-04', user: '张三', hours: 6, task: '前端框架搭建' }
    ]
  }
]);

// 过滤后的项目列表
const filteredProjects = computed<Project[]>(() => {
  if (!searchQuery.value) return projects.value;
  const query = searchQuery.value.toLowerCase();
  return projects.value.filter(project => 
    project.name.toLowerCase().includes(query) || 
    project.projectId.toLowerCase().includes(query) ||
    project.manager.toLowerCase().includes(query)
  );
});

// 当前激活的项目
const activeProject = computed<Project | undefined>(() => {
  return activeProjectId.value 
    ? projects.value.find(p => p.id === activeProjectId.value)
    : undefined;
});

// 甘特图时间轴
const timelineMonths = ref<string[]>([
  '1月', '2月', '3月', '4月', '5月', '6月', 
  '7月', '8月', '9月', '10月', '11月', '12月'
]);

// 图表数据
const financialChartData = computed<FinancialData[]>(() => {
  if (!activeProject.value) return [];
  return [
    { name: '1月', 预算: 50000, 实际: 45000 },
    { name: '2月', 预算: 60000, 实际: 58000 },
    { name: '3月', 预算: 70000, 实际: 65000 },
    { name: '4月', 预算: 65000, 实际: 62000 },
    { name: '5月', 预算: 75000, 实际: 70000 }
  ];
});

const hoursChartData = computed<HoursData[]>(() => {
  if (!activeProject.value) return [];
  return [
    { name: '张三', 工时: 160 },
    { name: '李四', 工时: 140 },
    { name: '王五', 工时: 180 },
    { name: '赵六', 工时: 120 }
  ];
});

// 方法
const handleProjectClick = (project: Project) => {
  activeProjectId.value = project.id;
};

const handleProjectNameClick = (project: Project) => {
  activeProjectId.value = project.id;
  isDetailOpen.value = true;
};

const closeDetailPanel = () => {
  isDetailOpen.value = false;
};

const handleColumnChange = (column: TableColumn) => {
  // 切换列的显示状态
  DataAnalysis.value[column].visible = !DataAnalysis.value[column].visible;
};

const canHide = (column: TableColumn): boolean => {
  // 确保至少保留一列可见
  const visibleCount = Object.values(DataAnalysis.value).filter(col => col.visible).length;
  return visibleCount > 1 || !DataAnalysis.value[column].visible;
};

const getUniqueManagers = (): string[] => {
  const managers = new Set<string>();
  projects.value.forEach(project => managers.add(project.manager));
  return Array.from(managers);
};

const getProgressColor = (progress: number): string => {
  if (progress < 30) return '#e74c3c';
  if (progress < 70) return '#f39c12';
  return '#42b983';
};

const getStatusLabel = (status: ProjectStatus): string => {
  const statusMap: Record<ProjectStatus, string> = {
    'notStarted': '未开始',
    'inProgress': '进行中',
    'completed': '已完成',
    'delayed': '已延期'
  };
  return statusMap[status] || status;
};

const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
};

const formatCurrency = (value: number): string => {
    // 确保输入是数字类型
    if (typeof value !== 'number' || isNaN(value)) {
    console.warn('Invalid currency value:', value);
    return '¥0';
  }
  return `¥${value.toLocaleString()}`;
};

const zoomIn = () => {
  if (zoomLevel.value < 2) zoomLevel.value += 0.2;
};

const zoomOut = () => {
  if (zoomLevel.value > 0.6) zoomLevel.value -= 0.2;
};

const handleTimeRangeChange = (range: string) => {
  timeRange.value = range as 'week' | 'month' | 'quarter' | 'year';
  // 根据时间范围调整甘特图显示
};

onMounted(() => {
  // 初始化逻辑
});
</script>

<style scoped>
.project-management-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  overflow: hidden;
}

.app-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;
  height: 60px;
  background-color: #1e88e5;
  color: white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  z-index: 10;
}

.logo {
  display: flex;
  align-items: center;
  font-size: 18px;
  font-weight: bold;
}

.logo :deep(.el-icon) {
  margin-right: 10px;
}

.header-actions {
  display: flex;
  align-items: center;
}

.main-content {
  display: flex;
  flex: 1;
  overflow: hidden;
  position: relative;
}

.project-list-container {
  width: 350px;
  border-right: 1px solid #eaecef;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.list-controls {
  padding: 12px 15px;
  border-bottom: 1px solid #eaecef;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.controls-right {
  display: flex;
  align-items: center;
}

.search-input {
  width: 180px;
  margin-left: 10px;
}

.project-table {
  flex: 1;
  overflow: auto;
}

.project-name {
  color: #1e88e5;
  cursor: pointer;
  text-decoration: underline;
}

.gantt-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background-color: #f9fafc;
}

.gantt-controls {
  padding: 12px 15px;
  border-bottom: 1px solid #eaecef;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.gantt-actions {
  display: flex;
  align-items: center;
}

.gantt-chart {
  flex: 1;
  overflow: auto;
  padding: 20px;
  position: relative;
}

.gantt-timeline {
  display: flex;
  margin-bottom: 10px;
  border-bottom: 2px solid #eaecef;
  padding-bottom: 5px;
}

.timeline-month {
  flex: 1;
  text-align: center;
  font-weight: bold;
  color: #666;
}

.gantt-row {
  height: 60px;
  margin-bottom: 10px;
  background-color: white;
  border-radius: 4px;
  position: relative;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  padding-left: 10px;
  display: flex;
  align-items: center;
}

.gantt-row-active {
  border: 1px solid #1e88e5;
}

.gantt-task-bar {
  height: 40px;
  border-radius: 4px;
  position: absolute;
  top: 10px;
  display: flex;
  align-items: center;
  padding: 0 10px;
  color: white;
  font-weight: bold;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.task-label {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
}

.detail-panel {
  position: absolute;
  top: 0;
  right: 0;
  width: 450px;
  height: 100%;
  background-color: white;
  box-shadow: -2px 0 10px rgba(0, 0, 0, 0.1);
  transform: translateX(100%);
  transition: transform 0.3s ease;
  z-index: 20;
  display: flex;
  flex-direction: column;
}

.panel-open {
  transform: translateX(0);
}

.panel-header {
  padding: 15px;
  border-bottom: 1px solid #eaecef;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.detail-tabs {
  flex: 1;
  overflow: auto;
  padding: 15px;
}

.progress-overview {
  margin-bottom: 20px;
}

.progress-stats {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
}

.stat-item {
  text-align: center;
  flex: 1;
  padding: 10px;
  background-color: #f5f7fa;
  border-radius: 4px;
  margin: 0 5px;
}

.stat-label {
  color: #666;
  font-size: 12px;
  margin-bottom: 5px;
}

.stat-value {
  font-size: 18px;
  font-weight: bold;
  color: #1e88e5;
}

.hours-chart {
  height: 200px;
}

.panel-mask {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.3s ease;
  z-index: 15;
}

.mask-visible {
  opacity: 1;
  pointer-events: auto;
}

/* 响应式调整 */
@media (max-width: 1200px) {
  .project-list-container {
    width: 300px;
  }
  
  .detail-panel {
    width: 400px;
  }
}

@media (max-width: 992px) {
  .project-list-container {
    width: 250px;
  }
  
  .detail-panel {
    width: 350px;
  }
}
</style>
    