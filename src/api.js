// Acesso ao backend.
// - Em dev (local): usa /api, redirecionado pelo proxy do Vite.
// - Em produção (Vercel): defina VITE_API_URL = https://SEU_DOMINIO (backend no VPS).
const BASE = import.meta.env.VITE_API_URL || '/api'
const TOKEN_KEY = 'irriga_admin_token'

export function getToken() { return localStorage.getItem(TOKEN_KEY) }
export function setToken(t) { t ? localStorage.setItem(TOKEN_KEY, t) : localStorage.removeItem(TOKEN_KEY) }

async function request(method, path, body) {
  // ngrok-skip-browser-warning: evita a página de aviso do ngrok grátis nas
  // chamadas de API (inofensivo quando não se usa ngrok — o backend ignora).
  const headers = { 'Content-Type': 'application/json', 'ngrok-skip-browser-warning': 'true' }
  const token = getToken()
  if (token) headers['Authorization'] = `Bearer ${token}`

  const res = await fetch(BASE + path, {
    method, headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })
  if (res.status === 204) return null

  const text = await res.text()
  let data = null
  if (text) { try { data = JSON.parse(text) } catch { data = text } }

  if (!res.ok) {
    if (res.status === 401) setToken(null)
    const detail = data && data.detail ? data.detail : `Erro ${res.status}`
    throw new Error(typeof detail === 'string' ? detail : 'Falha na requisição')
  }
  return data
}

export const api = {
  get: (p) => request('GET', p),
  post: (p, b) => request('POST', p, b),
  put: (p, b) => request('PUT', p, b),
  patch: (p, b) => request('PATCH', p, b),
  del: (p) => request('DELETE', p),
}
