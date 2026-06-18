import { useState, useEffect } from 'react'
import Home from './sections/Home'
import Contador from './sections/Contador'
import Cartas from './sections/Cartas'
import Razoes from './sections/Razoes'
import LinhaDoTempo from './sections/LinhaDoTempo'
import Lembrancas from './sections/Lembrancas'
import Musicas from './sections/Musicas'
import Galeria from './sections/Galeria'
import Filmes from './sections/Filmes'
import Mapa from './sections/Mapa'
import Planos from './sections/Planos'
import Jogos from './sections/Jogos'
import Surpresas from './sections/Surpresas/index.jsx'
import Navbar from './components/layout/Navbar'
import LoginScreen from './components/ui/LoginScreen'
import './index.css'

const PASSWORD = import.meta.env.VITE_APP_PASSWORD

function App() {
  const [logado, setLogado] = useState(false)

  useEffect(() => {
    const auth = sessionStorage.getItem('auth')
    if (auth === PASSWORD) setLogado(true)
  }, [])

  if (!logado) {
    return <LoginScreen onLogin={() => setLogado(true)} />
  }

  return (
    <div>
      <Navbar />
      <Home />
      <Contador />
      <Cartas />
      <Razoes />
      <LinhaDoTempo />
      <Lembrancas />
      <Musicas />
      <Galeria />
      <Filmes />
      <Mapa />
      <Planos />
      <Jogos />
      <Surpresas />
    </div>
  )
}

export default App