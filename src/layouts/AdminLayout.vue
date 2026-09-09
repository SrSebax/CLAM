<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'

import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()
const router = useRouter()
const drawer = ref(true)

const links = [
  { to: '/admin', title: 'Dashboard', icon: 'mdi-view-dashboard-outline', exact: true },
  { to: '/admin/posts', title: 'Publicaciones', icon: 'mdi-post-outline' },
  { to: '/admin/comments', title: 'Comentarios', icon: 'mdi-comment-outline' },
  { to: '/admin/users', title: 'Usuarios', icon: 'mdi-account-group-outline' },
  { to: '/admin/settings', title: 'Ajustes del sitio', icon: 'mdi-cog-outline' },
]

async function handleLogout() {
  await auth.logout()
  router.push('/')
}
</script>

<template>
  <v-app>
    <v-navigation-drawer v-model="drawer" permanent>
      <v-list-item title="CLAM Admin" prepend-icon="mdi-shield-account" class="py-4" />
      <v-divider />
      <v-list nav>
        <v-list-item
          v-for="link in links"
          :key="link.to"
          :to="link.to"
          :exact="link.exact"
          :title="link.title"
          :prepend-icon="link.icon"
        />
      </v-list>
      <template #append>
        <v-list nav>
          <v-list-item to="/" title="Ver sitio público" prepend-icon="mdi-open-in-new" />
          <v-list-item title="Cerrar sesión" prepend-icon="mdi-logout" @click="handleLogout" />
        </v-list>
      </template>
    </v-navigation-drawer>

    <v-app-bar flat color="surface" border>
      <v-app-bar-nav-icon @click="drawer = !drawer" />
      <v-toolbar-title>Panel administrativo</v-toolbar-title>
      <v-spacer />
      <span class="text-body-2 text-medium-emphasis mr-4">{{ auth.displayName }}</span>
    </v-app-bar>

    <v-main>
      <router-view />
    </v-main>
  </v-app>
</template>
