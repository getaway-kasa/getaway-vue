<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import { getLeftovers } from '@/api/inventory'
import { getTrips, type Trip } from '@/api/trips'
import { loggedIn } from '@/auth'
import { formatDepart } from '@/format'
import { subscribeTrip } from '@/ws/config'

const limit = 10
const page = ref(1)
const totalPage = ref(0)
const trips = ref<Trip[]>([])
const leftovers = ref<Record<number, number | null>>({})
const loading = ref(true)
const error = ref<string | null>(null)

let unsubscribe: (() => void) | undefined

function leftSeatsLabel(tripId: number) {
  const left = leftovers.value[tripId]
  if (left === undefined) return '…'
  if (left == null) return '—'
  return String(left)
}

async function loadTrips(nextPage = page.value) {
  unsubscribe?.()
  unsubscribe = undefined
  leftovers.value = {}
  loading.value = true
  error.value = null
  try {
    const result = await getTrips(nextPage, limit)
    trips.value = result.data
    page.value = result.page
    totalPage.value = result.totalPage

    const ids = result.data.map((trip) => trip.id)
    if (ids.length === 0) return
    const items = await getLeftovers(ids)
    leftovers.value = Object.fromEntries(items.map((item) => [item.tripId, item.leftSeats]))
    unsubscribe = subscribeTrip(ids, ({ tripId, leftSeats }) => {
      leftovers.value = { ...leftovers.value, [tripId]: leftSeats }
    })
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Не вдалося завантажити рейси'
  } finally {
    loading.value = false
  }
}

onMounted(() => loadTrips(1))
onUnmounted(() => unsubscribe?.())
</script>

<template>
  <header class="header">
    <h1>Рейси</h1>
  </header>

  <p v-if="loading" class="state">Завантажуємо…</p>
  <p v-else-if="error" class="state error">{{ error }}</p>
  <p v-else-if="trips.length === 0" class="state">Поки немає рейсів</p>

  <template v-else>
    <ul class="list">
      <li v-for="trip in trips" :key="trip.id" class="card">
        <RouterLink class="main" :to="{ name: 'trip', params: { id: trip.id } }">
          <span class="id">#{{ trip.id }}</span>
          <span class="route">{{ trip.fromLocation.name }} → {{ trip.toLocation.name }}</span>
          <span class="seats">{{ leftSeatsLabel(trip.id) }} / {{ trip.seatsTotal }}</span>
        </RouterLink>
        <div class="meta">
          <span class="time">{{ formatDepart(trip.departureTime) }}</span>
          <RouterLink v-if="loggedIn" class="book" :to="{ name: 'book', params: { id: trip.id } }">
            Бронювати
          </RouterLink>
        </div>
      </li>
    </ul>

    <nav v-if="totalPage > 1" class="pager">
      <button type="button" :disabled="page === 1" @click="loadTrips(page - 1)">Назад</button>
      <span>{{ page }} / {{ totalPage }}</span>
      <button type="button" :disabled="page >= totalPage" @click="loadTrips(page + 1)">Далі</button>
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
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 16px 18px;
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
  align-items: center;
  gap: 12px;
  color: inherit;
  text-decoration: none;
}

.meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.main:focus-visible {
  outline: 2px solid #8a5a32;
  outline-offset: 2px;
}

.book {
  flex: none;
  border: 1px solid #1c1916;
  background: #1c1916;
  color: #fffaf3;
  border-radius: 999px;
  padding: 8px 14px;
  font-size: 14px;
  text-decoration: none;
}

.book:hover,
.book:focus-visible {
  background: #3a332c;
}

.id {
  color: #8a5a32;
  font-variant-numeric: tabular-nums;
}

.route {
  font-weight: 600;
}

.time {
  color: #6b645c;
  font-size: 14px;
}

.seats {
  color: #1c1916;
  font-size: 20px;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  letter-spacing: -0.03em;
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
