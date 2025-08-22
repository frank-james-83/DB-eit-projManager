<template>
  <div class="equipment-info">
    <div style="display: flex; justify-content: flex-end; margin-bottom: 10px;">
      <el-button size="small" @click="toggleEdit">{{ isEditMode ? '保存' : '编辑' }}</el-button>
      <el-button v-if="isEditMode" size="small" @click="cancelEdit">取消</el-button>
    </div>
    
    <h3>设备信息</h3>
    
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
    
    <h3 style="margin-top: 30px;">Measure模块</h3>
    
    <div class="toolbar" v-if="isEditMode">
      <el-button size="small" type="primary" @click="addMeasure">
        添加Measure
      </el-button>
    </div>
    
    <el-table :data="measureData" border style="width: 100%; margin-top: 10px;">
      <el-table-column prop="id" label="#" width="60"></el-table-column>
      
      <el-table-column v-if="!isEditMode" prop="type" label="Type"></el-table-column>
      <el-table-column v-if="isEditMode" label="Type">
        <template #default="scope">
          <el-input v-model="scope.row.type" size="small"></el-input>
        </template>
      </el-table-column>
      
      <el-table-column v-if="!isEditMode" prop="equipment" label="Equipment"></el-table-column>
      <el-table-column v-if="isEditMode" label="Equipment">
        <template #default="scope">
          <el-input v-model="scope.row.equipment" size="small"></el-input>
        </template>
      </el-table-column>
      
      <el-table-column v-if="!isEditMode" prop="measureName" label="Measure Name" width="200"></el-table-column>
      <el-table-column v-if="isEditMode" label="Measure Name" width="200">
        <template #default="scope">
          <el-input v-model="scope.row.measureName" size="small"></el-input>
        </template>
      </el-table-column>
      
      <el-table-column v-if="!isEditMode" prop="measureNameChinese" label="Measure Name 中文" width="150"></el-table-column>
      <el-table-column v-if="isEditMode" label="Measure Name 中文" width="150">
        <template #default="scope">
          <el-input v-model="scope.row.measureNameChinese" size="small"></el-input>
        </template>
      </el-table-column>
      
      <el-table-column v-if="!isEditMode" prop="unit" label="Unit"></el-table-column>
      <el-table-column v-if="isEditMode" label="Unit">
        <template #default="scope">
          <el-input v-model="scope.row.unit" size="small"></el-input>
        </template>
      </el-table-column>
      
      <el-table-column v-if="!isEditMode" prop="precision" label="Precision"></el-table-column>
      <el-table-column v-if="isEditMode" label="Precision">
        <template #default="scope">
          <el-input v-model="scope.row.precision" size="small"></el-input>
        </template>
      </el-table-column>
      
      <el-table-column v-if="!isEditMode" prop="minValue" label="Min Value"></el-table-column>
      <el-table-column v-if="isEditMode" label="Min Value">
        <template #default="scope">
          <el-input v-model="scope.row.minValue" size="small"></el-input>
        </template>
      </el-table-column>
      
      <el-table-column v-if="!isEditMode" prop="maxValue" label="Max Value"></el-table-column>
      <el-table-column v-if="isEditMode" label="Max Value">
        <template #default="scope">
          <el-input v-model="scope.row.maxValue" size="small"></el-input>
        </template>
      </el-table-column>
      
      <el-table-column v-if="!isEditMode" prop="setPoint" label="Set Point"></el-table-column>
      <el-table-column v-if="isEditMode" label="Set Point">
        <template #default="scope">
          <el-input v-model="scope.row.setPoint" size="small"></el-input>
        </template>
      </el-table-column>
      
      <el-table-column v-if="!isEditMode" prop="hiHi" label="HiHi"></el-table-column>
      <el-table-column v-if="isEditMode" label="HiHi">
        <template #default="scope">
          <el-input v-model="scope.row.hiHi" size="small"></el-input>
        </template>
      </el-table-column>
      
      <el-table-column v-if="!isEditMode" prop="hi" label="Hi"></el-table-column>
      <el-table-column v-if="isEditMode" label="Hi">
        <template #default="scope">
          <el-input v-model="scope.row.hi" size="small"></el-input>
        </template>
      </el-table-column>
      
      <el-table-column v-if="!isEditMode" prop="lo" label="Lo"></el-table-column>
      <el-table-column v-if="isEditMode" label="Lo">
        <template #default="scope">
          <el-input v-model="scope.row.lo" size="small"></el-input>
        </template>
      </el-table-column>
      
      <el-table-column v-if="!isEditMode" prop="loLo" label="LoLo"></el-table-column>
      <el-table-column v-if="isEditMode" label="LoLo">
        <template #default="scope">
          <el-input v-model="scope.row.loLo" size="small"></el-input>
        </template>
      </el-table-column>
      
      <el-table-column v-if="isEditMode" label="操作" width="120">
        <template #default="scope">
          <el-button size="small" type="danger" @click="removeMeasure(scope.$index)">
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>
    
    <h3 style="margin-top: 30px;">ECO模块</h3>
    
    <div class="toolbar" v-if="isEditMode">
      <el-button size="small" type="primary" @click="addEco">
        添加ECO
      </el-button>
    </div>
    
    <el-table :data="ecoData" border style="width: 100%; margin-top: 10px;">
      <el-table-column prop="id" label="#" width="60"></el-table-column>
      
      <el-table-column v-if="!isEditMode" prop="consumptionNameChinese" label="Consumption Name Chinese"></el-table-column>
      <el-table-column v-if="isEditMode" label="Consumption Name Chinese">
        <template #default="scope">
          <el-input v-model="scope.row.consumptionNameChinese" size="small"></el-input>
        </template>
      </el-table-column>
      
      <el-table-column v-if="!isEditMode" prop="consumptionNameEnglish" label="Consumption Name English"></el-table-column>
      <el-table-column v-if="isEditMode" label="Consumption Name English">
        <template #default="scope">
          <el-input v-model="scope.row.consumptionNameEnglish" size="small"></el-input>
        </template>
      </el-table-column>
      
      <el-table-column v-if="!isEditMode" prop="unit" label="Unit"></el-table-column>
      <el-table-column v-if="isEditMode" label="Unit">
        <template #default="scope">
          <el-input v-model="scope.row.unit" size="small"></el-input>
        </template>
      </el-table-column>
      
      <el-table-column v-if="!isEditMode" prop="unitPrice" label="Unit Price"></el-table-column>
      <el-table-column v-if="isEditMode" label="Unit Price">
        <template #default="scope">
          <el-input v-model="scope.row.unitPrice" size="small"></el-input>
        </template>
      </el-table-column>
      
      <el-table-column v-if="isEditMode" label="操作" width="120">
        <template #default="scope">
          <el-button size="small" type="danger" @click="removeEco(scope.$index)">
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
    
    // 从项目数据中获取measure数据
    const measureData = computed(() => {
      return props.project.measures || []
    })
    
    // 从项目数据中获取ECO数据
    const ecoData = computed(() => {
      return props.project.ecos || []
    })

    // 添加设备
    const addEquipment = () => {
      if (!props.project.equipments) {
        props.project.equipments = []
      }
      
      const newId = props.project.equipments.length > 0 
        ? Math.max(...props.project.equipments.map(item => item.id)) + 1 
        : 1
      
      props.project.equipments.push({
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
      if (props.project.equipments) {
        props.project.equipments.splice(index, 1)
      }
    }
    
    // 添加measure
    const addMeasure = () => {
      if (!props.project.measures) {
        props.project.measures = []
      }
      
      const newId = props.project.measures.length > 0 
        ? Math.max(...props.project.measures.map(item => item.id)) + 1 
        : 1
      
      props.project.measures.push({
        id: newId,
        type: '',
        equipment: '',
        measureName: '',
        measureNameChinese: '',
        unit: '',
        precision: '',
        minValue: '',
        maxValue: '',
        setPoint: '',
        hiHi: '',
        hi: '',
        lo: '',
        loLo: ''
      })
    }

    // 删除measure
    const removeMeasure = (index) => {
      if (props.project.measures) {
        props.project.measures.splice(index, 1)
      }
    }
    
    // 添加ECO
    const addEco = () => {
      if (!props.project.ecos) {
        props.project.ecos = []
      }
      
      const newId = props.project.ecos.length > 0 
        ? Math.max(...props.project.ecos.map(item => item.id)) + 1 
        : 1
      
      props.project.ecos.push({
        id: newId,
        consumptionNameChinese: '',
        consumptionNameEnglish: '',
        unit: '',
        unitPrice: ''
      })
    }

    // 删除ECO
    const removeEco = (index) => {
      if (props.project.ecos) {
        props.project.ecos.splice(index, 1)
      }
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
      measureData,
      ecoData,
      addEquipment,
      removeEquipment,
      addMeasure,
      removeMeasure,
      addEco,
      removeEco,
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

h3 {
  margin: 20px 0 10px 0;
  font-weight: bold;
}
</style>