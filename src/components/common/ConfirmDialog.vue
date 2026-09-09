<script setup lang="ts">
import { useConfirmStore } from '@/stores/confirm'

const confirm = useConfirmStore()
</script>

<template>
  <v-dialog v-model="confirm.visible" max-width="420" persistent>
    <v-card>
      <v-card-title class="text-h6">{{ confirm.options.title }}</v-card-title>
      <v-card-text>{{ confirm.options.message }}</v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn variant="text" @click="confirm.resolve(false)">Cancelar</v-btn>
        <v-btn :color="confirm.options.color ?? 'error'" variant="flat" @click="confirm.resolve(true)">
          {{ confirm.options.confirmText ?? 'Confirmar' }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
