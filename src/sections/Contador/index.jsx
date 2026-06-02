import { useState, useEffect } from 'react'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import { db } from '../../services/firebase'
import styled, { keyframes } from 'styled-components'

// ── ANIMAÇÕES ──
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to   { opacity: 1; transform: translateY(0); }
`

const pulse = keyframes`
  0%, 100% { opacity: 1; transform: scale(1); }
  50%       { opacity: 0.4; transform: scale(0.7); }
`

// ── ESTILOS ──
const Wrapper = styled.div`
  position: relative;
  min-height: 100vh;
  background: var(--purple-dark);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  padding: 40px 24px;
`

const Blob = styled.div`
  position: absolute;
  border-radius: 50%;
  filter: blur(90px);
  opacity: 0.12;
  pointer-events: none;

  &.blob-1 {
    width: 400px; height: 400px;
    background: var(--purple-deep);
    top: -120px; left: -120px;
  }
  &.blob-2 {
    width: 350px; height: 350px;
    background: var(--pink-main);
    bottom: -100px; right: -100px;
  }
`

const Center = styled.div`
  position: relative;
  z-index: 2;
  text-align: center;
  max-width: 600px;
  width: 100%;
  animation: ${fadeIn} 1s ease forwards;
`

const SectionLabel = styled.p`
  font-size: 0.68rem;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: var(--lilac);
  margin-bottom: 48px;
  font-weight: 300;
`

const RunningLabel = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 0.65rem;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--pink-main);
  margin-bottom: 48px;
`

const DotPulse = styled.span`
  width: 7px; height: 7px;
  border-radius: 50%;
  background: var(--pink-main);
  display: inline-block;
  animation: ${pulse} 1.4s ease-in-out infinite;
`
const CounterGrid = styled.div`
  display: flex;
  gap: 0;
  justify-content: center;
  align-items: flex-start;
  flex-wrap: wrap;
  margin-bottom: 56px;

  @media (max-width: 480px) {
    gap: 0;
  }
`

const CounterItem = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0 12px;
  border-right: 1px solid rgba(255,255,255,0.1);

  &:last-child { border-right: none; }

  @media (max-width: 480px) {
    padding: 0 8px;
  }
`

const Num = styled.span`
  font-family: 'Playfair Display', serif;
  font-size: clamp(1.4rem, 4vw, 3.2rem);
  font-weight: 700;
  line-height: 1;
  margin-bottom: 8px;
  color: ${({ $running }) => $running ? 'transparent' : 'rgba(255,255,255,0.25)'};
  ${({ $running }) => $running && `
    background: linear-gradient(135deg, #fff, #F7C5D0);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  `}
`

const NumLabel = styled.span`
  font-size: clamp(0.45rem, 1.5vw, 0.58rem);
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--lilac);
  font-weight: 300;
`

const BtnIniciar = styled.button`
  font-family: 'Lato', sans-serif;
  font-size: 0.75rem;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  padding: 16px 44px;
  border-radius: 50px;
  border: 1.5px solid rgba(232,130,154,0.6);
  background: transparent;
  color: var(--pink-light);
  cursor: pointer;
  transition: all 0.3s;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(135deg, var(--purple-deep), var(--pink-main));
    opacity: 0;
    transition: opacity 0.3s;
  }

  &:hover::before { opacity: 1; }
  &:hover { border-color: transparent; box-shadow: 0 8px 28px rgba(232,130,154,0.35); }

  span { position: relative; z-index: 1; }
`

// ── MODAL ──
const ModalOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(20,8,36,0.75);
  backdrop-filter: blur(6px);
  z-index: 50;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  opacity: ${({ $visible }) => $visible ? 1 : 0};
  pointer-events: ${({ $visible }) => $visible ? 'all' : 'none'};
  transition: opacity 0.35s;
`

const Modal = styled.div`
  background: #2A0F45;
  border: 1px solid rgba(180,143,212,0.25);
  border-radius: 24px;
  padding: 48px 40px;
  max-width: 380px;
  width: 100%;
  text-align: center;
  transform: ${({ $visible }) => $visible ? 'translateY(0) scale(1)' : 'translateY(20px) scale(0.97)'};
  transition: transform 0.35s;
  box-shadow: 0 24px 64px rgba(0,0,0,0.5);
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: -60px; left: -60px;
    width: 200px; height: 200px;
    background: var(--purple-deep);
    border-radius: 50%;
    filter: blur(60px);
    opacity: 0.3;
  }
`

const ModalIcon = styled.div`
  width: 56px; height: 56px;
  background: linear-gradient(135deg, var(--purple-deep), var(--pink-main));
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 24px;
  position: relative;
  z-index: 1;
`

const ModalTitle = styled.h3`
  font-family: 'Playfair Display', serif;
  font-size: 1.4rem;
  font-weight: 700;
  color: #fff;
  margin-bottom: 12px;
  position: relative;
  z-index: 1;
`

const ModalText = styled.p`
  font-size: 0.88rem;
  color: var(--lilac);
  line-height: 1.7;
  margin-bottom: 36px;
  font-weight: 300;
  position: relative;
  z-index: 1;

  em { color: var(--pink-light); font-style: italic; }
`

const ModalButtons = styled.div`
  display: flex;
  gap: 12px;
  position: relative;
  z-index: 1;
`

const BtnCancel = styled.button`
  flex: 1;
  font-family: 'Lato', sans-serif;
  font-size: 0.72rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  padding: 13px 20px;
  border-radius: 40px;
  border: 1px solid rgba(255,255,255,0.15);
  background: transparent;
  color: rgba(255,255,255,0.5);
  cursor: pointer;
  transition: all 0.2s;

  &:hover { background: rgba(255,255,255,0.06); color: rgba(255,255,255,0.8); }
`

const BtnConfirm = styled.button`
  flex: 1;
  font-family: 'Lato', sans-serif;
  font-size: 0.72rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  padding: 13px 20px;
  border-radius: 40px;
  border: none;
  background: linear-gradient(135deg, var(--purple-deep), var(--pink-main));
  color: #fff;
  cursor: pointer;
  box-shadow: 0 4px 18px rgba(232,130,154,0.35);
  transition: all 0.2s;

  &:hover { transform: translateY(-2px); }
`

// ── LÓGICA ──
function calcDiff(start) {
  const now = new Date()
  const diff = Math.floor((now - start) / 1000)
  const segundos = diff % 60
  const minutos  = Math.floor(diff / 60) % 60
  const horas    = Math.floor(diff / 3600) % 24
  const dias     = Math.floor(diff / 86400) % 30
  const meses    = Math.floor(diff / (86400 * 30)) % 12
  const anos     = Math.floor(diff / (86400 * 365))
  return { anos, meses, dias, horas, minutos, segundos }
}

// ── COMPONENTE ──
export default function Contador() {
  const [modal, setModal]     = useState(false)
  const [running, setRunning] = useState(false)
  const [startDate, setStartDate] = useState(null)
  const [time, setTime] = useState({ anos:0, meses:0, dias:0, horas:0, minutos:0, segundos:0 })

  // Busca data de início no Firebase
  useEffect(() => {
    async function fetchStart() {
      const ref = doc(db, 'contador', 'inicio')
      const snap = await getDoc(ref)
      if (snap.exists()) {
        const date = snap.data().timestamp.toDate()
        setStartDate(date)
        setRunning(true)
      }
    }
    fetchStart()
  }, [])

  // Atualiza o contador a cada segundo
  useEffect(() => {
    if (!running || !startDate) return
    const interval = setInterval(() => {
      setTime(calcDiff(startDate))
    }, 1000)
    return () => clearInterval(interval)
  }, [running, startDate])

  async function handleConfirm() {
    const now = new Date()
    await setDoc(doc(db, 'contador', 'inicio'), {
      timestamp: now
    })
    setStartDate(now)
    setRunning(true)
    setModal(false)
  }

  const pad = n => String(n).padStart(2, '0')

  return (
    <Wrapper id="contador">
      <Blob className="blob-1" />
      <Blob className="blob-2" />

      <Center>
        {running
          ? <RunningLabel><DotPulse />contando desde o início</RunningLabel>
          : <SectionLabel>nosso tempo juntos</SectionLabel>
        }

        <CounterGrid>
          {[
            { label: 'anos',     value: pad(time.anos) },
            { label: 'meses',    value: pad(time.meses) },
            { label: 'dias',     value: pad(time.dias) },
            { label: 'horas',    value: pad(time.horas) },
            { label: 'minutos',  value: pad(time.minutos) },
            { label: 'segundos', value: pad(time.segundos) },
          ].map(({ label, value }) => (
            <CounterItem key={label}>
              <Num $running={running}>{value}</Num>
              <NumLabel>{label}</NumLabel>
            </CounterItem>
          ))}
        </CounterGrid>

        {!running && (
          <BtnIniciar onClick={() => setModal(true)}>
            <span>Iniciar Contagem</span>
          </BtnIniciar>
        )}
      </Center>

      <ModalOverlay $visible={modal}>
        <Modal $visible={modal}>
          <ModalIcon>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
            </svg>
          </ModalIcon>
          <ModalTitle>Tem certeza?</ModalTitle>
          <ModalText>
            Esse momento vai ficar guardado <em>para sempre.</em><br />
            A contagem do nosso tempo juntos começa agora.
          </ModalText>
          <ModalButtons>
            <BtnCancel onClick={() => setModal(false)}>Cancelar</BtnCancel>
            <BtnConfirm onClick={handleConfirm}>Confirmar</BtnConfirm>
          </ModalButtons>
        </Modal>
      </ModalOverlay>
    </Wrapper>
  )
}