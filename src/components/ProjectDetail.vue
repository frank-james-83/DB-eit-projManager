<template>
  <div class="detail-panel" :class="{ 'panel-open': visible }">
    <div class="panel-header">
      <h2>{{ project?.name || '项目详情' }}</h2>
      <el-button size="small" @click="closePanel"><el-icon>
          <Close />
        </el-icon></el-button>
    </div>

    <el-tabs v-if="project" type="card" class="detail-tabs" v-model="activeTab">
      <!-- 基本信息 -->
      <el-tab-pane label="基本信息" name="basic">
        <div style="display: flex; justify-content: flex-end; margin-bottom: 10px;">
          <el-button size="small" @click="toggleEdit('basic')">{{ editMode.basic ? '保存' : '编辑' }}</el-button>
          <el-button v-if="editMode.basic" size="small" @click="cancelEdit('basic')">取消</el-button>
        </div>
        <el-descriptions :column="1" border v-if="!editMode.basic">
          <el-descriptions-item label="项目编号">{{ projectEdit.projectId }}</el-descriptions-item>
          <el-descriptions-item label="EIT_WBS号">{{ projectEdit.eitWbs }}</el-descriptions-item>
          <el-descriptions-item label="项目名称">{{ projectEdit.name }}</el-descriptions-item>
          <el-descriptions-item label="项目经理">{{ projectEdit.manager }}</el-descriptions-item>
          <el-descriptions-item label="现场经理">{{ projectEdit.siteManager }}</el-descriptions-item>
          <el-descriptions-item label="开始日期">{{ formatDate(projectEdit.startDate) }}</el-descriptions-item>
          <el-descriptions-item label="结束日期">{{ formatDate(projectEdit.endDate) }}</el-descriptions-item>
          <el-descriptions-item label="状态">{{ getStatusLabel(projectEdit.status) }}</el-descriptions-item>
          <el-descriptions-item label="工时预算">{{ projectEdit.budgetHours }}h</el-descriptions-item>
          <el-descriptions-item label="项目描述">{{ projectEdit.description }}</el-descriptions-item>
          <el-descriptions-item label="CEP No.">{{ projectEdit.cepNo }}</el-descriptions-item>
          <el-descriptions-item label="客户简称">{{ projectEdit.customerShortName }}</el-descriptions-item>
          <el-descriptions-item label="客户全称">{{ projectEdit.customerFullName }}</el-descriptions-item>
          <el-descriptions-item label="客户英文名称">{{ projectEdit.customerEnglishName }}</el-descriptions-item>
          <el-descriptions-item label="客户地址">{{ projectEdit.customerAddress }}</el-descriptions-item>
        </el-descriptions>
        <el-form v-else :model="projectEdit" label-width="120px" label-position="left">
          <el-form-item label="项目编号">
            <el-input v-model="projectEdit.projectId" />
          </el-form-item>
          <el-form-item label="EIT_WBS号">
            <el-input v-model="projectEdit.eitWbs" />
          </el-form-item>
          <el-form-item label="项目名称">
            <el-input v-model="projectEdit.name" />
          </el-form-item>
          <el-form-item label="项目经理">
            <el-select v-model="projectEdit.manager" placeholder="请选择项目经理">
              <el-option
                v-for="manager in projectManagers"
                :key="manager.id"
                :label="manager.name"
                :value="manager.name">
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="现场经理">
            <el-select v-model="projectEdit.siteManager" placeholder="请选择现场经理">
              <el-option
                v-for="manager in siteManagers"
                :key="manager.id"
                :label="manager.name"
                :value="manager.name">
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="开始日期">
            <el-date-picker v-model="projectEdit.startDate" type="date" />
          </el-form-item>
          <el-form-item label="结束日期">
            <el-date-picker v-model="projectEdit.endDate" type="date" />
          </el-form-item>
          <el-form-item label="状态">
            <el-select v-model="projectEdit.status">
              <el-option label="未开始" value="notStarted" />
              <el-option label="进行中" value="inProgress" />
              <el-option label="已完成" value="completed" />
              <el-option label="已延期" value="delayed" />
            </el-select>
          </el-form-item>
          <el-form-item label="工时预算">
            <el-input v-model.number="projectEdit.budgetHours" type="number" />
          </el-form-item>
          <el-form-item label="项目描述">
            <el-input v-model="projectEdit.description" type="textarea" />
          </el-form-item>
          <el-form-item label="CEP No.">
            <el-input v-model="projectEdit.cepNo" />
          </el-form-item>
          <el-form-item label="客户简称">
            <el-input v-model="projectEdit.customerShortName" />
          </el-form-item>
          <el-form-item label="客户全称">
            <el-input v-model="projectEdit.customerFullName" />
          </el-form-item>
          <el-form-item label="客户英文名称">
            <el-input v-model="projectEdit.customerEnglishName" />
          </el-form-item>
          <el-form-item label="客户地址">
            <el-input v-model="projectEdit.customerAddress" />
          </el-form-item>
        </el-form>
      </el-tab-pane>
      <!-- 进度跟踪 -->
      <el-tab-pane label="进度跟踪" name="progress">
        <div class="progress-overview">
          <div class="progress-stats">
            <div class="stat-item">
              <div class="stat-label">总体进度</div>
              <div class="stat-value">{{ calculateProgressPercentage(calculateProjectUsedHours(projectEdit), calculateProjectPlannedHours(projectEdit)) }}%</div>
            </div>
            <div class="stat-item">
              <div class="stat-label">计划工时</div>
              <div class="stat-value">{{ calculateProjectPlannedHours(projectEdit) }}h</div>
            </div>
            <div class="stat-item">
              <div class="stat-label">已用工时</div>
              <div class="stat-value">{{ calculateProjectUsedHours(projectEdit) }}h</div>
            </div>
          </div>
          <el-progress :percentage="calculateProgressPercentage(calculateProjectUsedHours(projectEdit), calculateProjectPlannedHours(projectEdit))" :stroke-width="8"
            :stroke-color="getProgressColor(calculateProgressPercentage(calculateProjectUsedHours(projectEdit), calculateProjectPlannedHours(projectEdit)))" class="mt-4"></el-progress>
        </div>
        <h4 class="mt-4">关键里程碑</h4>
        <div style="display: flex; justify-content: flex-end; margin-bottom: 10px;">
          <el-button size="small" @click="toggleEdit('progress')">{{ editMode.progress ? '保存' : '编辑' }}</el-button>
          <el-button v-if="editMode.progress" size="small" @click="addMilestone">新增</el-button>
          <el-button v-if="editMode.progress" size="small" @click="cancelEdit('progress')">取消</el-button>
        </div>
        <el-timeline v-if="!editMode.progress">
          <el-timeline-item v-for="(milestone, index) in projectEdit.milestones" :key="index"
            :timestamp="formatDate(milestone.date)" :status="milestone.completed ? 'success' : 'process'">
            {{ milestone.name }}
            <el-tag :type="milestone.completed ? 'success' : 'info'" size="small" class="ml-2">
              {{ milestone.completed ? '已完成' : '进行中' }}
            </el-tag>
            <el-tag v-if="milestone.tag" size="small" class="ml-2">
              {{ milestone.tag }}
            </el-tag>
          </el-timeline-item>
        </el-timeline>
        <el-table v-else :data="projectEdit.milestones" border size="small" style="margin-bottom: 10px;">
          <el-table-column prop="name" label="里程碑名称">
            <template #default="scope">
              <el-input v-model="projectEdit.milestones[scope.$index].name" />
            </template>
          </el-table-column>
          <el-table-column prop="date" label="日期">
            <template #default="scope">
              <el-date-picker v-model="projectEdit.milestones[scope.$index].date" type="date" />
            </template>
          </el-table-column>
          <el-table-column prop="completed" label="状态">
            <template #default="scope">
              <el-switch v-model="projectEdit.milestones[scope.$index].completed" active-text="已完成" inactive-text="进行中" />
            </template>
          </el-table-column>
          <el-table-column prop="tag" label="标签">
            <template #default="scope">
              <el-input v-model="projectEdit.milestones[scope.$index].tag" />
            </template>
          </el-table-column>
          <el-table-column label="操作" width="80">
            <template #default="scope">
              <el-button @click="removeMilestone(scope.$index)" type="danger" size="small">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-tab-pane>
      <!-- 工时统计 -->
      <el-tab-pane label="工时统计" name="hours">
        <div style="display: flex; justify-content: flex-end; margin-bottom: 10px;">
          <el-button size="small" @click="toggleEdit('hours')">{{ editMode.hours ? '保存' : '编辑' }}</el-button>
          <el-button v-if="editMode.hours" size="small" @click="addPeriod">增加区间</el-button>
          <el-button v-if="editMode.hours" size="small" @click="cancelEdit('hours')">取消</el-button>
        </div>
        <div v-if="activeTab === 'hours' && !editMode.hours && showChart" style="height: 300px; margin-bottom: 20px;">
          <v-chart 
            :option="hoursChartOption" 
            autoresize 
            class="mt-4" 
            style="height: 100%;"
            @ready="onChartReady"></v-chart>
        </div>
        <el-table v-if="!editMode.hours" :data="projectEdit.periods" border size="small">
          <el-table-column prop="start" label="开始时间">
            <template #default="scope">
              {{ formatDate(scope.row.start) }}
            </template>
          </el-table-column>
          <el-table-column prop="end" label="结束时间">
            <template #default="scope">
              {{ formatDate(scope.row.end) }}
            </template>
          </el-table-column>
          <el-table-column label="工时">
            <template #default="scope">
              <div>实际: {{ calculateActualHours(scope.row) }}h</div>
              <div>计划: {{ calculatePlannedHours(scope.row) }}h</div>
            </template>
          </el-table-column>
          <el-table-column prop="user" label="EIT工程师"></el-table-column>
          <el-table-column prop="comment" label="备注"></el-table-column>
        </el-table>
        <el-table v-else :data="projectEdit.periods" border size="small">
          <el-table-column label="开始时间">
            <template #default="scope">
              <el-date-picker v-model="projectEdit.periods[scope.$index].start" type="date" />
            </template>
          </el-table-column>
          <el-table-column label="结束时间">
            <template #default="scope">
              <el-date-picker v-model="projectEdit.periods[scope.$index].end" type="date" />
            </template>
          </el-table-column>
          <el-table-column label="工时">
            <template #default="scope">
              <el-input v-model.number="projectEdit.periods[scope.$index].hours" type="number" />
            </template>
          </el-table-column>
          <el-table-column label="EIT工程师">
            <template #default="scope">
              <el-select 
                v-model="projectEdit.periods[scope.$index].user" 
                filterable 
                allow-create 
                default-first-option
                placeholder="请选择或输入EIT工程师">
                <el-option
                  v-for="engineer in eitEngineersList"
                  :key="engineer.id"
                  :label="engineer.name"
                  :value="engineer.name">
                </el-option>
              </el-select>
            </template>
          </el-table-column>
          <el-table-column label="备注">
            <template #default="scope">
              <el-input v-model="projectEdit.periods[scope.$index].comment" />
            </template>
          </el-table-column>
          <el-table-column label="操作" width="80">
            <template #default="scope">
              <el-button @click="removePeriod(scope.$index)" type="danger" size="small">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-tab-pane>
      
      <!-- EIT信息 -->
      <el-tab-pane label="EIT信息" name="eit">
        <div style="display: flex; justify-content: flex-end; margin-bottom: 10px;">
          <el-button size="small" @click="toggleEdit('eit')">{{ editMode.eit ? '保存' : '编辑' }}</el-button>
          <el-button v-if="editMode.eit" size="small" @click="cancelEdit('eit')">取消</el-button>
        </div>
        
        <!-- EIT模块 -->
        <h4>EIT模块</h4>
        <el-table v-if="!editMode.eit" :data="projectEdit.eitModules" border size="small" style="margin-bottom: 20px;">
          <el-table-column prop="name" label="模块名称"></el-table-column>
          <el-table-column prop="value" label="数量/状态"></el-table-column>
          <el-table-column prop="remark" label="备注"></el-table-column>
        </el-table>
        <div v-else>
          <el-table :data="projectEdit.eitModules" border size="small" style="margin-bottom: 10px;">
            <el-table-column label="模块名称" width="200">
              <template #default="scope">
                <el-select 
                  v-model="scope.row.name" 
                  filterable 
                  allow-create 
                  default-first-option
                  placeholder="请选择或输入模块名称">
                  <el-option label="基础模块" value="基础模块"></el-option>
                  <el-option label="API模块" value="API模块"></el-option>
                  <el-option label="EDS模块" value="EDS模块"></el-option>
                  <el-option label="QC模块" value="QC模块"></el-option>
                  <el-option label="ECO模块" value="ECO模块"></el-option>
                  <el-option label="Review模块" value="Review模块"></el-option>
                </el-select>
              </template>
            </el-table-column>
            <el-table-column label="数量/状态">
              <template #default="scope">
                <el-input v-model="scope.row.value" placeholder="请输入数量或状态" />
              </template>
            </el-table-column>
            <el-table-column label="备注" width="200">
              <template #default="scope">
                <el-input v-model="scope.row.remark" placeholder="请输入备注" />
              </template>
            </el-table-column>
            <el-table-column label="操作" width="80">
              <template #default="scope">
                <el-button @click="removeEitModule(scope.$index)" type="danger" size="small">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
          <div style="margin-bottom: 20px;">
            <el-button @click="addEitModule" size="small">添加模块</el-button>
          </div>
        </div>
        
        <!-- 软硬件 -->
        <h4>软硬件</h4>
        <el-table v-if="!editMode.eit" :data="projectEdit.hardwareSoftware" border size="small">
          <el-table-column prop="itemNumber" label="物料号"></el-table-column>
          <el-table-column prop="name" label="名称"></el-table-column>
          <el-table-column prop="category" label="类别"></el-table-column>
          <el-table-column prop="unit" label="单位"></el-table-column>
          <el-table-column prop="quantity" label="数量"></el-table-column>
          <el-table-column prop="description" label="规格"></el-table-column>
        </el-table>
        <div v-else>
          <el-table :data="projectEdit.hardwareSoftware" border size="small">
            <el-table-column label="物料">
              <template #default="scope">
                <el-select 
                  v-model="scope.row.materialId" 
                  filterable 
                  placeholder="请选择物料"
                  @change="handleMaterialSelect(scope.row, $event)">
                  <el-option
                    v-for="material in materialsList"
                    :key="material.id"
                    :label="`${material.name} (${material.spec})`"
                    :value="material.id">
                  </el-option>
                </el-select>
              </template>
            </el-table-column>
            <el-table-column label="物料号" prop="itemNumber"></el-table-column>
            <el-table-column label="名称" prop="name"></el-table-column>
            <el-table-column label="类别" prop="category"></el-table-column>
            <el-table-column label="单位" prop="unit"></el-table-column>
            <el-table-column label="数量">
              <template #default="scope">
                <el-input v-model.number="scope.row.quantity" type="number" placeholder="请输入数量" />
              </template>
            </el-table-column>
            <el-table-column label="规格">
              <template #default="scope">
                <el-input v-model="scope.row.description" placeholder="请输入规格" />
              </template>
            </el-table-column>
            <el-table-column label="操作" width="80">
              <template #default="scope">
                <el-button @click="removeHardwareSoftware(scope.$index)" type="danger" size="small">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
          <div style="margin-top: 10px;">
            <el-button @click="addHardwareSoftware" size="small">添加软硬件</el-button>
          </div>
        </div>
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
import {  projectManagers, siteManagers, eitEngineers, materials, materialCategories } from '../api/mockData.ts';
import { mockProjects } from '../api/mockProjects';
import { 
  projectManagers as pmList, 
  siteManagers as smList, 
  eitEngineers as eitList, 
  materials as matList, 
  materialCategories as matCatList 
} from '../api/mockData';

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
    VChart
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
    const projectManagersList = projectManagers.concat(pmList);
    const siteManagersList = siteManagers.concat(smList);
    const eitEngineersList = eitEngineers.concat(eitList);
    const materialsList = materials.concat(matList);
    const materialCategoriesList = materialCategories.concat(matCatList);
    
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