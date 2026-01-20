<template>
  <el-dialog
    v-model="dialogVisible"
    title="AI 设置"
    width="400px"
  >
    <el-form label-width="100px">
      <el-form-item label="AI 提供商">
        <el-select v-model="aiProvider" style="width: 100%;">
          <el-option label="DeepSeek" value="deepseek" />
          <el-option label="通义千问" value="qwen" disabled />
          <el-option label="ChatGPT" value="openai" disabled />
        </el-select>
      </el-form-item>
      <el-form-item label="API Key">
        <el-input
          v-model="apiKey"
          type="password"
          show-password
          placeholder="请输入 DeepSeek API Key"
        />
      </el-form-item>
      <el-form-item>
        <el-link 
          type="primary" 
          href="https://platform.deepseek.com/api_keys"
          target="_blank"
        >
          获取 DeepSeek API Key
        </el-link>
      </el-form-item>
      <el-form-item label="生成模式">
        <el-radio-group v-model="generationMode">
          <el-radio label="rule">规则生成</el-radio>
          <el-radio label="ai">AI 生成</el-radio>
        </el-radio-group>
      </el-form-item>
    </el-form>

    <template #footer>
      <el-button @click="dialogVisible = false">取消</el-button>
      <el-button type="primary" @click="saveSettings">保存</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { useDraftStore } from '@/stores/draft'
import { setDeepSeekApiKey, getDeepSeekApiKey } from '@/utils/deepseek'

const props = defineProps<{
  modelValue: boolean
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
}>()

const dialogVisible = ref(false)
const aiProvider = ref('deepseek')
const apiKey = ref('')
const generationMode = ref<'rule' | 'ai'>('rule')

const draftStore = useDraftStore()

watch(() => props.modelValue, (val) => {
  if (val) {
    apiKey.value = getDeepSeekApiKey()
    generationMode.value = draftStore.aiGenerationEnabled ? 'ai' : 'rule'
  }
  dialogVisible.value = val
})

watch(dialogVisible, (val) => {
  emit('update:modelValue', val)
})

function saveSettings() {
  if (generationMode.value === 'ai' && !apiKey.value.trim()) {
    ElMessage.warning('请输入 API Key')
    return
  }

  if (apiKey.value.trim()) {
    setDeepSeekApiKey(apiKey.value.trim())
    localStorage.setItem('deepseek_api_key', apiKey.value.trim())
  }

  draftStore.setAiGenerationEnabled(generationMode.value === 'ai')
  
  ElMessage.success('设置已保存')
  dialogVisible.value = false
}
</script>
