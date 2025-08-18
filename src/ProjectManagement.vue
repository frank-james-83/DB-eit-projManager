    // ...existing code...
<template>
  <div class="project-management-container">
    <!-- 标题栏 -->
    <header class="app-header">
      <div class="logo">
        <i class="el-icon-sitemap"></i>
        <span>EIT项目管理系统</span>
      </div>
      <div class="header-actions">
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
            <el-input placeholder="搜索项目" size="small" v-model="searchQuery" class="search-input">
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
      </aside>

      <!-- 中间甘特图区域 -->
      <section class="gantt-container">
        <div class="gantt-controls">
          <h2>项目计划甘特图</h2>
          <div class="gantt-actions">
            <el-button-group size="small">
              <el-button @click="prevTimeRange"><el-icon>
                  <ArrowLeft />
                </el-icon></el-button>
              <el-button @click="nextTimeRange"><el-icon>
                  <ArrowRight />
                </el-icon></el-button>
            </el-button-group>
            <el-select v-model="timeRange" size="small" class="ml-2" @change="handleTimeRangeChange">
              <el-option label="周视图" value="week"></el-option>
              <el-option label="月视图" value="month"></el-option>
            </el-select>
            <el-date-picker v-model="dateRange" type="daterange" range-separator="至" start-placeholder="开始日期"
              end-placeholder="结束日期" size="small" class="ml-2 gantt-date-picker"
              style="min-width: 260px; width: 320px;"></el-date-picker>
          </div>
        </div>

        <!-- 甘特图组件 -->
        <div class="gantt-chart">
          <!-- 全局唯一 period 编辑弹窗 -->
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
          <!-- 时间轴头部 -->
          <div class="gantt-timeline">
            <div v-for="(item, index) in timelineHeaders" :key="index" class="timeline-month"
              :style="getTimelineItemStyle(item)">
              <div>{{ item.label1 }}</div>
              <div v-if="item.label2" style="font-size:12px;color:#888;">{{ item.label2 }}</div>
            </div>
          </div>
          <!-- 甘特图项目行 -->
          <div v-for="project in filteredProjects" :key="project.id" class="gantt-row"
            :class="{ 'gantt-row-active': activeProjectId === project.id }">
            <!-- period 条形图 -->
            <template v-if="project.periods && project.periods.length">
              <div v-for="(period, idx) in project.periods" :key="idx">
                <el-tooltip effect="dark" placement="top" :content="getPeriodTooltip(period, project)"
                  popper-class="multi-line-tooltip" :open-delay="200"
                  popper-style="white-space: pre-line; line-height: 1.5;">
                  <div class="gantt-task-bar" :style="getGanttBarStyleByPeriod(period, project)"
                    @click.stop="openPeriodEditDialog(project)" style="cursor:pointer;z-index:2;">
                    <span class="task-label" v-if="idx === 0">{{ project.name }}</span>
                  </div>
                </el-tooltip>
              </div>
            </template>

            <!-- 里程碑-->
            <template v-if="project.milestones && project.milestones.length">
              <div v-for="(milestone, mIdx) in project.milestones" :key="mIdx" class="gantt-milestone"
                :style="getMilestoneStyle(milestone, project)">
                <el-tooltip effect="dark" placement="top" :content="getMilestoneTooltip(milestone)"
                  popper-class="multi-line-tooltip" :open-delay="200"
                  popper-style="white-space: pre-line; line-height: 1.5;">
                  <div class="milestone-container">
                    <div :class="['milestone-diamond', milestone.completed ? 'milestone-completed' : '']"></div>
                    <div v-if="milestone.tag"
                      :class="['milestone-tag', milestone.completed ? 'milestone-completed' : '']">
                      {{ milestone.tag }}
                    </div>
                  </div>
                </el-tooltip>
              </div>
            </template>
          </div>
        </div>
      </section>

      <!-- 右侧项目详情面板 -->
      <div class="detail-panel" :class="{ 'panel-open': isDetailOpen }">
        <div class="panel-header">
          <h2>{{ activeProject?.name || '项目详情' }}</h2>
          <el-button size="small" @click="closeDetailPanel"><el-icon>
              <Close />
            </el-icon></el-button>
        </div>

        <el-tabs v-if="activeProject" type="card" class="detail-tabs" v-model="activeTab">
          <!-- 基本信息 -->
          <el-tab-pane label="基本信息" name="basic">
            <div style="display: flex; justify-content: flex-end; margin-bottom: 10px;">
              <el-button size="small" @click="toggleEdit('basic')">{{ editMode.basic ? '保存' : '编辑' }}</el-button>
              <el-button v-if="editMode.basic" size="small" @click="cancelEdit('basic')">取消</el-button>
            </div>
            <el-descriptions :column="1" border v-if="!editMode.basic">
              <el-descriptions-item label="项目编号">{{ activeProjectEdit.projectId }}</el-descriptions-item>
              <el-descriptions-item label="项目名称">{{ activeProjectEdit.name }}</el-descriptions-item>
              <el-descriptions-item label="项目经理">{{ activeProjectEdit.manager }}</el-descriptions-item>
              <el-descriptions-item label="开始日期">{{ formatDate(activeProjectEdit.startDate) }}</el-descriptions-item>
              <el-descriptions-item label="结束日期">{{ formatDate(activeProjectEdit.endDate) }}</el-descriptions-item>
              <el-descriptions-item label="状态">{{ getStatusLabel(activeProjectEdit.status) }}</el-descriptions-item>
              <el-descriptions-item label="项目描述">{{ activeProjectEdit.description }}</el-descriptions-item>
            </el-descriptions>
            <el-form v-else :model="activeProjectEdit" label-width="80px" label-position="left">
              <el-form-item label="项目编号"><el-input v-model="activeProjectEdit.projectId" /></el-form-item>
              <el-form-item label="项目名称"><el-input v-model="activeProjectEdit.name" /></el-form-item>
              <el-form-item label="项目经理"><el-input v-model="activeProjectEdit.manager" /></el-form-item>
              <el-form-item label="开始日期"><el-date-picker v-model="activeProjectEdit.startDate"
                  type="date" /></el-form-item>
              <el-form-item label="结束日期"><el-date-picker v-model="activeProjectEdit.endDate"
                  type="date" /></el-form-item>
              <el-form-item label="状态">
                <el-select v-model="activeProjectEdit.status">
                  <el-option label="未开始" value="notStarted" />
                  <el-option label="进行中" value="inProgress" />
                  <el-option label="已完成" value="completed" />
                  <el-option label="已延期" value="delayed" />
                </el-select>
              </el-form-item>
              <el-form-item label="项目描述"><el-input v-model="activeProjectEdit.description"
                  type="textarea" /></el-form-item>
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
              <el-descriptions-item label="预算金额">{{ formatCurrency(activeProjectEdit.budget) }}</el-descriptions-item>
              <el-descriptions-item label="已使用金额">{{ formatCurrency(activeProjectEdit.spent) }}</el-descriptions-item>
              <el-descriptions-item label="预计总成本">{{ formatCurrency(activeProjectEdit.estimatedCost)
              }}</el-descriptions-item>
              <el-descriptions-item label="成本偏差">{{ formatCurrency(activeProjectEdit.costVariance)
              }}</el-descriptions-item>
            </el-descriptions>
            <el-form v-else :model="activeProjectEdit" label-width="100px" label-position="left">
              <el-form-item label="预算金额"><el-input v-model.number="activeProjectEdit.budget" /></el-form-item>
              <el-form-item label="已使用金额"><el-input v-model.number="activeProjectEdit.spent" /></el-form-item>
              <el-form-item label="预计总成本"><el-input v-model.number="activeProjectEdit.estimatedCost" /></el-form-item>
              <el-form-item label="成本偏差"><el-input v-model.number="activeProjectEdit.costVariance" /></el-form-item>
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
                  <div class="stat-value" v-if="!editMode.progress">{{ activeProjectEdit.progress }}%</div>
                  <el-input v-else v-model.number="activeProjectEdit.progress" style="width: 80px;" suffix="%" />
                </div>
                <div class="stat-item">
                  <div class="stat-label">计划工时</div>
                  <div class="stat-value" v-if="!editMode.progress">{{ activeProjectEdit.plannedHours }}h</div>
                  <el-input v-else v-model.number="activeProjectEdit.plannedHours" style="width: 80px;" suffix="h" />
                </div>
                <div class="stat-item">
                  <div class="stat-label">已用工时</div>
                  <div class="stat-value" v-if="!editMode.progress">{{ activeProjectEdit.usedHours }}h</div>
                  <el-input v-else v-model.number="activeProjectEdit.usedHours" style="width: 80px;" suffix="h" />
                </div>
              </div>
              <el-progress :percentage="activeProjectEdit.progress" :stroke-width="8"
                :stroke-color="getProgressColor(activeProjectEdit.progress)" class="mt-4"></el-progress>
            </div>
            <h4 class="mt-4">关键里程碑</h4>
            <el-timeline v-if="!editMode.progress">
              <el-timeline-item v-for="(milestone, index) in activeProjectEdit.milestones" :key="index"
                :timestamp="formatDate(milestone.date)" :status="milestone.completed ? 'success' : 'process'">
                {{ milestone.name }}
                <el-tag :type="milestone.completed ? 'success' : 'info'" size="small" class="ml-2">
                  {{ milestone.completed ? '已完成' : '进行中' }}
                </el-tag>
              </el-timeline-item>
            </el-timeline>
            <el-table v-else :data="activeProjectEdit.milestones" border size="small" style="margin-bottom: 10px;">
              <el-table-column prop="name" label="里程碑名称">
                <template #default="scope">
                  <el-input v-model="scope.row.name" />
                </template>
              </el-table-column>
              <el-table-column prop="date" label="日期">
                <template #default="scope">
                  <el-date-picker v-model="scope.row.date" type="date" />
                </template>
              </el-table-column>
              <el-table-column prop="completed" label="状态">
                <template #default="scope">
                  <el-switch v-model="scope.row.completed" active-text="已完成" inactive-text="进行中" />
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
            <el-table v-if="!editMode.hours" :data="activeProjectEdit.timeRecords" border size="small">
              <el-table-column prop="date" label="日期"></el-table-column>
              <el-table-column prop="user" label="人员"></el-table-column>
              <el-table-column prop="hours" label="工时"></el-table-column>
              <el-table-column prop="task" label="任务描述"></el-table-column>
            </el-table>
            <el-table v-else :data="activeProjectEdit.timeRecords" border size="small">
              <el-table-column prop="date" label="日期">
                <template #default="scope">
                  <el-date-picker v-model="scope.row.date" type="date" />
                </template>
              </el-table-column>
              <el-table-column prop="user" label="人员">
                <template #default="scope">
                  <el-input v-model="scope.row.user" />
                </template>
              </el-table-column>
              <el-table-column prop="hours" label="工时">
                <template #default="scope">
                  <el-input v-model.number="scope.row.hours" />
                </template>
              </el-table-column>
              <el-table-column prop="task" label="任务描述">
                <template #default="scope">
                  <el-input v-model="scope.row.task" />
                </template>
              </el-table-column>
            </el-table>
            <v-chart :option="hoursChartOption" autoresize class="mt-4" style="height: 300px;"
              v-if="activeTab === 'hours'"></v-chart>
          </el-tab-pane>
        </el-tabs>
      </div>

      <!-- 遮罩层 -->
      <div class="panel-mask" :class="{ 'mask-visible': isDetailOpen }" @click="closeDetailPanel"></div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, watch } from 'vue';
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

    // 监听表格排序
    const handleSortChange = ({ prop, order }) => {
      sortState.value = { prop, order };
    };
    // 监听表格过滤
    const handleFilterChange = (filters) => {
      filterState.value = filters;
    };

    // 甘特图时间轴区间（动态）
    const timelineHeaders = computed(() => {
      if (timeRange.value === 'month') {
        // 月视图：每个单元格代表一个月
        const start = new Date(dateRange.value[0]);
        const end = new Date(dateRange.value[1]);
        const months = [];
        let cur = new Date(start.getFullYear(), start.getMonth(), 1);

        while (cur <= end) {
          // 计算该月在时间轴上的位置
          const monthStart = new Date(cur.getFullYear(), cur.getMonth(), 1);
          const monthEnd = new Date(cur.getFullYear(), cur.getMonth() + 1, 0);

          months.push({
            label1: `${cur.getFullYear()}-${(cur.getMonth() + 1).toString().padStart(2, '0')}`,
            label2: '',
            start: monthStart,
            end: monthEnd
          });
          cur.setMonth(cur.getMonth() + 1);
        }
        return months;
      } else if (timeRange.value === 'week') {
        // 周视图：每个单元格代表一周
        const start = new Date(dateRange.value[0]);
        const end = new Date(dateRange.value[1]);
        let cur = new Date(start);
        // 使 cur 指向本周一
        cur.setDate(cur.getDate() - ((cur.getDay() + 6) % 7));
        const weeks = [];
        let weekIdx = 1;
        while (cur <= end) {
          const weekStart = new Date(cur);
          const weekEnd = new Date(cur);
          weekEnd.setDate(weekEnd.getDate() + 6);

          const m1 = (weekStart.getMonth() + 1).toString().padStart(2, '0');
          const d1 = weekStart.getDate().toString().padStart(2, '0');
          weeks.push({
            label1: `W${weekIdx}`,
            label2: `${m1}/${d1}`,
            start: weekStart,
            end: weekEnd
          });
          cur.setDate(cur.getDate() + 7);
          weekIdx++;
        }
        return weeks;
      }
      return [];
    });

    // 甘特条样式（根据当前视图类型动态计算 left/width）
    function getGanttBarStyle(project) {
      const start = dateRange.value[0];
      const end = dateRange.value[1];
      const total = end.getTime() - start.getTime();
      const pStart = new Date(project.startDate);
      const pEnd = new Date(project.endDate);
      // 限制在区间内
      const barStart = Math.max(pStart.getTime(), start.getTime());
      const barEnd = Math.min(pEnd.getTime(), end.getTime());
      const left = ((barStart - start.getTime()) / total) * 100;
      const width = Math.max(0.5, ((barEnd - barStart) / total) * 100); // 最小宽度0.5%
      return {
        left: left + '%',
        width: width + '%',
        backgroundColor: project.color
      };
    }

    // 多段periods渲染支持
    // 多段periods渲染支持
    function getGanttBarStyleByPeriod(period, project) {
      const viewStart = dateRange.value[0];
      const viewEnd = dateRange.value[1];
      const total = viewEnd.getTime() - viewStart.getTime();

      const pStart = new Date(period.start);
      const pEnd = new Date(period.end);

      // 如果 period 完全在视图范围之外，则不显示
      if (pEnd < viewStart || pStart > viewEnd) {
        return {
          display: 'none'
        };
      }

      // 限制在视图范围内
      const barStart = Math.max(pStart.getTime(), viewStart.getTime());
      const barEnd = Math.min(pEnd.getTime(), viewEnd.getTime());

      const left = ((barStart - viewStart.getTime()) / total) * 100;
      const width = Math.max(0.5, ((barEnd - barStart) / total) * 100); // 最小宽度0.5%

      return {
        left: left + '%',
        width: width + '%',
        backgroundColor: project.color
      };
    }
    // 调试辅助：打印periods和函数可用性
    onMounted(() => {
      if (projects.value.length > 0) {
        console.log('测试periods:', projects.value.map(p => p.periods));
      }
      console.log('getGanttBarStyleByPeriod:', typeof getGanttBarStyleByPeriod);
    });

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

    const handleTimeRangeChange = (range) => {
      timeRange.value = range;
      // 根据时间范围调整甘特图显示
    };

    onMounted(() => {
      // 初始化逻辑
    });


    // 编辑模式相关
    const editMode = ref({
      basic: false,
      financial: false,
      progress: false,
      hours: false
    });
    const activeProjectEdit = ref({});

    // period编辑弹窗及相关方法，必须在return前声明
    const periodEditDialog = ref({ visible: false, projectId: null, periods: [] });
    function getPeriodTooltip(period, project) {
      const lines = [];
      lines.push(`开始: ${formatDate(period.start)}  结束: ${formatDate(period.end)}`);
      if (period.hours) lines.push(`工时: ${period.hours}`);
      const details = [];
      if (period.user) details.push(`人员: ${period.user}`);
      if (period.comment) details.push(`备注: ${period.comment}`);
      if (details.length > 0) lines.push(details.join('  '));
      return lines.join('\n');
    }
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

    // 切换编辑/保存
    function toggleEdit(tab) {
      if (!editMode.value[tab]) {
        // 进入编辑模式，深拷贝当前数据
        activeProjectEdit.value = JSON.parse(JSON.stringify(activeProject.value));
        editMode.value[tab] = true;
      } else {
        // 保存，前台直接更新 projects
        const idx = projects.value.findIndex(p => p.id === activeProjectEdit.value.id);
        if (idx !== -1) {
          projects.value[idx] = JSON.parse(JSON.stringify(activeProjectEdit.value));
        }
        editMode.value[tab] = false;
      }
    }
    // 取消编辑
    function cancelEdit(tab) {
      editMode.value[tab] = false;
      activeProjectEdit.value = JSON.parse(JSON.stringify(activeProject.value));
    }

    // 监听切换项目时同步编辑数据
    watch(activeProject, (val) => {
      if (val) activeProjectEdit.value = JSON.parse(JSON.stringify(val));
    }, { immediate: true });

    return {
      searchQuery,
      timeRange,
      dateRange,
      zoomLevel,
      isDetailOpen,
      activeProjectId,
      activeProject,
      activeProjectEdit,
      activeTab,
      columns,
      projects,
      filteredProjects,
      timelineHeaders,
      getGanttBarStyle,
      getGanttBarStyleByPeriod,
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
      prevTimeRange,
      nextTimeRange,
      handleTimeRangeChange,
      handleSortChange,
      handleFilterChange,
      editMode,
      toggleEdit,
      cancelEdit,
      // period编辑相关
      periodEditDialog,
      getPeriodTooltip,
      openPeriodEditDialog,
      closePeriodEditDialog,
      addPeriod,
      removePeriod,
      confirmPeriodEdit
      , getMilestoneStyle
      , getMilestoneTooltip
      , getTimelineItemStyle

    };
    // 计算milestone菱形在甘特条上的left百分比
    function getMilestoneStyle(milestone, project) {
      const viewStart = dateRange.value[0];
      const viewEnd = dateRange.value[1];
      const msDate = new Date(milestone.date);

      // 如果里程碑日期在视图范围之外，则不显示
      if (msDate < viewStart || msDate > viewEnd) {
        return {
          display: 'none'
        };
      }

      const total = viewEnd.getTime() - viewStart.getTime();
      let left = ((msDate.getTime() - viewStart.getTime()) / total) * 100;
      // 限制在0-100%区间
      left = Math.max(0, Math.min(left, 100));

      return {
        position: 'absolute',
        top: '0',
        left: left + '%',
        zIndex: 3,
        width: '0',
        height: '0',
        pointerEvents: 'auto',
      };
    }

    function getTimelineItemStyle(item) {
      const start = dateRange.value[0];
      const end = dateRange.value[1];
      const total = end.getTime() - start.getTime();

      // 计算该项的开始位置
      const itemStart = Math.max(item.start.getTime(), start.getTime());
      const itemEnd = Math.min(item.end.getTime(), end.getTime());

      const left = ((itemStart - start.getTime()) / total) * 100;
      const width = ((itemEnd - itemStart) / total) * 100;

      return {
        position: 'absolute',
        left: left + '%',
        width: width + '%',
        textAlign: 'center'
      };
    }

    // 里程碑tooltip内容
    function getMilestoneTooltip(milestone) {
      let tooltipText = `${milestone.name} (${formatDate(milestone.date)})\n状态: ${milestone.completed ? '已完成' : '进行中'}`;
      if (milestone.tag) {
        tooltipText += `\n标签: ${milestone.tag}`;
      }
      return tooltipText;
    }
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
  flex: 1 1 0%;
  min-width: 0;
  width: 100%;
  overflow: hidden;
  position: relative;
  box-sizing: border-box;
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
  flex: 1 1 0%;
  display: flex;
  flex-direction: column;
  overflow-x: visible;
  overflow-y: hidden;
  background-color: #f9fafc;
  min-width: 0;
  width: 100%;
  align-self: stretch;
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
  flex: 1 1 0%;
  overflow-x: auto;
  overflow-y: visible;
  padding: 20px 20px 20px 0;
  position: relative;
  width: 100%;
  min-width: 0;
  box-sizing: border-box;
}

.gantt-timeline {
  position: relative;
  height: 40px;
  margin-bottom: 10px;
  border-bottom: 2px solid #eaecef;
  padding-bottom: 5px;
}

.timeline-month {
  position: absolute;
  top: 0;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  font-weight: bold;
  color: #666;
  border-right: 1px solid #eaecef;
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
  overflow: visible;
}

.gantt-row-active {
  border: 1px solid #1e88e5;
}

.gantt-task-bar {
  height: 20px;
  border-radius: 4px;
  position: absolute;
  top: 16px;
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

/* 关键里程碑菱形样式 */
.gantt-milestone {
  pointer-events: auto;
  height: 100%;
  width: 0;
  position: absolute;
  top: 0;
  /* left 由内联style控制 */
}

.milestone-container {
  position: relative;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
}

.milestone-diamond {
  width: 8px;
  height: 8px;
  background: #fff;
  border: 2px solid #e67e22;
  transform: rotate(45deg);
  position: absolute;
  top: 12px;
  left: -8px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
  z-index: 4;
}

.milestone-completed {
  background: #42b983;
  border-color: #42b983;
}

.milestone-tag {
  position: absolute;
  top: -2px;
  left: -15px;
  font-size: 10px;
  font-weight: bold;
  color: #e67e22;
  white-space: nowrap;
  z-index: 4;
  padding: 0px 0px;
  border-radius: 2px;
  background-color: rgba(255, 255, 255, 0.9);
  border: 1px solid #e67e22;
  min-width: 20px;
  text-align: center;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.milestone-tag.milestone-completed {
  color: #42b983;
  border-color: #42b983;
  background-color: rgba(255, 255, 255, 0.9);
}
</style>
