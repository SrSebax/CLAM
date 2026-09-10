import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'

import { useAuthStore } from '@/stores/auth'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('@/layouts/PublicLayout.vue'),
    children: [
      { path: '', name: 'home', component: () => import('@/views/public/HomeView.vue') },
      { path: 'posts', name: 'posts-list', component: () => import('@/views/public/PostsListView.vue') },
      { path: 'post/:id', name: 'post-detail', component: () => import('@/views/public/PostDetailView.vue'), props: true },
    ],
  },
  {
    path: '/admin/login',
    name: 'admin-login',
    component: () => import('@/views/admin/AdminLoginView.vue'),
  },
  {
    path: '/admin',
    component: () => import('@/layouts/AdminLayout.vue'),
    meta: { requiresAdmin: true },
    children: [
      { path: '', name: 'admin-dashboard', component: () => import('@/views/admin/AdminDashboardView.vue') },
      { path: 'posts', name: 'admin-posts', component: () => import('@/views/admin/AdminPostsListView.vue') },
      { path: 'posts/new', name: 'admin-posts-new', component: () => import('@/views/admin/AdminPostEditorView.vue') },
      {
        path: 'posts/:id/edit',
        name: 'admin-posts-edit',
        component: () => import('@/views/admin/AdminPostEditorView.vue'),
        props: true,
      },
      { path: 'comments', name: 'admin-comments', component: () => import('@/views/admin/AdminCommentsView.vue') },
      { path: 'settings', name: 'admin-settings', component: () => import('@/views/admin/AdminSettingsView.vue') },
    ],
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: () => import('@/views/NotFoundView.vue'),
  },
]

export const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior() {
    return { top: 0 }
  },
})

router.beforeEach(async (to) => {
  if (!to.meta.requiresAdmin) return true

  const auth = useAuthStore()
  if (!auth.initialized) await auth.ready

  if (!auth.isAuthenticated) {
    return { name: 'admin-login', query: { redirect: to.fullPath } }
  }
  if (!auth.isAdmin) {
    return { name: 'not-found' }
  }
  return true
})
