import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'
import HomePage from '@/views/HomePage.vue'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'home',
    component: HomePage
  },
  {
    path: '/templates',
    name: 'templates',
    component: () => import('@/views/TemplatesPage.vue')
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
