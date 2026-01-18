import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { Product, DraftResult, ReferenceImage } from '@/types'

export const useDraftStore = defineStore('draft', () => {
  const products = ref<Product[]>([])
  const referenceImages = ref<ReferenceImage[]>([])
  const draftResults = ref<DraftResult[]>([])
  const saveToLibrary = ref(false)
  const isGenerating = ref(false)
  const generateProgress = ref(0)

  const hasProducts = computed(() => products.value.length > 0)
  const hasDrafts = computed(() => draftResults.value.length > 0)
  const selectedDrafts = computed(() => draftResults.value.filter(d => d.selected))

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
  }

  return {
    products,
    referenceImages,
    draftResults,
    saveToLibrary,
    isGenerating,
    generateProgress,
    hasProducts,
    hasDrafts,
    selectedDrafts,
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
