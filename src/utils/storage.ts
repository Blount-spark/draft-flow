const DB_NAME = 'DraftFlowDB'
const DB_VERSION = 1
const STORE_PRODUCTS = 'products'
const STORE_DRAFTS = 'drafts'

export class IndexedDBStorage {
  private db: IDBDatabase | null = null

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION)

      request.onerror = () => {
        reject(new Error('Failed to open IndexedDB'))
      }

      request.onsuccess = () => {
        this.db = request.result
        resolve()
      }

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result

        if (!db.objectStoreNames.contains(STORE_PRODUCTS)) {
          db.createObjectStore(STORE_PRODUCTS, { keyPath: 'id' })
        }

        if (!db.objectStoreNames.contains(STORE_DRAFTS)) {
          db.createObjectStore(STORE_DRAFTS, { keyPath: 'id' })
        }
      }
    })
  }

  async saveProduct(product: any): Promise<void> {
    if (!this.db) await this.init()

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_PRODUCTS], 'readwrite')
      const store = transaction.objectStore(STORE_PRODUCTS)
      const request = store.put(product)

      request.onsuccess = () => resolve()
      request.onerror = () => reject(new Error('Failed to save product'))
    })
  }

  async saveDraft(draft: any): Promise<void> {
    if (!this.db) await this.init()

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_DRAFTS], 'readwrite')
      const store = transaction.objectStore(STORE_DRAFTS)
      const request = store.put(draft)

      request.onsuccess = () => resolve()
      request.onerror = () => reject(new Error('Failed to save draft'))
    })
  }

  async getAllProducts(): Promise<any[]> {
    if (!this.db) await this.init()

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_PRODUCTS], 'readonly')
      const store = transaction.objectStore(STORE_PRODUCTS)
      const request = store.getAll()

      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(new Error('Failed to get products'))
    })
  }

  async getAllDrafts(): Promise<any[]> {
    if (!this.db) await this.init()

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_DRAFTS], 'readonly')
      const store = transaction.objectStore(STORE_DRAFTS)
      const request = store.getAll()

      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(new Error('Failed to get drafts'))
    })
  }

  async clearStore(storeName: string): Promise<void> {
    if (!this.db) await this.init()

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], 'readwrite')
      const store = transaction.objectStore(storeName)
      const request = store.clear()

      request.onsuccess = () => resolve()
      request.onerror = () => reject(new Error(`Failed to clear ${storeName}`))
    })
  }
}

export const storage = new IndexedDBStorage()
