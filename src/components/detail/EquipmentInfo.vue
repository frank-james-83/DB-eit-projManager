<template>
  <div class="equipment-info">
    <el-table :data="equipmentData" border style="width: 100%">
      <el-table-column prop="id" label="#" width="60"></el-table-column>
      <el-table-column prop="localName" label="Name(Local)"></el-table-column>
      <el-table-column prop="englishName" label="Name(EN)"></el-table-column>
      <el-table-column prop="speed" label="Speed"></el-table-column>
      <el-table-column prop="supplier" label="Supplier"></el-table-column>
      <el-table-column prop="serialNumber" label="Serial Number" width="240"></el-table-column>
      <el-table-column prop="ipAddress" label="IP Address"></el-table-column>
      <el-table-column prop="plcType" label="PLC Type"></el-table-column>
      <el-table-column prop="communicationType" label="Communication Type"></el-table-column>
      <el-table-column prop="tagsReceived" label="TAGS or Programs Received"></el-table-column>
    </el-table>
  </div>
</template>

<script>
export default {
  name: 'EquipmentInfo',
  props: {
    project: {
      type: Object,
      required: true
    }
  },
  setup(props) {
    // 设备数据
    const equipmentData = [
      {
        id: 1,
        localName: '吹瓶机',
        englishName: 'Combi-blower',
        speed: '48000',
        supplier: 'SIDEL',
        serialNumber: 'SBO22M#220086 COMBI C5 SBMXGM220086',
        ipAddress: '',
        plcType: 'B&R',
        communicationType: 'Ethernet',
        tagsReceived: 'Yes'
      },
      {
        id: 2,
        localName: '灌装机',
        englishName: 'Combi-filler',
        speed: '48000',
        supplier: 'SIDEL',
        serialNumber: 'Combi Predis FMa 22/100/30T #1542',
        ipAddress: '',
        plcType: 'SIEMENS',
        communicationType: 'Ethernet',
        tagsReceived: 'Yes'
      },
      {
        id: 3,
        localName: '上盖机',
        englishName: 'cap feeder',
        speed: '48000',
        supplier: 'SIDEL',
        serialNumber: 'Aidlin 24-24',
        ipAddress: '',
        plcType: 'SIEMENS',
        communicationType: 'Ethernet',
        tagsReceived: 'Yes'
      }
    ];

    return {
      equipmentData
    };
  }
};
</script>

<style scoped>
.equipment-info {
  padding: 20px;
}
</style>