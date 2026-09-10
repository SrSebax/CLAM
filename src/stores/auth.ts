import type { User } from 'firebase/auth'
import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

import {
  ensurePersistence,
  loginWithEmail,
  logout as logoutService,
  watchAuthState,
} from '@/services/auth.service'

// TODO(firestore-auth): la fuente de verdad para autorización en Firestore/Storage Rules
// son los Custom Claims (claims.admin). Mientras no se ejecute el script
// scripts/setAdminClaim.mjs para el usuario administrador, se usa este email como
// respaldo SOLO para la UI (mostrar/ocultar el panel). Las Rules nunca confían en esto.
const ADMIN_EMAIL = import.meta.env.VITE_ADMIN_EMAIL as string | undefined

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const initialized = ref(false)
  const hasAdminClaim = ref(false)
  let readyResolve: () => void
  const ready = new Promise<void>((resolve) => {
    readyResolve = resolve
  })

  const isAuthenticated = computed(() => user.value !== null)
  const isAdmin = computed(() => {
    if (hasAdminClaim.value) return true
    return !!user.value?.email && !!ADMIN_EMAIL && user.value.email === ADMIN_EMAIL
  })
  const displayName = computed(() => user.value?.displayName || user.value?.email || '')

  async function syncClaims(firebaseUser: User) {
    // Forzar refresco: el token cacheado puede no incluir un Custom Claim
    // asignado después del último login (evita que el admin quede "atascado"
    // sin permisos hasta que cierre y vuelva a abrir sesión manualmente).
    const result = await firebaseUser.getIdTokenResult(true)
    hasAdminClaim.value = result.claims.admin === true
  }

  function init() {
    watchAuthState(async (firebaseUser) => {
      user.value = firebaseUser
      hasAdminClaim.value = false

      if (firebaseUser) {
        await syncClaims(firebaseUser)
      }

      if (!initialized.value) {
        initialized.value = true
        readyResolve()
      }
    })
  }

  async function login(email: string, password: string) {
    await ensurePersistence()
    user.value = await loginWithEmail(email, password)
  }

  async function logout() {
    await logoutService()
    user.value = null
    hasAdminClaim.value = false
  }

  return {
    user,
    initialized,
    ready,
    isAuthenticated,
    isAdmin,
    displayName,
    init,
    login,
    logout,
  }
})
