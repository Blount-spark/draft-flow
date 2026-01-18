import * as XLSX from 'xlsx'
import { Product } from '@/types'
import { generateId } from './file'

export interface ExcelProductData {
  name?: string
  category?: string
  brand?: string
  material?: string
  size?: string
  color?: string
  targetAudience?: string
  imageUrl?: string
}

export function downloadExcelTemplate() {
  const template = [
    {
      '商品名称': '示例商品',
      '类目': 'clothing',
      '品牌': '示例品牌',
      '材质': '棉',
      '尺寸': 'L',
      '颜色': '白色',
      '适用人群': 'men,women',
      '图片URL': ''
    }
  ]
  
  const ws = XLSX.utils.json_to_sheet(template)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, '商品信息')
  XLSX.writeFile(wb, '商品导入模板.xlsx')
}

export function parseExcelFile(file: File): Promise<Product[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    
    reader.onload = (e) => {
      try {
        const data = e.target?.result
        const workbook = XLSX.read(data, { type: 'binary' })
        const firstSheetName = workbook.SheetNames[0]
        const worksheet = workbook.Sheets[firstSheetName]
        const jsonData = XLSX.utils.sheet_to_json<ExcelProductData>(worksheet)
        
        const products: Product[] = jsonData
          .filter(row => row.name)
          .map(row => ({
            id: generateId(),
            name: row.name || '',
            category: row.category || 'clothing',
            brand: row.brand || '',
            material: row.material || '',
            size: row.size || '',
            color: row.color || '',
            targetAudience: row.targetAudience 
              ? row.targetAudience.split(',').map(s => s.trim()) 
              : ['general'],
            imageUrl: row.imageUrl || ''
          }))
        
        resolve(products)
      } catch (error) {
        reject(error)
      }
    }
    
    reader.onerror = () => {
      reject(new Error('Failed to read Excel file'))
    }
    
    reader.readAsBinaryString(file)
  })
}
