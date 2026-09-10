import {
  collection,
  doc,
  getCountFromServer,
  getDocs,
  increment,
  orderBy,
  query,
  runTransaction,
  serverTimestamp,
  where,
} from 'firebase/firestore'

import { db } from '@/firebase/config'
import type { Comment, CommentStatus } from '@/types'

const commentsCol = collection(db, 'comments')

export async function addComment(
  postId: string,
  userId: string,
  userName: string,
  text: string,
): Promise<void> {
  await runTransaction(db, async (tx) => {
    const ref = doc(commentsCol)
    const postRef = doc(db, 'posts', postId)
    tx.set(ref, {
      postId,
      userId,
      userName: userName.trim() || 'Anónimo',
      text,
      status: 'visible' satisfies CommentStatus,
      parentId: null,
      createdAt: serverTimestamp(),
    })
    tx.update(postRef, { commentsCount: increment(1) })
  })
}

export async function listVisibleComments(postId: string): Promise<Comment[]> {
  const snap = await getDocs(
    query(
      commentsCol,
      where('postId', '==', postId),
      where('status', '==', 'visible'),
      orderBy('createdAt', 'asc'),
    ),
  )
  return snap.docs.map((d) => ({ ...(d.data() as Comment), id: d.id }))
}

export async function listAllCommentsAdmin(): Promise<Comment[]> {
  const snap = await getDocs(query(commentsCol, orderBy('createdAt', 'desc')))
  return snap.docs.map((d) => ({ ...(d.data() as Comment), id: d.id }))
}

export async function getCommentCount(): Promise<number> {
  const snap = await getCountFromServer(commentsCol)
  return snap.data().count
}

export async function setCommentStatus(comment: Comment, status: CommentStatus): Promise<void> {
  if (comment.status === status) return
  await runTransaction(db, async (tx) => {
    const ref = doc(commentsCol, comment.id)
    const postRef = doc(db, 'posts', comment.postId)
    tx.update(ref, { status })
    tx.update(postRef, { commentsCount: increment(status === 'visible' ? 1 : -1) })
  })
}

export async function deleteComment(comment: Comment): Promise<void> {
  await runTransaction(db, async (tx) => {
    const ref = doc(commentsCol, comment.id)
    tx.delete(ref)
    if (comment.status === 'visible') {
      const postRef = doc(db, 'posts', comment.postId)
      tx.update(postRef, { commentsCount: increment(-1) })
    }
  })
}
