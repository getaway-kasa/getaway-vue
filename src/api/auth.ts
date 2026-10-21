import { api, apiError } from './http'

type AuthResult = {
  message: string
  success: boolean
}

const messages: Record<string, string> = {
  'Email is required': 'Вкажіть пошту',
  'Rate limit exceeded': 'Зачекайте хвилину перед наступним листом',
  'Code is required': 'Вкажіть код',
  'Token not found': 'Спочатку надішліть код',
  'Code not found': 'Код уже недійсний, надішліть новий',
  'Invalid code': 'Невірний код',
  'Try again later': 'Спроби закінчились, надішліть код ще раз',
}

export function sendEmail(email: string) {
  return api<AuthResult>('/auth/send-email', {
    method: 'POST',
    body: JSON.stringify({ email }),
  })
}

export function verifyCode(code: string) {
  return api<AuthResult>('/auth/verify-code', {
    method: 'POST',
    body: JSON.stringify({ code }),
  })
}

export function authError(error: unknown) {
  const message = apiError(error, 'Не вдалося увійти')
  return messages[message] ?? message
}
