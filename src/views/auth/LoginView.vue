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
const googleLoading = ref(false)
const errorMessage = ref('')

const emailRules = [(v: string) => !!v || 'El correo es obligatorio']
const passwordRules = [(v: string) => !!v || 'La contraseña es obligatoria']

function goToRedirect() {
  const redirect = (route.query.redirect as string) || '/'
  router.push(redirect)
}

async function handleSubmit() {
  errorMessage.value = ''
  loading.value = true
  try {
    await auth.login(email.value, password.value)
    goToRedirect()
  } catch (error) {
    errorMessage.value = getAuthErrorMessage(error)
  } finally {
    loading.value = false
  }
}

async function handleGoogle() {
  errorMessage.value = ''
  googleLoading.value = true
  try {
    await auth.loginGoogle()
    goToRedirect()
  } catch (error) {
    errorMessage.value = getAuthErrorMessage(error)
  } finally {
    googleLoading.value = false
  }
}
</script>

<template>
  <v-container class="fill-height" max-width="480">
    <v-responsive class="mx-auto" width="100%">
      <v-card elevation="2" class="pa-4">
        <v-card-title class="text-h5 font-weight-bold">Iniciar sesión</v-card-title>
        <v-card-subtitle>Ingresa a tu cuenta de CLAM</v-card-subtitle>

        <v-card-text>
          <v-alert v-if="errorMessage" type="error" variant="tonal" class="mb-4" density="compact">
            {{ errorMessage }}
          </v-alert>

          <v-btn
            block
            size="large"
            variant="outlined"
            prepend-icon="mdi-google"
            :loading="googleLoading"
            class="mb-4"
            @click="handleGoogle"
          >
            Continuar con Google
          </v-btn>

          <div class="d-flex align-center ga-3 mb-4">
            <v-divider />
            <span class="text-caption text-medium-emphasis text-no-wrap">o con tu correo</span>
            <v-divider />
          </div>

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

        <v-card-actions class="justify-center">
          <span class="text-body-2">¿No tienes cuenta?</span>
          <RouterLink to="/auth/register" class="text-primary text-body-2 ml-1">
            Regístrate
          </RouterLink>
        </v-card-actions>
      </v-card>
    </v-responsive>
  </v-container>
</template>
