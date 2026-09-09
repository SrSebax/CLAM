<script setup lang="ts"></script>

<template>
  <v-card elevation="1">
    <v-skeleton-loader type="image" height="180" />
    <v-card-text>
      <v-skeleton-loader type="chip" class="mb-2" width="80" />
      <v-skeleton-loader type="heading" class="mb-2" />
      <v-skeleton-loader type="text" />
      <v-skeleton-loader type="text" width="60%" />
    </v-card-text>
  </v-card>
</template>
