<template>
  <div class="home-container">
    <el-container class="layout-container">
      <!-- 主体内容 -->
      <el-main class="main-content">
        <router-view />
      </el-main>
    </el-container>
  </div>
</template>

<script>
export default {
  name: 'Home'
}
</script>

<style scoped>
.home-container {
  height: 100vh;
}

.layout-container {
  height: 100%;
}

.main-content {
  padding: 0;
  height: 100%;
}
</style>