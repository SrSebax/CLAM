<script setup lang="ts">
import { ref } from 'vue'
import { useDisplay } from 'vuetify'
import { useRouter } from 'vue-router'

const router = useRouter()
const { mdAndUp } = useDisplay()

const drawer = ref(false)
const searchOpen = ref(false)
const searchQuery = ref('')

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
    </v-list>
  </v-navigation-drawer>
</template>
