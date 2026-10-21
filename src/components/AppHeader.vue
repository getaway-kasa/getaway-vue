<script setup lang="ts">
import { loggedIn } from '@/auth'
</script>

<template>
  <header class="bar">
    <div class="inner">
      <RouterLink class="brand" :to="{ name: 'trips' }">Getaway</RouterLink>
      <RouterLink v-if="loggedIn" class="bookings" :to="{ name: 'bookings' }">Мої бронювання</RouterLink>
      <RouterLink v-else class="login" :to="{ name: 'login' }">Увійти</RouterLink>
    </div>
  </header>
</template>

<style scoped>
.bar {
  background: #fffaf3;
  border-bottom: 1px solid #e4d9c8;
}

.inner {
  max-width: 640px;
  margin: 0 auto;
  padding: 14px 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.brand {
  color: #8a5a32;
  font-size: 13px;
  font-weight: 600;
  letter-spacing: 0.16em;
  text-decoration: none;
  text-transform: uppercase;
}

.brand:hover,
.brand:focus-visible {
  text-decoration: underline;
}

.login {
  border: 1px solid #1c1916;
  background: #1c1916;
  color: #fffaf3;
  border-radius: 999px;
  padding: 8px 14px;
  font: inherit;
  font-size: 14px;
  text-decoration: none;
}

.login:hover,
.login:focus-visible {
  background: #3a332c;
}

.bookings {
  color: #1c1916;
  font-size: 14px;
  font-weight: 600;
  text-decoration: none;
}

.bookings:hover,
.bookings:focus-visible {
  text-decoration: underline;
}
</style>
