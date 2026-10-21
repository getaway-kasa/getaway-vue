import { ref } from 'vue'

const STORAGE_KEY = 'getaway.loggedIn'

export const loggedIn = ref(localStorage.getItem(STORAGE_KEY) === '1')

export function setLoggedIn(value: boolean) {
  loggedIn.value = value
  if (value) localStorage.setItem(STORAGE_KEY, '1')
  else localStorage.removeItem(STORAGE_KEY)
}
