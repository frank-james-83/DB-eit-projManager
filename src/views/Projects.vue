<template>
  <div class="project-management-container">
    <!-- 标题栏 -->
    <header class="app-header">
      <div class="logo">
        <i class="el-icon-sitemap"></i>
        <span>EIT项目管理系统</span>
      </div>
      <div class="header-actions">
        <div class="user-info">
          <span class="username">欢迎, {{ username }}</span>
          <span class="current-time">{{ currentTime }}</span>
        </div>
        <el-button type="primary" size="small"><el-icon>
            <Plus />
          </el-icon>新建项目</el-button>
        <el-dropdown>
          <el-button size="small" class="ml-2">
            <el-icon>
              <Setting />
            </el-icon>
            <el-icon>
              <ArrowDown />
            </el-icon>
          </el-button>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item>系统设置</el-dropdown-item>
              <el-dropdown-item>用户中心</el-dropdown-item>
              <el-dropdown-item @click="handleLogout">退出登录</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </header>

    <div class="main-content">
      <!-- 左侧项目列表 -->
      <ProjectList 
        :projects="projects"
        :columns="columns"
        :search-query="searchQuery"
        @update:searchQuery="searchQuery = $event"
        @project-click="handleProjectClick"
        @project-name-click="handleProjectNameClick"
        @column-change="handleColumnChange"
        @sort-change="handleSortChange"
        @filter-change="handleFilterChange"
      />

      <!-- 中间甘特图区域 -->
      <GanttChart
        :projects="filteredProjects"
        :time-range="timeRange"
        :date-range="dateRange"
        :active-project-id="activeProjectId"
        :sort-by="computedSortBy"
        @update:timeRange="timeRange = $event"
        @update:dateRange="handleDateRangeChange"
        @prev-time-range="prevTimeRange"
        @next-time-range="nextTimeRange"
        @time-range-change="handleTimeRangeChange"
        @period-edit="openPeriodEditDialog"
      />

      <!-- 右侧项目详情面板 -->
      <ProjectDetail
        :project="activeProject"
        :visible="isDetailOpen"
        @close="closeDetailPanel"
        @update-project="updateProject"
      />

      <!-- period 编辑弹窗 -->
      <el-dialog v-model="periodEditDialog.visible" title="编辑项目区间" width="600px" @close="closePeriodEditDialog">
        <el-table :data="periodEditDialog.periods" border size="small">
          <el-table-column prop="start" label="开始时间">
            <template #default="scope">
              <el-date-picker v-model="scope.row.start" type="date" size="small" />
            </template>
          </el-table-column>
          <el-table-column prop="end" label="结束时间">
            <template #default="scope">
              <el-date-picker v-model="scope.row.end" type="date" size="small" />
            </template>
          </el-table-column>
          <el-table-column prop="hours" label="工时">
            <template #default="scope">
              <el-input v-model.number="scope.row.hours" size="small" />
            </template>
          </el-table-column>
          <el-table-column prop="user" label="人员">
            <template #default="scope">
              <el-input v-model="scope.row.user" size="small" />
            </template>
          </el-table-column>
          <el-table-column prop="comment" label="备注">
            <template #default="scope">
              <el-input v-model="scope.row.comment" size="small" />
            </template>
          </el-table-column>
          <el-table-column label="操作" width="60">
            <template #default="scope">
              <el-button type="danger" size="small" icon="el-icon-delete" @click="removePeriod(scope.$index)"
                circle></el-button>
            </template>
          </el-table-column>
        </el-table>
        <div style="margin:10px 0;text-align:left;">
          <el-button type="primary" size="small" @click="addPeriod">新增区间</el-button>
        </div>
        <template #footer>
          <el-button @click="closePeriodEditDialog">取消</el-button>
          <el-button type="primary" @click="confirmPeriodEdit">确认</el-button>
        </template>
      </el-dialog>

      <!-- 遮罩层 -->
      <div class="panel-mask" :class="{ 'mask-visible': isDetailOpen }" @click="closeDetailPanel"></div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { getProjects as fetchProjects, addProject, updateProject } from '../api/project';
import ProjectList from '../components/ProjectList.vue';
import GanttChart from '../components/GanttChart.vue';
import ProjectDetail from '../components/ProjectDetail.vue';
import { 
  getProjectListSorting, 
  getProjectListFilters,
  getProjectListColumnSettings,
  saveProjectListSorting,
  saveProjectListFilters,
  saveProjectListColumnSettings,
  saveGanttChartViewMode,
  getGanttChartViewMode,
  saveGanttChartDateRange,
  getGanttChartDateRange,
  getCookie,
  setCookie
} from '../utils/cookies.js'

export default {
  name: 'Projects',
  components: {
    ProjectList,
    GanttChart,
    ProjectDetail
  },
  setup() {
    const router = useRouter();
    
    // 用户信息
    const username = ref('');
    const currentTime = ref('');
    let timeInterval = null;
    
    // 初始化用户信息
    const initUserInfo = () => {
      // 从localStorage获取用户名
      const userStr = localStorage.getItem('user');
      if (userStr) {
        try {
          const user = JSON.parse(userStr);
          username.value = user.username || '未知用户';
        } catch (e) {
          username.value = '未知用户';
        }
      } else {
        username.value = '未知用户';
      }
      
      // 更新时间
      updateTime();
    };
    
    // 更新当前时间
    const updateTime = () => {
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const day = String(now.getDate()).padStart(2, '0');
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      const seconds = String(now.getSeconds()).padStart(2, '0');
      currentTime.value = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    };
    
    // 开始时间更新定时器
    const startTimeUpdater = () => {
      if (timeInterval) {
        clearInterval(timeInterval);
      }
      timeInterval = setInterval(updateTime, 1000);
    };
    
    // 退出登录
    const handleLogout = () => {
      // 清除localStorage中的用户信息
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user');
      
      // 停止时间更新
      if (timeInterval) {
        clearInterval(timeInterval);
        timeInterval = null;
      }
      
      // 跳转到登录页面
      router.push('/login');
    };

    // 状态管理
    const searchQuery = ref('');
    const timeRange = ref('month');
    const dateRange = ref([new Date('2023-01-01'), new Date('2023-12-31')]);
    const isDetailOpen = ref(false);
    const activeProjectId = ref(null);
    const activeProject = computed(() => {
      return projects.value.find(p => p.id === activeProjectId.value) || null;
    });

    // 列显示控制配置
    const columns = ref({
      projectId: { visible: true },
      name: { visible: true },
      manager: { visible: true },
      budgetHours: { visible: true },
      plannedHours: { visible: true },
      usedHours: { visible: true },
      progress: { visible: true }
    });

    // 项目数据（后续用API获取）
    const projects = ref([]);

    // 示例：页面加载时获取项目列表
    onMounted(async () => {
      // 初始化用户信息
      initUserInfo();
      
      // 开始时间更新
      startTimeUpdater();
      
      // 从cookie中恢复设置
      loadSettingsFromCookies();
      
      projects.value = await fetchProjects();
    });
    
    // 组件卸载时清理定时器
    onUnmounted(() => {
      if (timeInterval) {
        clearInterval(timeInterval);
      }
    });

    // 排序和过滤状态
    const sortState = ref({ prop: '', order: '' });
    
    // 计算属性用于传递给甘特图的排序信息
    const computedSortBy = computed(() => {
      if (!sortState.value.prop || !sortState.value.order) {
        return { field: null, order: 0 };
      }
      
      // 将Element UI的排序值转换为甘特图组件需要的格式
      // Element UI使用 'ascending' 和 'descending'
      // 甘特图组件使用 1 表示升序，-1 表示降序
      const order = sortState.value.order === 'ascending' ? 1 : 
                   sortState.value.order === 'descending' ? -1 : 0;
      
      return {
        field: sortState.value.prop,
        order: order
      };
    });
    const filterState = ref({});

    // 监听设置变化并保存到cookie
    watch([columns, sortState, filterState, timeRange, dateRange], () => {
      saveSettingsToCookies();
    }, { deep: true });

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
      return arr;
    });

    // period编辑弹窗及相关方法
    const periodEditDialog = ref({ visible: false, projectId: null, periods: [] });
    
    function openPeriodEditDialog(project) {
      periodEditDialog.value.visible = true;
      periodEditDialog.value.projectId = project.id;
      periodEditDialog.value.periods = JSON.parse(JSON.stringify(project.periods || []));
    }
    
    function closePeriodEditDialog() {
      periodEditDialog.value.visible = false;
    }
    
    function addPeriod() {
      periodEditDialog.value.periods.push({ start: '', end: '', hours: 0, user: '', comment: '' });
    }
    
    function removePeriod(idx) {
      periodEditDialog.value.periods.splice(idx, 1);
    }
    
    function confirmPeriodEdit() {
      const pid = periodEditDialog.value.projectId;
      const idx = projects.value.findIndex(p => p.id === pid);
      if (idx !== -1) {
        projects.value[idx].periods = JSON.parse(JSON.stringify(periodEditDialog.value.periods));
      }
      periodEditDialog.value.visible = false;
    }

    // 方法
    const handleProjectClick = (project) => {
      activeProjectId.value = project.id;
    };

    const handleProjectNameClick = (project) => {
      activeProjectId.value = project.id;
      isDetailOpen.value = true;
      // 延迟一小段时间再显示图表，确保DOM已经渲染完成
      setTimeout(() => {
        // 触发一次更新以确保图表正确渲染
      }, 100);
    };

    const closeDetailPanel = () => {
      isDetailOpen.value = false;
    };

    const handleColumnChange = (column) => {
      // 切换列的显示状态
      columns.value[column].visible = !columns.value[column].visible;
    };

    const handleSortChange = ({ prop, order }) => {
      sortState.value = { prop, order };
    };
    
    const handleFilterChange = (filters) => {
      filterState.value = filters;
    };

    // 切换前/后时间区间
    function prevTimeRange() {
      if (timeRange.value === 'month') {
        // 月视图，整体往前推一个月
        const start = new Date(dateRange.value[0]);
        const end = new Date(dateRange.value[1]);
        start.setMonth(start.getMonth() - 1);
        end.setMonth(end.getMonth() - 1);
        dateRange.value = [start, end];
      } else if (timeRange.value === 'week') {
        // 周视图，整体往前推7天
        const start = new Date(dateRange.value[0]);
        const end = new Date(dateRange.value[1]);
        start.setDate(start.getDate() - 7);
        end.setDate(end.getDate() - 7);
        dateRange.value = [start, end];
      }
    }
    
    function nextTimeRange() {
      if (timeRange.value === 'month') {
        // 月视图，整体往后推一个月
        const start = new Date(dateRange.value[0]);
        const end = new Date(dateRange.value[1]);
        start.setMonth(start.getMonth() + 1);
        end.setMonth(end.getMonth() + 1);
        dateRange.value = [start, end];
      } else if (timeRange.value === 'week') {
        // 周视图，整体往后推7天
        const start = new Date(dateRange.value[0]);
        const end = new Date(dateRange.value[1]);
        start.setDate(start.getDate() + 7);
        end.setDate(end.getDate() + 7);
        dateRange.value = [start, end];
      }
    }
    
    function handleDateRangeChange(range) {
      if (range && range.length === 2) {
        dateRange.value = range;
      }
    }

    const handleTimeRangeChange = (range) => {
      timeRange.value = range;
      // 根据时间范围调整甘特图显示
    };

    const updateProject = (projectData) => {
      const idx = projects.value.findIndex(p => p.id === projectData.id);
      if (idx !== -1) {
        projects.value[idx] = JSON.parse(JSON.stringify(projectData));
      }
    };

    // 从cookie加载设置
    const loadSettingsFromCookies = () => {
      try {
        // 加载列设置
        const savedColumns = getProjectListColumnSettings();
        if (savedColumns) {
          Object.keys(savedColumns).forEach(key => {
            if (columns.value[key] !== undefined) {
              columns.value[key].visible = savedColumns[key].visible;
            }
          });
        }

        // 加载排序设置
        const savedSort = getProjectListSorting();
        if (savedSort) {
          sortState.value = savedSort;
        }

        // 加载过滤设置
        const savedFilters = getProjectListFilters();
        if (savedFilters) {
          filterState.value = savedFilters;
        }

        // 加载搜索查询
        const savedSearchQuery = getCookie('projectListSearchQuery');
        if (savedSearchQuery) {
          try {
            // 如果使用了JSON.stringify保存，需要解析
            searchQuery.value = JSON.parse(savedSearchQuery);
          } catch (e) {
            // 如果不是JSON格式，直接使用原始值
            searchQuery.value = savedSearchQuery;
          }
        }

        // 加载甘特图时间范围设置
        const savedTimeRange = getGanttChartViewMode();
        if (savedTimeRange) {
          timeRange.value = savedTimeRange;
        }

        // 加载甘特图日期范围设置
        const savedDateRange = getGanttChartDateRange();
        if (savedDateRange) {
          if (Array.isArray(savedDateRange) && savedDateRange.length === 2) {
            dateRange.value = [
              new Date(savedDateRange[0]),
              new Date(savedDateRange[1])
            ];
          }
        }
      } catch (e) {
        console.error('加载设置时出错:', e);
      }
    };

    // 保存设置到cookie
    const saveSettingsToCookies = () => {
      saveProjectListSorting(sortState.value);
      saveProjectListFilters(filterState.value);
      saveProjectListColumnSettings(columns.value);
      saveGanttChartViewMode(timeRange.value);
      if (dateRange.value && dateRange.value.length === 2) {
        saveGanttChartDateRange([dateRange.value[0].getTime(), dateRange.value[1].getTime()]);
      }
      setCookie('projectListSearchQuery', searchQuery.value);
    };

    return {
      searchQuery,
      timeRange,
      dateRange,
      isDetailOpen,
      activeProjectId,
      activeProject,
      columns,
      projects,
      filteredProjects,
      sortState,
      filterState,
      periodEditDialog,
      computedSortBy,
      handleProjectClick,
      handleProjectNameClick,
      closeDetailPanel,
      handleColumnChange,
      handleSortChange,
      handleFilterChange,
      prevTimeRange,
      nextTimeRange,
      handleDateRangeChange,
      handleTimeRangeChange,
      openPeriodEditDialog,
      closePeriodEditDialog,
      addPeriod,
      removePeriod,
      confirmPeriodEdit,
      updateProject,
      // 用户信息相关
      username,
      currentTime,
      handleLogout
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

.user-info {
  display: flex;
  flex-direction: column;
  margin-right: 20px;
  font-size: 14px;
  text-align: right;
}

.username {
  font-weight: bold;
  margin-bottom: 2px;
}

.current-time {
  font-size: 12px;
  opacity: 0.9;
}

.main-content {
  display: flex;
  flex: 1 1 0%;
  min-width: 0;
  width: 100%;
  overflow: hidden;
  position: relative;
  box-sizing: border-box;
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