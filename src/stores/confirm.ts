import { defineStore } from 'pinia'
import { ref } from 'vue'

interface ConfirmOptions {
  title: string
  message: string
  confirmText?: string
  color?: string
}

export const useConfirmStore = defineStore('confirm', () => {
  const visible = ref(false)
  const options = ref<ConfirmOptions>({ title: '', message: '' })
  let resolver: ((value: boolean) => void) | null = null

  function ask(opts: ConfirmOptions): Promise<boolean> {
    options.value = opts
    visible.value = true
    return new Promise((resolve) => {
      resolver = resolve
    })
  }

  function resolve(value: boolean) {
    visible.value = false
    resolver?.(value)
    resolver = null
  }

  return { visible, options, ask, resolve }
})
