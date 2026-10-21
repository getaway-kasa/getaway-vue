<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { getLeftovers } from '@/api/inventory'
import { getTrip, type Trip } from '@/api/trips'
import { formatDepart } from '@/format'
import { subscribeTrip } from '@/ws/config'

const route = useRoute()
const trip = ref<Trip | null>(null)
const leftSeats = ref<number | null>(null)
const loading = ref(true)
const error = ref<string | null>(null)

const tripId = computed(() => Number(route.params.id))

let unsubscribe: (() => void) | undefined

function subscribe(id: number) {
  unsubscribe?.()
  unsubscribe = undefined
  leftSeats.value = null
  if (!Number.isInteger(id) || id <= 0) return
  unsubscribe = subscribeTrip([id], ({ leftSeats: seats }) => {
    leftSeats.value = seats
  })
}

watch(tripId, subscribe)
onMounted(() => subscribe(tripId.value))

onUnmounted(() => unsubscribe?.())

async function loadTrip(id: number) {
  loading.value = true
  error.value = null
  trip.value = null

  if (!Number.isInteger(id) || id <= 0) {
    error.value = 'Рейс не знайдено'
    loading.value = false
    return
  }

  try {
    const result = await getTrip(id)
    if (!result) {
      error.value = 'Рейс не знайдено'
      return
    }
    trip.value = result
    const [leftover] = await getLeftovers([id])
    if (typeof leftover?.leftSeats === 'number') leftSeats.value = leftover.leftSeats
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Не вдалося завантажити рейс'
  } finally {
    loading.value = false
  }
}

watch(tripId, loadTrip, { immediate: true })
</script>

<template>
  <RouterLink class="back" :to="{ name: 'trips' }">← Рейси</RouterLink>

  <p v-if="loading" class="state">Завантажуємо…</p>
  <p v-else-if="error" class="state error">{{ error }}</p>

  <template v-else-if="trip">
    <header class="header">
      <p class="eyebrow">Рейс #{{ trip.id }}</p>
      <h1>{{ trip.fromLocation.name }} → {{ trip.toLocation.name }}</h1>
    </header>

    <dl class="facts">
      <div>
        <dt>Відправлення</dt>
        <dd>{{ formatDepart(trip.departureTime) }}</dd>
      </div>
      <div>
        <dt>Місць</dt>
        <dd>{{ trip.seatsTotal }}</dd>
      </div>
      <div>
        <dt>Вільно</dt>
        <dd>{{ leftSeats ?? '…' }}</dd>
      </div>
    </dl>
  </template>
</template>

<style scoped>
.back {
  display: inline-block;
  margin-bottom: 22px;
  color: #8a5a32;
  text-decoration: none;
  font-size: 14px;
}

.back:hover,
.back:focus-visible {
  text-decoration: underline;
}

.facts {
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.facts div {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 16px;
  padding: 16px 18px;
  background: #fffaf3;
  border: 1px solid #e4d9c8;
  border-radius: 12px;
}

dt {
  color: #6b645c;
}

dd {
  margin: 0;
  font-weight: 600;
}
</style>
