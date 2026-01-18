import { Product, DraftResult } from '@/types'
import { SELLING_POINT_TEMPLATES } from '@/constants'
import { generateId } from './file'

export async function generateMainImageDraft(
  product: Product,
  referenceImages?: string[]
): Promise<string> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    
    if (!ctx) {
      reject(new Error('Canvas context not available'))
      return
    }

    const img = new Image()
    img.crossOrigin = 'anonymous'
    
    img.onload = () => {
      const maxWidth = 800
      const maxHeight = 800
      let width = img.width
      let height = img.height

      if (width > maxWidth || height > maxHeight) {
        const ratio = Math.min(maxWidth / width, maxHeight / height)
        width *= ratio
        height *= ratio
      }

      canvas.width = width
      canvas.height = height + 60

      ctx.drawImage(img, 0, 0, width, height)

      const gradient = ctx.createLinearGradient(0, height, 0, height + 60)
      gradient.addColorStop(0, 'rgba(0, 0, 0, 0.7)')
      gradient.addColorStop(1, 'rgba(0, 0, 0, 0.9)')
      
      ctx.fillStyle = gradient
      ctx.fillRect(0, height, width, 60)

      const templates = SELLING_POINT_TEMPLATES[product.category] || SELLING_POINT_TEMPLATES.clothing
      const sellingPoints = templates.slice(0, 2).map(t => t.replace('${材质}', product.material).replace('${颜色}', product.color))
      
      ctx.fillStyle = '#ffffff'
      ctx.font = 'bold 18px Arial'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      
      const text = sellingPoints.join(' | ')
      ctx.fillText(text, width / 2, height + 30)

      resolve(canvas.toDataURL('image/png'))
    }

    img.onerror = () => {
      reject(new Error('Failed to load image'))
    }

    img.src = product.imageUrl
  })
}

export function generateTitle(product: Product): string {
  const audienceText = product.targetAudience.length > 0 
    ? product.targetAudience.join('/') 
    : '通用'
  return `${product.brand} ${product.name} ${audienceText} ${product.category}`
}

export function generateSellingPoints(product: Product): string[] {
  const templates = SELLING_POINT_TEMPLATES[product.category] || SELLING_POINT_TEMPLATES.clothing
  const points = templates.slice(0, 2).map(t => 
    t.replace('${材质}', product.material)
      .replace('${颜色}', product.color)
      .replace('${尺寸}', product.size)
  )
  
  points.push(`采用优质${product.material}，尺寸为${product.size}，适合${product.targetAudience.join('、')}日常使用。`)
  
  return points
}

export async function generateDraftResult(
  product: Product,
  referenceImages?: string[]
): Promise<DraftResult> {
  const mainImageDraftUrl = await generateMainImageDraft(product, referenceImages)
  const title = generateTitle(product)
  const sellingPoints = generateSellingPoints(product)

  return {
    id: generateId(),
    productId: product.id,
    mainImageDraftUrl,
    title,
    sellingPoints,
    selected: false
  }
}

export async function generateDraftResults(
  products: Product[],
  referenceImages?: string[],
  onProgress?: (current: number, total: number) => void
): Promise<DraftResult[]> {
  const results: DraftResult[] = []
  
  for (let i = 0; i < products.length; i++) {
    const draft = await generateDraftResult(products[i], referenceImages)
    results.push(draft)
    
    if (onProgress) {
      onProgress(i + 1, products.length)
    }
  }
  
  return results
}
