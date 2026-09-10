<script setup lang="ts">
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import { useAuthStore } from '@/stores/auth'
import { getAuthErrorMessage } from '@/utils/authErrors'

const auth = useAuthStore()
const router = useRouter()
const route = useRoute()

const email = ref('')
const password = ref('')
const showPassword = ref(false)
const loading = ref(false)
const errorMessage = ref('')

const emailRules = [(v: string) => !!v || 'El correo es obligatorio']
const passwordRules = [(v: string) => !!v || 'La contraseña es obligatoria']

async function handleSubmit() {
  errorMessage.value = ''
  loading.value = true
  try {
    await auth.login(email.value, password.value)
    const redirect = (route.query.redirect as string) || '/admin'
    router.push(redirect)
  } catch (error) {
    errorMessage.value = getAuthErrorMessage(error)
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <v-container class="fill-height" max-width="480">
    <v-responsive class="mx-auto" width="100%">
      <v-card elevation="2" class="pa-4">
        <v-card-title class="text-h5 font-weight-bold">Panel administrativo</v-card-title>
        <v-card-subtitle>Ingresa con tu cuenta de administrador</v-card-subtitle>

        <v-card-text>
          <v-alert v-if="errorMessage" type="error" variant="tonal" class="mb-4" density="compact">
            {{ errorMessage }}
          </v-alert>

          <v-form @submit.prevent="handleSubmit">
            <v-text-field
              v-model="email"
              label="Correo electrónico"
              type="email"
              :rules="emailRules"
              autocomplete="email"
              class="mb-2"
            />
            <v-text-field
              v-model="password"
              label="Contraseña"
              :type="showPassword ? 'text' : 'password'"
              :append-inner-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'"
              :rules="passwordRules"
              autocomplete="current-password"
              class="mb-2"
              @click:append-inner="showPassword = !showPassword"
            />

            <v-btn type="submit" color="primary" block size="large" :loading="loading">
              Iniciar sesión
            </v-btn>
          </v-form>
        </v-card-text>
      </v-card>
    </v-responsive>
  </v-container>
</template>
