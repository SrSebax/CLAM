import {
  browserLocalPersistence,
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  onAuthStateChanged,
  setPersistence,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
  type User,
} from 'firebase/auth'

import { auth } from '@/firebase/config'

const googleProvider = new GoogleAuthProvider()

export function watchAuthState(callback: (user: User | null) => void) {
  return onAuthStateChanged(auth, callback)
}

export async function ensurePersistence() {
  // Sesión persistida en este dispositivo/navegador (localStorage) entre recargas y pestañas.
  await setPersistence(auth, browserLocalPersistence)
}

export async function registerWithEmail(email: string, password: string, displayName: string) {
  const credential = await createUserWithEmailAndPassword(auth, email, password)
  await updateProfile(credential.user, { displayName })
  return credential.user
}

export async function loginWithEmail(email: string, password: string) {
  const credential = await signInWithEmailAndPassword(auth, email, password)
  return credential.user
}

export async function loginWithGoogle() {
  const credential = await signInWithPopup(auth, googleProvider)
  return credential.user
}

export async function logout() {
  await signOut(auth)
}
