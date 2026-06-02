import { useState, useEffect } from 'react'
import { collection, getDocs } from 'firebase/firestore'
import { db } from '../../services/firebase'
import styled, { keyframes } from 'styled-components'
import confetti from 'canvas-confetti'

// ── ANIMAÇÕES ──
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to   { opacity: 1; transform: translateY(0); }
`

const float = keyframes`
  0%, 100% { transform: translateY(0px); }
  50%       { transform: translateY(-12px); }
`

const heartBeat = keyframes`
  0%, 100% { transform: scale(1); }
  14%       { transform: scale(1.2); }
  28%       { transform: scale(1); }
  42%       { transform: scale(1.15); }
  70%       { transform: scale(1); }
`

const popIn = keyframes`
  from { transform: scale(0.8); opacity: 0; }
  to   { transform: scale(1); opacity: 1; }
`

const sunRise = keyframes`
  from { transform: translateY(60px); opacity: 0; }
  to   { transform: translateY(0); opacity: 1; }
`

const glow = keyframes`
  0%, 100% { box-shadow: 0 0 20px rgba(255,217,142,0.3); }
  50%       { box-shadow: 0 0 40px rgba(255,217,142,0.7); }
`

const twinkle = keyframes`
  0%, 100% { opacity: 1; transform: scale(1); }
  50%       { opacity: 0.3; transform: scale(0.7); }
`

const fall = keyframes`
  0%   { transform: translateY(-20px) rotate(0deg); opacity: 0; }
  10%  { opacity: 0.8; }
  90%  { opacity: 0.6; }
  100% { transform: translateY(110vh) rotate(720deg); opacity: 0; }
`

// ── ESTILOS ──
const Wrapper = styled.div`
  position: relative;
  min-height: 100vh;
  background: var(--purple-dark);
  padding: 80px 24px;
  overflow: hidden;

  &::before {
    content: '';
    position: fixed;
    inset: 0;
    background-image:
      radial-gradient(circle at 20% 20%, rgba(124,77,159,0.2) 0%, transparent 50%),
      radial-gradient(circle at 80% 80%, rgba(232,130,154,0.15) 0%, transparent 50%);
    pointer-events: none;
  }
`

const Inner = styled.div`
  position: relative;
  z-index: 1;
  max-width: 720px;
  margin: 0 auto;
  animation: ${fadeIn} 0.8s ease forwards;
`

const Eyebrow = styled.p`
  text-align: center;
  font-size: 0.68rem;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: var(--lilac);
  margin-bottom: 12px;
  font-weight: 300;
`

const Title = styled.h2`
  text-align: center;
  font-family: 'Playfair Display', serif;
  font-size: clamp(1.8rem, 4vw, 2.6rem);
  font-weight: 700;
  color: #fff;
  margin-bottom: 8px;

  em {
    font-style: italic;
    background: linear-gradient(135deg, var(--lilac), #FFD98E);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
`

const Divider = styled.div`
  width: 50px; height: 1.5px;
  background: linear-gradient(90deg, var(--lilac), var(--pink-main));
  margin: 16px auto 56px;
  border-radius: 2px;
`

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 48px;

  @media (max-width: 480px) {
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
  }
`

const SurpresaCard = styled.div`
  background: rgba(255,255,255,0.05);
  border: 1px solid rgba(180,143,212,0.2);
  border-radius: 20px;
  padding: 32px 24px;
  text-align: center;
  cursor: pointer;
  transition: transform 0.3s, box-shadow 0.3s, background 0.3s;
  animation: ${float} ${({ $delay }) => 4 + $delay}s ease-in-out infinite;

  &:hover {
    transform: translateY(-6px);
    background: rgba(255,255,255,0.08);
    box-shadow: 0 16px 40px rgba(0,0,0,0.3);
  }

  @media (max-width: 480px) {
    padding: 20px 12px;
  }
`

const SurpresaIcon = styled.div`
  width: 60px; height: 60px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--purple-deep), var(--pink-main));
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 16px;
  box-shadow: 0 4px 16px rgba(124,77,159,0.4);
`

const SurpresaTitle = styled.h3`
  font-family: 'Playfair Display', serif;
  font-size: 0.95rem;
  font-weight: 700;
  color: #fff;
  margin-bottom: 6px;

  @media (max-width: 480px) {
    font-size: 0.82rem;
  }
`

const SurpresaDesc = styled.p`
  font-size: 0.75rem;
  color: var(--lilac);
  line-height: 1.5;
  font-weight: 300;

  @media (max-width: 480px) {
    display: none;
  }
`

const Petal = styled.div`
  position: fixed;
  pointer-events: none;
  z-index: 999;
  border-radius: ${({ $round }) => $round ? '50%' : '50% 50% 50% 0'};
  animation: ${fall} ${({ $dur }) => $dur}s linear forwards;
  left: ${({ $left }) => $left}vw;
  width: ${({ $size }) => $size}px;
  height: ${({ $size }) => $size * 1.4}px;
  background: ${({ $color }) => $color};
  opacity: 0;
  animation-delay: ${({ $delay }) => $delay}s;
`

// ── OVERLAYS ──
const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(20,8,36,0.85);
  backdrop-filter: blur(10px);
  z-index: 400;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  opacity: ${({ $visible }) => $visible ? 1 : 0};
  pointer-events: ${({ $visible }) => $visible ? 'all' : 'none'};
  transition: opacity 0.4s;
`

const MensagemCard = styled.div`
  background: #2A0F45;
  border: 1px solid rgba(180,143,212,0.2);
  border-radius: 24px;
  padding: 48px 40px;
  max-width: 400px;
  width: 100%;
  text-align: center;
  animation: ${popIn} 0.5s ease;
`

const MensagemText = styled.p`
  font-family: 'Playfair Display', serif;
  font-style: italic;
  font-size: 1.2rem;
  color: #fff;
  line-height: 1.7;
  margin-bottom: 28px;
`

const MensagemAutor = styled.p`
  font-family: 'Dancing Script', cursive;
  font-size: 1.1rem;
  color: var(--pink-main);
  margin-bottom: 24px;
`

const CoracaoWrap = styled.div`
  text-align: center;
  animation: ${popIn} 0.5s ease;
`

const CoracaoSvg = styled.div`
  animation: ${heartBeat} 1.5s ease-in-out infinite;
  margin-bottom: 24px;
`

const CoracaoFrase = styled.p`
  font-family: 'Playfair Display', serif;
  font-style: italic;
  font-size: clamp(1.2rem, 3vw, 1.6rem);
  color: #fff;
  line-height: 1.6;
  max-width: 400px;
  margin: 0 auto 32px;
`

const SolOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: linear-gradient(180deg, #1a0830 0%, #3d1a5e 40%, #7c4d9f 70%, #e8829a 90%, #ffd98e 100%);
  z-index: 400;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  opacity: ${({ $visible }) => $visible ? 1 : 0};
  pointer-events: ${({ $visible }) => $visible ? 'all' : 'none'};
  transition: opacity 0.6s;
  overflow: hidden;
`

const SolWrap = styled.div`
  text-align: center;
  position: relative;
  z-index: 2;
`

const SolCirculo = styled.div`
  width: 120px; height: 120px;
  border-radius: 50%;
  background: radial-gradient(circle, #FFE566, #FFD98E);
  margin: 0 auto 32px;
  animation: ${sunRise} 1s ease forwards, ${glow} 2s ease-in-out infinite 1s;
  box-shadow: 0 0 60px rgba(255,217,142,0.6);
`

const Estrela = styled.div`
  position: absolute;
  width: ${({ $size }) => $size}px;
  height: ${({ $size }) => $size}px;
  border-radius: 50%;
  background: #fff;
  top: ${({ $top }) => $top}%;
  left: ${({ $left }) => $left}%;
  animation: ${twinkle} ${({ $dur }) => $dur}s ease-in-out infinite;
  animation-delay: ${({ $delay }) => $delay}s;
`

const SolTitle = styled.h2`
  font-family: 'Playfair Display', serif;
  font-size: clamp(1.6rem, 4vw, 2.4rem);
  font-weight: 700;
  color: #FFD98E;
  margin-bottom: 16px;
  animation: ${sunRise} 1.2s ease forwards;
`

const SolMsg = styled.p`
  font-family: 'Playfair Display', serif;
  font-style: italic;
  font-size: 1rem;
  color: rgba(255,255,255,0.9);
  line-height: 1.8;
  max-width: 360px;
  margin: 0 auto 32px;
  animation: ${sunRise} 1.4s ease forwards;
`

const ConstelaOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: #0a0515;
  z-index: 400;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  opacity: ${({ $visible }) => $visible ? 1 : 0};
  pointer-events: ${({ $visible }) => $visible ? 'all' : 'none'};
  transition: opacity 0.5s;
`

const ConstelaWrap = styled.div`
  text-align: center;
  position: relative;
`

const ConstelaTitle = styled.p`
  font-family: 'Dancing Script', cursive;
  font-size: clamp(2rem, 6vw, 4rem);
  color: #FFD98E;
  letter-spacing: 0.15em;
  text-shadow: 0 0 20px rgba(255,217,142,0.5);
  animation: ${glow} 2s ease-in-out infinite;
`

const ConstelaDesc = styled.p`
  font-size: 0.78rem;
  color: rgba(255,255,255,0.3);
  letter-spacing: 0.1em;
  text-transform: uppercase;
  margin-bottom: 24px;
`

const RecadoCard = styled.div`
  max-width: 420px;
  width: 100%;
  text-align: center;
  animation: ${popIn} 0.5s ease;
`

const EnvelopeWrap = styled.div`
  position: relative;
  width: 140px;
  height: 100px;
  margin: 0 auto 32px;
  cursor: pointer;
  transition: transform 0.3s;
  &:hover { transform: scale(1.05); }
`

const EnvBody = styled.div`
  position: absolute;
  inset: 0;
  background: linear-gradient(160deg, #fff 60%, #f3e8ff 100%);
  border-radius: 4px;
  border: 1px solid rgba(180,143,212,0.3);
`

const EnvFlap = styled.div`
  position: absolute;
  top: 0; left: 0; right: 0;
  height: 52px;
  overflow: hidden;
  transform-origin: top center;
  transition: transform 0.5s cubic-bezier(0.4,0,0.2,1);
  transform: ${({ $aberto }) => $aberto ? 'rotateX(180deg)' : 'rotateX(0deg)'};
  z-index: 3;

  &::before {
    content: '';
    position: absolute;
    top: 0; left: 50%;
    transform: translateX(-50%);
    border-left: 70px solid transparent;
    border-right: 70px solid transparent;
    border-top: 52px solid #e8d5f5;
  }
`

const EnvSeal = styled.div`
  position: absolute;
  top: 34px; left: 50%;
  transform: translateX(-50%);
  width: 24px; height: 24px;
  background: linear-gradient(135deg, var(--purple-deep), var(--pink-main));
  border-radius: 50%;
  z-index: 4;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: opacity 0.3s;
  opacity: ${({ $aberto }) => $aberto ? 0 : 1};
`

const RecadoTitle = styled.h3`
  font-family: 'Playfair Display', serif;
  font-size: 1.3rem;
  color: #fff;
  margin-bottom: 8px;
  font-style: italic;
`

const RecadoDesc = styled.p`
  font-size: 0.8rem;
  color: var(--lilac);
  margin-bottom: 28px;
  line-height: 1.6;
`

const AudioPlayer = styled.div`
  background: rgba(255,255,255,0.05);
  border: 1px solid rgba(180,143,212,0.2);
  border-radius: 16px;
  padding: 20px 24px;
  margin-bottom: 24px;
  animation: ${popIn} 0.4s ease;

  audio {
    width: 100%;
    outline: none;
  }
`

const BtnFechar = styled.button`
  background: transparent;
  border: 1px solid rgba(255,255,255,0.15);
  border-radius: 30px;
  color: rgba(255,255,255,0.5);
  font-family: 'Lato', sans-serif;
  font-size: 0.7rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  padding: 10px 28px;
  cursor: pointer;
  transition: all 0.2s;
  &:hover { background: rgba(255,255,255,0.06); color: #fff; }
`

const MENSAGENS = [
  'você é a melhor coisa que já aconteceu comigo',
  'meu dia fica melhor com você nele',
  'eu amo cada detalhe seu, até os que você acha que são defeitos',
  'cada segundo ao seu lado vale a pena',
  'você me faz querer ser uma pessoa melhor',
  'eu poderia ficar te olhando pra sempre',
  'você é meu lugar favorito no mundo',
  'obrigado por existir na minha vida',
  'você ilumina tudo ao redor seu redor, meu solzinho',
  'te conhecer é um presente que eu agradeço todo dia',
]

const ESTRELAS = Array.from({ length: 20 }, (_, i) => ({
  id: i,
  size: 2 + Math.random() * 3,
  top: Math.random() * 100,
  left: Math.random() * 100,
  dur: 1.5 + Math.random() * 2,
  delay: Math.random() * 2,
}))

export default function Surpresas() {
  const [petals, setPetals]                   = useState([])
  const [coracaoOpen, setCoracaoOpen]         = useState(false)
  const [mensagemOpen, setMensagemOpen]       = useState(false)
  const [mensagemAtual, setMensagemAtual]     = useState('')
  const [solOpen, setSolOpen]                 = useState(false)
  const [constelaOpen, setConstelaOpen]       = useState(false)
  const [recadoOpen, setRecadoOpen]           = useState(false)
  const [envelopeAberto, setEnvelopeAberto]   = useState(false)
  const [audioUrl, setAudioUrl]               = useState('')
  const [mostrarAudio, setMostrarAudio]       = useState(false)

  useEffect(() => {
    async function fetchConfig() {
      const snap = await getDocs(collection(db, 'config'))
      snap.docs.forEach(d => {
        if (d.id === 'surpresas') setAudioUrl(d.data().audioUrl || '')
      })
    }
    fetchConfig()
  }, [])

  function fazerChuva() {
    const colors = ['#E8829A','#B48FD4','#F7C5D0','#7C4D9F','#FFD98E']
    const novas = Array.from({ length: 40 }, (_, i) => ({
      id: Date.now() + i,
      left: Math.random() * 100,
      size: 6 + Math.random() * 8,
      color: colors[Math.floor(Math.random() * colors.length)],
      dur: 4 + Math.random() * 4,
      delay: Math.random() * 2,
      round: Math.random() > 0.5,
    }))
    setPetals(novas)
    confetti({ particleCount: 80, spread: 100, colors })
    setTimeout(() => setPetals([]), 8000)
  }

  function abrirMensagem() {
    const msg = MENSAGENS[Math.floor(Math.random() * MENSAGENS.length)]
    setMensagemAtual(msg)
    setMensagemOpen(true)
  }

  function abrirRecado() {
    setRecadoOpen(true)
    setEnvelopeAberto(false)
    setMostrarAudio(false)
  }

  function abrirEnvelope() {
    setEnvelopeAberto(true)
    setTimeout(() => setMostrarAudio(true), 600)
  }

  return (
    <Wrapper id="surpresas">
      {petals.map(p => (
        <Petal
          key={p.id}
          $left={p.left}
          $size={p.size}
          $color={p.color}
          $dur={p.dur}
          $round={p.round}
          $delay={p.delay}
        />
      ))}

      <Inner>
        <Eyebrow>feitas com carinho</Eyebrow>
        <Title>Surpresas para <em>você</em></Title>
        <Divider />

        <Grid>
          <SurpresaCard $delay={0} onClick={abrirMensagem}>
            <SurpresaIcon>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
              </svg>
            </SurpresaIcon>
            <SurpresaTitle>Botão do Amor</SurpresaTitle>
            <SurpresaDesc>Clique e receba uma mensagem especial</SurpresaDesc>
          </SurpresaCard>

          <SurpresaCard $delay={0.5} onClick={fazerChuva}>
            <SurpresaIcon>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                <path d="M12 22s-8-4.5-8-11.8A8 8 0 0 1 12 2a8 8 0 0 1 8 8.2c0 7.3-8 11.8-8 11.8z"/>
                <circle cx="12" cy="10" r="3"/>
              </svg>
            </SurpresaIcon>
            <SurpresaTitle>Chuva de Pétalas</SurpresaTitle>
            <SurpresaDesc>Deixa as pétalas caírem por você</SurpresaDesc>
          </SurpresaCard>

          <SurpresaCard $delay={1} onClick={() => setCoracaoOpen(true)}>
            <SurpresaIcon style={{ background: 'linear-gradient(135deg, #E8829A, #B48FD4)' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
              </svg>
            </SurpresaIcon>
            <SurpresaTitle>Coração que Bate</SurpresaTitle>
            <SurpresaDesc>Sente o ritmo do meu coração por você</SurpresaDesc>
          </SurpresaCard>

          <SurpresaCard $delay={1.5} onClick={() => setSolOpen(true)}>
            <SurpresaIcon style={{ background: 'linear-gradient(135deg, #FFD98E, #E8829A)' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                <circle cx="12" cy="12" r="5"/>
                <line x1="12" y1="1" x2="12" y2="3"/>
                <line x1="12" y1="21" x2="12" y2="23"/>
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
                <line x1="1" y1="12" x2="3" y2="12"/>
                <line x1="21" y1="12" x2="23" y2="12"/>
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
              </svg>
            </SurpresaIcon>
            <SurpresaTitle>Surpresa do Solzinho</SurpresaTitle>
            <SurpresaDesc>Uma surpresa especial para você</SurpresaDesc>
          </SurpresaCard>

          <SurpresaCard $delay={2} onClick={() => setConstelaOpen(true)}>
            <SurpresaIcon style={{ background: 'linear-gradient(135deg, #1a0830, #7C4D9F)' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#FFD98E" strokeWidth="2">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
              </svg>
            </SurpresaIcon>
            <SurpresaTitle>Constelação</SurpresaTitle>
            <SurpresaDesc>Seu nome escrito nas estrelas</SurpresaDesc>
          </SurpresaCard>

          <SurpresaCard $delay={2.5} onClick={abrirRecado}>
            <SurpresaIcon style={{ background: 'linear-gradient(135deg, #B48FD4, #E8829A)' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
                <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
                <line x1="12" y1="19" x2="12" y2="23"/>
                <line x1="8" y1="23" x2="16" y2="23"/>
              </svg>
            </SurpresaIcon>
            <SurpresaTitle>Recado de Voz</SurpresaTitle>
            <SurpresaDesc>Tem uma mensagem esperando por você</SurpresaDesc>
          </SurpresaCard>
        </Grid>
      </Inner>

      {/* Mensagem do amor */}
      <Overlay $visible={mensagemOpen} onClick={e => e.target === e.currentTarget && setMensagemOpen(false)}>
        <MensagemCard>
          <MensagemText>"{mensagemAtual}"</MensagemText>
          <MensagemAutor>Com amor, Felipe</MensagemAutor>
          <BtnFechar onClick={() => setMensagemOpen(false)}>Fechar</BtnFechar>
        </MensagemCard>
      </Overlay>

      {/* Coração */}
      <Overlay $visible={coracaoOpen} onClick={e => e.target === e.currentTarget && setCoracaoOpen(false)}>
        <CoracaoWrap>
          <CoracaoSvg>
            <svg width="120" height="120" viewBox="0 0 24 24" fill="#E8829A">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
            </svg>
          </CoracaoSvg>
          <CoracaoFrase>
            meu coração bate assim toda vez que penso em você
          </CoracaoFrase>
          <BtnFechar onClick={() => setCoracaoOpen(false)}>Fechar</BtnFechar>
        </CoracaoWrap>
      </Overlay>

      {/* Sol */}
      <SolOverlay $visible={solOpen} onClick={e => e.target === e.currentTarget && setSolOpen(false)}>
        {ESTRELAS.map(e => (
          <Estrela key={e.id} $size={e.size} $top={e.top} $left={e.left} $dur={e.dur} $delay={e.delay} />
        ))}
        <SolWrap>
          <SolCirculo />
          <SolTitle>meu solzinho</SolTitle>
          <SolMsg>
            você ilumina tudo ao redor sem nem perceber. cada dia ao seu lado é mais brilhante que o anterior.
          </SolMsg>
          <BtnFechar onClick={() => setSolOpen(false)}>Fechar</BtnFechar>
        </SolWrap>
      </SolOverlay>

      {/* Constelação */}
      <ConstelaOverlay $visible={constelaOpen} onClick={e => e.target === e.currentTarget && setConstelaOpen(false)}>
        {ESTRELAS.map(e => (
          <Estrela key={e.id} $size={e.size} $top={e.top} $left={e.left} $dur={e.dur} $delay={e.delay} />
        ))}
        <ConstelaWrap>
          <ConstelaDesc>escrito nas estrelas</ConstelaDesc>
          <ConstelaTitle>kaulinha</ConstelaTitle>
          <br /><br />
          <BtnFechar onClick={() => setConstelaOpen(false)}>Fechar</BtnFechar>
        </ConstelaWrap>
      </ConstelaOverlay>

      {/* Recado de voz */}
      <Overlay $visible={recadoOpen} onClick={e => e.target === e.currentTarget && setRecadoOpen(false)}>
        <RecadoCard>
          <RecadoTitle>Tem uma mensagem para você</RecadoTitle>
          <RecadoDesc>Clique no envelope para ouvir</RecadoDesc>
          <EnvelopeWrap onClick={abrirEnvelope}>
            <EnvBody />
            <EnvFlap $aberto={envelopeAberto} />
            <EnvSeal $aberto={envelopeAberto}>
              <svg width="10" height="10" viewBox="0 0 24 24" fill="white">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
              </svg>
            </EnvSeal>
          </EnvelopeWrap>
          {mostrarAudio && audioUrl && (
            <AudioPlayer>
              <audio controls autoPlay src={audioUrl} />
            </AudioPlayer>
          )}
          {mostrarAudio && !audioUrl && (
            <p style={{ color: 'var(--lilac)', fontSize: '0.78rem', marginBottom: '20px', fontStyle: 'italic' }}>
              Nenhum áudio configurado ainda.
            </p>
          )}
          <BtnFechar onClick={() => setRecadoOpen(false)}>Fechar</BtnFechar>
        </RecadoCard>
      </Overlay>
    </Wrapper>
  )
}