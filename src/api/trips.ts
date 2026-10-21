import { api } from './http'
import type { Paginated } from './paginated'

export type Location = {
  id: number
  name: string
}

export type Trip = {
  id: number
  seatsTotal: number
  fromLocationId: number
  toLocationId: number
  departureTime: string
  fromLocation: Location
  toLocation: Location
}

export type BookTripResult = {
  id: number
  message: string
  success: boolean
}

export function getTrips(page = 1, limit = 10) {
  return api<Paginated<Trip>>(`/trips?page=${page}&limit=${limit}`)
}

export function getTrip(id: number) {
  return api<Trip | null>(`/trips/${id}`)
}

export function bookTrip(id: number, reservedSeats: number) {
  return api<BookTripResult>(`/trips/${id}/book`, {
    method: 'POST',
    body: JSON.stringify({ reservedSeats }),
  })
}
