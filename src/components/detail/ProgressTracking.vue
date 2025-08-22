<template>
  <div>
    <div class="progress-overview">
      <div class="progress-stats">
        <div class="stat-item">
          <div class="stat-label">总体进度</div>
          <div class="stat-value">{{ progressPercentage }}%</div>
        </div>
        <div class="stat-item">
          <div class="stat-label">计划工时</div>
          <div class="stat-value">{{ plannedHours }}h</div>
        </div>
        <div class="stat-item">
          <div class="stat-label">已用工时</div>
          <div class="stat-value">{{ usedHours }}h</div>
        </div>
      </div>
      <el-progress 
        :percentage="progressPercentage" 
        :stroke-width="8"
        :stroke-color="getProgressColor(progressPercentage)" 
        class="mt-4">
      </el-progress>
    </div>
    <h4 class="mt-4">关键里程碑</h4>
    <div style="display: flex; justify-content: flex-end; margin-bottom: 10px;">
      <el-button size="small" @click="toggleEdit">{{ isEditMode ? '保存' : '编辑' }}</el-button>
      <el-button v-if="isEditMode" size="small" @click="addMilestone">新增</el-button>
      <el-button v-if="isEditMode" size="small" @click="cancelEdit">取消</el-button>
    </div>
    <el-timeline v-if="!isEditMode">
      <el-timeline-item 
        v-for="(milestone, index) in project.milestones" 
        :key="index"
        :timestamp="formatDate(milestone.date)" 
        :status="milestone.completed ? 'success' : 'process'">
        {{ milestone.name }}
        <el-tag :type="milestone.completed ? 'success' : 'info'" size="small" class="ml-2">
          {{ milestone.completed ? '已完成' : '进行中' }}
        </el-tag>
        <el-tag v-if="milestone.tag" size="small" class="ml-2">
          {{ milestone.tag }}
        </el-tag>
      </el-timeline-item>
    </el-timeline>
    <el-table v-else :data="project.milestones" border size="small" style="margin-bottom: 10px;">
      <el-table-column prop="name" label="里程碑名称">
        <template #default="scope">
          <el-input v-model="project.milestones[scope.$index].name" />
        </template>
      </el-table-column>
      <el-table-column prop="date" label="日期">
        <template #default="scope">
          <el-date-picker v-model="project.milestones[scope.$index].date" type="date" />
        </template>
      </el-table-column>
      <el-table-column prop="completed" label="状态">
        <template #default="scope">
          <el-switch 
            v-model="project.milestones[scope.$index].completed" 
            active-text="已完成" 
            inactive-text="进行中" />
        </template>
      </el-table-column>
      <el-table-column prop="tag" label="标签">
        <template #default="scope">
          <el-input v-model="project.milestones[scope.$index].tag" />
        </template>
      </el-table-column>
      <el-table-column label="操作" width="80">
        <template #default="scope">
          <el-button @click="removeMilestone(scope.$index)" type="danger" size="small">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script>
export default {
  name: 'ProgressTracking',
  props: {
    project: {
      type: Object,
      required: true
    },
    isEditMode: {
      type: Boolean,
      default: false
    },
    progressPercentage: {
      type: Number,
      required: true
    },
    plannedHours: {
      type: Number,
      required: true
    },
    usedHours: {
      type: Number,
      required: true
    },
    formatDate: {
      type: Function,
      required: true
    },
    getProgressColor: {
      type: Function,
      required: true
    }
  },
  emits: ['toggle-edit', 'cancel-edit', 'add-milestone', 'remove-milestone'],
  setup(props, { emit }) {
    const toggleEdit = () => {
      emit('toggle-edit');
    };

    const cancelEdit = () => {
      emit('cancel-edit');
    };

    const addMilestone = () => {
      emit('add-milestone');
    };

    const removeMilestone = (index) => {
      emit('remove-milestone', index);
    };

    return {
      toggleEdit,
      cancelEdit,
      addMilestone,
      removeMilestone
    };
  }
};
</script>

<style scoped>
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
</style>