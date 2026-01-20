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

export interface Template {
  id: string
  name: string
  tags: string[]
  thumbnail?: string
  elements: TemplateElement[]
  content: {
    titleTemplate?: string
    sellingPointsTemplate?: string[]
    imageStyle?: ImageStyleConfig
  }
  createdAt: string
  usedCount: number
}

export interface TemplateElement {
  type: 'mainImage' | 'title' | 'sellingPoints'
  enabled: boolean
}

export interface ImageStyleConfig {
  watermarkText?: string
  watermarkPosition?: 'top' | 'bottom'
  backgroundColor?: string
  fontStyle?: {
    fontFamily?: string
    fontSize?: number
    fontWeight?: string
    color?: string
  }
}

export interface TemplateVariables {
  name: string
  brand: string
  category: string
  material: string
  size: string
  color: string
  targetAudience: string[]
  [key: string]: any
}

