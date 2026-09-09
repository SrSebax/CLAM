import { defineStore } from 'pinia'
import { ref } from 'vue'

export type ToastColor = 'success' | 'error' | 'info' | 'warning'

export const useToastStore = defineStore('toast', () => {
  const visible = ref(false)
  const message = ref('')
  const color = ref<ToastColor>('success')

  function show(text: string, toastColor: ToastColor = 'success') {
    message.value = text
    color.value = toastColor
    visible.value = true
  }

  const success = (text: string) => show(text, 'success')
  const error = (text: string) => show(text, 'error')
  const info = (text: string) => show(text, 'info')

  return { visible, message, color, show, success, error, info }
})
