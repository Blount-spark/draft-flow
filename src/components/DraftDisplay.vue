<template>
  <div class="draft-display">
    <div class="header-actions">
      <el-checkbox v-model="allSelected" @change="handleSelectAll">
        全选
      </el-checkbox>
      <div class="action-buttons">
        <el-button 
          type="primary" 
          :disabled="selectedDrafts.length === 0"
          @click="handleBatchDownload"
        >
          <el-icon><download /></el-icon>
          批量下载图片
        </el-button>
        <el-button 
          :disabled="selectedDrafts.length === 0"
          @click="handleBatchCopy"
        >
          <el-icon><document-copy /></el-icon>
          批量复制文案
        </el-button>
      </div>
    </div>

    <div v-if="draftResults.length === 0" class="empty-state">
      <el-empty description="暂无草稿，请先添加商品并生成" />
    </div>

    <div v-else class="draft-grid">
      <div 
        v-for="draft in draftResults" 
        :key="draft.id" 
        class="draft-card"
        :class="{ selected: draft.selected }"
      >
        <div class="card-header">
          <el-checkbox v-model="draft.selected" @change="handleSelectionChange" />
          <span class="card-title">草稿 #{{ draftResults.indexOf(draft) + 1 }}</span>
        </div>

        <div class="card-image" @click="handleImagePreview(draft)">
          <img :src="draft.mainImageDraftUrl" alt="主图草稿" />
        </div>

        <div class="card-content">
          <div class="field-group">
            <label>标题</label>
            <el-input 
              v-model="draft.title" 
              type="textarea" 
              :rows="2"
              @blur="handleDraftUpdate(draft)"
            />
          </div>

          <div class="field-group">
            <label>卖点文案</label>
            <div v-for="(point, index) in draft.sellingPoints" :key="index" class="selling-point">
              <el-input 
                v-model="draft.sellingPoints[index]" 
                @blur="handleDraftUpdate(draft)"
              />
            </div>
          </div>

          <div class="card-actions">
            <el-button size="small" @click="handleDownload(draft)">
              <el-icon><download /></el-icon>
              下载本图
            </el-button>
            <el-button size="small" @click="handleCopy(draft)">
              <el-icon><document-copy /></el-icon>
              复制文案
            </el-button>
            <el-button size="small" type="primary" @click="handleEdit(draft)">
              <el-icon><edit /></el-icon>
              微调
            </el-button>
          </div>
        </div>
      </div>
    </div>

    <el-dialog v-model="previewVisible" title="图片预览" width="60%">
      <img :src="previewImage" style="width: 100%" alt="预览" />
    </el-dialog>

    <el-drawer v-model="editDrawerVisible" title="微调草稿" size="50%">
      <div v-if="editingDraft" class="edit-form">
        <div class="edit-image">
          <img :src="editingDraft.mainImageDraftUrl" alt="草稿预览" />
        </div>

        <el-form label-width="100px">
          <el-form-item label="标题">
            <el-input 
              v-model="editingDraft.title" 
              type="textarea" 
              :rows="3"
            />
          </el-form-item>

          <el-form-item label="卖点文案">
            <div v-for="(point, index) in editingDraft.sellingPoints" :key="index" class="selling-point-edit">
              <el-input 
                v-model="editingDraft.sellingPoints[index]" 
                type="textarea"
                :rows="2"
              />
              <el-button 
                type="danger" 
                size="small" 
                circle 
                @click="removeSellingPoint(index)"
              >
                <el-icon><delete /></el-icon>
              </el-button>
            </div>
            <el-button type="primary" size="small" @click="addSellingPoint">
              <el-icon><plus /></el-icon>
              添加卖点
            </el-button>
          </el-form-item>
        </el-form>

        <div class="edit-actions">
          <el-button type="primary" @click="saveEdit">保存修改</el-button>
          <el-button @click="editDrawerVisible = false">取消</el-button>
        </div>
      </div>
    </el-drawer>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { Download, DocumentCopy, Edit, Delete, Plus } from '@element-plus/icons-vue'
import { useDraftStore } from '@/stores/draft'
import { DraftResult } from '@/types'
import { downloadImage, downloadImagesAsZip, copyTextToClipboard } from '@/utils/file'

const draftStore = useDraftStore()

const draftResults = computed(() => draftStore.draftResults)
const selectedDrafts = computed(() => draftStore.selectedDrafts)
const allSelected = ref(false)
const previewVisible = ref(false)
const previewImage = ref('')
const editDrawerVisible = ref(false)
const editingDraft = ref<DraftResult | null>(null)

function handleSelectAll(val: boolean) {
  draftStore.selectAllDrafts(val)
  allSelected.value = val
}

function handleSelectionChange() {
  allSelected.value = draftResults.value.every(d => d.selected)
}

function handleImagePreview(draft: DraftResult) {
  previewImage.value = draft.mainImageDraftUrl
  previewVisible.value = true
}

async function handleDownload(draft: DraftResult) {
  try {
    await downloadImage(draft.mainImageDraftUrl, `${draft.title}.png`)
    ElMessage.success('图片下载成功')
  } catch (error) {
    ElMessage.error('图片下载失败')
  }
}

async function handleBatchDownload() {
  try {
    await downloadImagesAsZip(selectedDrafts.value)
    ElMessage.success('批量下载成功')
  } catch (error) {
    ElMessage.error('批量下载失败')
  }
}

async function handleCopy(draft: DraftResult) {
  const text = `${draft.title}\n\n${draft.sellingPoints.join('\n')}`
  const success = await copyTextToClipboard(text)
  if (success) {
    ElMessage.success('文案复制成功')
  } else {
    ElMessage.error('文案复制失败')
  }
}

async function handleBatchCopy() {
  const allText = selectedDrafts.value
    .map(d => `${d.title}\n\n${d.sellingPoints.join('\n')}`)
    .join('\n\n---\n\n')
  
  const success = await copyTextToClipboard(allText)
  if (success) {
    ElMessage.success('批量复制成功')
  } else {
    ElMessage.error('批量复制失败')
  }
}

function handleEdit(draft: DraftResult) {
  editingDraft.value = { ...draft }
  editDrawerVisible.value = true
}

function handleDraftUpdate(draft: DraftResult) {
  draftStore.updateDraftResult(draft.id, draft)
}

function addSellingPoint() {
  if (editingDraft.value) {
    editingDraft.value.sellingPoints.push('')
  }
}

function removeSellingPoint(index: number) {
  if (editingDraft.value && editingDraft.value.sellingPoints.length > 1) {
    editingDraft.value.sellingPoints.splice(index, 1)
  }
}

function saveEdit() {
  if (editingDraft.value) {
    draftStore.updateDraftResult(editingDraft.value.id, editingDraft.value)
    ElMessage.success('保存成功')
    editDrawerVisible.value = false
  }
}
</script>

<style scoped>
.draft-display {
  padding: 20px;
  min-height: 100%;
}

.header-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding: 15px;
  background: #f5f7fa;
  border-radius: 4px;
  flex-wrap: wrap;
  gap: 10px;
}

.action-buttons {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.empty-state {
  text-align: center;
  padding: 60px 0;
}

.draft-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 20px;
}

.draft-card {
  border: 2px solid #e4e7ed;
  border-radius: 8px;
  overflow: hidden;
  transition: all 0.3s;
  display: flex;
  flex-direction: column;
}

.draft-card.selected {
  border-color: #409eff;
  box-shadow: 0 0 10px rgba(64, 158, 255, 0.3);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 15px;
  background: #f5f7fa;
  border-bottom: 1px solid #e4e7ed;
  flex-shrink: 0;
}

.card-title {
  font-weight: bold;
  color: #303133;
}

.card-image {
  width: 100%;
  height: 300px;
  cursor: pointer;
  overflow: hidden;
  flex-shrink: 0;
}

.card-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s;
}

.card-image:hover img {
  transform: scale(1.05);
}

.card-content {
  padding: 15px;
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
}

.field-group {
  margin-bottom: 15px;
}

.field-group label {
  display: block;
  margin-bottom: 5px;
  font-size: 14px;
  color: #606266;
  font-weight: 500;
}

.selling-point {
  margin-bottom: 8px;
}

.card-actions {
  display: flex;
  gap: 8px;
  margin-top: 15px;
  flex-wrap: wrap;
}

.edit-image {
  text-align: center;
  margin-bottom: 20px;
}

.edit-image img {
  max-width: 100%;
  max-height: 400px;
  object-fit: contain;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
}

.selling-point-edit {
  display: flex;
  gap: 10px;
  margin-bottom: 10px;
  align-items: flex-start;
}

.selling-point-edit .el-input {
  flex: 1;
}

.edit-actions {
  display: flex;
  justify-content: center;
  gap: 15px;
  margin-top: 30px;
}

@media screen and (max-width: 768px) {
  .draft-display {
    padding: 10px;
  }

  .header-actions {
    flex-direction: column;
    align-items: stretch;
  }

  .action-buttons {
    justify-content: center;
  }

  .draft-grid {
    grid-template-columns: 1fr;
    gap: 15px;
  }

  .card-image {
    height: 250px;
  }

  .card-actions {
    flex-direction: column;
  }

  .card-actions .el-button {
    width: 100%;
  }
}

@media screen and (min-width: 769px) and (max-width: 1199px) {
  .draft-grid {
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 15px;
  }

  .card-image {
    height: 280px;
  }
}

@media screen and (min-width: 1200px) and (max-width: 1599px) {
  .draft-grid {
    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  }
}
</style>
