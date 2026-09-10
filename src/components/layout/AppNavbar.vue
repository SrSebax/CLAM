<script setup lang="ts">
import { ref, computed } from 'vue'
import { useDisplay } from 'vuetify'
import { useRoute } from 'vue-router'

import { useAuthStore } from '@/stores/auth'

const route = useRoute()
const { mdAndUp } = useDisplay()
const auth = useAuthStore()

const drawer = ref(false)

const isHome = computed(() => route.name === 'home')
const isPosts = computed(() => route.name === 'posts-list' || route.name === 'post-detail')
</script>

<template>
  <v-app-bar flat class="y2k-navbar" height="72">
    <span class="navbar-sparkle navbar-sparkle-1">✦</span>
    <span class="navbar-sparkle navbar-sparkle-2">✧</span>
    <span class="navbar-sparkle navbar-sparkle-3">★</span>

    <v-container class="d-flex align-center">
      <v-app-bar-nav-icon v-if="!mdAndUp" color="white" @click="drawer = true" />

      <RouterLink to="/" class="text-decoration-none clam-logo mr-4"> CLAM </RouterLink>

      <template v-if="mdAndUp">
        <RouterLink to="/" class="y2k-tab" :class="{ 'y2k-tab--active': isHome }">
          Inicio
        </RouterLink>
        <RouterLink to="/posts" class="y2k-tab" :class="{ 'y2k-tab--active': isPosts }">
          Publicaciones
        </RouterLink>
      </template>

      <v-spacer />

      <RouterLink v-if="auth.isAdmin" to="/admin" class="admin-badge">
        <span class="mdi mdi-crown" />
        Administrador
      </RouterLink>
    </v-container>
  </v-app-bar>

  <v-navigation-drawer v-model="drawer" temporary location="left">
    <v-list>
      <v-list-item
        to="/"
        title="Inicio"
        prepend-icon="mdi-home-outline"
        :active="isHome"
        @click="drawer = false"
      />
      <v-list-item
        to="/posts"
        title="Publicaciones"
        prepend-icon="mdi-post-outline"
        :active="isPosts"
        @click="drawer = false"
      />
    </v-list>
  </v-navigation-drawer>
</template>

<style scoped>
.y2k-navbar {
  background: linear-gradient(120deg, #ff69d4, #ff1493 35%, #c400ff 65%, #ff69d4);
  background-size: 300% 100%;
  animation: navbar-shimmer 10s ease-in-out infinite;
  border-bottom: 4px solid #00cfff;
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.7),
    0 3px 12px rgba(155, 48, 255, 0.55);
  position: relative;
  overflow: hidden;
}

@keyframes navbar-shimmer {
  0%,
  100% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
}

.y2k-navbar::after {
  content: '';
  position: absolute;
  inset: 0 0 auto 0;
  height: 45%;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.55), rgba(255, 255, 255, 0));
  pointer-events: none;
}

.navbar-sparkle {
  position: absolute;
  top: 8px;
  color: #fff59d;
  text-shadow:
    0 0 6px #fff,
    0 0 10px #ff69b4;
  pointer-events: none;
  animation: navbar-twinkle 1.8s ease-in-out infinite;
  z-index: 1;
}
.navbar-sparkle-1 {
  left: 32%;
  font-size: 0.9rem;
  animation-delay: 0s;
}
.navbar-sparkle-2 {
  left: 62%;
  top: 40px;
  font-size: 0.7rem;
  animation-delay: 0.5s;
}
.navbar-sparkle-3 {
  right: 8%;
  top: 14px;
  font-size: 0.8rem;
  animation-delay: 1s;
}

@keyframes navbar-twinkle {
  0%,
  100% {
    opacity: 0.3;
    transform: scale(0.7) rotate(0deg);
  }
  50% {
    opacity: 1;
    transform: scale(1.2) rotate(20deg);
  }
}

.clam-logo {
  font-family: 'Chewy', 'Comic Neue', cursive;
  font-size: 1.7rem;
  color: #fff;
  -webkit-text-stroke: 1px #9b30ff;
  text-shadow:
    2px 2px 0 #9b30ff,
    0 0 12px rgba(255, 255, 255, 0.9),
    0 0 20px rgba(0, 207, 255, 0.5);
  letter-spacing: 1px;
  position: relative;
  z-index: 1;
}

.y2k-tab {
  font-family: 'Comic Neue', cursive;
  font-weight: 700;
  text-decoration: none;
  color: #fff;
  text-shadow: 1px 1px 0 rgba(155, 48, 255, 0.8);
  padding: 8px 20px;
  margin-right: 10px;
  border-radius: 999px;
  border: 2px solid rgba(255, 255, 255, 0.7);
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.35), rgba(255, 255, 255, 0) 60%);
  box-shadow:
    inset 0 1px 1px rgba(255, 255, 255, 0.6),
    0 2px 3px rgba(0, 0, 0, 0.15);
  transition: transform 0.15s ease;
}

.y2k-tab:hover {
  transform: translateY(-1px);
}

.y2k-tab--active {
  color: #ff1493;
  background: #fff;
  border-color: #00cfff;
  text-shadow: none;
  box-shadow:
    inset 0 2px 4px rgba(155, 48, 255, 0.35),
    0 0 8px rgba(0, 207, 255, 0.6);
}

.admin-badge {
  display: flex;
  align-items: center;
  gap: 6px;
  text-decoration: none;
  font-family: 'Comic Neue', cursive;
  font-weight: 700;
  font-size: 0.78rem;
  letter-spacing: 0.5px;
  text-transform: uppercase;
  color: #7a4a00;
  padding: 7px 16px;
  border-radius: 999px;
  background: linear-gradient(180deg, #fff9c4, #ffd54f);
  border: 2px solid #fff;
  box-shadow:
    inset 0 1px 1px rgba(255, 255, 255, 0.8),
    0 2px 6px rgba(0, 0, 0, 0.2);
  transition: transform 0.15s ease;
}

.admin-badge:hover {
  transform: translateY(-1px) scale(1.03);
}

.admin-badge .mdi {
  font-size: 16px;
}
</style>
