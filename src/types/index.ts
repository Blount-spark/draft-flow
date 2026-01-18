export interface Product {
  id: string
  name: string
  category: string
  brand: string
  material: string
  size: string
  color: string
  targetAudience: string[]
  imageUrl: string
}

export interface DraftResult {
  id: string
  productId: string
  mainImageDraftUrl: string
  title: string
  sellingPoints: string[]
  selected: boolean
}

export interface ReferenceImage {
  id: string
  url: string
  type: 'upload' | 'url'
}

export interface MaterialInput {
  products: Product[]
  referenceImages: ReferenceImage[]
  saveToLibrary: boolean
}

export interface CategoryOption {
  label: string
  value: string
}

export interface TargetAudienceOption {
  label: string
  value: string
}
