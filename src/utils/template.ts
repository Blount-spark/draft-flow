import { Product, Template, TemplateVariables, DraftResult, ImageStyleConfig } from '@/types'
import { generateId } from './file'
import { SELLING_POINT_TEMPLATES } from '@/constants'

export function buildTemplateVariables(product: Product): TemplateVariables {
  return {
    name: product.name,
    brand: product.brand,
    category: product.category,
    material: product.material,
    size: product.size,
    color: product.color,
    targetAudience: product.targetAudience,
    audienceText: product.targetAudience.join('/')
  }
}

export function replaceVariables(template: string, variables: TemplateVariables): string {
  return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
    if (key in variables) {
      const value = variables[key]
      if (Array.isArray(value)) {
        return value.join('/')
      }
      return value || ''
    }
    return match
  })
}

export function applyTitleTemplate(
  titleTemplate: string | undefined,
  variables: TemplateVariables
): string {
  if (!titleTemplate) {
    return `${variables.brand} ${variables.name} ${variables.audienceText} ${variables.category}`
  }
  
  const replaced = replaceVariables(titleTemplate, variables)
  
  if (!replaced.trim()) {
    return `${variables.brand} ${variables.name} ${variables.audienceText} ${variables.category}`
  }
  
  return replaced
}

export function applySellingPointsTemplate(
  pointsTemplate: string[] | undefined,
  variables: TemplateVariables
): string[] {
  if (!pointsTemplate || pointsTemplate.length === 0) {
    return generateDefaultSellingPoints(variables)
  }
  
  return pointsTemplate.map(template => {
    const replaced = replaceVariables(template, variables)
    return replaced || generateDefaultSellingPoints(variables)[0]
  })
}

function generateDefaultSellingPoints(variables: TemplateVariables): string[] {
  const templates = SELLING_POINT_TEMPLATES[variables.category as keyof typeof SELLING_POINT_TEMPLATES] 
    || SELLING_POINT_TEMPLATES.clothing
  
  const points = templates.slice(0, 2).map(t => 
    t.replace('${材质}', variables.material).replace('${颜色}', variables.color)
  )
  
  points.push(`采用优质${variables.material}，尺寸为${variables.size}，适合${variables.targetAudience.join('、')}日常使用。`)
  
  return points
}

export async function applyImageTemplate(
  product: Product,
  imageStyle?: ImageStyleConfig
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

      const barHeight = imageStyle?.watermarkText ? 60 : 0
      
      canvas.width = width
      canvas.height = height + barHeight

      ctx.drawImage(img, 0, 0, width, height)

      if (imageStyle?.watermarkText) {
        const gradient = ctx.createLinearGradient(0, height, 0, height + barHeight)
        gradient.addColorStop(0, 'rgba(0, 0, 0, 0.7)')
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0.9)')
        
        ctx.fillStyle = gradient
        ctx.fillRect(0, height, width, barHeight)

        const fontStyle = imageStyle.fontStyle || {}
        ctx.fillStyle = fontStyle.color || '#ffffff'
        ctx.font = `bold ${fontStyle.fontSize || 18}px ${fontStyle.fontFamily || 'Arial'}`
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        
        const watermark = replaceVariables(imageStyle.watermarkText, buildTemplateVariables(product))
        ctx.fillText(watermark, width / 2, height + barHeight / 2)
      }

      resolve(canvas.toDataURL('image/png'))
    }

    img.onerror = () => {
      reject(new Error('Failed to load image'))
    }

    img.src = product.imageUrl
  })
}

export async function applyTemplate(
  product: Product,
  template: Template
): Promise<Partial<DraftResult>> {
  const variables = buildTemplateVariables(product)
  
  const enabledElements = template.elements.filter(e => e.enabled)
  
  const result: Partial<DraftResult> = {
    productId: product.id,
    selected: false
  }

  for (const element of enabledElements) {
    switch (element.type) {
      case 'mainImage':
        result.mainImageDraftUrl = await applyImageTemplate(product, template.content.imageStyle)
        break
      case 'title':
        result.title = applyTitleTemplate(template.content.titleTemplate, variables)
        break
      case 'sellingPoints':
        result.sellingPoints = applySellingPointsTemplate(template.content.sellingPointsTemplate, variables)
        break
    }
  }

  if (!result.mainImageDraftUrl && !result.title && !result.sellingPoints) {
    result.title = applyTitleTemplate(template.content.titleTemplate, variables)
    result.sellingPoints = applySellingPointsTemplate(template.content.sellingPointsTemplate, variables)
    result.mainImageDraftUrl = await applyImageTemplate(product, template.content.imageStyle)
  }

  return result
}

export async function applyTemplateToProducts(
  products: Product[],
  template: Template,
  onProgress?: (current: number, total: number) => void
): Promise<DraftResult[]> {
  const results: DraftResult[] = []
  
  for (let i = 0; i < products.length; i++) {
    const partialResult = await applyTemplate(products[i], template)
    
    const draft: DraftResult = {
      id: generateId(),
      productId: products[i].id,
      mainImageDraftUrl: partialResult.mainImageDraftUrl || '',
      title: partialResult.title || `${products[i].brand} ${products[i].name}`,
      sellingPoints: partialResult.sellingPoints || [],
      selected: false
    }
    
    results.push(draft)
    
    if (onProgress) {
      onProgress(i + 1, products.length)
    }
  }
  
  return results
}

export function createTemplateFromDraft(
  name: string,
  tags: string[],
  elements: Template['elements'],
  draft: DraftResult,
  product: Product,
  thumbnail?: string
): Template {
  const enabledElements = elements.filter(e => e.enabled)
  
  const imageStyle: ImageStyleConfig | undefined = enabledElements.some(e => e.type === 'mainImage')
    ? {
        watermarkText: '舒适面料 | 经典款式',
        watermarkPosition: 'bottom',
        backgroundColor: 'rgba(0,0,0,0.8)',
        fontStyle: {
          fontFamily: 'Arial',
          fontSize: 18,
          fontWeight: 'bold',
          color: '#ffffff'
        }
      }
    : undefined

  return {
    id: generateId(),
    name,
    tags,
    thumbnail: thumbnail || draft.mainImageDraftUrl,
    elements,
    content: {
      titleTemplate: enabledElements.some(e => e.type === 'title')
        ? draft.title.replace(product.name, '{{name}}')
          .replace(product.brand, '{{brand}}')
          .replace(product.category, '{{category}}')
          .replace(/men\/women|men|women|children|general|elderly|teenagers/g, '{{audienceText}}')
        : undefined,
      sellingPointsTemplate: enabledElements.some(e => e.type === 'sellingPoints')
        ? draft.sellingPoints.map(point => 
            point.replace(product.material, '{{material}}')
              .replace(product.size, '{{size}}')
              .replace(product.color, '{{color}}')
              .replace(/men|women|children|general|elderly|teenagers/g, '{{targetAudience}}')
          )
        : undefined,
      imageStyle
    },
    createdAt: new Date().toISOString(),
    usedCount: 0
  }
}
