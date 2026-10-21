import { api } from './http'
import type { Paginated } from './paginated'

export type Booking = {
  id: number
  tripId: number
  userId: number
  reservedSeats: number
  createdAt: string
}

export function getMyBookings(page = 1, limit = 10) {
  return api<Paginated<Booking>>(`/me?page=${page}&limit=${limit}`)
}
