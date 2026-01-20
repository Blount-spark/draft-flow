<template>
  <div class="template-library">
    <div class="library-header">
      <el-input
        v-model="searchKeyword"
        placeholder="搜索模板名称或标签..."
        clearable
        style="width: 300px;"
      >
        <template #prefix>
          <el-icon><search /></el-icon>
        </template>
      </el-input>
      <span class="template-count">共 {{ filteredTemplates.length }} 个模板</span>
    </div>

    <div v-if="filteredTemplates.length === 0" class="empty-state">
      <el-empty description="暂无收藏的模板">
        <template #description>
          <p>从草稿卡片点击"收藏"按钮可创建模板</p>
        </template>
      </el-empty>
    </div>

    <div v-else class="template-grid">
      <div 
        v-for="template in filteredTemplates" 
        :key="template.id" 
        class="template-card"
      >
        <div class="template-header">
          <h3 class="template-name">{{ template.name }}</h3>
          <div class="template-meta">
            <el-tag 
              v-for="tag in template.tags.slice(0, 2)" 
              :key="tag" 
              size="small"
              type="info"
            >
              {{ tag }}
            </el-tag>
            <span v-if="template.tags.length > 2" class="more-tags">
              +{{ template.tags.length - 2 }}
            </span>
          </div>
        </div>

        <div class="template-preview" @click="handlePreview(template)">
          <div v-if="template.thumbnail" class="thumbnail-image">
            <img :src="template.thumbnail" alt="模板缩略图" />
          </div>
          <div class="preview-content">
            <div v-if="template.elements.some(e => e.type === 'title' && e.enabled)" class="preview-title">
              <el-icon><document /></el-icon>
              <span class="title-text">{{ template.content.titleTemplate || '默认标题模板' }}</span>
            </div>
            <div v-if="template.elements.some(e => e.type === 'sellingPoints' && e.enabled)" class="preview-points">
              <el-icon><chat-line-square /></el-icon>
              <span>{{ template.content.sellingPointsTemplate?.length || 0 }} 个卖点模板</span>
            </div>
          </div>
        </div>

        <div class="template-info">
          <span class="used-count">
            <el-icon><view /></el-icon>
            使用 {{ template.usedCount }} 次
          </span>
          <span class="create-time">
            {{ formatTime(template.createdAt) }}
          </span>
        </div>

        <div class="template-actions">
          <el-button 
            type="primary" 
            size="small" 
            @click="handleUseTemplate(template)"
          >
            <el-icon><check /></el-icon>
            使用
          </el-button>
          <el-button 
            size="small" 
            @click="handleEditTemplate(template)"
          >
            <el-icon><edit /></el-icon>
            编辑
          </el-button>
          <el-button 
            type="danger" 
            size="small" 
            @click="handleDeleteTemplate(template)"
          >
            <el-icon><delete /></el-icon>
          </el-button>
        </div>
      </div>
    </div>

    <el-dialog v-model="previewVisible" title="模板预览" width="500px">
      <div v-if="previewingTemplate" class="preview-dialog">
        <div class="preview-header">
          <h3>{{ previewingTemplate.name }}</h3>
          <div class="preview-tags">
            <el-tag 
              v-for="tag in previewingTemplate.tags" 
              :key="tag" 
              size="small"
              type="info"
              style="margin-right: 6px;"
            >
              {{ tag }}
            </el-tag>
          </div>
        </div>

        <el-divider />

        <div class="preview-main" v-if="previewingTemplate && (previewingTemplate.thumbnail || previewingTemplate.elements.some(e => e.type === 'mainImage' && e.enabled))">
          <h4>封面图</h4>
          <div v-if="previewingTemplate.thumbnail" class="cover-image">
            <img :src="previewingTemplate.thumbnail" alt="封面图" />
          </div>
          <div v-else class="image-style-preview">
            <div class="sample-image">
              <el-icon><picture /></el-icon>
            </div>
            <div class="watermark-info" v-if="previewingTemplate.content.imageStyle?.watermarkText">
              <span>水印文字: {{ previewingTemplate.content.imageStyle.watermarkText }}</span>
              <span>水印位置: {{ previewingTemplate.content.imageStyle.watermarkPosition === 'top' ? '顶部' : '底部' }}</span>
            </div>
          </div>
        </div>

        <div class="preview-title-section" v-if="previewingTemplate.elements.some(e => e.type === 'title' && e.enabled)">
          <h4>标题模板</h4>
          <el-input 
            type="textarea" 
            :rows="2"
            :model-value="previewingTemplate.content.titleTemplate || '使用默认标题格式'"
            readonly
          />
          <p class="preview-hint">变量: {{name}}, {{brand}}, {{category}}, {{audienceText}}</p>
        </div>

        <div class="preview-points-section" v-if="previewingTemplate.elements.some(e => e.type === 'sellingPoints' && e.enabled)">
          <h4>卖点文案模板</h4>
          <div v-for="(_, index) in previewingTemplate.content.sellingPointsTemplate" :key="index" class="point-item">
            <span class="point-number">{{ index + 1 }}.</span>
            <span>{{ _ || '使用默认卖点' }}</span>
          </div>
          <p class="preview-hint">变量: {{material}}, {{size}}, {{color}}, {{targetAudience}}</p>
        </div>
      </div>
    </el-dialog>

    <el-dialog v-model="editVisible" title="编辑模板" width="600px">
      <el-form v-if="editingTemplate" :model="editForm" label-width="100px">
        <el-form-item label="模板名称">
          <el-input v-model="editForm.name" placeholder="请输入模板名称" />
        </el-form-item>

        <el-form-item label="标签">
          <el-select
            v-model="editForm.tags"
            multiple
            filterable
            allow-create
            default-first-option
            placeholder="请选择或输入标签"
            style="width: 100%;"
          >
            <el-option
              v-for="tag in commonTags"
              :key="tag"
              :label="tag"
              :value="tag"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="标题模板" v-if="editingTemplate.elements.some(e => e.type === 'title' && e.enabled)">
          <el-input 
            type="textarea" 
            :rows="3"
            v-model="editForm.titleTemplate"
            placeholder="可使用变量: {{name}}, {{brand}}, {{category}}, {{audienceText}}"
          />
          <div class="form-hint">可用变量: {{name}} 商品名, {{brand}} 品牌, {{category}} 类目, {{audienceText}} 适用人群</div>
        </el-form-item>

        <el-form-item label="卖点模板" v-if="editingTemplate.elements.some(e => e.type === 'sellingPoints' && e.enabled)">
          <div v-for="(_, index) in editForm.sellingPointsTemplate" :key="index" class="point-edit-item">
            <el-input 
              v-model="editForm.sellingPointsTemplate[index]"
              :placeholder="`卖点 ${index + 1}`"
            />
            <el-button 
              type="danger" 
              size="small" 
              circle
              @click="removePointTemplate(index)"
              v-if="editForm.sellingPointsTemplate.length > 1"
            >
              <el-icon><delete /></el-icon>
            </el-button>
          </div>
          <el-button type="primary" size="small" @click="addPointTemplate" style="margin-top: 10px;">
            <el-icon><plus /></el-icon>
            添加卖点
          </el-button>
          <div class="form-hint">可用变量: {{material}} 材质, {{size}} 尺寸, {{color}} 颜色, {{targetAudience}} 适用人群</div>
        </el-form-item>

        <el-form-item label="水印设置" v-if="editingTemplate.elements.some(e => e.type === 'mainImage' && e.enabled)">
          <el-input 
            v-model="editForm.watermarkText"
            placeholder="水印文字"
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="editVisible = false">取消</el-button>
        <el-button type="primary" @click="saveTemplateEdit">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Check, Delete, Edit, Document, ChatLineSquare, Plus } from '@element-plus/icons-vue'
import { useDraftStore } from '@/stores/draft'
import { Template } from '@/types'

const emit = defineEmits<{
  (e: 'useTemplate', template: Template): void
}>()

const draftStore = useDraftStore()
const searchKeyword = ref('')
const previewVisible = ref(false)
const editVisible = ref(false)
const previewingTemplate = ref<Template | null>(null)
const editingTemplate = ref<Template | null>(null)

const name = ''
const brand = ''
const category = ''
const audienceText = ''
const material = ''
const size = ''
const color = ''
const targetAudience = ''

const commonTags = ['爆款', '简约', '促销', '节日', '新品', '清仓', '热卖']

const editForm = reactive({
  name: '',
  tags: [] as string[],
  titleTemplate: '',
  sellingPointsTemplate: [] as string[],
  watermarkText: ''
})

const templates = computed(() => draftStore.templates)

const filteredTemplates = computed(() => {
  if (!searchKeyword.value.trim()) {
    return templates.value
  }
  
  const keyword = searchKeyword.value.toLowerCase()
  return templates.value.filter(t => 
    t.name.toLowerCase().includes(keyword) ||
    t.tags.some(tag => tag.toLowerCase().includes(keyword))
  )
})

function formatTime(isoString: string): string {
  const date = new Date(isoString)
  return `${date.getMonth() + 1}/${date.getDate()}`
}

function handlePreview(template: Template) {
  previewingTemplate.value = template
  previewVisible.value = true
}

function handleUseTemplate(template: Template) {
  draftStore.setSelectedTemplate(template.id)
  ElMessage.success(`已选择模板"${template.name}"`)
  emit('useTemplate', template)
}

function handleEditTemplate(template: Template) {
  editingTemplate.value = template
  editForm.name = template.name
  editForm.tags = [...template.tags]
  editForm.titleTemplate = template.content.titleTemplate || ''
  editForm.sellingPointsTemplate = template.content.sellingPointsTemplate || ['']
  editForm.watermarkText = template.content.imageStyle?.watermarkText || ''
  editVisible.value = true
}

function addPointTemplate() {
  editForm.sellingPointsTemplate.push('')
}

function removePointTemplate(index: number) {
  if (editForm.sellingPointsTemplate.length > 1) {
    editForm.sellingPointsTemplate.splice(index, 1)
  }
}

function saveTemplateEdit() {
  if (!editingTemplate.value) return

  if (!editForm.name.trim()) {
    ElMessage.warning('请输入模板名称')
    return
  }

  const updatedTemplate: Template = {
    ...editingTemplate.value,
    name: editForm.name,
    tags: editForm.tags,
    content: {
      ...editingTemplate.value.content,
      titleTemplate: editForm.titleTemplate || undefined,
      sellingPointsTemplate: editForm.sellingPointsTemplate.filter(p => p.trim()),
      imageStyle: editingTemplate.value.content.imageStyle ? {
        ...editingTemplate.value.content.imageStyle,
        watermarkText: editForm.watermarkText || undefined
      } : undefined
    }
  }

  draftStore.updateTemplate(updatedTemplate)
  ElMessage.success('模板更新成功')
  editVisible.value = false
}

async function handleDeleteTemplate(template: Template) {
  try {
    await ElMessageBox.confirm(
      `确定要删除模板"${template.name}"吗？`,
      '删除确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    draftStore.removeTemplate(template.id)
    ElMessage.success('模板删除成功')
  } catch {
  }
}
</script>

<style scoped>
.template-library {
  padding: 20px;
  min-height: 100%;
}

.library-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.template-count {
  color: #909399;
  font-size: 14px;
}

.empty-state {
  text-align: center;
  padding: 60px 0;
}

.template-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.template-card {
  border: 2px solid #e4e7ed;
  border-radius: 8px;
  padding: 15px;
  transition: all 0.3s;
  background: white;
}

.template-card:hover {
  border-color: #409eff;
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.15);
}

.template-header {
  margin-bottom: 12px;
}

.template-name {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 8px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.template-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.more-tags {
  font-size: 12px;
  color: #909399;
}

.template-preview {
  background: #f5f7fa;
  border-radius: 6px;
  padding: 12px;
  margin-bottom: 12px;
  cursor: pointer;
  transition: all 0.3s;
}

.template-preview:hover {
  background: #ecf5ff;
}

.thumbnail-image {
  width: 100%;
  height: 120px;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 10px;
  background: #e4e7ed;
}

.thumbnail-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.preview-image {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #409eff;
  margin-bottom: 8px;
  font-size: 13px;
}

.preview-content {
  font-size: 12px;
  color: #606266;
}

.preview-title {
  display: flex;
  align-items: flex-start;
  gap: 6px;
  margin-bottom: 6px;
}

.preview-title .title-text {
  line-height: 1.4;
  word-break: break-all;
}

.preview-points {
  display: flex;
  align-items: center;
  gap: 6px;
}

.template-info {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: #909399;
  margin-bottom: 12px;
}

.used-count {
  display: flex;
  align-items: center;
  gap: 4px;
}

.template-actions {
  display: flex;
  gap: 8px;
}

.template-actions .el-button:last-child {
  flex: 0;
  padding: 8px;
}

@media screen and (max-width: 768px) {
  .library-header {
    flex-direction: column;
    align-items: stretch;
    gap: 10px;
  }

  .template-grid {
    grid-template-columns: 1fr;
  }
}

.preview-dialog {
  max-height: 60vh;
  overflow-y: auto;
}

.preview-header h3 {
  margin-bottom: 10px;
  font-size: 18px;
}

.preview-hint {
  font-size: 12px;
  color: #909399;
  margin-top: 8px;
}

.form-hint {
  font-size: 12px;
  color: #909399;
  margin-top: 6px;
}

.point-edit-item {
  display: flex;
  gap: 8px;
  margin-bottom: 8px;
}

.point-edit-item .el-input {
  flex: 1;
}

.preview-main,
.preview-title-section,
.preview-points-section {
  margin-bottom: 20px;
}

.preview-main h4,
.preview-title-section h4,
.preview-points-section h4 {
  font-size: 14px;
  color: #303133;
  margin-bottom: 10px;
}

.image-style-preview {
  display: flex;
  gap: 20px;
  align-items: center;
}

.sample-image {
  width: 80px;
  height: 80px;
  background: #e4e7ed;
  border-radius: 6px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #909399;
  font-size: 24px;
}

.sample-image span {
  font-size: 10px;
  margin-top: 4px;
}

.cover-image {
  width: 200px;
  max-width: 100%;
  border-radius: 6px;
  overflow: hidden;
  border: 1px solid #e4e7ed;
}

.cover-image img {
  width: 100%;
  height: auto;
  display: block;
}

.watermark-info {
  font-size: 12px;
  color: #606266;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.point-item {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  margin-bottom: 8px;
  font-size: 13px;
}

.point-number {
  color: #409eff;
  font-weight: 600;
}
</style>
