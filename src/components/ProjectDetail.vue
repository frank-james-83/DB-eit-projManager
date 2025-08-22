<template>
  <div class="detail-panel" :class="{ 'panel-open': visible }">
    <div class="panel-header">
      <h2>{{ project?.name || '项目详情' }}</h2>
      <el-button size="small" @click="closePanel">
        <el-icon>
          <Close />
        </el-icon>
      </el-button>
    </div>

    <el-tabs v-if="project" type="card" class="detail-tabs" v-model="activeTab">
      <!-- 基本信息 -->
      <el-tab-pane label="基本信息" name="basic">
        <BasicInfo 
          :project="projectEdit" 
          :is-edit-mode="editMode.basic"
          :project-managers="projectManagers"
          :site-managers="siteManagers"
          :format-date="formatDate"
          :get-status-label="getStatusLabel"
          @toggle-edit="toggleEdit('basic')"
          @cancel-edit="cancelEdit('basic')" />
      </el-tab-pane>
      
      <!-- 进度跟踪 -->
      <el-tab-pane label="进度跟踪" name="progress">
        <ProgressTracking
          :project="projectEdit"
          :is-edit-mode="editMode.progress"
          :progress-percentage="calculateProgressPercentage(calculateProjectUsedHours(projectEdit), calculateProjectPlannedHours(projectEdit))"
          :planned-hours="calculateProjectPlannedHours(projectEdit)"
          :used-hours="calculateProjectUsedHours(projectEdit)"
          :format-date="formatDate"
          :get-progress-color="getProgressColor"
          @toggle-edit="toggleEdit('progress')"
          @cancel-edit="cancelEdit('progress')"
          @add-milestone="addMilestone"
          @remove-milestone="removeMilestone" />
      </el-tab-pane>
      
      <!-- 工时统计 -->
      <el-tab-pane label="工时统计" name="hours">
        <HoursStatistics
          :project="projectEdit"
          :is-edit-mode="editMode.hours"
          :show-chart="showChart"
          :chart-option="hoursChartOption"
          :format-date="formatDate"
          :calculate-actual-hours="calculateActualHours"
          :calculate-planned-hours="calculatePlannedHours"
          :eit-engineers-list="eitEngineersList"
          @toggle-edit="toggleEdit('hours')"
          @cancel-edit="cancelEdit('hours')"
          @add-period="addPeriod"
          @remove-period="removePeriod"
          @chart-ready="onChartReady" />
      </el-tab-pane>
      
      <!-- EIT信息 -->
      <el-tab-pane label="EIT信息" name="eit">
        <EitInfo
          :project="projectEdit"
          :is-edit-mode="editMode.eit"
          :materials-list="materialsList"
          :material-categories-list="materialCategoriesList"
          @toggle-edit="toggleEdit('eit')"
          @cancel-edit="cancelEdit('eit')"
          @add-eit-module="addEitModule"
          @remove-eit-module="removeEitModule"
          @add-hardware-software="addHardwareSoftware"
          @remove-hardware-software="removeHardwareSoftware"
          @material-select="handleMaterialSelect" />
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script>
import { ref, reactive, computed, watch, nextTick, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import VChart from 'vue-echarts'
import { use } from "echarts/core"
import { CanvasRenderer } from "echarts/renderers"
import { LineChart } from "echarts/charts"
import { TooltipComponent, LegendComponent, GridComponent } from "echarts/components"
import { 
  projectManagers as pmList, 
  siteManagers as smList, 
  eitEngineers as eitList, 
  materials as matList, 
  materialCategories as matCatList 
} from '../api/mockData';

// 引入子组件
import BasicInfo from './detail/BasicInfo.vue';
import ProgressTracking from './detail/ProgressTracking.vue';
import HoursStatistics from './detail/HoursStatistics.vue';
import EitInfo from './detail/EitInfo.vue';

use([
  CanvasRenderer,
  LineChart,
  TooltipComponent,
  LegendComponent,
  GridComponent
])

export default {
  name: 'ProjectDetail',
  components: {
    VChart,
    BasicInfo,
    ProgressTracking,
    HoursStatistics,
    EitInfo
  },
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
    const editMode = reactive({
      basic: false,
      progress: false,
      cost: false,
      materials: false,
      hours: false,
      eit: false
    });

    // 图表渲染控制
    const showChart = ref(false);
    const isComponentMounted = ref(false);
    let chartInstance = null;
    let isFirstChartRender = true;
    
    // 组件挂载后标记
    onMounted(() => {
      isComponentMounted.value = true;
    });
    
    // 监听visible属性变化，控制图表显示
    watch(() => props.visible, (newVal) => {
      if (newVal) {
        // 延迟显示图表，确保DOM已经渲染完成
        nextTick(() => {
          setTimeout(() => {
            // 只有当在工时统计标签页且不在编辑模式下才显示图表
            if (activeTab.value === 'hours' && !editMode.hours) {
              showChart.value = true;
            }
            // 触发图表resize确保正确渲染
            if (chartInstance) {
              nextTick(() => {
                setTimeout(() => {
                  chartInstance.resize();
                }, 50);
              });
            }
          }, 100);
        });
      } else {
        showChart.value = false;
        isFirstChartRender = true;
      }
    }, { flush: 'post' });

    // 监听activeTab变化，如果切换到工时统计标签页，确保图表显示
    watch([activeTab, () => props.visible], ([newTab, newVisible]) => {
      if (newTab === 'hours' && newVisible && !editMode.hours) {
        nextTick(() => {
          setTimeout(() => {
            showChart.value = true;
            // 触发图表resize确保正确渲染
            if (chartInstance) {
              nextTick(() => {
                setTimeout(() => {
                  chartInstance.resize();
                }, 50);
              });
            }
          }, 100);
        });
      } else {
        showChart.value = false;
      }
    }, { flush: 'post' });
    
    // 图表就绪回调
    const onChartReady = (chart) => {
      chartInstance = chart;
      // 确保图表正确初始化
      if (isFirstChartRender) {
        nextTick(() => {
          setTimeout(() => {
            chart.resize();
          }, 100);
        });
        isFirstChartRender = false;
      }
    };
    
    // 下拉选项数据
    const projectManagersList = pmList;
    const siteManagersList = smList;
    const eitEngineersList = eitList;
    const materialsList = matList;
    const materialCategoriesList = matCatList;
    
    const projectEdit = ref({});

    // 监听切换项目时同步编辑数据
    watch(() => props.project, (val) => {
      if (val) {
        projectEdit.value = JSON.parse(JSON.stringify(val));
        // 确保EIT模块和软硬件数组存在
        if (!projectEdit.value.eitModules) {
          projectEdit.value.eitModules = [];
        }
        if (!projectEdit.value.hardwareSoftware) {
          projectEdit.value.hardwareSoftware = [];
        }
      }
    }, { immediate: true });


    // 工时图表配置
    const hoursChartOption = computed(() => {
      if (!props.project || !props.project.periods) return {}

      // 按日期排序periods
      const sortedPeriods = [...props.project.periods].sort((a, b) => 
        new Date(a.start) - new Date(b.start)
      );
      
      // 构建累计工时数据
      const cumulativeData = [];
      const dates = [];
      
      // 收集所有日期
      const allDates = new Set();
      sortedPeriods.forEach(period => {
        allDates.add(formatDate(period.start));
        allDates.add(formatDate(period.end));
      });
      
      const sortedDates = Array.from(allDates).sort();
      
      // 计算每天的累计工时
      sortedDates.forEach(date => {
        dates.push(date);
        const currentDate = new Date(date);
        
        // 计算到当前日期的累计工时
        let cumulativeHours = 0;
        sortedPeriods.forEach(period => {
          const periodStart = new Date(period.start);
          const periodEnd = new Date(period.end);
          if (periodStart <= currentDate) {
            cumulativeHours += period.hours || 0;
          }
        });
        cumulativeData.push(cumulativeHours);
      });

      // 获取目标工时值
      const targetHours = props.project.budgetHours || 0;
      
      // 构建目标线数据
      const targetLine = new Array(dates.length).fill(targetHours);

      return {
        title: {
          text: '项目工时进度'
        },
        tooltip: {
          trigger: 'axis'
        },
        legend: {
          data: ['实际工时', '目标工时']
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
          data: dates
        },
        yAxis: {
          type: 'value',
          name: '工时(小时)'
        },
        series: [
          {
            name: '实际工时',
            type: 'line',
            data: cumulativeData,
            itemStyle: {
              color: '#1e88e5'
            },
            smooth: true
          },
          {
            name: '目标工时',
            type: 'line',
            data: targetLine,
            itemStyle: {
              color: '#42b983'
            },
            smooth: true,
            lineStyle: {
              type: 'dashed'
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
      if (!dateString) return '';
      const date = new Date(dateString);
      return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
    };

    const formatCurrency = (value) => {
      return `¥${value.toLocaleString()}`;
    };

    // 计算计划工时（所有periods.hours的总和）
    const calculateProjectPlannedHours = (project) => {
      if (!project.periods || !Array.isArray(project.periods)) {
        return 0;
      }
      return project.periods.reduce((total, period) => total + (period.hours || 0), 0);
    };

    // 计算已用工时（根据ProjectList.vue中的实际工时计算逻辑）
    const calculateProjectUsedHours = (project) => {
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

    // 计算进度百分比（与ProjectList.vue保持一致）
    const calculateProgressPercentage = (usedHours, plannedHours) => {
      if (!plannedHours || plannedHours === 0) return 0;
      const percentage = Math.round((usedHours / plannedHours) * 100);
      return Math.min(100, Math.max(0, percentage));
    };

    // 计算总体进度（计划工时和已用工时的比例）
    const calculateOverallProgress = (project) => {
      const plannedHours = project.plannedHours || 0;
      const usedHours = project.usedHours || 0;
      
      if (plannedHours === 0) {
        return 0;
      }
      
      // 计算进度百分比，保留整数
      const progress = Math.round((usedHours / plannedHours) * 100);
      // 确保进度在0-100范围内
      return Math.max(0, Math.min(100, progress));
    };

    // 计算实际工时（当前日期之前的工时）
    const calculateActualHours = (period) => {
      const periodEnd = new Date(period.end);
      const now = new Date();
      
      // 如果结束日期在当前日期之前，则全部为实际工时
      if (periodEnd < now) {
        return period.hours || 0;
      }
      
      // 如果结束日期在当前日期之后，则按比例计算
      const periodStart = new Date(period.start);
      const totalTime = periodEnd.getTime() - periodStart.getTime();
      
      // 如果任务还没开始，实际工时为0
      if (periodStart > now) {
        return 0;
      }
      
      // 计算到当前时间已完成的部分
      const elapsed = now.getTime() - periodStart.getTime();
      const ratio = Math.min(1, Math.max(0, elapsed / totalTime));
      return Math.round((period.hours || 0) * ratio);
    };
    
    // 计算计划工时（当前日期之后的工时）
    const calculatePlannedHours = (period) => {
      const periodEnd = new Date(period.end);
      const now = new Date();
      
      // 如果结束日期在当前日期之前，则计划工时为0
      if (periodEnd < now) {
        return 0;
      }
      
      // 如果开始日期在当前日期之后，则全部为计划工时
      const periodStart = new Date(period.start);
      if (periodStart > now) {
        return period.hours || 0;
      }
      
      // 计算剩余部分
      const totalTime = periodEnd.getTime() - periodStart.getTime();
      const remaining = periodEnd.getTime() - now.getTime();
      const ratio = Math.min(1, Math.max(0, remaining / totalTime));
      return Math.round((period.hours || 0) * ratio);
    };

    // 添加工时区间
    const addPeriod = () => {
      if (!projectEdit.value.periods) {
        projectEdit.value.periods = [];
      }
      projectEdit.value.periods.push({
        start: '',
        end: '',
        hours: 0,
        user: '',
        comment: ''
      });
    };

    // 删除工时区间
    const removePeriod = (index) => {
      projectEdit.value.periods.splice(index, 1);
    };

    // 添加EIT模块
    const addEitModule = () => {
      projectEdit.value.eitModules.push({
        name: '',
        value: '',
        remark: ''
      });
    };

    // 删除EIT模块
    const removeEitModule = (index) => {
      projectEdit.value.eitModules.splice(index, 1);
    };

    // 添加软硬件
    const addHardwareSoftware = () => {
      projectEdit.value.hardwareSoftware.push({
        materialId: '', // 新增物料ID字段
        itemNumber: '',
        name: '',
        category: '',
        unit: '', // 添加单位字段
        quantity: 0,
        description: '' // 规格描述
      });
    };

    // 删除软硬件
    const removeHardwareSoftware = (index) => {
      projectEdit.value.hardwareSoftware.splice(index, 1);
    };

    // 处理物料选择
    const handleMaterialSelect = (row, materialId) => {
      // 查找选中的物料
      const selectedMaterial = materialsList.find(material => material.id === materialId);
      
      // 如果找到匹配的物料，填充其他字段
      if (selectedMaterial) {
        row.itemNumber = selectedMaterial.id;
        row.name = selectedMaterial.name;
        row.unit = selectedMaterial.unit;  // 添加单位字段
        row.category = materialCategoriesList.find(c => c.id === selectedMaterial.categoryId)?.name || '';
        row.description = selectedMaterial.spec;  // 将描述字段改为spec
      }
    };

    // 添加里程碑
    const addMilestone = () => {
      if (!projectEdit.value.milestones) {
        projectEdit.value.milestones = [];
      }
      projectEdit.value.milestones.push({
        name: '',
        date: '',
        completed: false,
        tag: ''
      });
    };

    // 删除里程碑
    const removeMilestone = (index) => {
      projectEdit.value.milestones.splice(index, 1);
    };

    // 切换编辑/保存
    function toggleEdit(tab) {
      if (!editMode[tab]) {
        // 进入编辑模式，深拷贝当前数据
        projectEdit.value = JSON.parse(JSON.stringify(props.project));
        // 确保EIT模块和软硬件数组存在
        if (!projectEdit.value.eitModules) {
          projectEdit.value.eitModules = [];
        }
        if (!projectEdit.value.hardwareSoftware) {
          projectEdit.value.hardwareSoftware = [];
        }
        editMode[tab] = true;
      } else {
        // 保存，发送更新事件
        emit('update-project', projectEdit.value);
        editMode[tab] = false;
      }
    }
    
    // 取消编辑
    function cancelEdit(tab) {
      editMode[tab] = false;
      projectEdit.value = JSON.parse(JSON.stringify(props.project));
    }

    return {
      activeTab,
      editMode,
      projectEdit,
      formatDate,
      getStatusLabel,
      getProgressColor,
      calculateActualHours,
      calculatePlannedHours,
      calculateOverallProgress,
      calculateProgressPercentage,
      toggleEdit,
      cancelEdit,
      closePanel,
      addPeriod,
      removePeriod,
      addEitModule,
      removeEitModule,
      addHardwareSoftware,
      removeHardwareSoftware,
      handleMaterialSelect,
      addMilestone,
      removeMilestone,
      // 下拉选项数据
      projectManagers: projectManagersList,
      siteManagers: siteManagersList,
      eitEngineers: eitEngineersList,
      eitEngineersList,
      materials: materialsList,
      materialCategories: materialCategoriesList,
      materialsList,
      materialCategoriesList,
      hoursChartOption,
      showChart,
      onChartReady,
      calculateProjectPlannedHours,
      calculateProjectUsedHours
    };
  }
};
</script>

<style scoped>
.detail-panel {
  position: absolute;
  top: 0;
  right: 0;
  width: 750px;
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
  flex-shrink: 0;
}

.detail-tabs {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.detail-tabs :deep(.el-tabs__content) {
  flex: 1;
  overflow: hidden;
}

.detail-tabs :deep(.el-tab-pane) {
  height: 100%;
  overflow-y: auto;
  padding: 15px;
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