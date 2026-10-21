import { createRouter, createWebHistory } from 'vue-router'
import TripList from '@/pages/TripList.vue'
import TripPage from '@/pages/TripPage.vue'
import BookingPage from '@/pages/BookingPage.vue'
import LoginPage from '@/pages/LoginPage.vue'
import BookingsPage from '@/pages/BookingsPage.vue'
import { loggedIn } from '@/auth'

export const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', name: 'trips', component: TripList },
    { path: '/trips/:id/book', name: 'book', component: BookingPage, beforeEnter: () => loggedIn.value || { name: 'login' } },
    { path: '/trips/:id', name: 'trip', component: TripPage },
    { path: '/bookings', name: 'bookings', component: BookingsPage, beforeEnter: () => loggedIn.value || { name: 'login' } },
    { path: '/login', name: 'login', component: LoginPage },
  ],
})
