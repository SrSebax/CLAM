<script setup lang="ts">
import { ref } from 'vue'

import { deletePostFile, uploadPostFile } from '@/services/storage.service'
import { useToastStore } from '@/stores/toast'

import ImageCropperDialog from './ImageCropperDialog.vue'

const props = defineProps<{
  postId: string
  url: string | null
  path: string | null
}>()

const emit = defineEmits<{ change: [{ url: string | null; path: string | null }] }>()

const toast = useToastStore()
const uploading = ref(false)
const progress = ref(0)
const fileInput = ref<HTMLInputElement | null>(null)

const cropperOpen = ref(false)
const pendingFile = ref<File | null>(null)

function handleFileSelected(event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (!file) return
  pendingFile.value = file
  cropperOpen.value = true
}

async function handleCropped(croppedFile: File) {
  uploading.value = true
  progress.value = 0
  try {
    const previousPath = props.path
    const attachment = await uploadPostFile(props.postId, 'cover', croppedFile, (p) => (progress.value = p))
    emit('change', { url: attachment.url, path: attachment.path })
    if (previousPath) await deletePostFile(previousPath)
  } catch (error) {
    toast.error(error instanceof Error ? error.message : 'No se pudo subir la imagen.')
  } finally {
    uploading.value = false
    pendingFile.value = null
    if (fileInput.value) fileInput.value.value = ''
  }
}

async function remove() {
  if (props.path) await deletePostFile(props.path)
  emit('change', { url: null, path: null })
}
</script>

<template>
  <div>
    <v-img
      v-if="url"
      :src="url"
      height="200"
      cover
      class="rounded-lg mb-2 bg-grey-lighten-3"
    />
    <v-progress-linear v-if="uploading" :model-value="progress" color="primary" class="mb-2" />
    <div class="d-flex ga-2">
      <v-btn
        size="small"
        variant="tonal"
        prepend-icon="mdi-image-plus"
        :loading="uploading"
        @click="fileInput?.click()"
      >
        {{ url ? 'Cambiar imagen' : 'Subir imagen' }}
      </v-btn>
      <v-btn v-if="url" size="small" variant="text" color="error" @click="remove">Quitar</v-btn>
    </div>
    <input ref="fileInput" type="file" accept="image/*" hidden @change="handleFileSelected" />

    <ImageCropperDialog
      v-model="cropperOpen"
      :file="pendingFile"
      :aspect-ratio="16 / 9"
      @cropped="handleCropped"
    />
  </div>
</template>
