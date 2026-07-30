import type { MenuItem } from "@/api/menu-items.api"

const DB_NAME = "restaurant_partner_db"
const DB_VERSION = 1
const STORE_NAME = "menu_items"

function getDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)

    request.onupgradeneeded = () => {
      const db = request.result
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "_id" })
      }
    }

    request.onsuccess = () => {
      resolve(request.result)
    }

    request.onerror = () => {
      reject(request.error)
    }
  })
}

export async function saveMenuItems(items: MenuItem[]): Promise<void> {
  const db = await getDB()
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, "readwrite")
    const store = transaction.objectStore(STORE_NAME)

    // Clear existing
    const clearRequest = store.clear()

    clearRequest.onsuccess = () => {
      for (const item of items) {
        store.put(item)
      }
    }

    transaction.oncomplete = () => {
      resolve()
    }

    transaction.onerror = () => {
      reject(transaction.error)
    }
  })
}

export async function getMenuItems(): Promise<MenuItem[]> {
  const db = await getDB()
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, "readonly")
    const store = transaction.objectStore(STORE_NAME)
    const request = store.getAll()

    request.onsuccess = () => {
      resolve(request.result || [])
    }

    request.onerror = () => {
      reject(request.error)
    }
  })
}
