import {
  collection,
  doc,
  getDocs,
  increment,
  orderBy,
  query,
  runTransaction,
} from 'firebase/firestore'

import { db } from '@/firebase/config'
import type { Category } from '@/types'
import { slugify } from '@/utils/slug'

const categoriesCol = collection(db, 'categories')

export async function listCategories(): Promise<Category[]> {
  const snapshot = await getDocs(query(categoriesCol, orderBy('name', 'asc')))
  return snapshot.docs.map((d) => ({ ...(d.data() as Category), id: d.id }))
}

/** Obtiene la categoría por nombre o la crea si no existe. Devuelve {id, name}. */
export async function getOrCreateCategory(name: string): Promise<{ id: string; name: string }> {
  const trimmed = name.trim()
  const slug = slugify(trimmed)
  const ref = doc(categoriesCol, slug)

  await runTransaction(db, async (tx) => {
    const snap = await tx.get(ref)
    if (!snap.exists()) {
      tx.set(ref, { name: trimmed, slug, postCount: 0 })
    }
  })

  return { id: ref.id, name: trimmed }
}

export async function adjustCategoryPostCount(categoryId: string, delta: number) {
  await runTransaction(db, async (tx) => {
    const ref = doc(categoriesCol, categoryId)
    const snap = await tx.get(ref)
    if (!snap.exists()) return
    tx.update(ref, { postCount: increment(delta) })
  })
}
