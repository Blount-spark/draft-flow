<template>
  <div class="operation-panel">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>操作面板</span>
        </div>
      </template>

      <div v-if="!selectedProduct" class="empty-selection">
        <el-empty description="请选择一个商品查看详情" />
      </div>

      <div v-else class="product-detail">
        <div class="detail-image">
          <img :src="selectedProduct.imageUrl" :alt="selectedProduct.name" />
        </div>

        <el-descriptions :column="1" border>
          <el-descriptions-item label="商品名称">
            {{ selectedProduct.name }}
          </el-descriptions-item>
          <el-descriptions-item label="类目">
            {{ getCategoryLabel(selectedProduct.category) }}
          </el-descriptions-item>
          <el-descriptions-item label="品牌">
            {{ selectedProduct.brand || '未填写' }}
          </el-descriptions-item>
          <el-descriptions-item label="材质">
            {{ selectedProduct.material || '未填写' }}
          </el-descriptions-item>
          <el-descriptions-item label="尺寸">
            {{ selectedProduct.size || '未填写' }}
          </el-descriptions-item>
          <el-descriptions-item label="颜色">
            {{ selectedProduct.color || '未填写' }}
          </el-descriptions-item>
          <el-descriptions-item label="适用人群">
            {{ getAudienceLabels(selectedProduct.targetAudience) }}
          </el-descriptions-item>
        </el-descriptions>

        <div class="detail-actions">
          <el-button type="danger" @click="handleDelete">
            <el-icon><delete /></el-icon>
            删除商品
          </el-button>
        </div>
      </div>

      <el-divider />

      <div class="generate-section">
        <el-alert
          title="生成草稿"
          type="info"
          :closable="false"
          show-icon
        >
          <template #default>
            <p>当前共有 <strong>{{ products.length }}</strong> 个商品</p>
            <p>点击下方按钮开始批量生成草稿</p>
          </template>
        </el-alert>

        <el-button 
          type="primary" 
          size="large" 
          :loading="isGenerating"
          :disabled="products.length === 0"
          @click="handleGenerate"
          style="width: 100%; margin-top: 15px;"
        >
          <el-icon v-if="!isGenerating"><magic-stick /></el-icon>
          {{ isGenerating ? '生成中...' : '一键生成草稿' }}
        </el-button>

        <el-progress 
          v-if="isGenerating"
          :percentage="generateProgress"
          :status="generateProgress === 100 ? 'success' : ''"
          style="margin-top: 15px;"
        />
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Delete, MagicStick } from '@element-plus/icons-vue'
import { useDraftStore } from '@/stores/draft'
import { Product } from '@/types'
import { CATEGORY_OPTIONS, TARGET_AUDIENCE_OPTIONS } from '@/constants'
import { generateDraftResults } from '@/utils/generator'

const draftStore = useDraftStore()

const products = computed(() => draftStore.products)
const isGenerating = computed(() => draftStore.isGenerating)
const generateProgress = computed(() => draftStore.generateProgress)
const selectedProduct = ref<Product | null>(null)

function getCategoryLabel(category: string): string {
  const option = CATEGORY_OPTIONS.find(opt => opt.value === category)
  return option ? option.label : category
}

function getAudienceLabels(audiences: string[]): string {
  return audiences
    .map(aud => {
      const option = TARGET_AUDIENCE_OPTIONS.find(opt => opt.value === aud)
      return option ? option.label : aud
    })
    .join('、')
}

async function handleGenerate() {
  if (products.value.length === 0) {
    ElMessage.warning('请先添加商品')
    return
  }

  try {
    draftStore.setGenerating(true)
    draftStore.setGenerateProgress(0)
    draftStore.clearDraftResults()

    const results = await generateDraftResults(
      products.value,
      draftStore.referenceImages.map(ref => ref.url),
      (current, total) => {
        const progress = Math.round((current / total) * 100)
        draftStore.setGenerateProgress(progress)
      }
    )

    results.forEach(result => {
      draftStore.addDraftResult(result)
    })

    ElMessage.success(`成功生成 ${results.length} 个草稿`)
  } catch (error) {
    ElMessage.error('生成草稿失败')
    console.error(error)
  } finally {
    draftStore.setGenerating(false)
  }
}

async function handleDelete() {
  if (!selectedProduct.value) return

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

    draftStore.removeProduct(selectedProduct.value.id)
    selectedProduct.value = null
    ElMessage.success('删除成功')
  } catch {
    // 用户取消删除
  }
}

function selectProduct(product: Product) {
  selectedProduct.value = product
}

defineExpose({
  selectProduct
})
</script>

<style scoped>
.operation-panel {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.empty-selection {
  text-align: center;
  padding: 40px 0;
}

.product-detail {
  padding: 10px 0;
}

.detail-image {
  text-align: center;
  margin-bottom: 20px;
}

.detail-image img {
  max-width: 100%;
  max-height: 300px;
  object-fit: contain;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
}

.detail-actions {
  margin-top: 20px;
  text-align: center;
}

.generate-section {
  margin-top: 20px;
}
</style>
