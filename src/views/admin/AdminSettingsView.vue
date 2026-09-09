<script setup lang="ts">
import { onMounted, ref } from 'vue'

import BannerUploadField from '@/components/admin/BannerUploadField.vue'
import ColorField from '@/components/admin/ColorField.vue'
import { useSiteTheme } from '@/composables/useSiteTheme'
import { getSiteSettings, updateSiteSettings } from '@/services/settings.service'
import { useSiteSettingsStore } from '@/stores/siteSettings'
import { useToastStore } from '@/stores/toast'
import { getFirestoreErrorMessage } from '@/utils/firestoreErrors'

const toast = useToastStore()
const siteSettingsStore = useSiteSettingsStore()
const { applyColors } = useSiteTheme()

const loading = ref(true)
const saving = ref(false)

const siteTitle = ref('')
const welcomeTitle = ref('')
const welcomeText = ref('')
const bannerImageUrl = ref<string | null>(null)
const bannerImagePath = ref<string | null>(null)
const primaryColor = ref('#2A5DB0')
const secondaryColor = ref('#D9782E')

onMounted(async () => {
  loading.value = true
  try {
    const settings = await getSiteSettings()
    siteTitle.value = settings.siteTitle
    welcomeTitle.value = settings.welcomeTitle
    welcomeText.value = settings.welcomeText
    bannerImageUrl.value = settings.bannerImageUrl
    bannerImagePath.value = settings.bannerImagePath
    primaryColor.value = settings.primaryColor
    secondaryColor.value = settings.secondaryColor
  } finally {
    loading.value = false
  }
})

function handleBannerChange(value: { url: string | null; path: string | null }) {
  bannerImageUrl.value = value.url
  bannerImagePath.value = value.path
}

function previewColors() {
  applyColors({ primaryColor: primaryColor.value, secondaryColor: secondaryColor.value })
}

async function save() {
  saving.value = true
  try {
    await updateSiteSettings({
      siteTitle: siteTitle.value.trim() || 'CLAM',
      welcomeTitle: welcomeTitle.value.trim() || 'Bienvenidos',
      welcomeText: welcomeText.value.trim(),
      bannerImageUrl: bannerImageUrl.value,
      bannerImagePath: bannerImagePath.value,
      primaryColor: primaryColor.value,
      secondaryColor: secondaryColor.value,
    })
    await siteSettingsStore.load(true)
    toast.success('Ajustes guardados. Ya son visibles para todos los visitantes.')
  } catch (error) {
    toast.error(getFirestoreErrorMessage(error, 'No se pudieron guardar los ajustes.'))
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <v-container class="py-8" max-width="720">
    <h1 class="text-h4 font-weight-bold mb-6">Ajustes del sitio</h1>

    <v-skeleton-loader v-if="loading" type="article" />

    <v-form v-else @submit.prevent="save">
      <p class="text-subtitle-2 mb-2">Banner principal</p>
      <p class="text-caption text-medium-emphasis mb-3">
        Se muestra en la parte superior de todas las páginas públicas del blog.
      </p>
      <BannerUploadField :url="bannerImageUrl" :path="bannerImagePath" class="mb-6" @change="handleBannerChange" />

      <v-text-field v-model="siteTitle" label="Nombre del sitio" class="mb-4" />
      <v-text-field v-model="welcomeTitle" label="Título del bloque de bienvenida" class="mb-4" />
      <v-textarea v-model="welcomeText" label="Texto de bienvenida" rows="3" auto-grow class="mb-6" />

      <p class="text-subtitle-2 mb-2">Colores del sitio</p>
      <p class="text-caption text-medium-emphasis mb-3">
        Color principal (botones, enlaces) y secundario (acentos, categorías).
      </p>
      <ColorField v-model="primaryColor" label="Color principal" class="mb-3" @update:model-value="previewColors" />
      <ColorField v-model="secondaryColor" label="Color secundario" class="mb-6" @update:model-value="previewColors" />

      <v-btn type="submit" color="primary" :loading="saving">Guardar cambios</v-btn>
    </v-form>
  </v-container>
</template>
