<template>
  <div>
    <div style="display: flex; justify-content: flex-end; margin-bottom: 10px;">
      <el-button size="small" @click="toggleEdit">{{ isEditMode ? '保存' : '编辑' }}</el-button>
      <el-button v-if="isEditMode" size="small" @click="cancelEdit">取消</el-button>
    </div>
    <el-descriptions :column="1" border v-if="!isEditMode">
      <el-descriptions-item label="项目编号">{{ project.projectId }}</el-descriptions-item>
      <el-descriptions-item label="EIT_WBS号">{{ project.eitWbs }}</el-descriptions-item>
      <el-descriptions-item label="项目名称">{{ project.name }}</el-descriptions-item>
      <el-descriptions-item label="项目经理">{{ project.manager }}</el-descriptions-item>
      <el-descriptions-item label="现场经理">{{ project.siteManager }}</el-descriptions-item>
      <el-descriptions-item label="开始日期">{{ formatDate(project.startDate) }}</el-descriptions-item>
      <el-descriptions-item label="结束日期">{{ formatDate(project.endDate) }}</el-descriptions-item>
      <el-descriptions-item label="状态">{{ getStatusLabel(project.status) }}</el-descriptions-item>
      <el-descriptions-item label="工时预算">{{ project.budgetHours }}h</el-descriptions-item>
      <el-descriptions-item label="项目描述">{{ project.description }}</el-descriptions-item>
      <el-descriptions-item label="CEP No.">{{ project.cepNo }}</el-descriptions-item>
      <el-descriptions-item label="客户简称">{{ project.customerShortName }}</el-descriptions-item>
      <el-descriptions-item label="客户全称">{{ project.customerFullName }}</el-descriptions-item>
      <el-descriptions-item label="客户英文名称">{{ project.customerEnglishName }}</el-descriptions-item>
      <el-descriptions-item label="客户地址">{{ project.customerAddress }}</el-descriptions-item>
    </el-descriptions>
    <el-form v-else :model="project" label-width="120px" label-position="left">
      <el-form-item label="项目编号">
        <el-input v-model="project.projectId" />
      </el-form-item>
      <el-form-item label="EIT_WBS号">
        <el-input v-model="project.eitWbs" />
      </el-form-item>
      <el-form-item label="项目名称">
        <el-input v-model="project.name" />
      </el-form-item>
      <el-form-item label="项目经理">
        <el-select v-model="project.manager" placeholder="请选择项目经理">
          <el-option
            v-for="manager in projectManagers"
            :key="manager.id"
            :label="manager.name"
            :value="manager.name">
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="现场经理">
        <el-select v-model="project.siteManager" placeholder="请选择现场经理">
          <el-option
            v-for="manager in siteManagers"
            :key="manager.id"
            :label="manager.name"
            :value="manager.name">
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="开始日期">
        <el-date-picker v-model="project.startDate" type="date" />
      </el-form-item>
      <el-form-item label="结束日期">
        <el-date-picker v-model="project.endDate" type="date" />
      </el-form-item>
      <el-form-item label="状态">
        <el-select v-model="project.status">
          <el-option label="未开始" value="notStarted" />
          <el-option label="进行中" value="inProgress" />
          <el-option label="已完成" value="completed" />
          <el-option label="已延期" value="delayed" />
        </el-select>
      </el-form-item>
      <el-form-item label="工时预算">
        <el-input v-model.number="project.budgetHours" type="number" />
      </el-form-item>
      <el-form-item label="项目描述">
        <el-input v-model="project.description" type="textarea" />
      </el-form-item>
      <el-form-item label="CEP No.">
        <el-input v-model="project.cepNo" />
      </el-form-item>
      <el-form-item label="客户简称">
        <el-input v-model="project.customerShortName" />
      </el-form-item>
      <el-form-item label="客户全称">
        <el-input v-model="project.customerFullName" />
      </el-form-item>
      <el-form-item label="客户英文名称">
        <el-input v-model="project.customerEnglishName" />
      </el-form-item>
      <el-form-item label="客户地址">
        <el-input v-model="project.customerAddress" />
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
import { defineProps, defineEmits } from 'vue';

export default {
  name: 'BasicInfo',
  props: {
    project: {
      type: Object,
      required: true
    },
    isEditMode: {
      type: Boolean,
      default: false
    },
    projectManagers: {
      type: Array,
      default: () => []
    },
    siteManagers: {
      type: Array,
      default: () => []
    },
    formatDate: {
      type: Function,
      required: true
    },
    getStatusLabel: {
      type: Function,
      required: true
    }
  },
  emits: ['toggle-edit', 'cancel-edit'],
  setup(props, { emit }) {
    const toggleEdit = () => {
      emit('toggle-edit');
    };

    const cancelEdit = () => {
      emit('cancel-edit');
    };

    return {
      toggleEdit,
      cancelEdit
    };
  }
};
</script>