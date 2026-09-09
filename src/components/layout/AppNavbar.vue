<script setup lang="ts">
import { ref } from 'vue'
import { useDisplay } from 'vuetify'
import { useRouter } from 'vue-router'

import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()
const router = useRouter()
const { mdAndUp } = useDisplay()

const drawer = ref(false)
const searchOpen = ref(false)
const searchQuery = ref('')

async function handleLogout() {
  await auth.logout()
  drawer.value = false
  router.push('/')
}

function runSearch() {
  if (!searchQuery.value.trim()) {
    searchOpen.value = false
    return
  }
  router.push({ name: 'posts-list', query: { q: searchQuery.value.trim() } })
  searchOpen.value = false
  searchQuery.value = ''
}
</script>

<template>
  <v-app-bar flat color="surface" border>
    <v-container class="d-flex align-center">
      <v-app-bar-nav-icon v-if="!mdAndUp" @click="drawer = true" />

      <RouterLink to="/" class="text-decoration-none text-primary font-weight-bold text-h6 mr-4">
        CLAM
      </RouterLink>

      <template v-if="mdAndUp">
        <v-btn to="/" variant="text">Inicio</v-btn>
        <v-btn to="/posts" variant="text">Publicaciones</v-btn>

        <v-spacer />

        <v-expand-x-transition>
          <v-text-field
            v-if="searchOpen"
            v-model="searchQuery"
            placeholder="Buscar..."
            density="compact"
            variant="outlined"
            hide-details
            autofocus
            style="max-width: 240px"
            class="mr-2"
            @keyup.enter="runSearch"
            @blur="searchOpen = false"
          />
        </v-expand-x-transition>
        <v-btn icon="mdi-magnify" variant="text" @click="searchOpen = !searchOpen" />

        <template v-if="auth.isAuthenticated">
          <v-btn v-if="auth.isAdmin" to="/admin" variant="text" prepend-icon="mdi-shield-account">
            Admin
          </v-btn>
          <v-menu>
            <template #activator="{ props: menuProps }">
              <v-btn v-bind="menuProps" variant="text" prepend-icon="mdi-account-circle">
                {{ auth.displayName }}
              </v-btn>
            </template>
            <v-list>
              <v-list-item prepend-icon="mdi-logout" title="Cerrar sesión" @click="handleLogout" />
            </v-list>
          </v-menu>
        </template>
        <v-btn v-else to="/auth/login" variant="tonal" color="primary">Iniciar sesión</v-btn>
      </template>

      <v-spacer v-else />
    </v-container>
  </v-app-bar>

  <v-navigation-drawer v-model="drawer" temporary location="left">
    <v-list>
      <v-list-item to="/" title="Inicio" prepend-icon="mdi-home-outline" @click="drawer = false" />
      <v-list-item
        to="/posts"
        title="Publicaciones"
        prepend-icon="mdi-post-outline"
        @click="drawer = false"
      />
      <v-divider class="my-2" />
      <template v-if="auth.isAuthenticated">
        <v-list-item
          v-if="auth.isAdmin"
          to="/admin"
          title="Panel admin"
          prepend-icon="mdi-shield-account"
          @click="drawer = false"
        />
        <v-list-item title="Cerrar sesión" prepend-icon="mdi-logout" @click="handleLogout" />
      </template>
      <v-list-item
        v-else
        to="/auth/login"
        title="Iniciar sesión"
        prepend-icon="mdi-login"
        @click="drawer = false"
      />
    </v-list>
  </v-navigation-drawer>
</template>
