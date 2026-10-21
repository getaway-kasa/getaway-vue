<script setup lang="ts">
import AppHeader from '@/components/AppHeader.vue'
</script>

<template>
  <AppHeader />
  <div class="page">
    <RouterView />
  </div>
</template>

<style>
html,
body {
  margin: 0;
  min-height: 100%;
  background: #f3eee4;
  color: #1c1916;
  font-family: 'Segoe UI', Helvetica, sans-serif;
}

.page {
  max-width: 640px;
  margin: 0 auto;
  padding: 32px 20px 80px;
}

.header {
  margin-bottom: 28px;
}

.eyebrow {
  margin: 0 0 6px;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  font-size: 11px;
  color: #8a5a32;
}

h1 {
  margin: 0;
  font-size: 40px;
  font-weight: 600;
  letter-spacing: -0.04em;
}

.state {
  color: #6b645c;
}

.error {
  color: #9b2c2c;
}
</style>
