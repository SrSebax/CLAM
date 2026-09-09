<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'

import { useAuthStore } from '@/stores/auth'
import { getAuthErrorMessage } from '@/utils/authErrors'

const auth = useAuthStore()
const router = useRouter()

const name = ref('')
const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const showPassword = ref(false)
const loading = ref(false)
const errorMessage = ref('')

const googleLoading = ref(false)

const requiredRule = [(v: string) => !!v || 'Este campo es obligatorio']
const passwordRules = [(v: string) => v.length >= 6 || 'Mínimo 6 caracteres']
const confirmRules = [(v: string) => v === password.value || 'Las contraseñas no coinciden']

async function handleSubmit() {
  errorMessage.value = ''
  if (password.value !== confirmPassword.value) {
    errorMessage.value = 'Las contraseñas no coinciden.'
    return
  }
  loading.value = true
  try {
    await auth.register(email.value, password.value, name.value)
    router.push('/')
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
    router.push('/')
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
        <v-card-title class="text-h5 font-weight-bold">Crear cuenta</v-card-title>
        <v-card-subtitle>Regístrate para dar like y comentar</v-card-subtitle>

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
              v-model="name"
              label="Nombre"
              :rules="requiredRule"
              autocomplete="name"
              class="mb-2"
            />
            <v-text-field
              v-model="email"
              label="Correo electrónico"
              type="email"
              :rules="requiredRule"
              autocomplete="email"
              class="mb-2"
            />
            <v-text-field
              v-model="password"
              label="Contraseña"
              :type="showPassword ? 'text' : 'password'"
              :append-inner-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'"
              :rules="passwordRules"
              autocomplete="new-password"
              class="mb-2"
              @click:append-inner="showPassword = !showPassword"
            />
            <v-text-field
              v-model="confirmPassword"
              label="Confirmar contraseña"
              :type="showPassword ? 'text' : 'password'"
              :rules="confirmRules"
              autocomplete="new-password"
              class="mb-2"
            />

            <v-btn type="submit" color="primary" block size="large" :loading="loading">
              Registrarme
            </v-btn>
          </v-form>
        </v-card-text>

        <v-card-actions class="justify-center">
          <span class="text-body-2">¿Ya tienes cuenta?</span>
          <RouterLink to="/auth/login" class="text-primary text-body-2 ml-1">
            Inicia sesión
          </RouterLink>
        </v-card-actions>
      </v-card>
    </v-responsive>
  </v-container>
</template>
