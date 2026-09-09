<script setup lang="ts">
import Image from '@tiptap/extension-image'
import Link from '@tiptap/extension-link'
import Placeholder from '@tiptap/extension-placeholder'
import StarterKit from '@tiptap/starter-kit'
import { EditorContent, useEditor } from '@tiptap/vue-3'
import { onBeforeUnmount, ref, watch } from 'vue'

import { uploadPostFile } from '@/services/storage.service'
import { useToastStore } from '@/stores/toast'

const props = defineProps<{
  modelValue: string
  postId: string
}>()

const emit = defineEmits<{ 'update:modelValue': [value: string] }>()

const toast = useToastStore()
const uploading = ref(false)
const fileInput = ref<HTMLInputElement | null>(null)

const editor = useEditor({
  content: props.modelValue,
  extensions: [
    StarterKit,
    Link.configure({ openOnClick: false, autolink: true }),
    Image,
    Placeholder.configure({ placeholder: 'Escribe el contenido de la publicación...' }),
  ],
  onUpdate: ({ editor: e }) => emit('update:modelValue', e.getHTML()),
})

watch(
  () => props.modelValue,
  (value) => {
    if (editor.value && value !== editor.value.getHTML()) {
      editor.value.commands.setContent(value, { emitUpdate: false })
    }
  },
)

onBeforeUnmount(() => editor.value?.destroy())

function toggleLink() {
  const previousUrl = editor.value?.getAttributes('link').href as string | undefined
  const url = window.prompt('URL del enlace', previousUrl ?? 'https://')
  if (url === null) return
  if (url === '') {
    editor.value?.chain().focus().unsetLink().run()
    return
  }
  editor.value?.chain().focus().setLink({ href: url }).run()
}

function triggerImagePick() {
  fileInput.value?.click()
}

async function handleImageSelected(event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (!file) return
  uploading.value = true
  try {
    const attachment = await uploadPostFile(props.postId, 'images', file)
    editor.value?.chain().focus().setImage({ src: attachment.url }).run()
  } catch (error) {
    toast.error(error instanceof Error ? error.message : 'No se pudo subir la imagen.')
  } finally {
    uploading.value = false
    if (fileInput.value) fileInput.value.value = ''
  }
}
</script>

<template>
  <div class="rich-text-editor">
    <div class="toolbar d-flex flex-wrap ga-1 pa-2 border-b">
      <v-btn
        size="small"
        variant="text"
        icon="mdi-format-header-1"
        :color="editor?.isActive('heading', { level: 1 }) ? 'primary' : undefined"
        @click="editor?.chain().focus().toggleHeading({ level: 1 }).run()"
      />
      <v-btn
        size="small"
        variant="text"
        icon="mdi-format-header-2"
        :color="editor?.isActive('heading', { level: 2 }) ? 'primary' : undefined"
        @click="editor?.chain().focus().toggleHeading({ level: 2 }).run()"
      />
      <v-btn
        size="small"
        variant="text"
        icon="mdi-format-bold"
        :color="editor?.isActive('bold') ? 'primary' : undefined"
        @click="editor?.chain().focus().toggleBold().run()"
      />
      <v-btn
        size="small"
        variant="text"
        icon="mdi-format-italic"
        :color="editor?.isActive('italic') ? 'primary' : undefined"
        @click="editor?.chain().focus().toggleItalic().run()"
      />
      <v-btn
        size="small"
        variant="text"
        icon="mdi-format-list-bulleted"
        :color="editor?.isActive('bulletList') ? 'primary' : undefined"
        @click="editor?.chain().focus().toggleBulletList().run()"
      />
      <v-btn
        size="small"
        variant="text"
        icon="mdi-format-list-numbered"
        :color="editor?.isActive('orderedList') ? 'primary' : undefined"
        @click="editor?.chain().focus().toggleOrderedList().run()"
      />
      <v-btn
        size="small"
        variant="text"
        icon="mdi-format-quote-close"
        :color="editor?.isActive('blockquote') ? 'primary' : undefined"
        @click="editor?.chain().focus().toggleBlockquote().run()"
      />
      <v-btn
        size="small"
        variant="text"
        icon="mdi-code-tags"
        :color="editor?.isActive('codeBlock') ? 'primary' : undefined"
        @click="editor?.chain().focus().toggleCodeBlock().run()"
      />
      <v-btn
        size="small"
        variant="text"
        icon="mdi-link-variant"
        :color="editor?.isActive('link') ? 'primary' : undefined"
        @click="toggleLink"
      />
      <v-btn
        size="small"
        variant="text"
        icon="mdi-image-plus"
        :loading="uploading"
        @click="triggerImagePick"
      />
      <input ref="fileInput" type="file" accept="image/*" hidden @change="handleImageSelected" />
    </div>

    <EditorContent :editor="editor" class="editor-content pa-4" />
  </div>
</template>

<style scoped>
.rich-text-editor {
  border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
  border-radius: 8px;
}
.editor-content :deep(.ProseMirror) {
  min-height: 260px;
  outline: none;
}
.editor-content :deep(.ProseMirror p.is-editor-empty:first-child::before) {
  content: attr(data-placeholder);
  float: left;
  height: 0;
  color: rgba(var(--v-theme-on-surface), 0.4);
  pointer-events: none;
}
.editor-content :deep(img) {
  max-width: 100%;
  border-radius: 8px;
}
.editor-content :deep(blockquote) {
  border-left: 3px solid rgba(var(--v-theme-primary), 0.5);
  margin: 0;
  padding-left: 1rem;
  color: rgba(var(--v-theme-on-surface), 0.7);
}
.editor-content :deep(pre) {
  background: rgba(var(--v-theme-on-surface), 0.06);
  border-radius: 6px;
  padding: 0.75rem 1rem;
  overflow-x: auto;
}
</style>
