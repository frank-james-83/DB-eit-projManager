<template>
  <div class="project-management-container">
    <!-- 标题栏 -->
    <header class="app-header">
      <div class="logo">
        <i class="el-icon-sitemap"></i>
        <span>EIT项目管理系统</span>
      </div>
      <div class="header-actions">
        <el-button type="primary" size="small"><el-icon><Plus /></el-icon>新建项目</el-button>
        <el-dropdown>
          <el-button size="small" class="ml-2">
            <el-icon><Setting /></el-icon>
            <el-icon><ArrowDown /></el-icon>
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
            <el-dropdown trigger="click">
              <el-button size="small">
                <el-icon><DataAnalysis /></el-icon>
                列设置
              </el-button>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="projectId" :disabled="!canHide('projectId')">
                    <el-checkbox :model-value="columns.projectId.visible" @change="() => handleColumnChange('projectId')">项目编号</el-checkbox>
                  </el-dropdown-item>
                  <el-dropdown-item command="name" :disabled="!canHide('name')">
                    <el-checkbox :model-value="columns.name.visible" @change="() => handleColumnChange('name')">项目名称</el-checkbox>
                  </el-dropdown-item>
                  <el-dropdown-item command="manager" :disabled="!canHide('manager')">
                    <el-checkbox :model-value="columns.manager.visible" @change="() => handleColumnChange('manager')">项目经理</el-checkbox>
                  </el-dropdown-item>
                  <el-dropdown-item command="plannedHours" :disabled="!canHide('plannedHours')">
                    <el-checkbox :model-value="columns.plannedHours.visible" @change="() => handleColumnChange('plannedHours')">计划工时</el-checkbox>
                  </el-dropdown-item>
                  <el-dropdown-item command="usedHours" :disabled="!canHide('usedHours')">
                    <el-checkbox :model-value="columns.usedHours.visible" @change="() => handleColumnChange('usedHours')">已用工时</el-checkbox>
                  </el-dropdown-item>
                  <el-dropdown-item command="progress" :disabled="!canHide('progress')">
                    <el-checkbox :model-value="columns.progress.visible" @change="() => handleColumnChange('progress')">进度</el-checkbox>
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
              <el-button slot="append" size="small"><el-icon><Search /></el-icon></el-button>
            </el-input>
          </div>
        </div>
        
        <!-- 项目表格 -->
        <el-table 
          :data="filteredProjects" 
          border 
          size="small"
          :row-style="{ height: '40px' }"
          @row-click="handleProjectClick"
          @sort-change="handleSortChange"
          @filter-change="handleFilterChange"
          class="project-table"
        >
          <el-table-column 
            v-if="columns.projectId.visible"
            prop="projectId" 
            column-key="projectId"
            label="项目编号" 
            sortable
            :filters="[{text: 'EIT-2023', value: 'EIT-2023'}, {text: 'EIT-2024', value: 'EIT-2024'}]"
            :filter-method="(value, row) => row.projectId.includes(value)"
          ></el-table-column>
          
          <el-table-column 
            v-if="columns.name.visible"
            prop="name" 
            column-key="name"
            label="项目名称" 
            sortable
            :filter-method="(value, row) => row.name.includes(value)"
          >
            <template #default="scope">
              <span class="project-name" @click.stop="handleProjectNameClick(scope.row)">{{ scope.row.name }}</span>
            </template>
          </el-table-column>
          
          <el-table-column 
            v-if="columns.manager.visible"
            prop="manager" 
            column-key="manager"
            label="项目经理" 
            sortable
            :filters="getUniqueManagers().map(m => ({text: m, value: m}))"
            :filter-method="(value, row) => row.manager === value"
          ></el-table-column>
          
          <el-table-column 
            v-if="columns.plannedHours.visible"
            prop="plannedHours" 
            column-key="plannedHours"
            label="计划工时" 
            sortable
          ></el-table-column>
          
          <el-table-column 
            v-if="columns.usedHours.visible"
            prop="usedHours" 
            column-key="usedHours"
            label="已用工时" 
            sortable
          ></el-table-column>
          
          <el-table-column 
            v-if="columns.progress.visible"
            prop="progress" 
            column-key="progress"
            label="进度" 
            sortable
          >
            <template #default="scope">
              <el-progress 
                :percentage="scope.row.progress" 
                :stroke-width="6"
                :stroke-color="getProgressColor(scope.row.progress)"
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
              <el-button  @click="zoomOut"><el-icon><ZoomOut /></el-icon></el-button>
              <el-button  @click="zoomIn"> <el-icon><ZoomIn /></el-icon></el-button>
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
              class="ml-2 gantt-date-picker"
              style="min-width: 260px; width: 320px;"
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
            size="small" 
            @click="closeDetailPanel"
          ><el-icon><Close /></el-icon></el-button>
        </div>
        
        <el-tabs v-if="activeProject" type="card" class="detail-tabs" v-model="activeTab">
          <el-tab-pane label="基本信息" name="basic">
            <el-descriptions :column="1" border>
              <el-descriptions-item label="项目编号">{{ activeProject.projectId }}</el-descriptions-item>
              <el-descriptions-item label="项目名称">{{ activeProject.name }}</el-descriptions-item>
              <el-descriptions-item label="项目经理">{{ activeProject.manager }}</el-descriptions-item>
              <el-descriptions-item label="开始日期">{{ formatDate(activeProject.startDate) }}</el-descriptions-item>
              <el-descriptions-item label="结束日期">{{ formatDate(activeProject.endDate) }}</el-descriptions-item>
              <el-descriptions-item label="状态">{{ getStatusLabel(activeProject.status) }}</el-descriptions-item>
              <el-descriptions-item label="项目描述">{{ activeProject.description }}</el-descriptions-item>
            </el-descriptions>
          </el-tab-pane>
          <el-tab-pane label="财务数据" name="financial">
            <el-descriptions :column="2" border>
              <el-descriptions-item label="预算金额">{{ formatCurrency(activeProject.budget) }}</el-descriptions-item>
              <el-descriptions-item label="已使用金额">{{ formatCurrency(activeProject.spent) }}</el-descriptions-item>
              <el-descriptions-item label="预计总成本">{{ formatCurrency(activeProject.estimatedCost) }}</el-descriptions-item>
              <el-descriptions-item label="成本偏差">{{ formatCurrency(activeProject.costVariance) }}</el-descriptions-item>
            </el-descriptions>
            <v-chart :option="financialChartOption" autoresize class="mt-4" style="height: 300px;" v-show="true"></v-chart>
          </el-tab-pane>
          
          <el-tab-pane label="进度跟踪" name="progress">
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
                :stroke-width="8"
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
          
          <el-tab-pane label="工时统计" name="hours">
            <el-table :data="activeProject.timeRecords" border size="small">
              <el-table-column prop="date" label="日期"></el-table-column>
              <el-table-column prop="user" label="人员"></el-table-column>
              <el-table-column prop="hours" label="工时"></el-table-column>
              <el-table-column prop="task" label="任务描述"></el-table-column>
            </el-table>
            
            <v-chart :option="hoursChartOption" autoresize class="mt-4" style="height: 300px;" v-if="activeTab === 'hours'"></v-chart>
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

<script>
import { ref, computed, onMounted } from 'vue';
import { fetchProjects, addProject, updateProject, deleteProject } from './api/project';

export default {
  name: 'ProjectManagement',
  filters: {
    currency(value) {
      return `¥${value.toLocaleString()}`;
    }
  },
  setup() {
    // 状态管理
    const searchQuery = ref('');
    const timeRange = ref('month');
    const dateRange = ref([new Date('2023-01-01'), new Date('2023-12-31')]);
    const zoomLevel = ref(1);
    const isDetailOpen = ref(false);
    const activeProjectId = ref(null);
    const activeTab = ref('basic'); // 添加这一行
    const activeProject = computed(() => {
      return projects.value.find(p => p.id === activeProjectId.value) || null;
    });
    
    // 列显示控制配置
    const columns = ref({
      projectId: { visible: true },
      name: { visible: true },
      manager: { visible: true },
      plannedHours: { visible: true },
      usedHours: { visible: true },
      progress: { visible: true }
    });
    
    // 项目数据（后续用API获取）
    const projects = ref([]);

    // 示例：页面加载时获取项目列表
    onMounted(async () => {
      projects.value = await fetchProjects();
    });
    
    // 排序和过滤状态
    const sortState = ref({ prop: '', order: '' });
    const filterState = ref({});

    // 过滤+排序后的项目列表
    const filteredProjects = computed(() => {
      let arr = projects.value;
      // 搜索框过滤
      if (searchQuery.value) {
        const query = searchQuery.value.toLowerCase();
        arr = arr.filter(project => 
          project.name.toLowerCase().includes(query) || 
          project.projectId.toLowerCase().includes(query) ||
          project.manager.toLowerCase().includes(query)
        );
      }
      // 表头过滤
      Object.entries(filterState.value).forEach(([prop, values]) => {
        if (!Array.isArray(values) || values.length === 0) {
          // 不过滤该字段
          return;
        }
        arr = arr.filter(row => {
          const rowValue = row[prop] !== undefined && row[prop] !== null ? row[prop].toString().trim() : '';
          const match = values.map(v => v !== undefined && v !== null ? v.toString().trim() : '').includes(rowValue);
          console.log(`[过滤测试] prop: ${prop}, rowValue: '${rowValue}', values:`, values, 'match:', match, 'row:', row);
          return match;
        });
      });
      // 排序
      if (sortState.value.prop && sortState.value.order) {
        arr = [...arr].sort((a, b) => {
          const prop = sortState.value.prop;
          if (sortState.value.order === 'ascending') {
            return a[prop] > b[prop] ? 1 : a[prop] < b[prop] ? -1 : 0;
          } else {
            return a[prop] < b[prop] ? 1 : a[prop] > b[prop] ? -1 : 0;
          }
        });
      }
      console.log('[filteredProjects] 当前排序:', sortState.value, '过滤:', filterState.value, '结果:', arr.map(p => p.name));
      return arr;
    });

    // 监听表格排序
    const handleSortChange = ({ prop, order }) => {
      sortState.value = { prop, order };
      console.log('[handleSortChange] 排序字段:', prop, '顺序:', order);
    };
    // 监听表格过滤
    const handleFilterChange = (filters) => {
      filterState.value = filters;
      console.log('[handleFilterChange] 过滤条件:', filters);
    };
    
    // 甘特图时间轴
    const timelineMonths = ref([
      '1月', '2月', '3月', '4月', '5月', '6月', 
      '7月', '8月', '9月', '10月', '11月', '12月'
    ]);
    
    // 图表数据
    const financialChartData = computed(() => {
      if (!activeProject.value) return [];
      return [
        { name: '1月', 预算: 50000, 实际: 45000 },
        { name: '2月', 预算: 60000, 实际: 58000 },
        { name: '3月', 预算: 70000, 实际: 65000 },
        { name: '4月', 预算: 65000, 实际: 62000 },
        { name: '5月', 预算: 75000, 实际: 70000 }
      ];
    });

    // 财务图表配置
    const financialChartOption = computed(() => {
      if (!activeProject.value) return {}
      
      return {
        title: {
          text: '财务数据趋势'
        },
        tooltip: {
          trigger: 'axis'
        },
        legend: {
          data: ['预算', '实际']
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true
        },
        xAxis: {
          type: 'category',
          boundaryGap: false,
          data: ['1月', '2月', '3月', '4月', '5月']
        },
        yAxis: {
          type: 'value'
        },
        series: [
          {
            name: '预算',
            type: 'line',
            data: [50000, 60000, 70000, 65000, 75000]
          },
          {
            name: '实际',
            type: 'line',
            data: [45000, 58000, 65000, 62000, 70000]
          }
        ]
      }
    })
    
    const hoursChartData = computed(() => {
      if (!activeProject.value) return [];
      return [
        { name: '张三', 工时: 160 },
        { name: '李四', 工时: 140 },
        { name: '王五', 工时: 180 },
        { name: '赵六', 工时: 120 }
      ];
    });

    // 工时图表配置
    const hoursChartOption = computed(() => {
      if (!activeProject.value || !activeProject.value.timeRecords) return {}

      // 统计每个人的工时总和
      const userHoursMap = {};
      activeProject.value.timeRecords.forEach(record => {
        if (!userHoursMap[record.user]) {
          userHoursMap[record.user] = 0;
        }
        userHoursMap[record.user] += record.hours;
      });
      const users = Object.keys(userHoursMap);
      const hours = users.map(user => userHoursMap[user]);

      return {
        title: {
          text: '人员工时统计'
        },
        tooltip: {
          trigger: 'axis'
        },
        xAxis: {
          type: 'category',
          data: users
        },
        yAxis: {
          type: 'value',
          name: '工时(小时)'
        },
        series: [
          {
            data: hours,
            type: 'bar',
            itemStyle: {
              color: '#1e88e5'
            }
          }
        ]
      }
    })
    
    // 方法
    const handleProjectClick = (project) => {
      activeProjectId.value = project.id;
    };
    
    const handleProjectNameClick = (project) => {
      activeProjectId.value = project.id;
      isDetailOpen.value = true;
    };
    
    const closeDetailPanel = () => {
      isDetailOpen.value = false;
    };
    
    const handleColumnChange = (column) => {
      // 切换列的显示状态
      columns.value[column].visible = !columns.value[column].visible;
    };
    
    const canHide = (column) => {
      // 确保至少保留一列可见
      const visibleCount = Object.values(columns.value).filter(col => col.visible).length;
      console.log('Visible count:', visibleCount, 'Current column:', column, 'Is visible:', columns.value[column].visible); // 添加调试日志
      return visibleCount > 1 || !columns.value[column].visible;
    };
    
    const getUniqueManagers = () => {
      const managers = new Set();
      projects.value.forEach(project => managers.add(project.manager));
      return Array.from(managers);
    };
    
    const getProgressColor = (progress) => {
      if (progress < 30) return '#e74c3c';
      if (progress < 70) return '#f39c12';
      return '#42b983';
    };
    
    const getStatusLabel = (status) => {
      const statusMap = {
        'notStarted': '未开始',
        'inProgress': '进行中',
        'completed': '已完成',
        'delayed': '已延期'
      };
      return statusMap[status] || status;
    };
    
    const formatDate = (dateString) => {
      const date = new Date(dateString);
      return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
    };
    
    const formatCurrency = (value) => {
      return `¥${value.toLocaleString()}`;
    };
    const zoomIn = () => {
      if (zoomLevel.value < 2) zoomLevel.value += 0.2;
    };
    
    const zoomOut = () => {
      if (zoomLevel.value > 0.6) zoomLevel.value -= 0.2;
    };
    
    const handleTimeRangeChange = (range) => {
      timeRange.value = range;
      // 根据时间范围调整甘特图显示
    };
    
    onMounted(() => {
      // 初始化逻辑
    });
    
    return {
      searchQuery,
      timeRange,
      dateRange,
      zoomLevel,
      isDetailOpen,
      activeProjectId,
      activeProject,
      activeTab,
      columns,
      projects,
      filteredProjects,
      timelineMonths,
      financialChartData,
      financialChartOption,
      hoursChartData,
      hoursChartOption,
      handleProjectClick,
      handleProjectNameClick,
      closeDetailPanel,
      handleColumnChange,
      canHide,
      getUniqueManagers,
      getProgressColor,
      getStatusLabel,
      formatDate,
      formatCurrency,
      zoomIn,
      zoomOut,
  handleTimeRangeChange,
  handleSortChange,
  handleFilterChange
    };
  }
};
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

.logo i {
  margin-right: 10px;
  font-size: 24px;
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
  width: 500px;
  border-right: 1px solid #eaecef;
  display: flex;
  flex-direction: column;
  overflow-x: auto;
  overflow-y: auto;
  min-width: 0;
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
  min-width: max-content;
  width: 100%;
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

.gantt-actions .el-button-group {
  display: flex
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
  height: 40px;
  margin-bottom: 10px;
  background-color: white;
  border-radius: 4px;
  position: relative;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  padding-left: 10px;
  display: flex;
  align-items: center;
  overflow: hidden;
}

.gantt-row-active {
  border: 1px solid #1e88e5;
}

.gantt-task-bar {
  height: 24px;
  border-radius: 4px;
  position: absolute;
  top: 8px;
  bottom: 8px;
  display: flex;
  align-items: center;
  padding: 0 10px;
  color: white;
  font-weight: bold;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}
/* 表格内容强制单行显示，防止因换行导致行高变化 */
.project-table .el-table__cell {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
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
