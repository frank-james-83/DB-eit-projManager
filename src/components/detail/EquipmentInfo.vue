<template>
  <div class="equipment-info">
    <div style="display: flex; justify-content: flex-end; margin-bottom: 10px;">
      <el-button size="small" @click="toggleEdit">{{ isEditMode ? '保存' : '编辑' }}</el-button>
      <el-button v-if="isEditMode" size="small" @click="cancelEdit">取消</el-button>
    </div>
    
    <div class="toolbar" v-if="isEditMode">
      <el-button size="small" type="primary" @click="addEquipment">
        添加设备
      </el-button>
    </div>
    
    <el-table :data="equipmentData" border style="width: 100%">
      <el-table-column prop="id" label="#" width="60"></el-table-column>
      
      <el-table-column v-if="!isEditMode" prop="localName" label="Name(Local)"></el-table-column>
      <el-table-column v-if="isEditMode" label="Name(Local)">
        <template #default="scope">
          <el-input v-model="scope.row.localName" size="small"></el-input>
        </template>
      </el-table-column>
      
      <el-table-column v-if="!isEditMode" prop="englishName" label="Name(EN)"></el-table-column>
      <el-table-column v-if="isEditMode" label="Name(EN)">
        <template #default="scope">
          <el-input v-model="scope.row.englishName" size="small"></el-input>
        </template>
      </el-table-column>
      
      <el-table-column v-if="!isEditMode" prop="speed" label="Speed"></el-table-column>
      <el-table-column v-if="isEditMode" label="Speed">
        <template #default="scope">
          <el-input v-model="scope.row.speed" size="small"></el-input>
        </template>
      </el-table-column>
      
      <el-table-column v-if="!isEditMode" prop="supplier" label="Supplier"></el-table-column>
      <el-table-column v-if="isEditMode" label="Supplier">
        <template #default="scope">
          <el-input v-model="scope.row.supplier" size="small"></el-input>
        </template>
      </el-table-column>
      
      <el-table-column v-if="!isEditMode" prop="serialNumber" label="Serial Number" width="240"></el-table-column>
      <el-table-column v-if="isEditMode" label="Serial Number" width="240">
        <template #default="scope">
          <el-input v-model="scope.row.serialNumber" size="small"></el-input>
        </template>
      </el-table-column>
      
      <el-table-column v-if="!isEditMode" prop="ipAddress" label="IP Address"></el-table-column>
      <el-table-column v-if="isEditMode" label="IP Address">
        <template #default="scope">
          <el-input v-model="scope.row.ipAddress" size="small"></el-input>
        </template>
      </el-table-column>
      
      <el-table-column v-if="!isEditMode" prop="plcType" label="PLC Type"></el-table-column>
      <el-table-column v-if="isEditMode" label="PLC Type">
        <template #default="scope">
          <el-input v-model="scope.row.plcType" size="small"></el-input>
        </template>
      </el-table-column>
      
      <el-table-column v-if="!isEditMode" prop="communicationType" label="Communication Type"></el-table-column>
      <el-table-column v-if="isEditMode" label="Communication Type">
        <template #default="scope">
          <el-input v-model="scope.row.communicationType" size="small"></el-input>
        </template>
      </el-table-column>
      
      <el-table-column v-if="!isEditMode" prop="tagsReceived" label="TAGS or Programs Received"></el-table-column>
      <el-table-column v-if="isEditMode" label="TAGS or Programs Received">
        <template #default="scope">
          <el-select v-model="scope.row.tagsReceived" size="small">
            <el-option label="Yes" value="Yes"></el-option>
            <el-option label="No" value="No"></el-option>
          </el-select>
        </template>
      </el-table-column>
      
      <el-table-column v-if="isEditMode" label="操作" width="120">
        <template #default="scope">
          <el-button size="small" type="danger" @click="removeEquipment(scope.$index)">
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script>
import { ref, computed } from 'vue'

export default {
  name: 'EquipmentInfo',
  props: {
    project: {
      type: Object,
      required: true
    },
    isEditMode: {
      type: Boolean,
      default: false
    }
  },
  emits: ['toggle-edit', 'cancel-edit'],
  setup(props, { emit }) {
    // 从项目数据中获取设备数据
    const equipmentData = computed(() => {
      return props.project.equipments || []
    })

    // 添加设备
    const addEquipment = () => {
      const newId = equipmentData.value.length > 0 
        ? Math.max(...equipmentData.value.map(item => item.id)) + 1 
        : 1
      
      equipmentData.value.push({
        id: newId,
        localName: '',
        englishName: '',
        speed: '',
        supplier: '',
        serialNumber: '',
        ipAddress: '',
        plcType: '',
        communicationType: '',
        tagsReceived: 'Yes'
      })
    }

    // 删除设备
    const removeEquipment = (index) => {
      equipmentData.value.splice(index, 1)
    }
    
    // 切换编辑模式
    const toggleEdit = () => {
      emit('toggle-edit')
    }
    
    // 取消编辑
    const cancelEdit = () => {
      emit('cancel-edit')
    }

    return {
      equipmentData,
      addEquipment,
      removeEquipment,
      toggleEdit,
      cancelEdit
    }
  }
}
</script>

<style scoped>
.equipment-info {
  padding: 20px;
}

.toolbar {
  margin-bottom: 15px;
  text-align: right;
}
</style>