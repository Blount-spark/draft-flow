import JSZip from 'jszip'
import { DraftResult } from '@/types'

export async function downloadImage(dataUrl: string, filename: string) {
  const link = document.createElement('a')
  link.href = dataUrl
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

export async function downloadImagesAsZip(drafts: DraftResult[]) {
  const zip = new JSZip()
  
  drafts.forEach((draft, index) => {
    const imageData = draft.mainImageDraftUrl.split(',')[1]
    zip.file(`${draft.title}_${index + 1}.png`, imageData, { base64: true })
  })
  
  const content = await zip.generateAsync({ type: 'blob' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(content)
  link.download = `drafts_${Date.now()}.zip`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

export function copyTextToClipboard(text: string): Promise<boolean> {
  return new Promise((resolve) => {
    navigator.clipboard.writeText(text).then(
      () => resolve(true),
      () => resolve(false)
    )
  })
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

export function generateId(): string {
  return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}
