import { onMounted, ref } from 'vue'
import { apiError } from '@/api/http'
import { getMyBookings, type Booking } from '@/api/me'

const limit = 10

export function useBookings() {
  const page = ref(1)
  const totalPage = ref(0)
  const bookings = ref<Booking[]>([])
  const loading = ref(true)
  const error = ref<string | null>(null)

  async function loadBookings(nextPage = page.value) {
    loading.value = true
    error.value = null

    try {
      const result = await getMyBookings(nextPage, limit)
      bookings.value = result.data
      page.value = result.page
      totalPage.value = result.totalPage
    } catch (e) {
      error.value = apiError(e, 'Не вдалося завантажити бронювання')
    } finally {
      loading.value = false
    }
  }

  onMounted(() => loadBookings(1))

  return { bookings, loading, error, page, totalPage, loadBookings }
}
