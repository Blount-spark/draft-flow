<template>
  <div class="material-input">
    <el-collapse v-model="activeNames">
      <el-collapse-item title="素材输入" name="input">
        <div class="input-section">
          <el-tabs v-model="activeTab">
            <el-tab-pane label="直接上传" name="upload">
              <div class="upload-area">
                <el-alert
                  title="上传流程提示"
                  type="info"
                  :closable="false"
                  show-icon
                >
                  <template #default>
                    <p>1. 上传商品图片</p>
                    <p>2. 点击图片填写商品信息</p>
                    <p>3. 或使用Excel批量导入</p>
                  </template>
                </el-alert>

                <el-upload
                  drag
                  :auto-upload="false"
                  :on-change="handleImageUpload"
                  :show-file-list="false"
                  accept="image/jpeg,image/png"
                  multiple
                >
                  <el-icon class="el-icon--upload"><upload-filled /></el-icon>
                  <div class="el-upload__text">
                    拖拽商品图片到此处，或<em>点击上传</em>
                  </div>
                  <template #tip>
                    <div class="el-upload__tip">
                      支持 JPG/PNG 格式，支持多图上传
                    </div>
                  </template>
                </el-upload>
                
                <div v-if="uploadedImages.length > 0" class="uploaded-section">
                  <div class="section-header">
                    <span class="section-title">已上传图片 ({{ uploadedImages.length }})</span>
                    <el-button type="primary" size="small" @click="showBatchAddDialog = true">
                      <el-icon><plus /></el-icon>
                      批量添加为商品
                    </el-button>
                  </div>
                  
                  <div class="uploaded-images">
                    <div 
                      v-for="(img, index) in uploadedImages" 
                      :key="index" 
                      class="uploaded-image-item"
                      @click="openImageEditDialog(img, index)"
                    >
                      <img :src="img.url" :alt="`上传图片${index + 1}`" />
                      <div class="image-overlay">
                        <el-icon class="edit-icon"><edit /></el-icon>
                        <span>点击编辑</span>
                      </div>
                      <el-button 
                        type="danger" 
                        size="small" 
                        circle 
                        class="delete-btn"
                        @click.stop="removeUploadedImage(index)"
                      >
                        <el-icon><delete /></el-icon>
                      </el-button>
                    </div>
                  </div>
                </div>

                <el-divider>或</el-divider>

                <el-upload
                  drag
                  :auto-upload="false"
                  :on-change="handleExcelUpload"
                  :show-file-list="false"
                  accept=".xlsx,.xls"
                >
                  <el-icon class="el-icon--upload"><document /></el-icon>
                  <div class="el-upload__text">
                    拖拽Excel文件到此处，或<em>点击上传</em>
                  </div>
                  <template #tip>
                    <div class="el-upload__tip">
                      支持 .xlsx/.xls 格式，Excel上传后会自动添加为商品
                    </div>
                  </template>
                </el-upload>

                <div class="template-download">
                  <el-button type="primary" link @click="downloadTemplate">
                    <el-icon><download /></el-icon>
                    下载Excel导入模板
                  </el-button>
                </div>
              </div>
            </el-tab-pane>

            <el-tab-pane label="在线录入" name="manual">
              <el-form :model="productForm" label-width="100px">
                <el-form-item label="商品名称" required>
                  <el-input v-model="productForm.name" placeholder="请输入商品名称" />
                </el-form-item>
                <el-form-item label="类目">
                  <el-select v-model="productForm.category" placeholder="请选择类目">
                    <el-option
                      v-for="cat in categoryOptions"
                      :key="cat.value"
                      :label="cat.label"
                      :value="cat.value"
                    />
                  </el-select>
                </el-form-item>
                <el-form-item label="品牌">
                  <el-input v-model="productForm.brand" placeholder="请输入品牌" />
                </el-form-item>
                <el-form-item label="材质">
                  <el-input v-model="productForm.material" placeholder="请输入材质" />
                </el-form-item>
                <el-form-item label="尺寸">
                  <el-input v-model="productForm.size" placeholder="请输入尺寸" />
                </el-form-item>
                <el-form-item label="颜色">
                  <el-input v-model="productForm.color" placeholder="请输入颜色" />
                </el-form-item>
                <el-form-item label="适用人群">
                  <el-checkbox-group v-model="productForm.targetAudience">
                    <el-checkbox
                      v-for="aud in audienceOptions"
                      :key="aud.value"
                      :label="aud.value"
                    >
                      {{ aud.label }}
                    </el-checkbox>
                  </el-checkbox-group>
                </el-form-item>
                <el-form-item label="商品图片">
                  <el-upload
                    :auto-upload="false"
                    :on-change="handleProductImageUpload"
                    :show-file-list="false"
                    accept="image/jpeg,image/png"
                  >
                    <el-button type="primary">选择图片</el-button>
                  </el-upload>
                  <div v-if="productForm.imageUrl" class="preview-image">
                    <img :src="productForm.imageUrl" alt="商品图片预览" />
                  </div>
                </el-form-item>
                <el-form-item>
                  <el-button type="primary" @click="addProduct">添加商品</el-button>
                  <el-button @click="resetForm">重置表单</el-button>
                </el-form-item>
              </el-form>
            </el-tab-pane>
          </el-tabs>

          <el-divider />

          <div class="reference-section">
            <h4>参考物（可选）</h4>
            <el-upload
              drag
              :auto-upload="false"
              :on-change="handleReferenceUpload"
              :show-file-list="false"
              accept="image/jpeg,image/png"
              multiple
            >
              <el-icon class="el-icon--upload"><picture /></el-icon>
              <div class="el-upload__text">
                上传历史爆款截图
              </div>
            </el-upload>

            <div class="reference-url">
              <el-input
                v-model="referenceUrl"
                placeholder="或粘贴参考链接URL"
                @keyup.enter="addReferenceUrl"
              >
                <template #append>
                  <el-button @click="addReferenceUrl">添加</el-button>
                </template>
              </el-input>
            </div>

            <div v-if="referenceImages.length > 0" class="reference-list">
              <div v-for="ref in referenceImages" :key="ref.id" class="reference-item">
                <img :src="ref.url" alt="参考图片" />
                <el-button type="danger" size="small" circle @click="removeReference(ref.id)">
                  <el-icon><delete /></el-icon>
                </el-button>
              </div>
            </div>
          </div>

          <el-divider />

          <div class="global-options">
            <el-checkbox v-model="saveToLibrary" disabled>
              保存本次素材至素材库 (TODO)
            </el-checkbox>
            <el-tooltip content="功能开发中，敬请期待" placement="top">
              <el-icon class="todo-icon"><info-filled /></el-icon>
            </el-tooltip>
          </div>
        </div>
      </el-collapse-item>
    </el-collapse>

    <el-dialog 
      v-model="showEditDialog" 
      title="编辑商品信息" 
      width="500px"
    >
      <el-form :model="editingForm" label-width="100px">
        <el-form-item label="商品图片">
          <img :src="editingForm.imageUrl" alt="商品图片" class="dialog-preview" />
        </el-form-item>
        <el-form-item label="商品名称" required>
          <el-input v-model="editingForm.name" placeholder="请输入商品名称" />
        </el-form-item>
        <el-form-item label="类目">
          <el-select v-model="editingForm.category" placeholder="请选择类目">
            <el-option
              v-for="cat in categoryOptions"
              :key="cat.value"
              :label="cat.label"
              :value="cat.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="品牌">
          <el-input v-model="editingForm.brand" placeholder="请输入品牌" />
        </el-form-item>
        <el-form-item label="材质">
          <el-input v-model="editingForm.material" placeholder="请输入材质" />
        </el-form-item>
        <el-form-item label="尺寸">
          <el-input v-model="editingForm.size" placeholder="请输入尺寸" />
        </el-form-item>
        <el-form-item label="颜色">
          <el-input v-model="editingForm.color" placeholder="请输入颜色" />
        </el-form-item>
        <el-form-item label="适用人群">
          <el-checkbox-group v-model="editingForm.targetAudience">
            <el-checkbox
              v-for="aud in audienceOptions"
              :key="aud.value"
              :label="aud.value"
            >
              {{ aud.label }}
            </el-checkbox>
          </el-checkbox-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showEditDialog = false">取消</el-button>
        <el-button type="primary" @click="saveImageEdit">保存并添加</el-button>
      </template>
    </el-dialog>

    <el-dialog 
      v-model="showBatchAddDialog" 
      title="批量添加商品" 
      width="600px"
    >
      <el-alert
        title="批量添加说明"
        type="info"
        :closable="false"
        show-icon
        style="margin-bottom: 20px;"
      >
        <template #default>
          <p>将为所有已上传图片创建商品，使用默认信息</p>
          <p>添加后可在商品列表中逐个编辑</p>
        </template>
      </el-alert>

      <el-form :model="batchForm" label-width="100px">
        <el-form-item label="默认类目">
          <el-select v-model="batchForm.category" placeholder="请选择类目">
            <el-option
              v-for="cat in categoryOptions"
              :key="cat.value"
              :label="cat.label"
              :value="cat.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="默认材质">
          <el-input v-model="batchForm.material" placeholder="请输入默认材质" />
        </el-form-item>
        <el-form-item label="默认尺寸">
          <el-input v-model="batchForm.size" placeholder="请输入默认尺寸" />
        </el-form-item>
        <el-form-item label="默认颜色">
          <el-input v-model="batchForm.color" placeholder="请输入默认颜色" />
        </el-form-item>
        <el-form-item label="默认人群">
          <el-checkbox-group v-model="batchForm.targetAudience">
            <el-checkbox
              v-for="aud in audienceOptions"
              :key="aud.value"
              :label="aud.value"
            >
              {{ aud.label }}
            </el-checkbox>
          </el-checkbox-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showBatchAddDialog = false">取消</el-button>
        <el-button type="primary" @click="batchAddProducts">批量添加 ({{ uploadedImages.length }})</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { UploadFilled, Document, Download, Picture, Delete, Edit, Plus, InfoFilled } from '@element-plus/icons-vue'
import { useDraftStore } from '@/stores/draft'
import { Product, ReferenceImage } from '@/types'
import { CATEGORY_OPTIONS, TARGET_AUDIENCE_OPTIONS } from '@/constants'
import { generateId } from '@/utils/file'
import { downloadExcelTemplate, parseExcelFile } from '@/utils/excel'

const draftStore = useDraftStore()

const activeNames = ref(['input'])
const activeTab = ref('upload')
const uploadedImages = ref<{ url: string; file: File }[]>([])
const productForm = reactive({
  name: '',
  category: 'clothing',
  brand: '',
  material: '',
  size: '',
  color: '',
  targetAudience: ['general'],
  imageUrl: ''
})
const referenceUrl = ref('')
const referenceImages = ref<ReferenceImage[]>([])
const saveToLibrary = ref(false)
const showEditDialog = ref(false)
const showBatchAddDialog = ref(false)
const editingIndex = ref(-1)
const editingForm = reactive({
  imageUrl: '',
  name: '',
  category: 'clothing',
  brand: '',
  material: '',
  size: '',
  color: '',
  targetAudience: ['general']
})
const batchForm = reactive({
  category: 'clothing',
  material: '',
  size: '',
  color: '',
  targetAudience: ['general']
})

const categoryOptions = CATEGORY_OPTIONS
const audienceOptions = TARGET_AUDIENCE_OPTIONS

watch(saveToLibrary, (val) => {
  draftStore.setSaveToLibrary(val)
})

function handleImageUpload(file: any) {
  const reader = new FileReader()
  reader.onload = (e) => {
    uploadedImages.value.push({
      url: e.target?.result as string,
      file: file.raw
    })
    ElMessage.success('图片上传成功，请点击图片填写商品信息')
  }
  reader.readAsDataURL(file.raw)
}

function removeUploadedImage(index: number) {
  uploadedImages.value.splice(index, 1)
}

function openImageEditDialog(img: { url: string; file: File }, index: number) {
  editingIndex.value = index
  editingForm.imageUrl = img.url
  editingForm.name = ''
  editingForm.category = 'clothing'
  editingForm.brand = ''
  editingForm.material = ''
  editingForm.size = ''
  editingForm.color = ''
  editingForm.targetAudience = ['general']
  showEditDialog.value = true
}

function saveImageEdit() {
  if (!editingForm.name) {
    ElMessage.warning('请输入商品名称')
    return
  }

  const product: Product = {
    id: generateId(),
    name: editingForm.name,
    category: editingForm.category,
    brand: editingForm.brand,
    material: editingForm.material,
    size: editingForm.size,
    color: editingForm.color,
    targetAudience: editingForm.targetAudience,
    imageUrl: editingForm.imageUrl
  }

  draftStore.addProduct(product)
  uploadedImages.value.splice(editingIndex.value, 1)
  showEditDialog.value = false
  ElMessage.success('商品添加成功')
}

async function handleExcelUpload(file: any) {
  try {
    const products = await parseExcelFile(file.raw)
    products.forEach(product => {
      draftStore.addProduct(product)
    })
    ElMessage.success(`成功导入 ${products.length} 个商品`)
  } catch (error) {
    ElMessage.error('Excel文件解析失败')
  }
}

function downloadTemplate() {
  downloadExcelTemplate()
}

function handleProductImageUpload(file: any) {
  const reader = new FileReader()
  reader.onload = (e) => {
    productForm.imageUrl = e.target?.result as string
  }
  reader.readAsDataURL(file.raw)
}

function addProduct() {
  if (!productForm.name) {
    ElMessage.warning('请输入商品名称')
    return
  }

  if (!productForm.imageUrl) {
    ElMessage.warning('请上传商品图片')
    return
  }

  const product: Product = {
    id: generateId(),
    name: productForm.name,
    category: productForm.category,
    brand: productForm.brand,
    material: productForm.material,
    size: productForm.size,
    color: productForm.color,
    targetAudience: productForm.targetAudience,
    imageUrl: productForm.imageUrl
  }

  draftStore.addProduct(product)
  ElMessage.success('商品添加成功')
  resetForm()
}

function resetForm() {
  productForm.name = ''
  productForm.category = 'clothing'
  productForm.brand = ''
  productForm.material = ''
  productForm.size = ''
  productForm.color = ''
  productForm.targetAudience = ['general']
  productForm.imageUrl = ''
}

function batchAddProducts() {
  if (uploadedImages.value.length === 0) {
    ElMessage.warning('没有可添加的图片')
    return
  }

  uploadedImages.value.forEach((img, index) => {
    const product: Product = {
      id: generateId(),
      name: `商品${index + 1}`,
      category: batchForm.category,
      brand: '',
      material: batchForm.material,
      size: batchForm.size,
      color: batchForm.color,
      targetAudience: batchForm.targetAudience,
      imageUrl: img.url
    }
    draftStore.addProduct(product)
  })

  uploadedImages.value = []
  showBatchAddDialog.value = false
  ElMessage.success(`成功添加 ${draftStore.products.length} 个商品`)
}

function handleReferenceUpload(file: any) {
  const reader = new FileReader()
  reader.onload = (e) => {
    const refImage: ReferenceImage = {
      id: generateId(),
      url: e.target?.result as string,
      type: 'upload'
    }
    referenceImages.value.push(refImage)
    draftStore.addReferenceImage(refImage)
  }
  reader.readAsDataURL(file.raw)
}

function addReferenceUrl() {
  if (!referenceUrl.value) {
    ElMessage.warning('请输入参考链接')
    return
  }

  const refImage: ReferenceImage = {
    id: generateId(),
    url: referenceUrl.value,
    type: 'url'
  }
  referenceImages.value.push(refImage)
  draftStore.addReferenceImage(refImage)
  referenceUrl.value = ''
}

function removeReference(id: string) {
  referenceImages.value = referenceImages.value.filter(ref => ref.id !== id)
  draftStore.removeReferenceImage(id)
}
</script>

<style scoped>
.material-input {
  margin-bottom: 20px;
}

.upload-area {
  padding: 20px 0;
}

.uploaded-section {
  margin-top: 20px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.uploaded-images {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 10px;
}

.uploaded-image-item {
  position: relative;
  border: 2px solid #e4e7ed;
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s;
}

.uploaded-image-item:hover {
  border-color: #409eff;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.2);
}

.uploaded-image-item img {
  width: 100%;
  height: 150px;
  object-fit: cover;
}

.image-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  color: white;
  opacity: 0;
  transition: opacity 0.3s;
}

.uploaded-image-item:hover .image-overlay {
  opacity: 1;
}

.edit-icon {
  font-size: 32px;
  margin-bottom: 8px;
}

.image-overlay span {
  font-size: 14px;
}

.uploaded-image-item .delete-btn {
  position: absolute;
  top: 5px;
  right: 5px;
  z-index: 10;
}

.template-download {
  text-align: center;
  margin-top: 20px;
}

.preview-image {
  margin-top: 10px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  overflow: hidden;
}

.preview-image img {
  max-width: 200px;
  max-height: 200px;
  object-fit: contain;
}

.dialog-preview {
  max-width: 100%;
  max-height: 300px;
  object-fit: contain;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
}

.reference-section {
  padding: 20px 0;
}

.reference-section h4 {
  margin-bottom: 15px;
}

.reference-url {
  margin-top: 15px;
}

.reference-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 10px;
  margin-top: 15px;
}

.reference-item {
  position: relative;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  overflow: hidden;
}

.reference-item img {
  width: 100%;
  height: 150px;
  object-fit: cover;
}

.reference-item .el-button {
  position: absolute;
  top: 5px;
  right: 5px;
}

.global-options {
  padding: 10px 0;
  display: flex;
  align-items: center;
  gap: 8px;
}

.global-options .el-checkbox {
  margin-right: 0;
}

.todo-icon {
  color: #909399;
  cursor: help;
}

@media screen and (max-width: 768px) {
  .uploaded-images {
    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  }

  .uploaded-image-item img {
    height: 120px;
  }

  .section-header {
    flex-direction: column;
    align-items: stretch;
    gap: 10px;
  }
}
</style>
