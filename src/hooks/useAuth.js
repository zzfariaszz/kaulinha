import { useState, useEffect } from 'react'

const PASSWORD = import.meta.env.VITE_APP_PASSWORD

export function useAuth() {
  const [isLogado, setIsLogado] = useState(false)
  const [carregando, setCarregando] = useState(true)

  useEffect(() => {
    const auth = sessionStorage.getItem('auth')
    if (auth === PASSWORD) {
      setIsLogado(true)
    }
    setCarregando(false)
  }, [])

  function login(senha) {
    if (senha === PASSWORD) {
      sessionStorage.setItem('auth', PASSWORD)
      setIsLogado(true)
      return true
    }
    return false
  }

  function logout() {
    sessionStorage.removeItem('auth')
    setIsLogado(false)
  }

  return { isLogado, login, logout, carregando }
}