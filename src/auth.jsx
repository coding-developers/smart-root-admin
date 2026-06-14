import { createContext, useContext, useEffect, useState } from 'react'
import { api, getToken, setToken } from './api.js'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [admin, setAdmin] = useState(null)
  const [carregando, setCarregando] = useState(true)

  useEffect(() => {
    if (!getToken()) { setCarregando(false); return }
    api.get('/auth/me')
      .then((u) => { if (u.role === 'admin') setAdmin(u); else setToken(null) })
      .catch(() => setToken(null))
      .finally(() => setCarregando(false))
  }, [])

  async function login(email, senha) {
    const { access_token } = await api.post('/auth/login', { email, senha })
    setToken(access_token)
    const me = await api.get('/auth/me')
    if (me.role !== 'admin') {
      setToken(null)
      throw new Error('Esta conta não é de administrador.')
    }
    setAdmin(me)
  }

  function logout() { setToken(null); setAdmin(null) }

  return (
    <AuthContext.Provider value={{ admin, carregando, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() { return useContext(AuthContext) }
