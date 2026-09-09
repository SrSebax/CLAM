<script setup lang="ts">
import Cropper from 'cropperjs'
import { nextTick, onBeforeUnmount, ref, watch } from 'vue'

const props = defineProps<{
  modelValue: boolean
  file: File | null
  aspectRatio?: number
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  cropped: [file: File]
}>()

const imgRef = ref<HTMLImageElement | null>(null)
const processing = ref(false)
let cropper: Cropper | null = null
let objectUrl: string | null = null

function destroyCropper() {
  cropper?.destroy()
  cropper = null
  if (objectUrl) {
    URL.revokeObjectURL(objectUrl)
    objectUrl = null
  }
}

watch(
  () => [props.modelValue, props.file] as const,
  async ([open, file]) => {
    destroyCropper()
    if (!open || !file) return

    await nextTick()
    if (!imgRef.value) return

    objectUrl = URL.createObjectURL(file)
    imgRef.value.src = objectUrl

    cropper = new Cropper(imgRef.value)
    const selection = cropper.getCropperSelection()
    if (selection && props.aspectRatio) {
      selection.aspectRatio = props.aspectRatio
    }
  },
)

onBeforeUnmount(destroyCropper)

async function confirmCrop() {
  const selection = cropper?.getCropperSelection()
  if (!selection) return

  processing.value = true
  try {
    const canvas = await selection.$toCanvas()
    canvas.toBlob(
      (blob) => {
        processing.value = false
        if (!blob) return
        const baseName = props.file?.name.replace(/\.\w+$/, '') ?? 'imagen'
        emit('cropped', new File([blob], `${baseName}.jpg`, { type: 'image/jpeg' }))
        emit('update:modelValue', false)
      },
      'image/jpeg',
      0.92,
    )
  } catch {
    processing.value = false
  }
}

function cancel() {
  emit('update:modelValue', false)
}
</script>

<template>
  <v-dialog
    :model-value="modelValue"
    max-width="760"
    persistent
    @update:model-value="(v) => $emit('update:modelValue', v)"
  >
    <v-card>
      <v-card-title>Ajustar imagen</v-card-title>
      <v-card-subtitle>Arrastra para mover o cambiar el tamaño del recuadro</v-card-subtitle>
      <v-card-text>
        <div class="cropper-wrapper">
          <img ref="imgRef" alt="Imagen a recortar" />
        </div>
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn variant="text" @click="cancel">Cancelar</v-btn>
        <v-btn color="primary" :loading="processing" @click="confirmCrop">Recortar y usar</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<style scoped>
.cropper-wrapper {
  width: 100%;
  height: 420px;
  background: #000;
}
.cropper-wrapper :deep(cropper-canvas) {
  display: block;
  width: 100%;
  height: 100%;
}
.cropper-wrapper :deep(cropper-image) {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: contain;
}
</style>
