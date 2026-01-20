import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { Product, DraftResult, ReferenceImage, Template } from '@/types'

const STORAGE_KEY_TEMPLATES = 'draft_flow_templates'

export const useDraftStore = defineStore('draft', () => {
  const products = ref<Product[]>([])
  const referenceImages = ref<ReferenceImage[]>([])
  const draftResults = ref<DraftResult[]>([])
  const saveToLibrary = ref(false)
  const isGenerating = ref(false)
  const generateProgress = ref(0)
  const templates = ref<Template[]>([])
  const selectedTemplateId = ref<string | null>(null)
  const generationMode = ref<'default' | 'template'>('default')
  const aiGenerationEnabled = ref(false)

  const hasProducts = computed(() => products.value.length > 0)
  const hasDrafts = computed(() => draftResults.value.length > 0)
  const selectedDrafts = computed(() => draftResults.value.filter(d => d.selected))
  const selectedTemplate = computed(() => 
    templates.value.find(t => t.id === selectedTemplateId.value) || null
  )

  function loadTemplates() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_TEMPLATES)
      if (stored) {
        templates.value = JSON.parse(stored)
      }
    } catch (error) {
      console.error('Failed to load templates:', error)
      templates.value = []
    }
  }

  function loadAiSettings() {
    try {
      const stored = localStorage.getItem('ai_generation_enabled')
      if (stored) {
        aiGenerationEnabled.value = stored === 'true'
      }
    } catch (error) {
      console.error('Failed to load AI settings:', error)
    }
  }

  function saveTemplates() {
    try {
      localStorage.setItem(STORAGE_KEY_TEMPLATES, JSON.stringify(templates.value))
    } catch (error) {
      console.error('Failed to save templates:', error)
    }
  }

  function addTemplate(template: Template) {
    templates.value.unshift(template)
    saveTemplates()
  }

  function removeTemplate(id: string) {
    templates.value = templates.value.filter(t => t.id !== id)
    if (selectedTemplateId.value === id) {
      selectedTemplateId.value = null
    }
    saveTemplates()
  }

  function updateTemplateUsedCount(id: string) {
    const template = templates.value.find(t => t.id === id)
    if (template) {
      template.usedCount++
      saveTemplates()
    }
  }

  function updateTemplate(template: Template) {
    const index = templates.value.findIndex(t => t.id === template.id)
    if (index !== -1) {
      templates.value[index] = template
      saveTemplates()
    }
  }

  function setSelectedTemplate(id: string | null) {
    selectedTemplateId.value = id
  }

  function setGenerationMode(mode: 'default' | 'template') {
    generationMode.value = mode
    if (mode === 'default') {
      selectedTemplateId.value = null
    }
  }

  function setAiGenerationEnabled(enabled: boolean) {
    aiGenerationEnabled.value = enabled
    localStorage.setItem('ai_generation_enabled', String(enabled))
  }

  function addProduct(product: Product) {
    products.value.push(product)
  }

  function updateProduct(id: string, updates: Partial<Product>) {
    const index = products.value.findIndex(p => p.id === id)
    if (index !== -1) {
      products.value[index] = { ...products.value[index], ...updates }
    }
  }

  function removeProduct(id: string) {
    products.value = products.value.filter(p => p.id !== id)
  }

  function clearProducts() {
    products.value = []
  }

  function addReferenceImage(image: ReferenceImage) {
    referenceImages.value.push(image)
  }

  function removeReferenceImage(id: string) {
    referenceImages.value = referenceImages.value.filter(img => img.id !== id)
  }

  function clearReferenceImages() {
    referenceImages.value = []
  }

  function addDraftResult(draft: DraftResult) {
    draftResults.value.push(draft)
  }

  function updateDraftResult(id: string, updates: Partial<DraftResult>) {
    const index = draftResults.value.findIndex(d => d.id === id)
    if (index !== -1) {
      draftResults.value[index] = { ...draftResults.value[index], ...updates }
    }
  }

  function removeDraftResult(id: string) {
    draftResults.value = draftResults.value.filter(d => d.id !== id)
  }

  function clearDraftResults() {
    draftResults.value = []
  }

  function toggleDraftSelection(id: string) {
    const draft = draftResults.value.find(d => d.id === id)
    if (draft) {
      draft.selected = !draft.selected
    }
  }

  function selectAllDrafts(selected: boolean) {
    draftResults.value.forEach(d => d.selected = selected)
  }

  function setSaveToLibrary(value: boolean) {
    saveToLibrary.value = value
  }

  function setGenerating(value: boolean) {
    isGenerating.value = value
  }

  function setGenerateProgress(value: number) {
    generateProgress.value = value
  }

  function reset() {
    products.value = []
    referenceImages.value = []
    draftResults.value = []
    saveToLibrary.value = false
    isGenerating.value = false
    generateProgress.value = 0
    selectedTemplateId.value = null
    generationMode.value = 'default'
  }

  loadTemplates()
  loadAiSettings()

  return {
    products,
    referenceImages,
    draftResults,
    saveToLibrary,
    isGenerating,
    generateProgress,
    templates,
    selectedTemplateId,
    selectedTemplate,
    generationMode,
    hasProducts,
    hasDrafts,
    selectedDrafts,
    addTemplate,
    removeTemplate,
    updateTemplateUsedCount,
    updateTemplate,
    setSelectedTemplate,
    setGenerationMode,
    setAiGenerationEnabled,
    aiGenerationEnabled,
    addProduct,
    updateProduct,
    removeProduct,
    clearProducts,
    addReferenceImage,
    removeReferenceImage,
    clearReferenceImages,
    addDraftResult,
    updateDraftResult,
    removeDraftResult,
    clearDraftResults,
    toggleDraftSelection,
    selectAllDrafts,
    setSaveToLibrary,
    setGenerating,
    setGenerateProgress,
    reset
  }
})
