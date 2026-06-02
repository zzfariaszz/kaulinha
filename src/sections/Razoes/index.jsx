import { useState, useEffect } from 'react'
import { collection, addDoc, getDocs, orderBy, query } from 'firebase/firestore'
import { db } from '../../services/firebase'
import { useAuth } from '../../hooks/useAuth'
import styled, { keyframes } from 'styled-components'

// ── ANIMAÇÕES ──
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to   { opacity: 1; transform: translateY(0); }
`

const cardIn = keyframes`
  from { opacity: 0; transform: translateY(16px); }
  to   { opacity: 1; transform: translateY(0); }
`

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
  max-width: 720px;
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
  margin: 16px auto 32px;
  border-radius: 2px;
`

const Tabs = styled.div`
  display: flex;
  justify-content: center;
  gap: 8px;
  margin-bottom: 40px;
`

const Tab = styled.button`
  font-family: 'Lato', sans-serif;
  font-size: 0.7rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  padding: 10px 24px;
  border-radius: 30px;
  border: 1.5px solid rgba(124,77,159,0.25);
  background: ${({ $active }) => $active ? 'linear-gradient(135deg, var(--purple-deep), var(--pink-main))' : 'transparent'};
  color: ${({ $active }) => $active ? '#fff' : 'var(--purple-deep)'};
  border-color: ${({ $active }) => $active ? 'transparent' : 'rgba(124,77,159,0.25)'};
  box-shadow: ${({ $active }) => $active ? '0 4px 16px rgba(124,77,159,0.3)' : 'none'};
  cursor: pointer;
  transition: all 0.25s;
`

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 36px;
`

const bgColors = ['#F7C5D0', '#EDE7F6', '#F3E8FF', '#FFE8EF']

const Card = styled.div`
  border-radius: 18px;
  padding: 28px 24px;
  background: ${({ $index }) => bgColors[$index % bgColors.length]};
  position: relative;
  overflow: hidden;
  opacity: 0;
  animation: ${cardIn} 0.5s forwards;
  animation-delay: ${({ $index }) => $index * 0.07}s;
  transition: transform 0.3s, box-shadow 0.3s;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 32px rgba(61,26,94,0.13);
  }
`

const CardNumber = styled.div`
  font-family: 'Playfair Display', serif;
  font-size: 2.8rem;
  font-weight: 700;
  line-height: 1;
  margin-bottom: 12px;
  opacity: 0.18;
  color: var(--purple-dark);
`

const CardText = styled.p`
  font-family: 'Playfair Display', serif;
  font-style: italic;
  font-size: 0.95rem;
  color: var(--purple-dark);
  line-height: 1.65;
`

const CardIcon = styled.div`
  position: absolute;
  bottom: 16px;
  right: 18px;
  opacity: 0.2;
`

const CardAdd = styled.button`
  border-radius: 18px;
  padding: 28px 24px;
  border: 2px dashed rgba(124,77,159,0.25);
  background: transparent;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  cursor: pointer;
  transition: all 0.25s;
  min-height: 130px;
  color: var(--purple-deep);

  &:hover {
    background: rgba(124,77,159,0.05);
    border-color: var(--purple-deep);
  }

  span {
    font-size: 0.68rem;
    letter-spacing: 0.12em;
    text-transform: uppercase;
  }
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
  max-width: 400px;
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

const FormLabel = styled.label`
  display: block;
  font-size: 0.65rem;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--lilac);
  margin-bottom: 8px;
  font-weight: 300;
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
  min-height: 100px;
  line-height: 1.6;
  transition: border-color 0.2s;

  &:focus { border-color: var(--pink-main); }
  &::placeholder { color: rgba(255,255,255,0.25); }
`

const FormButtons = styled.div`
  display: flex;
  gap: 12px;
  margin-top: 20px;
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

// ── COMPONENTE ──
export default function Razoes() {
  const { isAdmin } = useAuth()
  const [aba, setAba] = useState('dele')
  const [razoesDele, setRazoesDele] = useState([])
  const [razoesDela, setRazoesDela] = useState([])
  const [formOpen, setFormOpen] = useState(false)
  const [texto, setTexto] = useState('')

  useEffect(() => {
    async function fetch() {
      const qDele = query(collection(db, 'razoes_dele'), orderBy('data', 'asc'))
      const qDela = query(collection(db, 'razoes_dela'), orderBy('data', 'asc'))
      const [snapDele, snapDela] = await Promise.all([getDocs(qDele), getDocs(qDela)])
      setRazoesDele(snapDele.docs.map(d => ({ id: d.id, ...d.data() })))
      setRazoesDela(snapDela.docs.map(d => ({ id: d.id, ...d.data() })))
    }
    fetch()
  }, [])

  async function handleSubmit() {
    if (!texto.trim()) return
    const colecao = aba === 'dele' ? 'razoes_dele' : 'razoes_dela'
    const nova = { texto, data: new Date() }
    const ref = await addDoc(collection(db, colecao), nova)
    const novaRazao = { id: ref.id, ...nova }
    if (aba === 'dele') setRazoesDele(prev => [...prev, novaRazao])
    else setRazoesDela(prev => [...prev, novaRazao])
    setTexto('')
    setFormOpen(false)
  }

  const razoes = aba === 'dele' ? razoesDele : razoesDela
  const podeAdicionar = isAdmin && aba === 'dele' || aba === 'dela'

  return (
    <Wrapper id="razoes">
      <Inner>
        <Eyebrow>do fundo do coração</Eyebrow>
        <Title>Razões pelas quais <em>te amo</em></Title>
        <Divider />

        <Tabs>
          <Tab $active={aba === 'dele'} onClick={() => setAba('dele')}>
            Por que te amo
          </Tab>
          <Tab $active={aba === 'dela'} onClick={() => setAba('dela')}>
            Por que voce me ama
          </Tab>
        </Tabs>

        <Grid>
          {razoes.map((r, i) => (
            <Card key={r.id} $index={i}>
              <CardNumber>{String(i + 1).padStart(2, '0')}</CardNumber>
              <CardText>{r.texto}</CardText>
              <CardIcon>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="var(--purple-dark)">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                </svg>
              </CardIcon>
            </Card>
          ))}

          {podeAdicionar && (
            <CardAdd onClick={() => setFormOpen(true)}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
              <span>Nova razão</span>
            </CardAdd>
          )}
        </Grid>
      </Inner>

      <FormOverlay $visible={formOpen} onClick={e => e.target === e.currentTarget && setFormOpen(false)}>
        <FormCard $visible={formOpen}>
          <FormTitle>Nova razão</FormTitle>
          <FormLabel>Escreva a razão</FormLabel>
          <FormTextarea
            value={texto}
            onChange={e => setTexto(e.target.value)}
            placeholder="Porque você..."
          />
          <FormButtons>
            <BtnCancel onClick={() => setFormOpen(false)}>Cancelar</BtnCancel>
            <BtnSubmit onClick={handleSubmit}>Salvar</BtnSubmit>
          </FormButtons>
        </FormCard>
      </FormOverlay>
    </Wrapper>
  )
}