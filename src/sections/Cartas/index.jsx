import { useState, useEffect } from 'react'
import { collection, addDoc, getDocs, orderBy, query } from 'firebase/firestore'
import { db } from '../../services/firebase'
import styled, { keyframes } from 'styled-components'
import { useAuth } from '../../hooks/useAuth'

// ── ANIMAÇÕES ──
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to   { opacity: 1; transform: translateY(0); }
`

const cardIn = keyframes`
  from { opacity: 0; transform: translateY(16px); }
  to   { opacity: 1; transform: translateY(0); }
`

const float1 = keyframes`
  0%, 100% { transform: rotate(-3deg) translateY(0px); }
  50%       { transform: rotate(-1deg) translateY(-8px); }
`
const float2 = keyframes`
  0%, 100% { transform: rotate(2deg) translateY(0px); }
  50%       { transform: rotate(4deg) translateY(-10px); }
`
const float3 = keyframes`
  0%, 100% { transform: rotate(-1.5deg) translateY(0px); }
  50%       { transform: rotate(0.5deg) translateY(-6px); }
`

const floats = [float1, float2, float3]

// ── ESTILOS ──
const Wrapper = styled.div`
  position: relative;
  min-height: 100vh;
  background: var(--bg);
  padding: 80px 24px;
  overflow-x: hidden;

  &::before {
    content: '';
    position: fixed;
    inset: 0;
    background-image:
      radial-gradient(circle at 15% 15%, rgba(124,77,159,0.06) 0%, transparent 50%),
      radial-gradient(circle at 85% 85%, rgba(232,130,154,0.07) 0%, transparent 50%);
    pointer-events: none;
  }
`

const Inner = styled.div`
  position: relative;
  z-index: 1;
  max-width: 700px;
  margin: 0 auto;
  animation: ${fadeIn} 0.8s ease forwards;
`

const Eyebrow = styled.p`
  text-align: center;
  font-size: 0.68rem;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: var(--purple-deep);
  margin-bottom: 12px;
  font-weight: 300;
`

const Title = styled.h2`
  text-align: center;
  font-family: 'Playfair Display', serif;
  font-size: clamp(1.8rem, 4vw, 2.6rem);
  font-weight: 700;
  color: var(--purple-dark);
  margin-bottom: 8px;

  em {
    font-style: italic;
    background: linear-gradient(135deg, var(--purple-deep), var(--pink-main));
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
`

const Divider = styled.div`
  width: 50px; height: 1.5px;
  background: linear-gradient(90deg, var(--purple-deep), var(--pink-main));
  margin: 16px auto 48px;
  border-radius: 2px;
`

const EnvelopesGrid = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 32px;
  justify-content: center;
  margin-bottom: 48px;
`

const EnvelopeWrap = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  animation: ${cardIn} 0.5s ease forwards;
  animation-delay: ${({ $index }) => $index * 0.08}s;
  opacity: 0;
`

const Envelope = styled.div`
  width: 180px;
  height: 120px;
  position: relative;
  filter: drop-shadow(0 8px 24px rgba(61,26,94,0.15));
  transition: transform 0.3s, filter 0.3s;
  animation: ${({ $floatIndex }) => floats[$floatIndex % 3]} ${({ $floatIndex }) => 6 + $floatIndex * 0.5}s ease-in-out infinite;

  &:hover {
    filter: drop-shadow(0 14px 32px rgba(61,26,94,0.25));
  }
`

const EnvBody = styled.div`
  position: absolute;
  inset: 0;
  background: linear-gradient(160deg, #fff 60%, #f3e8ff 100%);
  border-radius: 4px;
  border: 1px solid rgba(180,143,212,0.3);
`

const EnvBottom = styled.div`
  position: absolute;
  bottom: 0; left: 0; right: 0;
  height: 60px;
  overflow: hidden;
  border-radius: 0 0 4px 4px;

  &::before {
    content: '';
    position: absolute;
    bottom: 0;
    left: 50%;
    transform: translateX(-50%);
    border-left: 90px solid transparent;
    border-right: 90px solid transparent;
    border-bottom: 60px solid rgba(180,143,212,0.18);
  }
`

const EnvSides = styled.div`
  position: absolute;
  inset: 0;
  overflow: hidden;
  border-radius: 4px;

  &::before {
    content: '';
    position: absolute;
    top: 0; left: 0;
    border-top: 60px solid rgba(180,143,212,0.12);
    border-right: 90px solid transparent;
  }

  &::after {
    content: '';
    position: absolute;
    top: 0; right: 0;
    border-top: 60px solid rgba(180,143,212,0.12);
    border-left: 90px solid transparent;
  }
`

const EnvFlap = styled.div`
  position: absolute;
  top: 0; left: 0; right: 0;
  height: 62px;
  overflow: hidden;
  transform-origin: top center;
  z-index: 3;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 50%;
    transform: translateX(-50%);
    border-left: 90px solid transparent;
    border-right: 90px solid transparent;
    border-top: 62px solid #e8d5f5;
  }
`

const EnvSeal = styled.div`
  position: absolute;
  top: 42px;
  left: 50%;
  transform: translateX(-50%);
  width: 28px; height: 28px;
  background: linear-gradient(135deg, var(--purple-deep), var(--pink-main));
  border-radius: 50%;
  z-index: 4;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 8px rgba(124,77,159,0.4);
`

const EnvDate = styled.span`
  font-size: 0.65rem;
  letter-spacing: 0.08em;
  color: var(--lilac);
  font-weight: 300;
`

const EnvTitle = styled.span`
  font-family: 'Dancing Script', cursive;
  font-size: 0.88rem;
  color: var(--purple-dark);
  text-align: center;
  max-width: 160px;
  line-height: 1.3;
`

const NovaCarta = styled.button`
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 0 auto;
  font-family: 'Lato', sans-serif;
  font-size: 0.72rem;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  padding: 13px 32px;
  border-radius: 40px;
  border: 1.5px dashed rgba(124,77,159,0.4);
  background: transparent;
  color: var(--purple-deep);
  cursor: pointer;
  transition: all 0.25s;

  &:hover {
    background: var(--purple-deep);
    color: #fff;
    border-style: solid;
    border-color: var(--purple-deep);
  }
`

// ── CARTA MODAL ──
const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(20,8,36,0.7);
  backdrop-filter: blur(8px);
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  opacity: ${({ $visible }) => $visible ? 1 : 0};
  pointer-events: ${({ $visible }) => $visible ? 'all' : 'none'};
  transition: opacity 0.4s;
`

const CartaModal = styled.div`
  background: #fffaf8;
  border-radius: 4px;
  max-width: 480px;
  width: 100%;
  max-height: 80vh;
  overflow-y: auto;
  padding: 52px 48px;
  position: relative;
  transform: ${({ $visible }) => $visible ? 'translateY(0) scale(1)' : 'translateY(30px) scale(0.96)'};
  transition: transform 0.4s cubic-bezier(0.4,0,0.2,1);
  box-shadow: 0 32px 80px rgba(61,26,94,0.4);
  border-top: 3px solid;
  border-image: linear-gradient(90deg, var(--purple-deep), var(--pink-main)) 1;

  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background-image: repeating-linear-gradient(transparent, transparent 27px, rgba(180,143,212,0.12) 28px);
    border-radius: 4px;
    pointer-events: none;
  }
`

const CartaClose = styled.button`
  position: absolute;
  top: 16px; right: 16px;
  width: 32px; height: 32px;
  border-radius: 50%;
  border: 1px solid rgba(180,143,212,0.3);
  background: transparent;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--lilac);
  font-size: 1rem;
  transition: all 0.2s;

  &:hover { background: var(--pink-light); color: var(--purple-dark); }
`

const CartaDate = styled.p`
  font-size: 0.7rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--lilac);
  margin-bottom: 24px;
  font-weight: 300;
  position: relative;
  z-index: 1;
`

const CartaTitle = styled.h3`
  font-family: 'Dancing Script', cursive;
  font-size: 1.8rem;
  color: var(--purple-dark);
  margin-bottom: 24px;
  position: relative;
  z-index: 1;
  line-height: 1.2;
`

const CartaBody = styled.p`
  font-family: 'Playfair Display', serif;
  font-size: 0.95rem;
  color: #4a3060;
  line-height: 1.95;
  font-style: italic;
  position: relative;
  z-index: 1;
`

const CartaAssinatura = styled.p`
  font-family: 'Dancing Script', cursive;
  font-size: 1.4rem;
  color: var(--purple-deep);
  margin-top: 32px;
  text-align: right;
  position: relative;
  z-index: 1;
`

// ── FORM MODAL ──
const FormOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(20,8,36,0.7);
  backdrop-filter: blur(8px);
  z-index: 200;
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
  max-width: 420px;
  width: 100%;
  transform: ${({ $visible }) => $visible ? 'translateY(0)' : 'translateY(20px)'};
  transition: transform 0.3s;
`

const FormTitle = styled.h3`
  font-family: 'Playfair Display', serif;
  font-size: 1.3rem;
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

const FormTextarea = styled.textarea`
  width: 100%;
  background: rgba(255,255,255,0.06);
  border: 1px solid rgba(180,143,212,0.2);
  border-radius: 10px;
  padding: 12px 16px;
  color: #fff;
  font-family: 'Playfair Display', serif;
  font-style: italic;
  font-size: 0.92rem;
  outline: none;
  resize: vertical;
  min-height: 140px;
  line-height: 1.6;
  transition: border-color 0.2s;

  &:focus { border-color: var(--pink-main); }
  &::placeholder { color: rgba(255,255,255,0.25); }
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

// ── SENHA ──
const PASSWORD = import.meta.env.VITE_APP_PASSWORD

// ── COMPONENTE ──
export default function Cartas() {
  const [cartas, setCartas]         = useState([])
  const [cartaAberta, setCartaAberta] = useState(null)
  const [formOpen, setFormOpen]     = useState(false)
  const [titulo, setTitulo]         = useState('')
  const [texto, setTexto]           = useState('')
  const { isAdmin } = useAuth()

  useEffect(() => {
    async function fetchCartas() {
      const q = query(collection(db, 'cartas'), orderBy('data', 'desc'))
      const snap = await getDocs(q)
      setCartas(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    }
    fetchCartas()
  }, [])

  async function handleSubmit() {
    if (!titulo.trim() || !texto.trim()) return
    const nova = {
      titulo,
      texto,
      data: new Date(),
    }
    const ref = await addDoc(collection(db, 'cartas'), nova)
    setCartas(prev => [{ id: ref.id, ...nova }, ...prev])
    setTitulo('')
    setTexto('')
    setFormOpen(false)
  }

  function formatDate(data) {
    if (!data) return ''
    const d = data.toDate ? data.toDate() : new Date(data)
    return d.toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' })
  }

  return (
    <Wrapper id="cartas">
      <Inner>
        <Eyebrow>escritas com carinho</Eyebrow>
        <Title>Cartas para <em>você</em></Title>
        <Divider />

        <EnvelopesGrid>
          {cartas.map((carta, i) => (
            <EnvelopeWrap key={carta.id} $index={i} onClick={() => setCartaAberta(carta)}>
              <Envelope $floatIndex={i}>
                <EnvBody />
                <EnvBottom />
                <EnvSides />
                <EnvFlap />
                <EnvSeal>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="white">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                  </svg>
                </EnvSeal>
              </Envelope>
              <EnvDate>{formatDate(carta.data)}</EnvDate>
              <EnvTitle>{carta.titulo}</EnvTitle>
            </EnvelopeWrap>
          ))}

          {isAdmin && (
            <NovaCarta onClick={() => setFormOpen(true)}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
              Escrever nova carta
            </NovaCarta>
          )}
        </EnvelopesGrid>
      </Inner>

      {/* Carta aberta */}
      <Overlay $visible={!!cartaAberta} onClick={e => e.target === e.currentTarget && setCartaAberta(null)}>
        <CartaModal $visible={!!cartaAberta}>
          <CartaClose onClick={() => setCartaAberta(null)}>✕</CartaClose>
          <CartaDate>{formatDate(cartaAberta?.data)}</CartaDate>
          <CartaTitle>{cartaAberta?.titulo}</CartaTitle>
          <CartaBody>{cartaAberta?.texto}</CartaBody>
          <CartaAssinatura>Com amor, Felipe</CartaAssinatura>
        </CartaModal>
      </Overlay>

      {/* Form nova carta */}
      <FormOverlay $visible={formOpen} onClick={e => e.target === e.currentTarget && setFormOpen(false)}>
        <FormCard $visible={formOpen}>
          <FormTitle>Escrever nova carta</FormTitle>
          <FormGroup>
            <FormLabel>Título</FormLabel>
            <FormInput
              value={titulo}
              onChange={e => setTitulo(e.target.value)}
              placeholder="Ex: Só pra te lembrar..."
            />
          </FormGroup>
          <FormGroup>
            <FormLabel>Carta</FormLabel>
            <FormTextarea
              value={texto}
              onChange={e => setTexto(e.target.value)}
              placeholder="Escreva sua carta aqui..."
            />
          </FormGroup>
          <FormButtons>
            <BtnCancel onClick={() => setFormOpen(false)}>Cancelar</BtnCancel>
            <BtnSubmit onClick={handleSubmit}>Enviar carta</BtnSubmit>
          </FormButtons>
        </FormCard>
      </FormOverlay>
    </Wrapper>
  )
}