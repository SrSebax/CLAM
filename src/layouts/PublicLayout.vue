<script setup lang="ts">
import AppFooter from '@/components/layout/AppFooter.vue'
import AppNavbar from '@/components/layout/AppNavbar.vue'
import AppSidebar from '@/components/layout/AppSidebar.vue'
import SiteBanner from '@/components/layout/SiteBanner.vue'
</script>

<template>
  <v-app class="notebook-bg">
    <AppNavbar />

    <v-main>
      <div class="page-frame">
        <v-container class="py-4 py-md-6" max-width="1200">
          <SiteBanner class="mb-6" />

          <v-row>
            <v-col cols="12" md="8">
              <router-view />
            </v-col>
            <v-col cols="12" md="4">
              <AppSidebar />
            </v-col>
          </v-row>
        </v-container>
      </div>
    </v-main>

    <AppFooter />
  </v-app>
</template>

<style scoped>
.notebook-bg {
  background:
    repeating-linear-gradient(
      to bottom,
      rgba(var(--v-theme-primary), 0.06) 0px,
      rgba(var(--v-theme-primary), 0.06) 1px,
      transparent 1px,
      transparent 32px
    ),
    rgb(var(--v-theme-notebook-bg));
}
.page-frame {
  max-width: 1240px;
  margin: 0 auto;
  background: rgb(var(--v-theme-surface));
  min-height: 100%;
  box-shadow: 0 0 0 1px rgba(var(--v-border-color), var(--v-border-opacity));
}
</style>
