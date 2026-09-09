<script setup lang="ts">
import type { Category } from '@/types'

const search = defineModel<string>('search', { default: '' })
const categoryId = defineModel<string | null>('categoryId', { default: null })

defineProps<{ categories: Category[] }>()
</script>

<template>
  <div class="d-flex flex-column flex-sm-row ga-3">
    <v-text-field
      v-model="search"
      label="Buscar publicaciones"
      prepend-inner-icon="mdi-magnify"
      clearable
      hide-details
      density="comfortable"
    />
    <v-select
      v-model="categoryId"
      :items="categories"
      item-title="name"
      item-value="id"
      label="Categoría"
      clearable
      hide-details
      density="comfortable"
      style="min-width: 220px"
    />
  </div>
</template>
