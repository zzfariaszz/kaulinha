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
import AdminBtn from './components/ui/AdminBtn'
import Navbar from './components/layout/Navbar'
import './index.css'

function App() {
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
      <AdminBtn />
    </div>
  )
}

export default App