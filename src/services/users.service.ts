import type { User } from 'firebase/auth'
import {
  collection,
  doc,
  getCountFromServer,
  getDoc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
} from 'firebase/firestore'

import { db } from '@/firebase/config'
import type { AppUser } from '@/types'

const usersCol = collection(db, 'users')

export async function ensureUserDocument(user: User, isAdminEmail: boolean): Promise<void> {
  const ref = doc(usersCol, user.uid)
  const existing = await getDoc(ref)
  if (existing.exists()) return

  await setDoc(ref, {
    uid: user.uid,
    email: user.email ?? '',
    displayName: user.displayName ?? user.email ?? 'Usuario',
    photoURL: user.photoURL ?? null,
    // TODO(firestore-auth): este campo es solo informativo por ahora.
    // La autorización real de admin se resuelve por Custom Claims (ver stores/auth.ts).
    role: isAdminEmail ? 'admin' : 'user',
    createdAt: serverTimestamp(),
  })
}

export async function listUsers(): Promise<AppUser[]> {
  const snapshot = await getDocs(query(usersCol, orderBy('createdAt', 'desc')))
  return snapshot.docs.map((d) => ({ ...(d.data() as AppUser), uid: d.id }))
}

export async function getUserCount(): Promise<number> {
  const snap = await getCountFromServer(usersCol)
  return snap.data().count
}
