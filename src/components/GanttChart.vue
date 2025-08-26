<template>
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
        <el-select :model-value="timeRange" size="small" class="ml-2" @change="handleTimeRangeChange">
          <el-option label="周视图" value="week"></el-option>
          <el-option label="月视图" value="month"></el-option>
        </el-select>
        <el-date-picker 
          :model-value="dateRange" 
          type="daterange" 
          range-separator="至" 
          start-placeholder="开始日期"
          end-placeholder="结束日期" 
          size="small" 
          class="ml-2 gantt-date-picker"
          style="min-width: 260px; width: 320px;" 
          @update:modelValue="handleDateRangeChange">
        </el-date-picker>
      </div>
    </div>

    <!-- 甘特图组件 -->
    <div class="gantt-chart">
      <!-- 时间轴头部 -->
      <div class="gantt-timeline">
        <div v-for="(item, index) in timelineHeaders" :key="index" class="timeline-month"
          :style="getTimelineItemStyle(item)">
          <div>{{ item.label1 }}</div>
          <div v-if="item.label2" style="font-size:12px;color:#888;">{{ item.label2 }}</div>
        </div>
      </div>
      <!-- 甘特图项目行 -->
      <div v-for="project in sortedProjects" :key="project.id" class="gantt-row"
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
</template>

<script>
import { ref, computed } from 'vue'

export default {
  name: 'GanttChart',
  props: {
    projects: {
      type: Array,
      required: true
    },
    timeRange: {
      type: String,
      required: true
    },
    dateRange: {
      type: Array,
      required: true
    },
    activeProjectId: {
      type: [String, Number],
      default: null
    },
    sortBy: {
      type: Object,
      default: () => ({ field: '', order: 0 })
    }
  },
  emits: ['update:timeRange', 'update:dateRange', 'prev-time-range', 'next-time-range', 'time-range-change', 'period-edit'],
  setup(props, { emit }) {
    // 甘特图时间轴区间（动态）
    const timelineHeaders = computed(() => {
      if (props.timeRange === 'month') {
        // 月视图：每个单元格代表一个月
        const start = new Date(props.dateRange[0]);
        const end = new Date(props.dateRange[1]);
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
      } else if (props.timeRange === 'week') {
        // 周视图：每个单元格代表一周
        const start = new Date(props.dateRange[0]);
        const end = new Date(props.dateRange[1]);
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

    // 根据排序属性对项目进行排序
    const sortedProjects = computed(() => {
      if (!props.sortBy || !props.sortBy.field || props.sortBy.order === 0) {
        return props.projects;
      }

      const field = props.sortBy.field;
      const order = props.sortBy.order;
      
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

      // 计算进度百分比
      const calculateProgressPercentage = (usedHours, plannedHours) => {
        if (!plannedHours || plannedHours === 0) return 0;
        const percentage = Math.round((usedHours / plannedHours) * 100);
        return Math.min(100, Math.max(0, percentage));
      };
      
      return [...props.projects].sort((a, b) => {
        let aVal, bVal;
        
        // 根据字段名称获取正确的值
        switch (field) {
          case 'plannedHours':
            aVal = calculatePlannedHours(a);
            bVal = calculatePlannedHours(b);
            break;
          case 'usedHours':
            aVal = calculateUsedHours(a);
            bVal = calculateUsedHours(b);
            break;
          case 'progress':
            const aPlanned = calculatePlannedHours(a);
            const aUsed = calculateUsedHours(a);
            const bPlanned = calculatePlannedHours(b);
            const bUsed = calculateUsedHours(b);
            aVal = calculateProgressPercentage(aUsed, aPlanned);
            bVal = calculateProgressPercentage(bUsed, bPlanned);
            break;
          default:
            aVal = a[field];
            bVal = b[field];
        }
        
        // 处理比较逻辑
        if (typeof aVal === 'string' && typeof bVal === 'string') {
          const result = aVal.localeCompare(bVal);
          return order === 1 ? result : -result;
        } else if (typeof aVal === 'number' && typeof bVal === 'number') {
          // 对数字进行排序
          if (aVal < bVal) {
            return order === 1 ? -1 : 1;
          }
          if (aVal > bVal) {
            return order === 1 ? 1 : -1;
          }
          return 0;
        } else {
          // 处理不同类型的情况（例如数字与字符串比较）
          // 将非数字值排在最后
          if (typeof aVal === 'number' && typeof bVal !== 'number') {
            return order === 1 ? -1 : 1;
          }
          if (typeof aVal !== 'number' && typeof bVal === 'number') {
            return order === 1 ? 1 : -1;
          }
          // 如果都不是数字且都不是字符串，则保持原顺序
          return 0;
        }
      });
    });

    // 多段periods渲染支持
    function getGanttBarStyleByPeriod(period, project) {
      const viewStart = new Date(props.dateRange[0]);
      const viewEnd = new Date(props.dateRange[1]);
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

    // 计算milestone菱形在甘特条上的left百分比
    function getMilestoneStyle(milestone, project) {
      const viewStart = new Date(props.dateRange[0]);
      const viewEnd = new Date(props.dateRange[1]);
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
      const start = new Date(props.dateRange[0]);
      const end = new Date(props.dateRange[1]);
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

    function formatDate(dateString) {
      const date = new Date(dateString);
      return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
    }

    // 切换前/后时间区间
    function prevTimeRange() {
      emit('prev-time-range');
    }
    
    function nextTimeRange() {
      emit('next-time-range');
    }

    function handleTimeRangeChange(range) {
      emit('update:timeRange', range);
    }

    function handleDateRangeChange(range) {
      if (range && range.length === 2) {
        emit('update:dateRange', range);
      }
    }

    function openPeriodEditDialog(project) {
      emit('period-edit', project);
    }

    return {
      timelineHeaders,
      getGanttBarStyleByPeriod,
      getMilestoneStyle,
      getTimelineItemStyle,
      getMilestoneTooltip,
      getPeriodTooltip,
      formatDate,
      prevTimeRange,
      nextTimeRange,
      handleTimeRangeChange,
      handleDateRangeChange,
      openPeriodEditDialog,
      sortedProjects
    };
  }
};
</script>

<style scoped>
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

.task-label {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
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