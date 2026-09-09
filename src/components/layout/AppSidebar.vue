<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'

import { listCategories } from '@/services/categories.service'
import { listArchivePosts } from '@/services/posts.service'
import { useSiteSettingsStore } from '@/stores/siteSettings'
import type { ArchivePostEntry, Category } from '@/types'

const siteSettings = useSiteSettingsStore()
const categories = ref<Category[]>([])
const archivePosts = ref<ArchivePostEntry[]>([])

const MONTH_NAMES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
]

interface MonthGroup {
  key: string
  label: string
  posts: ArchivePostEntry[]
}
interface YearGroup {
  year: number
  months: MonthGroup[]
}

const archiveTree = computed<YearGroup[]>(() => {
  const years = new Map<number, Map<number, ArchivePostEntry[]>>()

  for (const post of archivePosts.value) {
    const date = post.publishedAt.toDate()
    const year = date.getFullYear()
    const month = date.getMonth()
    if (!years.has(year)) years.set(year, new Map())
    const monthsMap = years.get(year)!
    if (!monthsMap.has(month)) monthsMap.set(month, [])
    monthsMap.get(month)!.push(post)
  }

  return [...years.entries()]
    .sort((a, b) => b[0] - a[0])
    .map(([year, monthsMap]) => ({
      year,
      months: [...monthsMap.entries()]
        .sort((a, b) => b[0] - a[0])
        .map(([month, posts]) => ({ key: `${year}-${month}`, label: MONTH_NAMES[month], posts })),
    }))
})

onMounted(async () => {
  const [cats, archive] = await Promise.all([listCategories(), listArchivePosts()])
  categories.value = cats
  archivePosts.value = archive
})
</script>

<template>
  <aside class="app-sidebar">
    <section class="sidebar-widget">
      <h2 class="sidebar-title">{{ siteSettings.settings?.welcomeTitle ?? 'Bienvenidos' }}</h2>
      <p class="text-body-2">{{ siteSettings.settings?.welcomeText }}</p>
    </section>

    <section class="sidebar-widget">
      <h2 class="sidebar-title">Páginas</h2>
      <ul class="sidebar-links">
        <li><RouterLink to="/">Página principal</RouterLink></li>
        <li><RouterLink to="/posts">Publicaciones</RouterLink></li>
      </ul>
    </section>

    <section v-if="categories.length" class="sidebar-widget">
      <h2 class="sidebar-title">Categorías</h2>
      <ul class="sidebar-links">
        <li v-for="cat in categories" :key="cat.id">
          <RouterLink :to="{ name: 'posts-list', query: { category: cat.id } }">
            {{ cat.name }} ({{ cat.postCount }})
          </RouterLink>
        </li>
      </ul>
    </section>

    <section v-if="archiveTree.length" class="sidebar-widget">
      <h2 class="sidebar-title">Archivo del blog</h2>
      <v-list density="compact" class="pa-0 bg-transparent">
        <v-list-group v-for="yearGroup in archiveTree" :key="yearGroup.year" :value="yearGroup.year">
          <template #activator="{ props: activatorProps }">
            <v-list-item v-bind="activatorProps" :title="`${yearGroup.year}`" density="compact" class="pl-0" />
          </template>

          <v-list-group v-for="monthGroup in yearGroup.months" :key="monthGroup.key" :value="monthGroup.key">
            <template #activator="{ props: activatorProps }">
              <v-list-item v-bind="activatorProps" :title="monthGroup.label" density="compact" />
            </template>

            <v-list-item
              v-for="post in monthGroup.posts"
              :key="post.id"
              :to="`/post/${post.slug}`"
              :title="post.title"
              density="compact"
              class="archive-post-item"
            />
          </v-list-group>
        </v-list-group>
      </v-list>
    </section>
  </aside>
</template>

<style scoped>
.app-sidebar {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}
.sidebar-widget {
  padding-bottom: 1rem;
}
.sidebar-title {
  font-size: 1.05rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
}
.sidebar-links {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}
.sidebar-links a {
  color: rgb(var(--v-theme-primary));
  text-decoration: none;
  font-size: 0.9rem;
}
.sidebar-links a:hover {
  text-decoration: underline;
}
.archive-post-item :deep(.v-list-item-title) {
  white-space: normal;
  font-size: 0.85rem;
  color: rgb(var(--v-theme-primary));
}
</style>
