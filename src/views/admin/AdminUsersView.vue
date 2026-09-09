<script setup lang="ts">
import { onMounted, ref } from 'vue'

import EmptyState from '@/components/common/EmptyState.vue'
import { listUsers } from '@/services/users.service'
import type { AppUser } from '@/types'
import { formatDate } from '@/utils/date'

const users = ref<AppUser[]>([])
const loading = ref(true)

onMounted(async () => {
  loading.value = true
  try {
    users.value = await listUsers()
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <v-container class="py-8">
    <h1 class="text-h4 font-weight-bold mb-6">Usuarios</h1>

    <v-skeleton-loader v-if="loading" type="table" />
    <EmptyState v-else-if="!users.length" icon="mdi-account-group-outline" title="No hay usuarios registrados" />

    <v-table v-else>
      <thead>
        <tr>
          <th>Nombre</th>
          <th>Correo</th>
          <th>Rol</th>
          <th>Registrado</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="u in users" :key="u.uid">
          <td>{{ u.displayName }}</td>
          <td>{{ u.email }}</td>
          <td>
            <v-chip size="small" :color="u.role === 'admin' ? 'primary' : undefined" variant="tonal">
              {{ u.role }}
            </v-chip>
          </td>
          <td>{{ formatDate(u.createdAt) }}</td>
        </tr>
      </tbody>
    </v-table>
  </v-container>
</template>
