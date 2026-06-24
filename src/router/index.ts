import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/diary',
      name: 'diary',
      component: () => import('../views/DiaryView.vue'),
    },
    {
      path: '/public',
      name: 'public',
      component: () => import('../views/PublicView.vue'),
    },
    {
      path: '/einstellungen',
      name: 'settings',
      component: () => import('../views/SettingsView.vue'),
    },
  ],
})

export default router
