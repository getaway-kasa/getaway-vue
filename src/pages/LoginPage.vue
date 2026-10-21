<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { authError, sendEmail, verifyCode } from '@/api/auth'
import { loggedIn, setLoggedIn } from '@/auth'

const router = useRouter()
const step = ref<'email' | 'code'>('email')
const email = ref('')
const code = ref('')
const loading = ref(false)
const error = ref<string | null>(null)

onMounted(() => {
  if (loggedIn.value) router.replace({ name: 'trips' })
})

async function submitEmail() {
  error.value = null
  const value = email.value.trim()
  if (!value) {
    error.value = 'Вкажіть пошту'
    return
  }

  loading.value = true
  try {
    await sendEmail(value)
    email.value = value
    step.value = 'code'
  } catch (e) {
    error.value = authError(e)
  } finally {
    loading.value = false
  }
}

async function submitCode() {
  error.value = null
  const value = code.value.trim()
  if (!value) {
    error.value = 'Вкажіть код'
    return
  }

  loading.value = true
  try {
    await verifyCode(value)
    setLoggedIn(true)
    await router.push({ name: 'trips' })
  } catch (e) {
    error.value = authError(e)
  } finally {
    loading.value = false
  }
}

function changeEmail() {
  step.value = 'email'
  code.value = ''
  error.value = null
}
</script>

<template>
  <header class="header">
    <h1>Увійти</h1>
  </header>

  <p class="lead">Надішлемо код на пошту. Якщо акаунта ще немає, створимо його.</p>

  <form v-if="step === 'email'" class="form" @submit.prevent="submitEmail">
    <label class="field">
      <span>Пошта</span>
      <input v-model="email" type="email" name="email" autocomplete="email" required />
    </label>
    <p v-if="error" class="error">{{ error }}</p>
    <button class="submit" type="submit" :disabled="loading">
      {{ loading ? 'Надсилаємо…' : 'Надіслати код' }}
    </button>
  </form>

  <form v-else class="form" @submit.prevent="submitCode">
    <p class="hint">Код для {{ email }}</p>
    <label class="field">
      <span>Код</span>
      <input
        v-model="code"
        type="text"
        name="code"
        inputmode="numeric"
        autocomplete="one-time-code"
        maxlength="6"
        required
      />
    </label>
    <p v-if="error" class="error">{{ error }}</p>
    <button class="submit" type="submit" :disabled="loading">
      {{ loading ? 'Перевіряємо…' : 'Увійти' }}
    </button>
    <button class="back" type="button" :disabled="loading" @click="changeEmail">Інша пошта</button>
  </form>
</template>

<style scoped>
.lead,
.hint {
  margin: 0 0 22px;
  color: #6b645c;
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
.back {
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

.back {
  background: transparent;
  color: #8a5a32;
}

.submit:disabled,
.back:disabled {
  cursor: default;
  opacity: 0.6;
}
</style>
