import { Product } from '@/types'

const DEEPSEEK_API_URL = 'https://api.deepseek.com/chat/completions'

let deepseekApiKey = ''

export function setDeepSeekApiKey(key: string) {
  deepseekApiKey = key
}

export function getDeepSeekApiKey(): string {
  return deepseekApiKey
}

function loadStoredApiKey() {
  const stored = localStorage.getItem('deepseek_api_key')
  if (stored) {
    deepseekApiKey = stored
  }
}

loadStoredApiKey()

export async function generateTitleWithAI(product: Product): Promise<string> {
  if (!deepseekApiKey) {
    throw new Error('请先配置 DeepSeek API Key')
  }

  const prompt = `请为以下商品生成一个吸引人的标题，要求：
- 包含品牌、商品名、适用人群
- 简洁有力，适合电商推广
- 标题长度在20字以内

商品信息：
- 商品名：${product.name}
- 品牌：${product.brand || '未知'}
- 材质：${product.material || '未知'}
- 颜色：${product.color || '未知'}
- 适用人群：${product.targetAudience.join('、') || '通用'}
- 类目：${product.category || '未知'}

请直接返回标题，不要其他内容。`

  try {
    const response = await fetch(DEEPSEEK_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${deepseekApiKey}`
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 100,
        temperature: 0.7
      })
    })

    if (!response.ok) {
      throw new Error(`API 请求失败: ${response.status}`)
    }

    const data = await response.json()
    const title = data.choices?.[0]?.message?.content?.trim() || ''

    if (!title) {
      throw new Error('AI 返回内容为空')
    }

    return title
  } catch (error) {
    console.error('生成标题失败:', error)
    throw error
  }
}

export async function generateSellingPointsWithAI(product: Product): Promise<string[]> {
  if (!deepseekApiKey) {
    throw new Error('请先配置 DeepSeek API Key')
  }

  const prompt = `请为以下商品生成3条卖点文案，要求：
- 突出商品特点和优势
- 适合电商推广，能打动消费者
- 每条15-30字左右
- 直接列出3条，用换行分隔

商品信息：
- 商品名：${product.name}
- 品牌：${product.brand || '未知'}
- 材质：${product.material || '未知'}
- 尺寸：${product.size || '未知'}
- 颜色：${product.color || '未知'}
- 适用人群：${product.targetAudience.join('、') || '通用'}
- 类目：${product.category || '未知'}

请直接返回3条卖点文案，每条一行，不要其他内容。`

  try {
    const response = await fetch(DEEPSEEK_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${deepseekApiKey}`
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 200,
        temperature: 0.7
      })
    })

    if (!response.ok) {
      throw new Error(`API 请求失败: ${response.status}`)
    }

    const data = await response.json()
    const content = data.choices?.[0]?.message?.content?.trim() || ''

    if (!content) {
      throw new Error('AI 返回内容为空')
    }

    const points = content
      .split('\n')
      .map((p: string) => p.replace(/^\d+\.\s*/, '').trim())
      .filter((p: string) => p.length > 0)
      .slice(0, 3)

    return points
  } catch (error) {
    console.error('生成卖点文案失败:', error)
    throw error
  }
}
