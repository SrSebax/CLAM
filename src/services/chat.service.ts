import {
  collection,
  deleteDoc,
  doc,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
} from 'firebase/firestore'

import { db } from '@/firebase/config'
import type { ChatMessage } from '@/types'

const chatCol = collection(db, 'chatMessages')

export async function sendChatMessage(userId: string, userName: string, text: string): Promise<void> {
  await setDoc(doc(chatCol), {
    userId,
    userName: userName.trim() || 'Anónimo',
    text: text.trim(),
    createdAt: serverTimestamp(),
  })
}

export async function deleteChatMessage(messageId: string): Promise<void> {
  await deleteDoc(doc(chatCol, messageId))
}

/** Escucha en vivo los últimos mensajes del chat, ordenados del más antiguo al más nuevo. */
export function subscribeToChatMessages(
  messageLimit: number,
  callback: (messages: ChatMessage[]) => void,
): () => void {
  const q = query(chatCol, orderBy('createdAt', 'desc'), limit(messageLimit))
  return onSnapshot(q, (snap) => {
    const messages = snap.docs.map((d) => ({ ...(d.data() as ChatMessage), id: d.id }))
    callback(messages.reverse())
  })
}
