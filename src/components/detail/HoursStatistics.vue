<template>
  <div>
    <div style="display: flex; justify-content: flex-end; margin-bottom: 10px;">
      <el-button size="small" @click="toggleEdit">{{ isEditMode ? '保存' : '编辑' }}</el-button>
      <el-button v-if="isEditMode" size="small" @click="addPeriod">增加区间</el-button>
      <el-button v-if="isEditMode" size="small" @click="cancelEdit">取消</el-button>
    </div>
    <div v-if="!isEditMode && showChart" style="height: 300px; margin-bottom: 20px;">
      <v-chart 
        :option="chartOption" 
        autoresize 
        class="mt-4" 
        style="height: 100%;"
        @ready="onChartReady">
      </v-chart>
    </div>
    <el-table v-if="!isEditMode" :data="project.periods" border size="small">
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
    <el-table v-else :data="project.periods" border size="small">
      <el-table-column label="开始时间">
        <template #default="scope">
          <el-date-picker v-model="project.periods[scope.$index].start" type="date" />
        </template>
      </el-table-column>
      <el-table-column label="结束时间">
        <template #default="scope">
          <el-date-picker v-model="project.periods[scope.$index].end" type="date" />
        </template>
      </el-table-column>
      <el-table-column label="工时">
        <template #default="scope">
          <el-input v-model.number="project.periods[scope.$index].hours" type="number" />
        </template>
      </el-table-column>
      <el-table-column label="EIT工程师">
        <template #default="scope">
          <el-select 
            v-model="project.periods[scope.$index].user" 
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
          <el-input v-model="project.periods[scope.$index].comment" />
        </template>
      </el-table-column>
      <el-table-column label="操作" width="80">
        <template #default="scope">
          <el-button @click="removePeriod(scope.$index)" type="danger" size="small">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script>
export default {
  name: 'HoursStatistics',
  props: {
    project: {
      type: Object,
      required: true
    },
    isEditMode: {
      type: Boolean,
      default: false
    },
    showChart: {
      type: Boolean,
      default: false
    },
    chartOption: {
      type: Object,
      required: true
    },
    formatDate: {
      type: Function,
      required: true
    },
    calculateActualHours: {
      type: Function,
      required: true
    },
    calculatePlannedHours: {
      type: Function,
      required: true
    },
    eitEngineersList: {
      type: Array,
      default: () => []
    }
  },
  emits: ['toggle-edit', 'cancel-edit', 'add-period', 'remove-period', 'chart-ready'],
  setup(props, { emit }) {
    const toggleEdit = () => {
      emit('toggle-edit');
    };

    const cancelEdit = () => {
      emit('cancel-edit');
    };

    const addPeriod = () => {
      emit('add-period');
    };

    const removePeriod = (index) => {
      emit('remove-period', index);
    };

    const onChartReady = (chart) => {
      emit('chart-ready', chart);
    };

    return {
      toggleEdit,
      cancelEdit,
      addPeriod,
      removePeriod,
      onChartReady
    };
  }
};
</script>