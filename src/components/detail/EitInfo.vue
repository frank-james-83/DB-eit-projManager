<template>
  <div>
    <div style="display: flex; justify-content: flex-end; margin-bottom: 10px;">
      <el-button size="small" @click="toggleEdit">{{ isEditMode ? '保存' : '编辑' }}</el-button>
      <el-button v-if="isEditMode" size="small" @click="cancelEdit">取消</el-button>
    </div>
    
    <!-- EIT模块 -->
    <h4>EIT模块</h4>
    <el-table v-if="!isEditMode" :data="project.eitModules" border size="small" style="margin-bottom: 20px;">
      <el-table-column prop="name" label="模块名称"></el-table-column>
      <el-table-column prop="value" label="数量/状态"></el-table-column>
      <el-table-column prop="remark" label="备注"></el-table-column>
    </el-table>
    <div v-else>
      <el-table :data="project.eitModules" border size="small" style="margin-bottom: 10px;">
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
    <el-table v-if="!isEditMode" :data="project.hardwareSoftware" border size="small">
      <el-table-column prop="itemNumber" label="物料号"></el-table-column>
      <el-table-column prop="name" label="名称"></el-table-column>
      <el-table-column prop="category" label="类别"></el-table-column>
      <el-table-column prop="unit" label="单位"></el-table-column>
      <el-table-column prop="quantity" label="数量"></el-table-column>
      <el-table-column prop="description" label="规格"></el-table-column>
    </el-table>
    <div v-else>
      <el-table :data="project.hardwareSoftware" border size="small">
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
                :label="material.name + ' (' + material.spec + ')'"
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
  </div>
</template>

<script>
export default {
  name: 'EitInfo',
  props: {
    project: {
      type: Object,
      required: true
    },
    isEditMode: {
      type: Boolean,
      default: false
    },
    materialsList: {
      type: Array,
      default: () => []
    },
    materialCategoriesList: {
      type: Array,
      default: () => []
    }
  },
  emits: [
    'toggle-edit', 
    'cancel-edit', 
    'add-eit-module', 
    'remove-eit-module', 
    'add-hardware-software', 
    'remove-hardware-software',
    'material-select'
  ],
  setup(props, { emit }) {
    const toggleEdit = () => {
      emit('toggle-edit');
    };

    const cancelEdit = () => {
      emit('cancel-edit');
    };

    const addEitModule = () => {
      emit('add-eit-module');
    };

    const removeEitModule = (index) => {
      emit('remove-eit-module', index);
    };

    const addHardwareSoftware = () => {
      emit('add-hardware-software');
    };

    const removeHardwareSoftware = (index) => {
      emit('remove-hardware-software', index);
    };

    const handleMaterialSelect = (row, materialId) => {
      emit('material-select', row, materialId);
    };

    return {
      toggleEdit,
      cancelEdit,
      addEitModule,
      removeEitModule,
      addHardwareSoftware,
      removeHardwareSoftware,
      handleMaterialSelect
    };
  }
};
</script>