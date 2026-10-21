<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, useTemplateRef, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { apiError } from '@/api/http'
import { getLeftovers } from '@/api/inventory'
import { bookTrip, getTrip, type Trip } from '@/api/trips'
import { formatDepart } from '@/format'
import { subscribeTrip } from '@/ws/config'

const MAX_SEATS = 4

const route = useRoute()
const router = useRouter()
const trip = ref<Trip | null>(null)
const leftSeats = ref<number | null>(null)
const loading = ref(true)
const error = ref<string | null>(null)
const seats = ref('1')
const formError = ref<string | null>(null)
const confirmError = ref<string | null>(null)
const booking = ref(false)
const booked = ref(false)
const dialog = useTemplateRef('dialog')

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
const seatCount = computed(() => {
  const value = seats.value.trim()
  if (!/^\d+$/.test(value)) return null
  return Number(value)
})
const seatsLabel = computed(() => (seatCount.value === 1 ? '1 місце' : `${seatCount.value} місця`))

async function loadTrip(id: number) {
  loading.value = true
  error.value = null
  trip.value = null
  booked.value = false

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

function seatsError(count: number | null) {
  if (count == null || count < 1) return 'Вкажіть кількість місць'
  if (count > MAX_SEATS) return 'Можна забронювати не більше 4 місць'
  return null
}

function openConfirm() {
  formError.value = seatsError(seatCount.value)
  if (formError.value || !dialog.value) return
  confirmError.value = null
  dialog.value.showModal()
}

function closeConfirm() {
  dialog.value?.close()
}

function onDialogClick(event: MouseEvent) {
  const element = event.currentTarget
  if (!(element instanceof HTMLDialogElement)) return
  const box = element.getBoundingClientRect()
  const inside =
    event.clientX >= box.left &&
    event.clientX <= box.right &&
    event.clientY >= box.top &&
    event.clientY <= box.bottom
  if (!inside) closeConfirm()
}

async function confirmBooking() {
  const count = seatCount.value
  const current = trip.value
  if (!current || seatsError(count) || count == null) return

  booking.value = true
  confirmError.value = null
  try {
    await bookTrip(current.id, count)
    booked.value = true
    closeConfirm()
  } catch (e) {
    confirmError.value = apiError(e, 'Не вдалося забронювати')
  } finally {
    booking.value = false
  }
}

watch(tripId, loadTrip, { immediate: true })
</script>

<template>
  <button class="back" type="button" @click="router.back()">Назад</button>

  <p v-if="loading" class="state">Завантажуємо…</p>
  <p v-else-if="error" class="error">{{ error }}</p>

  <template v-else-if="trip">
    <header class="header">
      <h1>Бронювання</h1>
    </header>

    <dl class="facts">
      <div>
        <dt>Маршрут</dt>
        <dd>{{ trip.fromLocation.name }} → {{ trip.toLocation.name }}</dd>
      </div>
      <div>
        <dt>Відправлення</dt>
        <dd>{{ formatDepart(trip.departureTime) }}</dd>
      </div>
      <div>
        <dt>Вільно</dt>
        <dd>{{ leftSeats ?? '…' }}</dd>
      </div>
    </dl>

    <p v-if="booked" class="done">Місця заброньовано</p>

    <form v-else class="form" @submit.prevent="openConfirm">
      <label class="field">
        <span>Скільки місць</span>
        <input v-model="seats" type="number" name="seats" min="1" :max="MAX_SEATS" step="1" inputmode="numeric" />
      </label>
      <p v-if="formError" class="error">{{ formError }}</p>
      <button class="submit" type="submit">Бронювати</button>
    </form>

    <dialog ref="dialog" class="modal" @click="onDialogClick">
      <p class="question">Ви впевнені, що бажаєте замовити {{ seatsLabel }}?</p>
      <p v-if="confirmError" class="error">{{ confirmError }}</p>
      <div class="actions">
        <button class="submit" type="button" :disabled="booking" @click="confirmBooking">
          {{ booking ? 'Бронюємо…' : 'Так, забронювати' }}
        </button>
        <button class="cancel" type="button" :disabled="booking" @click="closeConfirm">Скасувати</button>
      </div>
    </dialog>
  </template>
</template>

<style scoped>
.back {
  display: inline-block;
  margin: 0 0 22px;
  padding: 0;
  border: 0;
  background: transparent;
  color: #8a5a32;
  font: inherit;
  font-size: 14px;
  cursor: pointer;
}

.back:hover,
.back:focus-visible {
  text-decoration: underline;
}

.facts {
  margin: 0 0 28px;
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

.form {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 8px;
  font-size: 14px;
  color: #6b645c;
}

.field input {
  padding: 14px 16px;
  border: 1px solid #e4d9c8;
  border-radius: 12px;
  background: #fffaf3;
  color: #1c1916;
  font: inherit;
  font-size: 16px;
}

.field input:focus-visible {
  outline: 2px solid #8a5a32;
  outline-offset: 2px;
}

.submit,
.cancel {
  border: 0;
  border-radius: 999px;
  padding: 12px 16px;
  font: inherit;
  font-size: 15px;
  cursor: pointer;
}

.submit {
  background: #1c1916;
  color: #fffaf3;
}

.submit:hover,
.submit:focus-visible {
  background: #3a332c;
}

.cancel {
  background: transparent;
  color: #8a5a32;
}

.submit:disabled,
.cancel:disabled {
  cursor: default;
  opacity: 0.6;
}

.done {
  margin: 0;
  font-weight: 600;
}

.modal {
  width: min(420px, calc(100% - 32px));
  border: 1px solid #e4d9c8;
  border-radius: 16px;
  padding: 24px;
  background: #fffaf3;
  color: #1c1916;
}

.modal::backdrop {
  background: rgb(28 25 22 / 45%);
}

.question {
  margin: 0 0 18px;
  font-size: 20px;
  font-weight: 600;
  letter-spacing: -0.03em;
}

.actions {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 18px;
}
</style>
