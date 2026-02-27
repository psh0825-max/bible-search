// IndexedDB for bookmarks, history, daily verse tracking

const DB_NAME = 'bible-search-db'
const DB_VERSION = 1

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION)
    req.onupgradeneeded = () => {
      const db = req.result
      if (!db.objectStoreNames.contains('bookmarks')) {
        db.createObjectStore('bookmarks', { keyPath: 'id' })
      }
      if (!db.objectStoreNames.contains('history')) {
        const store = db.createObjectStore('history', { keyPath: 'id', autoIncrement: true })
        store.createIndex('timestamp', 'timestamp')
      }
      if (!db.objectStoreNames.contains('settings')) {
        db.createObjectStore('settings', { keyPath: 'key' })
      }
    }
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })
}

// Bookmarks
export async function addBookmark(verse: { reference: string; text: string; reason?: string; mood?: string }) {
  const db = await openDB()
  const tx = db.transaction('bookmarks', 'readwrite')
  tx.objectStore('bookmarks').put({ ...verse, id: verse.reference, savedAt: Date.now() })
  return new Promise(r => { tx.oncomplete = r })
}

export async function removeBookmark(reference: string) {
  const db = await openDB()
  const tx = db.transaction('bookmarks', 'readwrite')
  tx.objectStore('bookmarks').delete(reference)
  return new Promise(r => { tx.oncomplete = r })
}

export async function getBookmarks(): Promise<any[]> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction('bookmarks', 'readonly')
    const req = tx.objectStore('bookmarks').getAll()
    req.onsuccess = () => resolve(req.result.sort((a: any, b: any) => b.savedAt - a.savedAt))
    req.onerror = () => reject(req.error)
  })
}

export async function isBookmarked(reference: string): Promise<boolean> {
  const db = await openDB()
  return new Promise((resolve) => {
    const tx = db.transaction('bookmarks', 'readonly')
    const req = tx.objectStore('bookmarks').get(reference)
    req.onsuccess = () => resolve(!!req.result)
    req.onerror = () => resolve(false)
  })
}

// History
export async function addHistory(query: string) {
  const db = await openDB()
  const tx = db.transaction('history', 'readwrite')
  tx.objectStore('history').add({ query, timestamp: Date.now() })
  return new Promise(r => { tx.oncomplete = r })
}

export async function getHistory(limit = 20): Promise<{ query: string; timestamp: number }[]> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction('history', 'readonly')
    const req = tx.objectStore('history').getAll()
    req.onsuccess = () => {
      const results = req.result.sort((a: any, b: any) => b.timestamp - a.timestamp).slice(0, limit)
      resolve(results)
    }
    req.onerror = () => reject(req.error)
  })
}

export async function clearHistory() {
  const db = await openDB()
  const tx = db.transaction('history', 'readwrite')
  tx.objectStore('history').clear()
  return new Promise(r => { tx.oncomplete = r })
}
