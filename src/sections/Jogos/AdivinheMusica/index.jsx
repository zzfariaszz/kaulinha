import { useState, useEffect, useRef } from 'react'
import { collection, getDocs, addDoc } from 'firebase/firestore'
import { db } from '../../../services/firebase'
import { useAuth } from '../../../hooks/useAuth'
import styled, { keyframes } from 'styled-components'
import confetti from 'canvas-confetti'

// ── ANIMAÇÕES ──
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to   { opacity: 1; transform: translateY(0); }
`

const popIn = keyframes`
  from { transform: scale(0.8); opacity: 0; }
  to   { transform: scale(1); opacity: 1; }
`

const pulse = keyframes`
  0%, 100% { transform: scale(1); opacity: 1; }
  50%       { transform: scale(1.08); opacity: 0.8; }
`

const rotate = keyframes`
  from { transform: rotate(0deg); }
  to   { transform: rotate(360deg); }
`

// ── ESTILOS ──
const Wrapper = styled.div`
  position: relative;
  min-height: 100vh;
  background: var(--purple-dark);
  padding: 80px 24px;
  display: flex;
  align-items: center;
  justify-content: center;

  &::before {
    content: '';
    position: fixed;
    inset: 0;
    background-image:
      radial-gradient(circle at 15% 15%, rgba(124,77,159,0.2) 0%, transparent 50%),
      radial-gradient(circle at 85% 85%, rgba(232,130,154,0.15) 0%, transparent 50%);
    pointer-events: none;
  }
`

const Game = styled.div`
  position: relative;
  z-index: 1;
  max-width: 540px;
  width: 100%;
  text-align: center;
  animation: ${fadeIn} 0.8s ease forwards;
`

const Eyebrow = styled.p`
  font-size: 0.68rem;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: var(--lilac);
  margin-bottom: 12px;
  font-weight: 300;
`

const Title = styled.h2`
  font-family: 'Playfair Display', serif;
  font-size: clamp(1.8rem, 4vw, 2.4rem);
  font-weight: 700;
  color: #fff;
  margin-bottom: 8px;

  em {
    font-style: italic;
    background: linear-gradient(135deg, var(--lilac), var(--pink-main));
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
`

const Divider = styled.div`
  width: 50px; height: 1.5px;
  background: linear-gradient(90deg, var(--lilac), var(--pink-main));
  margin: 16px auto 40px;
  border-radius: 2px;
`

const PlayerWrap = styled.div`
  background: rgba(255,255,255,0.05);
  border: 1px solid rgba(180,143,212,0.2);
  border-radius: 24px;
  padding: 32px;
  margin-bottom: 28px;
`

const Disco = styled.div`
  width: 100px; height: 100px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--purple-deep), var(--pink-main));
  margin: 0 auto 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8px 32px rgba(124,77,159,0.4);
  animation: ${({ $tocando }) => $tocando ? rotate : 'none'} 4s linear infinite;
  position: relative;

  &::after {
    content: '';
    width: 28px; height: 28px;
    border-radius: 50%;
    background: var(--purple-dark);
    position: absolute;
  }
`

const BtnPlay = styled.button`
  width: 56px; height: 56px;
  border-radius: 50%;
  border: none;
  background: linear-gradient(135deg, var(--purple-deep), var(--pink-main));
  color: #fff;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 20px;
  box-shadow: 0 6px 20px rgba(124,77,159,0.4);
  transition: transform 0.2s, box-shadow 0.2s;
  animation: ${({ $pulsing }) => $pulsing ? pulse : 'none'} 1.5s ease-in-out infinite;

  &:hover { transform: scale(1.1); box-shadow: 0 8px 28px rgba(124,77,159,0.5); }
  &:disabled { opacity: 0.5; cursor: not-allowed; }
`

const ProgressWrap = styled.div`
  width: 100%;
  height: 4px;
  background: rgba(255,255,255,0.1);
  border-radius: 2px;
  overflow: hidden;
  margin-bottom: 12px;
`

const ProgressFill = styled.div`
  height: 100%;
  border-radius: 2px;
  background: linear-gradient(90deg, var(--purple-deep), var(--pink-main));
  width: ${({ $pct }) => $pct}%;
  transition: width 0.1s linear;
`

const TempoText = styled.p`
  font-size: 0.72rem;
  color: var(--lilac);
  letter-spacing: 0.08em;
`

const PerguntaText = styled.p`
  font-family: 'Playfair Display', serif;
  font-style: italic;
  font-size: 0.9rem;
  color: var(--lilac);
  margin-bottom: 24px;
`

const OpcoesGrid = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 24px;
`

const OpcaoBtn = styled.button`
  width: 100%;
  padding: 14px 20px;
  border-radius: 14px;
  border: 1.5px solid ${({ $estado }) => {
    if ($estado === 'certa')  return 'var(--pink-main)'
    if ($estado === 'errada') return 'rgba(180,143,212,0.2)'
    return 'rgba(180,143,212,0.2)'
  }};
  background: ${({ $estado }) => {
    if ($estado === 'certa')  return 'rgba(232,130,154,0.15)'
    if ($estado === 'errada') return 'rgba(255,255,255,0.02)'
    return 'rgba(255,255,255,0.05)'
  }};
  color: ${({ $estado }) => $estado === 'errada' ? 'rgba(255,255,255,0.3)' : '#fff'};
  font-family: 'Playfair Display', serif;
  font-size: 0.9rem;
  text-align: left;
  cursor: ${({ $estado }) => $estado ? 'default' : 'pointer'};
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 12px;

  &:hover:not(:disabled) {
    border-color: var(--lilac);
    background: rgba(180,143,212,0.1);
  }
`

const OpcaoLetra = styled.span`
  width: 28px; height: 28px;
  border-radius: 50%;
  background: ${({ $estado }) => $estado === 'certa'
    ? 'linear-gradient(135deg, var(--purple-deep), var(--pink-main))'
    : 'rgba(180,143,212,0.15)'
  };
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.72rem;
  font-weight: 700;
  flex-shrink: 0;
`

const FeedbackMsg = styled.p`
  font-family: 'Playfair Display', serif;
  font-style: italic;
  font-size: 0.88rem;
  color: ${({ $certa }) => $certa ? 'var(--pink-light)' : 'var(--lilac)'};
  margin-bottom: 16px;
  animation: ${popIn} 0.3s ease;
`

const ScoreBadge = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: rgba(255,255,255,0.06);
  border: 1px solid rgba(180,143,212,0.2);
  border-radius: 30px;
  padding: 6px 18px;
  font-size: 0.72rem;
  color: var(--lilac);
  letter-spacing: 0.08em;
  margin-bottom: 28px;
`

const ResultadoWrap = styled.div`
  background: rgba(255,255,255,0.05);
  border: 1px solid rgba(180,143,212,0.2);
  border-radius: 24px;
  padding: 40px 32px;
  margin-bottom: 24px;
  animation: ${popIn} 0.5s ease;
`

const ResultadoTitle = styled.h3`
  font-family: 'Playfair Display', serif;
  font-size: 1.6rem;
  color: var(--pink-light);
  margin-bottom: 8px;
`

const ResultadoScore = styled.p`
  font-family: 'Playfair Display', serif;
  font-style: italic;
  font-size: 1rem;
  color: var(--lilac);
  margin-bottom: 8px;
`

const ResultadoMsg = styled.p`
  font-size: 0.85rem;
  color: rgba(255,255,255,0.4);
  line-height: 1.6;
  margin-bottom: 28px;
`

const BtnRow = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
`

const BtnNovo = styled.button`
  font-family: 'Lato', sans-serif;
  font-size: 0.74rem;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  padding: 13px 34px;
  border-radius: 40px;
  border: none;
  cursor: pointer;
  background: linear-gradient(135deg, var(--purple-deep), var(--pink-main));
  color: #fff;
  box-shadow: 0 6px 24px rgba(124,77,159,0.35);
  transition: transform 0.25s;
  &:hover { transform: translateY(-3px); }
`

const BtnVoltar = styled.button`
  background: transparent;
  border: none;
  color: rgba(255,255,255,0.35);
  font-size: 0.7rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  cursor: pointer;
  transition: color 0.2s;
  &:hover { color: rgba(255,255,255,0.7); }
`

const BtnAddMusica = styled.button`
  background: transparent;
  border: 1px dashed rgba(180,143,212,0.3);
  border-radius: 30px;
  color: rgba(180,143,212,0.6);
  font-size: 0.65rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  padding: 8px 20px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    border-color: var(--lilac);
    color: var(--lilac);
  }
`

const SemMusicas = styled.div`
  background: rgba(255,255,255,0.05);
  border: 1px solid rgba(180,143,212,0.15);
  border-radius: 20px;
  padding: 40px 32px;
  margin-bottom: 28px;
`

// ── FORM MODAL ──
const FormOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(20,8,36,0.8);
  backdrop-filter: blur(8px);
  z-index: 500;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  opacity: ${({ $visible }) => $visible ? 1 : 0};
  pointer-events: ${({ $visible }) => $visible ? 'all' : 'none'};
  transition: opacity 0.3s;
`

const FormCard = styled.div`
  background: #2A0F45;
  border: 1px solid rgba(180,143,212,0.2);
  border-radius: 20px;
  padding: 40px 36px;
  max-width: 400px;
  width: 100%;
  transform: ${({ $visible }) => $visible ? 'translateY(0)' : 'translateY(20px)'};
  transition: transform 0.3s;
`

const FormTitle = styled.h3`
  font-family: 'Playfair Display', serif;
  font-size: 1.2rem;
  color: #fff;
  margin-bottom: 24px;
  font-style: italic;
`

const FormGroup = styled.div`
  margin-bottom: 16px;
`

const FormLabel = styled.label`
  display: block;
  font-size: 0.65rem;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--lilac);
  margin-bottom: 8px;
  font-weight: 300;
`

const FormInput = styled.input`
  width: 100%;
  background: rgba(255,255,255,0.06);
  border: 1px solid rgba(180,143,212,0.2);
  border-radius: 10px;
  padding: 12px 16px;
  color: #fff;
  font-family: 'Lato', sans-serif;
  font-size: 0.88rem;
  outline: none;
  transition: border-color 0.2s;

  &:focus { border-color: var(--pink-main); }
  &::placeholder { color: rgba(255,255,255,0.25); }
`

const FormHint = styled.p`
  font-size: 0.62rem;
  color: rgba(180,143,212,0.5);
  margin-top: 6px;
  line-height: 1.5;
`

const FormButtons = styled.div`
  display: flex;
  gap: 12px;
  margin-top: 24px;
`

const BtnCancel = styled.button`
  flex: 1; padding: 12px; border-radius: 30px;
  border: 1px solid rgba(255,255,255,0.15);
  background: transparent; color: rgba(255,255,255,0.5);
  font-family: 'Lato', sans-serif; font-size: 0.72rem;
  letter-spacing: 0.1em; text-transform: uppercase; cursor: pointer;
  transition: all 0.2s;
  &:hover { background: rgba(255,255,255,0.06); color: #fff; }
`

const BtnSubmit = styled.button`
  flex: 2; padding: 12px; border-radius: 30px; border: none;
  background: linear-gradient(135deg, var(--purple-deep), var(--pink-main));
  color: #fff; font-family: 'Lato', sans-serif; font-size: 0.72rem;
  letter-spacing: 0.1em; text-transform: uppercase; cursor: pointer;
  box-shadow: 0 4px 16px rgba(232,130,154,0.3);
  transition: all 0.2s;
  &:hover { transform: translateY(-2px); }
`

const LETRAS_OPCAO = ['A', 'B', 'C', 'D']
const TEMPO_TOTAL  = 30

function getMensagem(acertos, total) {
  const pct = acertos / total
  if (pct === 1)   return 'Você sabe muito!'
  if (pct >= 0.75) return 'bom!'
  if (pct >= 0.5)  return 'da pra melhorar.'
  return 'melhor ficar de boa.'
}

// ── SPOTIFY AUTH ──
const CLIENT_ID = import.meta.env.VITE_SPOTIFY_CLIENT_ID
const CLIENT_SECRET = import.meta.env.VITE_SPOTIFY_CLIENT_SECRET

async function getSpotifyToken() {
  const response = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': 'Basic ' + btoa(CLIENT_ID + ':' + CLIENT_SECRET),
    },
    body: 'grant_type=client_credentials',
  })
  const data = await response.json()
  return data.access_token
}

// ── COMPONENTE ──
export default function AdivinheMusica({ onVoltar }) {
  const { isLogado } = useAuth()
  const [musicas, setMusicas]         = useState([])
  const [rodada, setRodada]           = useState(null)
  const [opcoes, setOpcoes]           = useState([])
  const [selecionada, setSelecionada] = useState(null)
  const [tocando, setTocando]         = useState(false)
  const [tempo, setTempo]             = useState(TEMPO_TOTAL)
  const [acertos, setAcertos]         = useState(0)
  const [rodadaNum, setRodadaNum]     = useState(0)
  const [fim, setFim]                 = useState(false)
  const [formOpen, setFormOpen]       = useState(false)
  const [novaMusica, setNovaMusica]   = useState({ titulo: '', artista: '', spotifyId: '' })
  const [spotifyToken, setSpotifyToken] = useState(null)
  const audioRef = useRef(null)
  const timerRef  = useRef(null)

  const TOTAL_RODADAS = 5

  useEffect(() => {
    // Obter token do Spotify
    async function initSpotify() {
      try {
        const token = await getSpotifyToken()
        setSpotifyToken(token)
      } catch (err) {
        console.error('Erro ao obter token Spotify:', err)
      }
    }

    // Carregar músicas
    async function fetchMusicas() {
      const snap = await getDocs(collection(db, 'jogo_musicas'))
      const lista = snap.docs.map(d => ({ id: d.id, ...d.data() }))
      setMusicas(lista)
      if (lista.length >= 4) iniciarRodada(lista, 0)
    }

    initSpotify()
    fetchMusicas()
    return () => clearInterval(timerRef.current)
  }, [])

  function iniciarRodada(lista, num) {
    if (num >= TOTAL_RODADAS) { setFim(true); return }
    const embaralhadas = [...lista].sort(() => Math.random() - 0.5)
    const correta = embaralhadas[0]
    const erradas = embaralhadas.slice(1, 4)
    const todasOpcoes = [...erradas, correta].sort(() => Math.random() - 0.5)
    setRodada(correta)
    setOpcoes(todasOpcoes)
    setSelecionada(null)
    setTocando(false)
    setTempo(TEMPO_TOTAL)
    setRodadaNum(num)
    clearInterval(timerRef.current)
  }

  async function handlePlay() {
    if (!rodada || !spotifyToken) return

    try {
      // Buscar preview da música no Spotify
      const response = await fetch(
        `https://api.spotify.com/v1/tracks/${rodada.spotifyId}`,
        { headers: { 'Authorization': `Bearer ${spotifyToken}` } }
      )
      const data = await response.json()

      if (data.preview_url) {
        if (audioRef.current) {
          audioRef.current.pause()
        }
        audioRef.current = new Audio(data.preview_url)
        audioRef.current.play()
        setTocando(true)

        // Timer para contar 30 segundos
        let tempoRestante = TEMPO_TOTAL
        setTempo(tempoRestante)

        timerRef.current = setInterval(() => {
          tempoRestante--
          setTempo(tempoRestante)

          if (tempoRestante <= 0) {
            clearInterval(timerRef.current)
            audioRef.current.pause()
            setTocando(false)
            setTempo(TEMPO_TOTAL)
          }
        }, 1000)

        audioRef.current.onended = () => {
          clearInterval(timerRef.current)
          setTocando(false)
          setTempo(TEMPO_TOTAL)
        }
      } else {
        alert('Essa música não tem preview disponível no Spotify')
      }
    } catch (err) {
      console.error('Erro ao reproduzir:', err)
      alert('Erro ao reproduzir a música')
    }
  }

  function handleOpcao(i) {
    if (selecionada !== null) return
    clearInterval(timerRef.current)
    if (audioRef.current) audioRef.current.pause()
    setTocando(false)
    setSelecionada(i)
    const certa = opcoes[i].id === rodada.id
    if (certa) {
      setAcertos(a => a + 1)
      confetti({ particleCount: 80, spread: 70, colors: ['#7C4D9F','#E8829A','#FFD98E'] })
    }
  }

  function handleProxima() {
    clearInterval(timerRef.current)
    if (audioRef.current) audioRef.current.pause()
    iniciarRodada(musicas, rodadaNum + 1)
  }

  function reiniciar() {
    setAcertos(0)
    setFim(false)
    iniciarRodada(musicas, 0)
  }

  async function handleAddMusica() {
    if (!novaMusica.titulo.trim() || !novaMusica.spotifyId.trim()) return
    const nova = { ...novaMusica }
    const ref = await addDoc(collection(db, 'jogo_musicas'), nova)
    setMusicas(prev => [...prev, { id: ref.id, ...nova }])
    setNovaMusica({ titulo: '', artista: '', spotifyId: '' })
    setFormOpen(false)
  }

  if (musicas.length < 4) {
    return (
      <Wrapper>
        <Game>
          <Eyebrow>joguinhos</Eyebrow>
          <Title>Adivinhe a <em>Música</em></Title>
          <Divider />
          <SemMusicas>
            <p style={{ color: 'var(--lilac)', marginBottom: '8px', fontFamily: 'Playfair Display', fontStyle: 'italic' }}>
              Precisa de pelo menos 4 músicas com ID do Spotify para jogar!
            </p>
            <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.78rem' }}>
              Adicione músicas usando o botão abaixo.
            </p>
          </SemMusicas>
          <BtnRow>
            {isLogado && (
              <BtnAddMusica onClick={() => setFormOpen(true)}>
                + Adicionar música ao jogo
              </BtnAddMusica>
            )}
            {onVoltar && <BtnVoltar onClick={onVoltar}>Voltar aos jogos</BtnVoltar>}
          </BtnRow>
        </Game>

        <FormOverlay $visible={formOpen} onClick={e => e.target === e.currentTarget && setFormOpen(false)}>
          <FormCard $visible={formOpen}>
            <FormTitle>Nova música para o jogo</FormTitle>
            <FormGroup>
              <FormLabel>Nome da música</FormLabel>
              <FormInput
                value={novaMusica.titulo}
                onChange={e => setNovaMusica(p => ({ ...p, titulo: e.target.value }))}
                placeholder="Ex: Lover..."
              />
            </FormGroup>
            <FormGroup>
              <FormLabel>Artista</FormLabel>
              <FormInput
                value={novaMusica.artista}
                onChange={e => setNovaMusica(p => ({ ...p, artista: e.target.value }))}
                placeholder="Ex: Taylor Swift..."
              />
            </FormGroup>
            <FormGroup>
              <FormLabel>ID do Spotify</FormLabel>
              <FormInput
                value={novaMusica.spotifyId}
                onChange={e => setNovaMusica(p => ({ ...p, spotifyId: e.target.value }))}
                placeholder="Ex: 1dGr1c8CrMLDpV6mPbImSI"
              />
              <FormHint>
                Copie o link da música no Spotify e pegue o ID após /track/
              </FormHint>
            </FormGroup>
            <FormButtons>
              <BtnCancel onClick={() => setFormOpen(false)}>Cancelar</BtnCancel>
              <BtnSubmit onClick={handleAddMusica}>Salvar</BtnSubmit>
            </FormButtons>
          </FormCard>
        </FormOverlay>
      </Wrapper>
    )
  }

  if (fim) {
    return (
      <Wrapper>
        <Game>
          <Eyebrow>joguinhos</Eyebrow>
          <Title>Adivinhe a <em>Música</em></Title>
          <Divider />
          <ResultadoWrap>
            <ResultadoTitle>Fim do jogo!</ResultadoTitle>
            <ResultadoScore>{acertos} de {TOTAL_RODADAS} acertos</ResultadoScore>
            <ResultadoMsg>{getMensagem(acertos, TOTAL_RODADAS)}</ResultadoMsg>
          </ResultadoWrap>
          <BtnRow>
            <BtnNovo onClick={reiniciar}>Jogar novamente</BtnNovo>
            {isLogado && (
              <BtnAddMusica onClick={() => setFormOpen(true)}>
                + Adicionar música ao jogo
              </BtnAddMusica>
            )}
            {onVoltar && <BtnVoltar onClick={onVoltar}>Voltar aos jogos</BtnVoltar>}
          </BtnRow>
        </Game>

        <FormOverlay $visible={formOpen} onClick={e => e.target === e.currentTarget && setFormOpen(false)}>
          <FormCard $visible={formOpen}>
            <FormTitle>Nova música para o jogo</FormTitle>
            <FormGroup>
              <FormLabel>Nome da música</FormLabel>
              <FormInput
                value={novaMusica.titulo}
                onChange={e => setNovaMusica(p => ({ ...p, titulo: e.target.value }))}
                placeholder="Ex: Lover..."
              />
            </FormGroup>
            <FormGroup>
              <FormLabel>Artista</FormLabel>
              <FormInput
                value={novaMusica.artista}
                onChange={e => setNovaMusica(p => ({ ...p, artista: e.target.value }))}
                placeholder="Ex: Taylor Swift..."
              />
            </FormGroup>
            <FormGroup>
              <FormLabel>ID do Spotify</FormLabel>
              <FormInput
                value={novaMusica.spotifyId}
                onChange={e => setNovaMusica(p => ({ ...p, spotifyId: e.target.value }))}
                placeholder="Ex: 1dGr1c8CrMLDpV6mPbImSI"
              />
              <FormHint>
                Copie o link da música no Spotify e pegue o ID após /track/
              </FormHint>
            </FormGroup>
            <FormButtons>
              <BtnCancel onClick={() => setFormOpen(false)}>Cancelar</BtnCancel>
              <BtnSubmit onClick={handleAddMusica}>Salvar</BtnSubmit>
            </FormButtons>
          </FormCard>
        </FormOverlay>
      </Wrapper>
    )
  }

  if (!rodada) return null

  const certaIndex = opcoes.findIndex(o => o.id === rodada.id)

  return (
    <Wrapper>
      <Game>
        <Eyebrow>joguinhos</Eyebrow>
        <Title>Adivinhe a <em>Música</em></Title>
        <Divider />

        <ScoreBadge>
          Rodada {rodadaNum + 1} de {TOTAL_RODADAS} &nbsp;·&nbsp; {acertos} acertos
        </ScoreBadge>

        <PlayerWrap>
          <Disco $tocando={tocando}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="2" style={{ position: 'relative', zIndex: 1 }}>
              <path d="M9 18V5l12-2v13"/>
              <circle cx="6" cy="18" r="3"/>
              <circle cx="18" cy="16" r="3"/>
            </svg>
          </Disco>

          <BtnPlay
            onClick={handlePlay}
            disabled={tocando || selecionada !== null}
            $pulsing={!tocando && selecionada === null}
          >
            {tocando
              ? <svg width="20" height="20" viewBox="0 0 24 24" fill="white"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>
              : <svg width="20" height="20" viewBox="0 0 24 24" fill="white"><polygon points="5 3 19 12 5 21 5 3"/></svg>
            }
          </BtnPlay>

          <ProgressWrap>
            <ProgressFill $pct={((TEMPO_TOTAL - tempo) / TEMPO_TOTAL) * 100} />
          </ProgressWrap>
          <TempoText>{tempo}s restantes</TempoText>
        </PlayerWrap>

        <PerguntaText>Qual é essa música?</PerguntaText>

        <OpcoesGrid>
          {opcoes.map((op, i) => {
            let estado = null
            if (selecionada !== null) {
              if (i === certaIndex)       estado = 'certa'
              else if (i === selecionada) estado = 'errada'
            }
            return (
              <OpcaoBtn
                key={op.id}
                $estado={estado}
                disabled={selecionada !== null}
                onClick={() => handleOpcao(i)}
              >
                <OpcaoLetra $estado={estado}>{LETRAS_OPCAO[i]}</OpcaoLetra>
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontSize: '0.92rem', fontFamily: 'Playfair Display', color: '#fff' }}>{op.titulo}</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--lilac)', marginTop: '2px' }}>{op.artista}</div>
                </div>
              </OpcaoBtn>
            )
          })}
        </OpcoesGrid>

        {selecionada !== null && (
          <FeedbackMsg $certa={selecionada === certaIndex}>
            {selecionada === certaIndex
              ? 'Acertou! Você conhece bem essa playlist!'
              : `Era: ${rodada.titulo} — ${rodada.artista}`
            }
          </FeedbackMsg>
        )}

        <BtnRow>
          {selecionada !== null && (
            <BtnNovo onClick={handleProxima}>
              {rodadaNum + 1 >= TOTAL_RODADAS ? 'Ver resultado' : 'Próxima'}
            </BtnNovo>
          )}
          {isLogado && (
            <BtnAddMusica onClick={() => setFormOpen(true)}>
              + Adicionar música ao jogo
            </BtnAddMusica>
          )}
          {onVoltar && <BtnVoltar onClick={onVoltar}>Voltar aos jogos</BtnVoltar>}
        </BtnRow>
      </Game>

      <FormOverlay $visible={formOpen} onClick={e => e.target === e.currentTarget && setFormOpen(false)}>
        <FormCard $visible={formOpen}>
          <FormTitle>Nova música para o jogo</FormTitle>
          <FormGroup>
            <FormLabel>Nome da música</FormLabel>
            <FormInput
              value={novaMusica.titulo}
              onChange={e => setNovaMusica(p => ({ ...p, titulo: e.target.value }))}
              placeholder="Ex: Lover..."
            />
          </FormGroup>
          <FormGroup>
            <FormLabel>Artista</FormLabel>
            <FormInput
              value={novaMusica.artista}
              onChange={e => setNovaMusica(p => ({ ...p, artista: e.target.value }))}
              placeholder="Ex: Taylor Swift..."
            />
          </FormGroup>
          <FormGroup>
            <FormLabel>ID do Spotify</FormLabel>
            <FormInput
              value={novaMusica.spotifyId}
              onChange={e => setNovaMusica(p => ({ ...p, spotifyId: e.target.value }))}
              placeholder="Ex: 1dGr1c8CrMLDpV6mPbImSI"
            />
            <FormHint>
              Copie o link da música no Spotify e pegue o ID após /track/
            </FormHint>
          </FormGroup>
          <FormButtons>
            <BtnCancel onClick={() => setFormOpen(false)}>Cancelar</BtnCancel>
            <BtnSubmit onClick={handleAddMusica}>Salvar</BtnSubmit>
          </FormButtons>
        </FormCard>
      </FormOverlay>
    </Wrapper>
  )
}