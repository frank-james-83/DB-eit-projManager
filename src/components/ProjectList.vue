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
        <el-input placeholder="搜索项目" size="small" :value="searchQuery" class="search-input" @input="handleSearchInput">
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

      <el-table-column v-if="columns.plannedHours.visible" prop="plannedHours" column-key="plannedHours"
        label="计划工时" sortable></el-table-column>

      <el-table-column v-if="columns.usedHours.visible" prop="usedHours" column-key="usedHours" label="已用工时"
        sortable></el-table-column>

      <el-table-column v-if="columns.progress.visible" prop="progress" column-key="progress" label="进度" sortable>
        <template #default="scope">
          <el-progress :percentage="scope.row.progress" :stroke-width="6"
            :stroke-color="getProgressColor(scope.row.progress)"></el-progress>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script>
import { ref, computed } from 'vue'

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
      required: true
    }
  },
  emits: ['update:searchQuery', 'project-click', 'project-name-click', 'column-change', 'sort-change', 'filter-change'],
  setup(props, { emit }) {
    // 过滤后的项目列表
    const filteredProjects = computed(() => {
      let arr = props.projects;
      // 搜索框过滤
      if (props.searchQuery) {
        const query = props.searchQuery.toLowerCase();
        arr = arr.filter(project =>
          project.name.toLowerCase().includes(query) ||
          project.projectId.toLowerCase().includes(query) ||
          project.manager.toLowerCase().includes(query)
        );
      }
      
      return arr;
    });

    // 方法
    const handleProjectClick = (project) => {
      emit('project-click', project);
    };

    const handleProjectNameClick = (project) => {
      emit('project-name-click', project);
    };

    const handleColumnChange = (column) => {
      emit('column-change', column);
    };

    const handleSearchInput = (value) => {
      emit('update:searchQuery', value);
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
      emit('sort-change', { prop, order });
    };
    
    const handleFilterChange = (filters) => {
      emit('filter-change', filters);
    };

    return {
      filteredProjects,
      handleProjectClick,
      handleProjectNameClick,
      handleColumnChange,
      handleSearchInput,
      canHide,
      getUniqueManagers,
      getProgressColor,
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

/* 表格内容强制单行显示，防止因换行导致行高变化 */
.project-table .el-table__cell {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>