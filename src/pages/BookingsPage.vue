<script setup lang="ts">
import { formatDepart } from '@/format'
import { useBookings } from '@/composables/useBookings'

const { bookings, loading, error, page, totalPage, loadBookings } = useBookings()

function seatsLabel(count: number) {
  return count === 1 ? '1 місце' : `${count} місця`
}
</script>

<template>
  <header class="header">
    <h1>Мої бронювання</h1>
  </header>

  <p v-if="loading" class="state">Завантажуємо…</p>
  <p v-else-if="error" class="error">{{ error }}</p>
  <p v-else-if="bookings.length === 0" class="state">Поки немає бронювань</p>

  <template v-else>
    <ul class="list">
      <li v-for="booking in bookings" :key="booking.id" class="card">
        <RouterLink class="main" :to="{ name: 'trip', params: { id: booking.tripId } }">
          <span class="id">#{{ booking.id }}</span>
          <span class="route">Рейс #{{ booking.tripId }}</span>
          <span class="seats">{{ seatsLabel(booking.reservedSeats) }}</span>
          <span class="time">{{ formatDepart(booking.createdAt) }}</span>
        </RouterLink>
      </li>
    </ul>

    <nav v-if="totalPage > 1" class="pager">
      <button type="button" :disabled="page === 1" @click="loadBookings(page - 1)">Назад</button>
      <span>{{ page }} / {{ totalPage }}</span>
      <button type="button" :disabled="page >= totalPage" @click="loadBookings(page + 1)">Далі</button>
    </nav>
  </template>
</template>

<style scoped>
.list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.card {
  background: #fffaf3;
  border: 1px solid #e4d9c8;
  border-radius: 12px;
}

.card:has(.main:hover),
.card:has(.main:focus-visible) {
  border-color: #c4b09a;
}

.main {
  display: grid;
  grid-template-columns: 56px 1fr auto;
  grid-template-rows: auto auto;
  align-items: center;
  gap: 4px 12px;
  padding: 16px 18px;
  color: inherit;
  text-decoration: none;
}

.main:focus-visible {
  outline: 2px solid #8a5a32;
  outline-offset: 2px;
}

.id {
  color: #8a5a32;
  font-variant-numeric: tabular-nums;
}

.route {
  font-weight: 600;
}

.seats,
.time {
  color: #6b645c;
  font-size: 14px;
}

.time {
  grid-column: 2 / -1;
}

.pager {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-top: 18px;
}

.pager button {
  border: 1px solid #e4d9c8;
  background: #fffaf3;
  color: #1c1916;
  border-radius: 999px;
  padding: 8px 14px;
  font: inherit;
  font-size: 14px;
  cursor: pointer;
}

.pager button:hover,
.pager button:focus-visible {
  border-color: #c4b09a;
}

.pager button:disabled {
  cursor: default;
  opacity: 0.45;
}

.pager span {
  color: #6b645c;
  font-variant-numeric: tabular-nums;
}
</style>
