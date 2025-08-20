<template>
  <div class="detail-panel" :class="{ 'panel-open': visible }">
    <div class="panel-header">
      <h2>{{ project?.name || '项目详情' }}</h2>
      <el-button size="small" @click="closePanel"><el-icon>
          <Close />
        </el-icon></el-button>
    </div>

    <!-- <el-tabs v-if="project" type="card" class="detail-tabs" :value="activeTab" @input="handleTabChange"> -->
    <el-tabs v-if="project" type="card" class="detail-tabs" v-model="activeTab">
      <!-- 基本信息 -->
      <el-tab-pane label="基本信息" name="basic">
        <div style="display: flex; justify-content: flex-end; margin-bottom: 10px;">
          <el-button size="small" @click="toggleEdit('basic')">{{ editMode.basic ? '保存' : '编辑' }}</el-button>
          <el-button v-if="editMode.basic" size="small" @click="cancelEdit('basic')">取消</el-button>
        </div>
        <el-descriptions :column="1" border v-if="!editMode.basic">
          <el-descriptions-item label="项目编号">{{ projectEdit.projectId }}</el-descriptions-item>
          <el-descriptions-item label="项目名称">{{ projectEdit.name }}</el-descriptions-item>
          <el-descriptions-item label="项目经理">{{ projectEdit.manager }}</el-descriptions-item>
          <el-descriptions-item label="开始日期">{{ formatDate(projectEdit.startDate) }}</el-descriptions-item>
          <el-descriptions-item label="结束日期">{{ formatDate(projectEdit.endDate) }}</el-descriptions-item>
          <el-descriptions-item label="状态">{{ getStatusLabel(projectEdit.status) }}</el-descriptions-item>
          <el-descriptions-item label="项目描述">{{ projectEdit.description }}</el-descriptions-item>
        </el-descriptions>
        <el-form v-else :model="projectEdit" label-width="80px" label-position="left">
          <el-form-item label="项目编号"><el-input :value="projectEdit.projectId" @input="val => updateProjectEdit('projectId', val)" /></el-form-item>
          <el-form-item label="项目名称"><el-input :value="projectEdit.name" @input="val => updateProjectEdit('name', val)" /></el-form-item>
          <el-form-item label="项目经理"><el-input :value="projectEdit.manager" @input="val => updateProjectEdit('manager', val)" /></el-form-item>
          <el-form-item label="开始日期"><el-date-picker :value="projectEdit.startDate"
              type="date" @input="val => updateProjectEdit('startDate', val)" /></el-form-item>
          <el-form-item label="结束日期"><el-date-picker :value="projectEdit.endDate"
              type="date" @input="val => updateProjectEdit('endDate', val)" /></el-form-item>
          <el-form-item label="状态">
            <el-select :value="projectEdit.status" @change="val => updateProjectEdit('status', val)">
              <el-option label="未开始" value="notStarted" />
              <el-option label="进行中" value="inProgress" />
              <el-option label="已完成" value="completed" />
              <el-option label="已延期" value="delayed" />
            </el-select>
          </el-form-item>
          <el-form-item label="项目描述"><el-input :value="projectEdit.description"
              type="textarea" @input="val => updateProjectEdit('description', val)" /></el-form-item>
        </el-form>
      </el-tab-pane>
      <!-- 财务数据 -->
      <el-tab-pane label="财务数据" name="financial">
        <div style="display: flex; justify-content: flex-end; margin-bottom: 10px;">
          <el-button size="small" @click="toggleEdit('financial')">{{ editMode.financial ? '保存' : '编辑'
          }}</el-button>
          <el-button v-if="editMode.financial" size="small" @click="cancelEdit('financial')">取消</el-button>
        </div>
        <el-descriptions :column="2" border v-if="!editMode.financial">
          <el-descriptions-item label="预算金额">{{ formatCurrency(projectEdit.budget) }}</el-descriptions-item>
          <el-descriptions-item label="已使用金额">{{ formatCurrency(projectEdit.spent) }}</el-descriptions-item>
          <el-descriptions-item label="预计总成本">{{ formatCurrency(projectEdit.estimatedCost)
          }}</el-descriptions-item>
          <el-descriptions-item label="成本偏差">{{ formatCurrency(projectEdit.costVariance)
          }}</el-descriptions-item>
        </el-descriptions>
        <el-form v-else :model="projectEdit" label-width="100px" label-position="left">
          <el-form-item label="预算金额"><el-input :value="projectEdit.budget" @input="val => updateProjectEdit('budget', Number(val))" type="number" /></el-form-item>
          <el-form-item label="已使用金额"><el-input :value="projectEdit.spent" @input="val => updateProjectEdit('spent', Number(val))" type="number" /></el-form-item>
          <el-form-item label="预计总成本"><el-input :value="projectEdit.estimatedCost" @input="val => updateProjectEdit('estimatedCost', Number(val))" type="number" /></el-form-item>
          <el-form-item label="成本偏差"><el-input :value="projectEdit.costVariance" @input="val => updateProjectEdit('costVariance', Number(val))" type="number" /></el-form-item>
        </el-form>
        <v-chart :option="financialChartOption" autoresize class="mt-4" style="height: 300px;"
          v-show="true"></v-chart>
      </el-tab-pane>
      <!-- 进度跟踪 -->
      <el-tab-pane label="进度跟踪" name="progress">
        <div style="display: flex; justify-content: flex-end; margin-bottom: 10px;">
          <el-button size="small" @click="toggleEdit('progress')">{{ editMode.progress ? '保存' : '编辑' }}</el-button>
          <el-button v-if="editMode.progress" size="small" @click="cancelEdit('progress')">取消</el-button>
        </div>
        <div class="progress-overview">
          <div class="progress-stats">
            <div class="stat-item">
              <div class="stat-label">总体进度</div>
              <div class="stat-value" v-if="!editMode.progress">{{ projectEdit.progress }}%</div>
              <el-input v-else :value="projectEdit.progress" @input="val => updateProjectEdit('progress', Number(val))" style="width: 80px;" suffix="%" type="number" />
            </div>
            <div class="stat-item">
              <div class="stat-label">计划工时</div>
              <div class="stat-value" v-if="!editMode.progress">{{ projectEdit.plannedHours }}h</div>
              <el-input v-else :value="projectEdit.plannedHours" @input="val => updateProjectEdit('plannedHours', Number(val))" style="width: 80px;" suffix="h" type="number" />
            </div>
            <div class="stat-item">
              <div class="stat-label">已用工时</div>
              <div class="stat-value" v-if="!editMode.progress">{{ projectEdit.usedHours }}h</div>
              <el-input v-else :value="projectEdit.usedHours" @input="val => updateProjectEdit('usedHours', Number(val))" style="width: 80px;" suffix="h" type="number" />
            </div>
          </div>
          <el-progress :percentage="projectEdit.progress" :stroke-width="8"
            :stroke-color="getProgressColor(projectEdit.progress)" class="mt-4"></el-progress>
        </div>
        <h4 class="mt-4">关键里程碑</h4>
        <el-timeline v-if="!editMode.progress">
          <el-timeline-item v-for="(milestone, index) in projectEdit.milestones" :key="index"
            :timestamp="formatDate(milestone.date)" :status="milestone.completed ? 'success' : 'process'">
            {{ milestone.name }}
            <el-tag :type="milestone.completed ? 'success' : 'info'" size="small" class="ml-2">
              {{ milestone.completed ? '已完成' : '进行中' }}
            </el-tag>
          </el-timeline-item>
        </el-timeline>
        <el-table v-else :data="projectEdit.milestones" border size="small" style="margin-bottom: 10px;">
          <el-table-column prop="name" label="里程碑名称">
            <template #default="scope">
              <el-input :value="scope.row.name" @input="val => updateMilestoneEdit(scope.$index, 'name', val)" />
            </template>
          </el-table-column>
          <el-table-column prop="date" label="日期">
            <template #default="scope">
              <el-date-picker :value="scope.row.date" type="date" @input="val => updateMilestoneEdit(scope.$index, 'date', val)" />
            </template>
          </el-table-column>
          <el-table-column prop="completed" label="状态">
            <template #default="scope">
              <el-switch :value="scope.row.completed" @change="val => updateMilestoneEdit(scope.$index, 'completed', val)" active-text="已完成" inactive-text="进行中" />
            </template>
          </el-table-column>
        </el-table>
      </el-tab-pane>
      <!-- 工时统计 -->
      <el-tab-pane label="工时统计" name="hours">
        <div style="display: flex; justify-content: flex-end; margin-bottom: 10px;">
          <el-button size="small" @click="toggleEdit('hours')">{{ editMode.hours ? '保存' : '编辑' }}</el-button>
          <el-button v-if="editMode.hours" size="small" @click="cancelEdit('hours')">取消</el-button>
        </div>
        <el-table v-if="!editMode.hours" :data="projectEdit.timeRecords" border size="small">
          <el-table-column prop="date" label="日期"></el-table-column>
          <el-table-column prop="user" label="人员"></el-table-column>
          <el-table-column prop="hours" label="工时"></el-table-column>
          <el-table-column prop="task" label="任务描述"></el-table-column>
        </el-table>
        <el-table v-else :data="projectEdit.timeRecords" border size="small">
          <el-table-column prop="date" label="日期">
            <template #default="scope">
              <el-date-picker :value="scope.row.date" type="date" @input="val => updateTimeRecordEdit(scope.$index, 'date', val)" />
            </template>
          </el-table-column>
          <el-table-column prop="user" label="人员">
            <template #default="scope">
              <el-input :value="scope.row.user" @input="val => updateTimeRecordEdit(scope.$index, 'user', val)" />
            </template>
          </el-table-column>
          <el-table-column prop="hours" label="工时">
            <template #default="scope">
              <el-input :value="scope.row.hours" @input="val => updateTimeRecordEdit(scope.$index, 'hours', Number(val))" type="number" />
            </template>
          </el-table-column>
          <el-table-column prop="task" label="任务描述">
            <template #default="scope">
              <el-input :value="scope.row.task" @input="val => updateTimeRecordEdit(scope.$index, 'task', val)" />
            </template>
          </el-table-column>
        </el-table>
        <v-chart :option="hoursChartOption" autoresize class="mt-4" style="height: 300px;"
          v-if="activeTab === 'hours'"></v-chart>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script>
import { ref, computed, watch } from 'vue'

export default {
  name: 'ProjectDetail',
  props: {
    project: {
      type: Object,
      default: null
    },
    visible: {
      type: Boolean,
      default: false
    }
  },
  emits: ['close', 'update-project'],
  setup(props, { emit }) {
    const activeTab = ref('basic');
    
    // 编辑模式相关
    const editMode = ref({
      basic: false,
      financial: false,
      progress: false,
      hours: false
    });
    
    const projectEdit = ref({});

    // 监听切换项目时同步编辑数据
    watch(() => props.project, (val) => {
      if (val) projectEdit.value = JSON.parse(JSON.stringify(val));
    }, { immediate: true });

    const financialChartOption = computed(() => {
      if (!props.project) return {}

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

    // 工时图表配置
    const hoursChartOption = computed(() => {
      if (!props.project || !props.project.timeRecords) return {}

      // 统计每个人的工时总和
      const userHoursMap = {};
      props.project.timeRecords.forEach(record => {
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

    const closePanel = () => {
      emit('close');
    };

    const handleTabChange = (tab) => {
      activeTab.value = tab;
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

    // 更新编辑中的项目属性
    const updateProjectEdit = (field, value) => {
      projectEdit.value[field] = value;
    };

    // 更新里程碑编辑
    const updateMilestoneEdit = (index, field, value) => {
      projectEdit.value.milestones[index][field] = value;
    };

    // 更新工时记录编辑
    const updateTimeRecordEdit = (index, field, value) => {
      projectEdit.value.timeRecords[index][field] = value;
    };

    // 切换编辑/保存
    function toggleEdit(tab) {
      if (!editMode.value[tab]) {
        // 进入编辑模式，深拷贝当前数据
        projectEdit.value = JSON.parse(JSON.stringify(props.project));
        editMode.value[tab] = true;
      } else {
        // 保存，发送更新事件
        emit('update-project', projectEdit.value);
        editMode.value[tab] = false;
      }
    }
    
    // 取消编辑
    function cancelEdit(tab) {
      editMode.value[tab] = false;
      projectEdit.value = JSON.parse(JSON.stringify(props.project));
    }

    return {
      activeTab,
      editMode,
      projectEdit,
      financialChartOption,
      hoursChartOption,
      closePanel,
      handleTabChange,
      getProgressColor,
      getStatusLabel,
      formatDate,
      formatCurrency,
      updateProjectEdit,
      updateMilestoneEdit,
      updateTimeRecordEdit,
      toggleEdit,
      cancelEdit
    };
  }
};
</script>

<style scoped>
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

/* 响应式调整 */
@media (max-width: 1200px) {
  .detail-panel {
    width: 400px;
  }
}

@media (max-width: 992px) {
  .detail-panel {
    width: 350px;
  }
}
</style>