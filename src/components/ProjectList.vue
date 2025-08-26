<template>
  <div class="project-list-container">
    <div class="list-controls">
      <h2>项目列表</h2>
      <div class="controls-right">
        <!-- 列显示控制 -->
        <el-dropdown trigger="click">
          <el-button size="small">
            <el-icon>
              <DataAnalysis />
            </el-icon>
            列设置
          </el-button>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="projectId" :disabled="!canHide('projectId')">
                <el-checkbox :model-value="columns.projectId.visible"
                  @change="() => handleColumnChange('projectId')">项目编号</el-checkbox>
              </el-dropdown-item>
              <el-dropdown-item command="name" :disabled="!canHide('name')">
                <el-checkbox :model-value="columns.name.visible"
                  @change="() => handleColumnChange('name')">项目名称</el-checkbox>
              </el-dropdown-item>
              <el-dropdown-item command="manager" :disabled="!canHide('manager')">
                <el-checkbox :model-value="columns.manager.visible"
                  @change="() => handleColumnChange('manager')">项目经理</el-checkbox>
              </el-dropdown-item>
              <el-dropdown-item command="budgetHours" :disabled="!canHide('budgetHours')">
                <el-checkbox :model-value="columns.budgetHours.visible"
                  @change="() => handleColumnChange('budgetHours')">预算工时</el-checkbox>
              </el-dropdown-item>
              <el-dropdown-item command="plannedHours" :disabled="!canHide('plannedHours')">
                <el-checkbox :model-value="columns.plannedHours.visible"
                  @change="() => handleColumnChange('plannedHours')">计划工时</el-checkbox>
              </el-dropdown-item>
              <el-dropdown-item command="usedHours" :disabled="!canHide('usedHours')">
                <el-checkbox :model-value="columns.usedHours.visible"
                  @change="() => handleColumnChange('usedHours')">已用工时</el-checkbox>
              </el-dropdown-item>
              <el-dropdown-item command="progress" :disabled="!canHide('progress')">
                <el-checkbox :model-value="columns.progress.visible"
                  @change="() => handleColumnChange('progress')">进度</el-checkbox>
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>

        <!-- 搜索框 -->
        <el-input 
          placeholder="搜索项目" 
          size="small" 
          v-model="localSearchQuery" 
          class="search-input" 
          @input="handleSearchInput">
          <el-button slot="append" size="small"><el-icon>
              <Search />
            </el-icon></el-button>
        </el-input>
      </div>
    </div>

    <!-- 项目表格 -->
    <el-table :data="filteredProjects" border size="small" :row-style="{ height: '40px' }"
      @row-click="handleProjectClick" @sort-change="handleSortChange" @filter-change="handleFilterChange"
      class="project-table">
      <el-table-column v-if="columns.projectId.visible" prop="projectId" column-key="projectId" label="项目编号"
        sortable :filters="[{ text: 'EIT-2023', value: 'EIT-2023' }, { text: 'EIT-2024', value: 'EIT-2024' }]"
        :filter-method="(value, row) => row.projectId.includes(value)"></el-table-column>

      <el-table-column v-if="columns.name.visible" prop="name" column-key="name" label="项目名称" sortable
        :filter-method="(value, row) => row.name.includes(value)">
        <template #default="scope">
          <span class="project-name" @click.stop="handleProjectNameClick(scope.row)">{{ scope.row.name }}</span>
        </template>
      </el-table-column>

      <el-table-column v-if="columns.manager.visible" prop="manager" column-key="manager" label="项目经理" sortable
        :filters="getUniqueManagers().map(m => ({ text: m, value: m }))"
        :filter-method="(value, row) => row.manager === value"></el-table-column>

      <el-table-column v-if="columns.budgetHours.visible" prop="budgetHours" column-key="budgetHours"
        label="预算工时" sortable></el-table-column>

      <el-table-column v-if="columns.plannedHours.visible" prop="plannedHours" column-key="plannedHours"
        label="计划工时" sortable></el-table-column>

      <el-table-column v-if="columns.usedHours.visible" prop="usedHours" column-key="usedHours" label="已用工时"
        sortable></el-table-column>

      <el-table-column v-if="columns.progress.visible" prop="progress" column-key="progress" label="进度" sortable>
        <template #default="scope">
          <div class="progress-cell">
            <el-progress 
              :percentage="calculateProgressPercentage(scope.row.usedHours, scope.row.plannedHours)" 
              :stroke-width="6"
              :stroke-color="getProgressColor(calculateProgressPercentage(scope.row.usedHours, scope.row.plannedHours))"
              :text-inside="false"
              :show-text="true">
            </el-progress>
          </div>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script>
import { ref, computed, onMounted, watch } from 'vue'
import { 
  getProjectListSorting, 
  getProjectListFilters,
  saveProjectListSorting,
  saveProjectListFilters
} from '../utils/cookies'

export default {
  name: 'ProjectList',
  props: {
    projects: {
      type: Array,
      required: true
    },
    columns: {
      type: Object,
      required: true
    },
    searchQuery: {
      type: String,
      required: false,
      default: ''
    }
  },
  emits: ['update:searchQuery', 'project-click', 'project-name-click', 'column-change', 'sort-change', 'filter-change'],
  setup(props, { emit }) {
    // 本地搜索查询状态
    const localSearchQuery = ref(props.searchQuery || '');
    
    // 监听 props.searchQuery 的变化并同步到本地状态
    watch(() => props.searchQuery, (newVal) => {
      localSearchQuery.value = newVal || '';
    });

    // 本地排序和过滤状态
    const localSortState = ref({ prop: '', order: '' });
    const localFilterState = ref({});

    // 计算计划工时（所有periods.hours的总和）
    const calculatePlannedHours = (project) => {
      if (!project.periods || !Array.isArray(project.periods)) {
        return 0;
      }
      return project.periods.reduce((total, period) => total + (period.hours || 0), 0);
    };

    // 计算已用工时（根据ProjectDetail.vue中的实际工时计算逻辑）
    const calculateUsedHours = (project) => {
      if (!project.periods || !Array.isArray(project.periods)) {
        return 0;
      }
      
      const now = new Date();
      let totalUsedHours = 0;
      
      project.periods.forEach(period => {
        const periodEnd = new Date(period.end);
        
        // 如果结束日期在当前日期之前，则全部为实际工时
        if (periodEnd < now) {
          totalUsedHours += period.hours || 0;
          return;
        }
        
        // 如果结束日期在当前日期之后，则按比例计算
        const periodStart = new Date(period.start);
        const totalTime = periodEnd.getTime() - periodStart.getTime();
        
        // 如果任务还没开始，实际工时为0
        if (periodStart > now) {
          return;
        }
        
        // 计算到当前时间已完成的部分
        const elapsed = now.getTime() - periodStart.getTime();
        const ratio = Math.min(1, Math.max(0, elapsed / totalTime));
        totalUsedHours += Math.round((period.hours || 0) * ratio);
      });
      
      return totalUsedHours;
    };

    // 过滤后的项目列表
    const filteredProjects = computed(() => {
      let arr = props.projects.map(project => {
        // 计算计划工时和已用工时
        const plannedHours = calculatePlannedHours(project);
        const usedHours = calculateUsedHours(project);
        // 计算进度百分比
        const progress = calculateProgressPercentage(usedHours, plannedHours);
        
        return {
          ...project,
          plannedHours,
          usedHours,
          progress
        };
      });
      
      // 搜索框过滤
      if (localSearchQuery.value) {
        const query = localSearchQuery.value.toLowerCase();
        arr = arr.filter(project =>
          project.name.toLowerCase().includes(query) ||
          project.projectId.toLowerCase().includes(query) ||
          project.manager.toLowerCase().includes(query)
        );
      }
      
      // 表头过滤
      Object.entries(localFilterState.value).forEach(([prop, values]) => {
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
      if (localSortState.value.prop && localSortState.value.order) {
        arr = [...arr].sort((a, b) => {
          const prop = localSortState.value.prop;
          if (localSortState.value.order === 'ascending') {
            return a[prop] > b[prop] ? 1 : a[prop] < b[prop] ? -1 : 0;
          } else {
            return a[prop] < b[prop] ? 1 : a[prop] > b[prop] ? -1 : 0;
          }
        });
      }
      
      return arr;
    });

    // 页面加载时恢复排序和过滤状态
    onMounted(() => {
      try {
        // 加载排序设置
        const savedSort = getProjectListSorting();
        if (savedSort) {
          localSortState.value = savedSort;
        }

        // 加载过滤设置
        const savedFilters = getProjectListFilters();
        if (savedFilters) {
          localFilterState.value = savedFilters;
        }
      } catch (e) {
        console.error('加载项目列表设置时出错:', e);
      }
    });

    // 监听排序和过滤状态变化并保存到cookie
    watch([localSortState, localFilterState], () => {
      try {
        saveProjectListSorting(localSortState.value);
        saveProjectListFilters(localFilterState.value);
      } catch (e) {
        console.error('保存项目列表设置时出错:', e);
      }
    }, { deep: true });

    // 方法
    const calculateProgressPercentage = (usedHours, plannedHours) => {
      if (!plannedHours || plannedHours === 0) return 0;
      const percentage = Math.round((usedHours / plannedHours) * 100);
      return Math.min(100, Math.max(0, percentage));
    };

    const handleProjectClick = (project) => {
      emit('project-click', project);
    };

    const handleProjectNameClick = (project) => {
      emit('project-name-click', project);
    };

    const handleColumnChange = (column) => {
      emit('column-change', column);
    };

    const canHide = (column) => {
      // 确保至少保留一列可见
      const visibleCount = Object.values(props.columns).filter(col => col.visible).length;
      return visibleCount > 1 || !props.columns[column].visible;
    };

    const getUniqueManagers = () => {
      const managers = new Set();
      props.projects.forEach(project => managers.add(project.manager));
      return Array.from(managers);
    };

    const getProgressColor = (progress) => {
      if (progress < 30) return '#e74c3c';
      if (progress < 70) return '#f39c12';
      return '#42b983';
    };

    const handleSortChange = ({ prop, order }) => {
      // 确保prop存在且order是ascending或descending
      if (prop && (order === 'ascending' || order === 'descending')) {
        localSortState.value = { prop, order };
        emit('sort-change', { prop, order });
      } else {
        // 如果没有排序信息，清空排序状态
        localSortState.value = { prop: '', order: '' };
        emit('sort-change', { prop: '', order: '' });
      }
    };
    
    const handleFilterChange = (filters) => {
      localFilterState.value = filters;
      emit('filter-change', filters);
    };

    const handleSearchInput = (value) => {
      emit('update:searchQuery', value);
    };

    return {
      localSearchQuery,
      filteredProjects,
      handleProjectClick,
      handleProjectNameClick,
      handleColumnChange,
      handleSearchInput,
      canHide,
      getUniqueManagers,
      getProgressColor,
      calculateProgressPercentage,
      handleSortChange,
      handleFilterChange
    };
  }
};
</script>

<style scoped>
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

.progress-cell {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  width: 100%;
}

.progress-cell :deep(.el-progress) {
  width: 100%;
}

/* 表格内容强制单行显示，防止因换行导致行高变化 */
.project-table .el-table__cell {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>