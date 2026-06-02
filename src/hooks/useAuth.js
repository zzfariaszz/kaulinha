import { useState, useEffect } from 'react'

const PASSWORD = import.meta.env.VITE_APP_PASSWORD

export function useAuth() {
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    const auth = sessionStorage.getItem('auth')
    setIsAdmin(auth === PASSWORD)
  }, [])

  function login(senha) {
    if (senha === PASSWORD) {
      sessionStorage.setItem('auth', PASSWORD)
      setIsAdmin(true)
      return true
    }
    return false
  }

  function logout() {
    sessionStorage.removeItem('auth')
    setIsAdmin(false)
  }

  return { isAdmin, login, logout }
}