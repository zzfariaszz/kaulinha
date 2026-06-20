import { useState, useEffect } from 'react'
import { doc, setDoc, getDoc } from 'firebase/firestore'
import { db } from '../services/firebase'

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

  async function login(senha, quem) {
    if (senha === PASSWORD) {
      sessionStorage.setItem('auth', PASSWORD)
      sessionStorage.setItem('quem', quem)
      setIsLogado(true)

      // Salva no Firestore quem logou e quando
      try {
        await setDoc(doc(db, 'config', 'ultimo_login'), {
          quem,
          horario: new Date(),
        })
      } catch (err) {
        console.error('Erro ao salvar login:', err)
      }

      return true
    }
    return false
  }

  function logout() {
    sessionStorage.removeItem('auth')
    sessionStorage.removeItem('quem')
    setIsLogado(false)
  }

  return { isLogado, login, logout, carregando }
}