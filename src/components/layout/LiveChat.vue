<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'

import { getAnonId } from '@/composables/useAnonId'
import { deleteChatMessage, sendChatMessage, subscribeToChatMessages } from '@/services/chat.service'
import { useAuthStore } from '@/stores/auth'
import { useConfirmStore } from '@/stores/confirm'
import { useToastStore } from '@/stores/toast'
import type { ChatMessage } from '@/types'
import { formatRelativeTime } from '@/utils/date'

const NAME_KEY = 'clam_chat_name'

const auth = useAuthStore()
const confirmStore = useConfirmStore()
const toast = useToastStore()

const messages = ref<ChatMessage[]>([])
const name = ref(localStorage.getItem(NAME_KEY) ?? '')
const text = ref('')
const sending = ref(false)
const listEl = ref<HTMLElement | null>(null)

let unsubscribe: (() => void) | null = null

onMounted(() => {
  unsubscribe = subscribeToChatMessages(30, (msgs) => {
    messages.value = msgs
  })
})

onBeforeUnmount(() => {
  unsubscribe?.()
})

watch(name, (value) => {
  localStorage.setItem(NAME_KEY, value.trim())
})

watch(
  () => messages.value.length,
  async () => {
    await nextTick()
    if (listEl.value) listEl.value.scrollTop = listEl.value.scrollHeight
  },
)

async function handleSend() {
  const trimmed = text.value.trim()
  if (!trimmed) return

  sending.value = true
  try {
    await sendChatMessage(getAnonId(), name.value, trimmed)
    text.value = ''
  } catch {
    toast.error('No se pudo enviar el mensaje.')
  } finally {
    sending.value = false
  }
}

async function handleDelete(message: ChatMessage) {
  const confirmed = await confirmStore.ask({
    title: 'Eliminar mensaje',
    message: '¿Eliminar este mensaje del chat? Esta acción no se puede deshacer.',
  })
  if (!confirmed) return

  try {
    await deleteChatMessage(message.id)
  } catch {
    toast.error('No se pudo eliminar el mensaje.')
  }
}
</script>

<template>
  <div class="chat-widget">
    <p class="chat-heading">CHAT EN VIVO</p>

    <div class="chat-card">
      <div ref="listEl" class="chat-list">
        <p v-if="!messages.length" class="chat-empty">Aún no hay mensajes. ¡Sé el primero!</p>
        <div v-for="msg in messages" :key="msg.id" class="chat-msg">
          <div class="chat-msg-head">
            <span class="chat-msg-name">{{ msg.userName }}</span>
            <span class="chat-msg-time">{{ formatRelativeTime(msg.createdAt) }}</span>
            <button
              v-if="auth.isAdmin"
              type="button"
              class="chat-msg-delete"
              title="Eliminar mensaje"
              @click="handleDelete(msg)"
            >
              <span class="mdi mdi-close" />
            </button>
          </div>
          <p class="chat-msg-text">{{ msg.text }}</p>
        </div>
      </div>

      <form class="chat-form" @submit.prevent="handleSend">
        <input v-model="name" class="chat-input chat-input-name" placeholder="nombre" maxlength="40" />
        <div class="chat-input-row">
          <input
            v-model="text"
            class="chat-input chat-input-text"
            placeholder="mensaje"
            maxlength="300"
          />
          <button type="submit" class="chat-send" :disabled="sending || !text.trim()">
            <span class="mdi mdi-send" />
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<style scoped>
.chat-widget {
  width: 100%;
}

.chat-heading {
  text-align: center;
  font-family: 'Chewy', 'Comic Neue', cursive;
  font-size: 1.3rem;
  margin: 0 0 8px;
  color: #ff1493;
  text-shadow:
    1px 1px 0 #fff,
    0 0 10px rgba(255, 20, 147, 0.5);
}

.chat-card {
  border-radius: 16px;
  border: 2px solid #fff;
  background: #fff0f6;
  box-shadow:
    inset 0 2px 4px rgba(255, 255, 255, 0.7),
    0 8px 20px rgba(214, 0, 111, 0.25);
  overflow: hidden;
}

.chat-list {
  max-height: 220px;
  overflow-y: auto;
  padding: 8px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.chat-empty {
  margin: 0;
  font-size: 0.68rem;
  color: #9b30ff;
  text-align: center;
  font-family: 'Comic Neue', cursive;
}

.chat-msg {
  background: #fff;
  border-radius: 8px;
  padding: 5px 7px;
  border: 1px solid rgba(155, 48, 255, 0.15);
}

.chat-msg-head {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 4px;
}

.chat-msg-name {
  font-weight: 700;
  font-size: 0.68rem;
  color: #9b30ff;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  flex-shrink: 1;
}

.chat-msg-time {
  font-size: 0.55rem;
  color: #ff1493;
  white-space: nowrap;
  margin-left: auto;
}

.chat-msg-delete {
  flex-shrink: 0;
  border: none;
  background: none;
  color: #999;
  font-size: 12px;
  padding: 0;
  cursor: pointer;
  display: flex;
}
.chat-msg-delete:hover {
  color: #ff1493;
}

.chat-msg-text {
  margin: 2px 0 0;
  font-size: 0.7rem;
  color: #333;
  word-break: break-word;
}

.chat-form {
  border-top: 2px solid #fff;
  background: linear-gradient(160deg, #ff8fc9, #ff1493);
  padding: 6px 8px 8px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.chat-input {
  border: none;
  border-radius: 999px;
  padding: 5px 10px;
  font-size: 0.68rem;
  font-family: 'Comic Neue', cursive;
  outline: none;
  min-width: 0;
}

.chat-input-name {
  background: rgba(255, 255, 255, 0.85);
}

.chat-input-row {
  display: flex;
  gap: 4px;
}

.chat-input-text {
  flex: 1;
  background: #fff;
}

.chat-send {
  flex-shrink: 0;
  width: 26px;
  height: 26px;
  border-radius: 50%;
  border: none;
  background: #fff;
  color: #ff1493;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}
.chat-send:disabled {
  opacity: 0.5;
  cursor: default;
}
</style>
