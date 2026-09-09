import { initializeApp, type FirebaseApp } from 'firebase/app'
import { getAuth, type Auth } from 'firebase/auth'
import { getFirestore, type Firestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
  // eslint-disable-next-line no-console
  console.warn(
    '[firebase] Configuración incompleta. Copia .env.example a .env y completa las variables VITE_FIREBASE_*.',
  )
}

// El almacenamiento de archivos (imágenes/documentos) usa Cloudinary, no Firebase
// Storage (ver src/services/storage.service.ts) — evita depender del plan Blaze.
export const firebaseApp: FirebaseApp = initializeApp(firebaseConfig)
export const auth: Auth = getAuth(firebaseApp)
export const db: Firestore = getFirestore(firebaseApp)
