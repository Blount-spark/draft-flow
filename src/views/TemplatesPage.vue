<template>
  <div class="templates-page">
    <div class="page-header">
      <el-page-header @back="goBack">
        <template #content>
          <span class="page-title">模板库</span>
        </template>
      </el-page-header>
    </div>
    
    <div class="page-content">
      <TemplateLibrary @use-template="handleUseTemplate" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import TemplateLibrary from '@/components/TemplateLibrary.vue'

const router = useRouter()

function goBack() {
  router.push('/')
}

function handleUseTemplate() {
  router.push('/')
}
</script>

<style scoped>
.templates-page {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: #f5f7fa;
}

.page-header {
  background: white;
  padding: 15px 20px;
  border-bottom: 1px solid #e4e7ed;
}

.page-title {
  font-size: 18px;
  font-weight: 600;
}

.page-content {
  flex: 1;
  overflow-y: auto;
}
</style>
