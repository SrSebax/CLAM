<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'

import CoverImageField from '@/components/admin/CoverImageField.vue'
import FileListField from '@/components/admin/FileListField.vue'
import RichTextEditor from '@/components/admin/RichTextEditor.vue'
import { adjustCategoryPostCount, getOrCreateCategory, listCategories } from '@/services/categories.service'
import { createPost, getPostById, newPostRef, updatePost, type PostInput } from '@/services/posts.service'
import { useAuthStore } from '@/stores/auth'
import { useToastStore } from '@/stores/toast'
import type { Category, PostAttachment, PostStatus } from '@/types'
import { getFirestoreErrorMessage } from '@/utils/firestoreErrors'

const props = defineProps<{ id?: string }>()
const router = useRouter()
const auth = useAuthStore()
const toast = useToastStore()

const isEditMode = computed(() => !!props.id)
const postId = ref<string>(props.id ?? newPostRef().id)

const loading = ref(isEditMode.value)
const saving = ref(false)
const categories = ref<Category[]>([])
const previousStatus = ref<PostStatus>('draft')
const previousCategoryId = ref<string | null>(null)

const title = ref('')
const excerpt = ref('')
const content = ref('')
const categoryName = ref('')
const tagsInput = ref('')
const coverImageUrl = ref<string | null>(null)
const coverImagePath = ref<string | null>(null)
const gallery = ref<PostAttachment[]>([])
const attachments = ref<PostAttachment[]>([])
const featured = ref(false)

const tags = computed(() =>
  tagsInput.value
    .split(',')
    .map((t) => t.trim())
    .filter(Boolean),
)

onMounted(async () => {
  categories.value = await listCategories()

  if (isEditMode.value && props.id) {
    const post = await getPostById(props.id)
    if (!post) {
      toast.error('Publicación no encontrada.')
      router.push('/admin/posts')
      return
    }
    title.value = post.title
    excerpt.value = post.excerpt
    content.value = post.content
    categoryName.value = post.categoryName
    tagsInput.value = post.tags.join(', ')
    coverImageUrl.value = post.coverImageUrl
    coverImagePath.value = post.coverImagePath
    gallery.value = post.gallery
    attachments.value = post.attachments
    featured.value = post.featured
    previousStatus.value = post.status
    previousCategoryId.value = post.categoryId
    loading.value = false
  }
})

function handleCoverChange(value: { url: string | null; path: string | null }) {
  coverImageUrl.value = value.url
  coverImagePath.value = value.path
}

async function save(status: PostStatus) {
  if (!title.value.trim()) {
    toast.error('El título es obligatorio.')
    return
  }
  if (!categoryName.value.trim()) {
    toast.error('La categoría es obligatoria.')
    return
  }
  if (!auth.user) return

  saving.value = true
  try {
    const category = await getOrCreateCategory(categoryName.value)

    const input: PostInput = {
      title: title.value.trim(),
      excerpt: excerpt.value.trim(),
      content: content.value,
      coverImageUrl: coverImageUrl.value,
      coverImagePath: coverImagePath.value,
      gallery: gallery.value,
      attachments: attachments.value,
      categoryId: category.id,
      categoryName: category.name,
      tags: tags.value,
      status,
      featured: featured.value,
    }

    if (isEditMode.value) {
      await updatePost(postId.value, input, previousStatus.value === 'published')
      if (previousCategoryId.value && previousCategoryId.value !== category.id) {
        await adjustCategoryPostCount(previousCategoryId.value, -1)
        await adjustCategoryPostCount(category.id, 1)
      }
      previousStatus.value = status
      previousCategoryId.value = category.id
    } else {
      await createPost(postId.value, auth.user.uid, auth.displayName, input)
      await adjustCategoryPostCount(category.id, 1)
      router.replace(`/admin/posts/${postId.value}/edit`)
    }

    toast.success(status === 'published' ? 'Publicación publicada.' : 'Borrador guardado.')
    categories.value = await listCategories()
  } catch (error) {
    toast.error(getFirestoreErrorMessage(error, 'No se pudo guardar la publicación.'))
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <v-container class="py-8" max-width="900">
    <h1 class="text-h4 font-weight-bold mb-6">
      {{ isEditMode ? 'Editar publicación' : 'Nueva publicación' }}
    </h1>

    <v-skeleton-loader v-if="loading" type="article" />

    <v-form v-else @submit.prevent>
      <v-text-field v-model="title" label="Título" class="mb-4" />

      <v-combobox
        v-model="categoryName"
        :items="categories.map((c) => c.name)"
        label="Categoría"
        hint="Selecciona una existente o escribe una nueva"
        persistent-hint
        class="mb-4"
      />

      <v-textarea v-model="excerpt" label="Resumen / descripción" rows="2" auto-grow class="mb-4" />

      <p class="text-subtitle-2 mb-2">Imagen principal</p>
      <CoverImageField :post-id="postId" :url="coverImageUrl" :path="coverImagePath" class="mb-6" @change="handleCoverChange" />

      <p class="text-subtitle-2 mb-2">Contenido</p>
      <RichTextEditor v-model="content" :post-id="postId" class="mb-6" />

      <FileListField
        v-model="gallery"
        :post-id="postId"
        kind="images"
        accept="image/*"
        label="Galería de imágenes"
        class="mb-6"
      />

      <FileListField
        v-model="attachments"
        :post-id="postId"
        kind="documents"
        accept=".pdf,.doc,.docx,.xls,.xlsx,.zip,.txt"
        label="Archivos adjuntos"
        class="mb-6"
      />

      <v-text-field
        v-model="tagsInput"
        label="Etiquetas (separadas por coma)"
        hint="ej: vue, firebase, tutorial"
        persistent-hint
        class="mb-4"
      />

      <v-checkbox v-model="featured" label="Destacar en la página principal" hide-details class="mb-6" />

      <div class="d-flex ga-3">
        <v-btn variant="tonal" :loading="saving" @click="save('draft')">Guardar borrador</v-btn>
        <v-btn color="primary" :loading="saving" @click="save('published')">Publicar</v-btn>
      </div>
    </v-form>
  </v-container>
</template>
