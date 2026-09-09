<script setup lang="ts">
import { onMounted, ref } from 'vue'

import StatCard from '@/components/admin/StatCard.vue'
import { getCommentCount } from '@/services/comments.service'
import { getLikeCount } from '@/services/likes.service'
import { getPostCounts, type PostCounts } from '@/services/posts.service'
import { getUserCount } from '@/services/users.service'

const loading = ref(true)
const postCounts = ref<PostCounts>({ total: 0, published: 0, draft: 0 })
const userCount = ref(0)
const commentCount = ref(0)
const likeCount = ref(0)

onMounted(async () => {
  loading.value = true
  try {
    const [posts, users, comments, likes] = await Promise.all([
      getPostCounts(),
      getUserCount(),
      getCommentCount(),
      getLikeCount(),
    ])
    postCounts.value = posts
    userCount.value = users
    commentCount.value = comments
    likeCount.value = likes
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <v-container class="py-8">
    <h1 class="text-h4 font-weight-bold mb-6">Dashboard</h1>

    <v-row v-if="loading">
      <v-col v-for="n in 6" :key="n" cols="12" sm="6" md="4">
        <v-skeleton-loader type="card" height="90" />
      </v-col>
    </v-row>

    <v-row v-else>
      <v-col cols="12" sm="6" md="4">
        <StatCard icon="mdi-post-outline" label="Publicaciones" :value="postCounts.total" />
      </v-col>
      <v-col cols="12" sm="6" md="4">
        <StatCard icon="mdi-check-circle-outline" label="Publicadas" :value="postCounts.published" color="success" />
      </v-col>
      <v-col cols="12" sm="6" md="4">
        <StatCard icon="mdi-file-edit-outline" label="Borradores" :value="postCounts.draft" color="warning" />
      </v-col>
      <v-col cols="12" sm="6" md="4">
        <StatCard icon="mdi-account-group-outline" label="Usuarios" :value="userCount" />
      </v-col>
      <v-col cols="12" sm="6" md="4">
        <StatCard icon="mdi-comment-outline" label="Comentarios" :value="commentCount" />
      </v-col>
      <v-col cols="12" sm="6" md="4">
        <StatCard icon="mdi-heart" label="Likes" :value="likeCount" color="secondary" />
      </v-col>
    </v-row>
  </v-container>
</template>
