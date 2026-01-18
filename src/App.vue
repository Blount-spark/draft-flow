<template>
  <div id="app">
    <el-container>
      <el-header class="app-header">
        <div class="header-content">
          <div class="header-left">
            <el-button 
              class="menu-toggle"
              :icon="isMenuOpen ? Close : Menu"
              @click="toggleMenu"
              circle
            />
            <h1>图文草稿批量生成器</h1>
          </div>
          <div class="header-info">
            <el-tag v-if="hasProducts" type="success">
              商品: {{ products.length }}
            </el-tag>
            <el-tag v-if="hasDrafts" type="primary">
              草稿: {{ draftResults.length }}
            </el-tag>
          </div>
        </div>
      </el-header>

      <el-container class="main-container">
        <el-aside 
          :width="isMenuOpen ? '350px' : '0px'" 
          class="left-panel"
          :class="{ 'panel-hidden': !isMenuOpen }"
        >
          <div class="panel-content">
            <MaterialInput />
            
            <el-divider />

            <el-card>
              <template #header>
                <div class="card-header">
                  <span>商品列表</span>
                  <el-button 
                    type="danger" 
                    size="small" 
                    @click="handleClearProducts"
                    :disabled="products.length === 0"
                  >
                    清空
                  </el-button>
                </div>
              </template>

              <div v-if="products.length === 0" class="empty-products">
                <el-empty description="暂无商品" :image-size="80" />
              </div>

              <div v-else class="product-list">
                <div 
                  v-for="product in products" 
                  :key="product.id"
                  class="product-item"
                  @click="handleProductClick(product)"
                >
                  <img :src="product.imageUrl" :alt="product.name" />
                  <div class="product-info">
                    <div class="product-name">{{ product.name }}</div>
                    <div class="product-meta">{{ product.brand }} | {{ product.category }}</div>
                  </div>
                  <el-button 
                    type="danger" 
                    size="small" 
                    circle
                    @click.stop="handleRemoveProduct(product.id)"
                  >
                    <el-icon><delete /></el-icon>
                  </el-button>
                </div>
              </div>
            </el-card>
          </div>
        </el-aside>

        <el-main class="main-content">
          <DraftDisplay />
        </el-main>

        <el-aside 
          :width="isMenuOpen ? '350px' : '0px'" 
          class="right-panel"
          :class="{ 'panel-hidden': !isMenuOpen }"
        >
          <div class="panel-content">
            <OperationPanel ref="operationPanelRef" />
          </div>
        </el-aside>
      </el-container>
    </el-container>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Delete, Menu, Close } from '@element-plus/icons-vue'
import { useDraftStore } from '@/stores/draft'
import { Product } from '@/types'
import MaterialInput from '@/components/MaterialInput.vue'
import DraftDisplay from '@/components/DraftDisplay.vue'
import OperationPanel from '@/components/OperationPanel.vue'

const draftStore = useDraftStore()

const products = computed(() => draftStore.products)
const draftResults = computed(() => draftStore.draftResults)
const hasProducts = computed(() => products.value.length > 0)
const hasDrafts = computed(() => draftResults.value.length > 0)
const operationPanelRef = ref()
const isMenuOpen = ref(true)

function handleProductClick(product: Product) {
  operationPanelRef.value?.selectProduct(product)
}

async function handleRemoveProduct(id: string) {
  try {
    await ElMessageBox.confirm(
      '确定要删除该商品吗？',
      '提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    draftStore.removeProduct(id)
    ElMessage.success('删除成功')
  } catch {
    // 用户取消删除
  }
}

async function handleClearProducts() {
  try {
    await ElMessageBox.confirm(
      '确定要清空所有商品吗？',
      '提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    draftStore.clearProducts()
    ElMessage.success('清空成功')
  } catch {
    // 用户取消清空
  }
}

function toggleMenu() {
  isMenuOpen.value = !isMenuOpen.value
}

function handleResize() {
  const width = window.innerWidth
  if (width < 1200) {
    isMenuOpen.value = false
  } else {
    isMenuOpen.value = true
  }
}

onMounted(() => {
  handleResize()
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
})
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

#app {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  height: 100vh;
  overflow: hidden;
}

.app-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  display: flex;
  align-items: center;
  padding: 0 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  height: 60px;
  z-index: 100;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 15px;
}

.menu-toggle {
  background: rgba(255, 255, 255, 0.2);
  border: none;
  color: white;
  transition: all 0.3s;
}

.menu-toggle:hover {
  background: rgba(255, 255, 255, 0.3);
}

.header-content h1 {
  font-size: 20px;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.header-info {
  display: flex;
  gap: 10px;
}

.main-container {
  height: calc(100vh - 60px);
  overflow: hidden;
}

.left-panel,
.right-panel {
  background: #f5f7fa;
  border-right: 1px solid #e4e7ed;
  overflow: hidden;
  transition: width 0.3s ease;
}

.left-panel.panel-hidden,
.right-panel.panel-hidden {
  width: 0 !important;
  padding: 0;
  overflow: hidden;
}

.panel-content {
  height: 100%;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 20px;
}

.right-panel {
  border-right: none;
  border-left: 1px solid #e4e7ed;
}

.main-content {
  background: #ffffff;
  padding: 0;
  overflow-y: auto;
  overflow-x: hidden;
  height: 100%;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.empty-products {
  text-align: center;
  padding: 30px 0;
}

.product-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.product-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px;
  background: white;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s;
}

.product-item:hover {
  border-color: #409eff;
  box-shadow: 0 2px 8px rgba(64, 158, 255, 0.2);
}

.product-item img {
  width: 50px;
  height: 50px;
  object-fit: cover;
  border-radius: 4px;
  flex-shrink: 0;
}

.product-info {
  flex: 1;
  min-width: 0;
}

.product-name {
  font-size: 14px;
  font-weight: 500;
  color: #303133;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.product-meta {
  font-size: 12px;
  color: #909399;
  margin-top: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

@media screen and (max-width: 768px) {
  .header-content h1 {
    font-size: 16px;
  }

  .header-info {
    display: none;
  }

  .left-panel,
  .right-panel {
    position: fixed;
    top: 60px;
    height: calc(100vh - 60px);
    z-index: 50;
  }

  .left-panel {
    left: 0;
  }

  .right-panel {
    right: 0;
  }

  .main-content {
    width: 100%;
  }
}

@media screen and (min-width: 769px) and (max-width: 1199px) {
  .left-panel,
  .right-panel {
    width: 300px !important;
  }

  .header-content h1 {
    font-size: 18px;
  }
}
</style>
