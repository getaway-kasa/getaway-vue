import { api } from './http'

export type Leftover = {
  tripId: number
  leftSeats: number | null
}

export function getLeftovers(ids: number[]) {
  return api<Leftover[]>('/inventory/leftovers', {
    method: 'POST',
    body: JSON.stringify({ ids }),
  })
}
