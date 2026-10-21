const WS_PATH = '/ws'

let socket: WebSocket | null = null

export function wsUrl(apiUrl = import.meta.env.VITE_API_URL) {
  const url = new URL(apiUrl)
  url.protocol = url.protocol === 'https:' ? 'wss:' : 'ws:'
  url.pathname = WS_PATH
  url.search = ''
  url.hash = ''
  return url.toString()
}

export function connectWs() {
  if (socket && socket.readyState !== WebSocket.CLOSED) return socket
  socket = new WebSocket(wsUrl())
  return socket
}

type TripSeatsUpdate = { tripId: number; leftSeats: number }

export function subscribeTrip(ids: number[], onUpdate: (item: TripSeatsUpdate) => void) {
  const tripIds = ids.filter((id) => Number.isInteger(id) && id > 0)
  const from = location.href
  const current = connectWs()
  const watched = new Set(tripIds)

  const send = () => {
    if (tripIds.length === 0) return
    current.send(JSON.stringify({ event: 'trip', data: { ids: tripIds } }))
  }

  const onMessage = (event: MessageEvent) => {
    const update = parseTripUpdateItem(event.data)
    if (!update || !watched.has(update.tripId)) return
    onUpdate(update)
  }

  current.addEventListener('message', onMessage)
  if (current.readyState === WebSocket.OPEN) send()
  else current.addEventListener('open', send, { once: true })

  return () => {
    console.log('unsubscribeTrip', { from, now: location.href, tripIds })
    current.removeEventListener('message', onMessage)
    current.removeEventListener('open', send)
    if (current.readyState !== WebSocket.OPEN || tripIds.length === 0) return
    current.send(JSON.stringify({ event: 'trip-leave', data: { ids: tripIds } }))
  }
}

function parseMessage(raw: unknown): { type?: unknown; data?: unknown } | null {
  if (typeof raw !== 'string') return null

  try {
    const message = JSON.parse(raw)
    if (!message || typeof message !== 'object') return null
    return message as { type?: unknown; data?: unknown }
  } catch {
    return null
  }
}

function parseTripUpdateItem(raw: unknown): { tripId: number; leftSeats: number } | null {
  const message = parseMessage(raw)
  if (!message || message.type !== 'trip-update') return null
  if (!message.data || typeof message.data !== 'object') return null

  const { tripId, leftSeats } = message.data as { tripId?: unknown; leftSeats?: unknown }
  if (typeof tripId !== 'number' || typeof leftSeats !== 'number') return null
  return { tripId, leftSeats }
}

