import {
  collection,
  doc,
  getCountFromServer,
  getDoc,
  increment,
  runTransaction,
  serverTimestamp,
} from 'firebase/firestore'

import { db } from '@/firebase/config'

function likeRef(postId: string, userId: string) {
  return doc(db, 'likes', `${postId}_${userId}`)
}

export async function hasLiked(postId: string, userId: string): Promise<boolean> {
  const snap = await getDoc(likeRef(postId, userId))
  return snap.exists()
}

/** Crea el Like y aumenta el contador de forma atómica. El id determinístico evita duplicados. */
export async function addLike(postId: string, userId: string): Promise<void> {
  await runTransaction(db, async (tx) => {
    const ref = likeRef(postId, userId)
    const existing = await tx.get(ref)
    if (existing.exists()) return

    const postRef = doc(db, 'posts', postId)
    tx.set(ref, { postId, userId, createdAt: serverTimestamp() })
    tx.update(postRef, { likesCount: increment(1) })
  })
}

export async function removeLike(postId: string, userId: string): Promise<void> {
  await runTransaction(db, async (tx) => {
    const ref = likeRef(postId, userId)
    const existing = await tx.get(ref)
    if (!existing.exists()) return

    const postRef = doc(db, 'posts', postId)
    tx.delete(ref)
    tx.update(postRef, { likesCount: increment(-1) })
  })
}

export async function getLikeCount(): Promise<number> {
  const snap = await getCountFromServer(collection(db, 'likes'))
  return snap.data().count
}
