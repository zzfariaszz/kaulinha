import { useState, useEffect } from 'react'
import { collection, addDoc, getDocs, orderBy, query } from 'firebase/firestore'
import { db } from '../../services/firebase'
import { useAuth } from '../../hooks/useAuth'
import styled, { keyframes } from 'styled-components'

// ── ÍCONES DISPONÍVEIS ──
const ICONES = [
  { id: 'heart', label: 'Coração', svg: <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/> },
  { id: 'star', label: 'Estrela', svg: <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/> },
  { id: 'moon', label: 'Lua', svg: <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/> },
  { id: 'sun', label: 'Sol', svg: <><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></> },
  { id: 'music', label: 'Música', svg: <><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></> },
  { id: 'coffee', label: 'Café', svg: <><path d="M18 8h1a4 4 0 0 1 0 8h-1"/><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/><line x1="6" y1="1" x2="6" y2="4"/><line x1="10" y1="1" x2="10" y2="4"/><line x1="14" y1="1" x2="14" y2="4"/></> },
  { id: 'flower', label: 'Flor', svg: <><path d="M12 22s-8-4.5-8-11.8A8 8 0 0 1 12 2a8 8 0 0 1 8 8.2c0 7.3-8 11.8-8 11.8z"/><circle cx="12" cy="10" r="3"/></> },
  { id: 'book', label: 'Livro', svg: <><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></> },
  { id: 'camera', label: 'Câmera', svg: <><rect x="3" y="5" width="18" height="14" rx="2"/><circle cx="12" cy="12" r="3.5"/><path d="M8.5 5l1-2h5l1 2"/></> },
  { id: 'map', label: 'Mapa', svg: <><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></> },
  { id: 'film', label: 'Filme', svg: <><rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18"/><line x1="7" y1="2" x2="7" y2="22"/><line x1="17" y1="2" x2="17" y2="22"/><line x1="2" y1="12" x2="22" y2="12"/><line x1="2" y1="7" x2="7" y2="7"/><line x1="2" y1="17" x2="7" y2="17"/><line x1="17" y1="17" x2="22" y2="17"/><line x1="17" y1="7" x2="22" y2="7"/></> },
  { id: 'cloud', label: 'Nuvem', svg: <path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z"/> },
  { id: 'rain', label: 'Chuva', svg: <><line x1="16" y1="13" x2="16" y2="21"/><line x1="8" y1="13" x2="8" y2="21"/><line x1="12" y1="15" x2="12" y2="23"/><path d="M20 16.58A5 5 0 0 0 18 7h-1.26A8 8 0 1 0 4 15.25"/></> },
  { id: 'sunset', label: 'Por do sol', svg: <><path d="M17 18a5 5 0 0 0-10 0"/><line x1="12" y1="2" x2="12" y2="9"/><line x1="4.22" y1="10.22" x2="5.64" y2="11.64"/><line x1="1" y1="18" x2="3" y2="18"/><line x1="21" y1="18" x2="23" y2="18"/><line x1="18.36" y1="11.64" x2="19.78" y2="10.22"/><line x1="23" y1="22" x2="1" y2="22"/><polyline points="8 6 12 2 16 6"/></> },
  { id: 'wind', label: 'Vento', svg: <><path d="M9.59 4.59A2 2 0 1 1 11 8H2m10.59 11.41A2 2 0 1 0 14 16H2m15.73-8.27A2.5 2.5 0 1 1 19.5 12H2"/></> },
  { id: 'umbrella', label: 'Guarda-chuva', svg: <><path d="M23 12a11.05 11.05 0 0 0-22 0zm-5 7a3 3 0 0 1-6 0v-7"/></> },
  { id: 'feather', label: 'Pena', svg: <><path d="M20.24 12.24a6 6 0 0 0-8.49-8.49L5 10.5V19h8.5z"/><line x1="16" y1="8" x2="2" y2="22"/><line x1="17.5" y1="15" x2="9" y2="15"/></> },
  { id: 'gift', label: 'Presente', svg: <><polyline points="20 12 20 22 4 22 4 12"/><rect x="2" y="7" width="20" height="5"/><line x1="12" y1="22" x2="12" y2="7"/><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"/><path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"/></> },
  { id: 'smile', label: 'Sorriso', svg: <><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></> },
]

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
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 16px;
  margin-bottom: 36px;
`

const bgColors = ['#F7C5D0', '#EDE7F6', '#F3E8FF', '#FFE8EF']

const Card = styled.div`
  border-radius: 20px;
  padding: 28px 20px 24px;
  background: ${({ $index }) => bgColors[$index % bgColors.length]};
  position: relative;
  overflow: hidden;
  opacity: 0;
  animation: ${cardIn} 0.5s forwards;
  animation-delay: ${({ $index }) => $index * 0.07}s;
  transition: transform 0.3s, box-shadow 0.3s;
  text-align: center;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 14px 36px rgba(61,26,94,0.13);
  }
`

const CardIconWrap = styled.div`
  width: 56px; height: 56px;
  border-radius: 50%;
  background: rgba(255,255,255,0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 16px;
  box-shadow: 0 2px 12px rgba(61,26,94,0.1);
`

const CardName = styled.p`
  font-family: 'Playfair Display', serif;
  font-size: 1rem;
  font-weight: 700;
  color: var(--purple-dark);
  margin-bottom: 8px;
  line-height: 1.2;
`

const CardText = styled.p`
  font-family: 'Playfair Display', serif;
  font-style: italic;
  font-size: 0.8rem;
  color: #6B5080;
  line-height: 1.6;
`

const CardAdd = styled.button`
  border-radius: 20px;
  padding: 28px 20px;
  border: 2px dashed rgba(124,77,159,0.25);
  background: transparent;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  cursor: pointer;
  transition: all 0.25s;
  min-height: 160px;
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
  max-width: 440px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
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
  font-family: 'Lato', sans-serif;
  font-size: 0.88rem;
  outline: none;
  resize: vertical;
  min-height: 80px;
  line-height: 1.6;
  transition: border-color 0.2s;

  &:focus { border-color: var(--pink-main); }
  &::placeholder { color: rgba(255,255,255,0.25); }
`

const IconGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 8px;
`

const IconBtn = styled.button`
  aspect-ratio: 1;
  border-radius: 10px;
  border: 1.5px solid ${({ $selected }) => $selected ? 'var(--pink-main)' : 'rgba(180,143,212,0.2)'};
  background: ${({ $selected }) => $selected ? 'rgba(232,130,154,0.2)' : 'rgba(255,255,255,0.04)'};
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  padding: 8px;

  &:hover {
    border-color: var(--pink-main);
    background: rgba(232,130,154,0.15);
  }
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

function IconSvg({ icone }) {
  const found = ICONES.find(i => i.id === icone)
  if (!found) return null
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#7C4D9F" strokeWidth="1.8">
      {found.svg}
    </svg>
  )
}

// ── COMPONENTE ──
export default function Lembrancas() {
  const { isAdmin } = useAuth()
  const [aba, setAba] = useState('dele')
  const [lembrancasDele, setLembrancasDele] = useState([])
  const [lembrancasDela, setLembrancasDela] = useState([])
  const [formOpen, setFormOpen] = useState(false)
  const [nome, setNome] = useState('')
  const [texto, setTexto] = useState('')
  const [icone, setIcone] = useState('heart')

  useEffect(() => {
    async function fetch() {
      const qDele = query(collection(db, 'lembrancas_dele'), orderBy('data', 'asc'))
      const qDela = query(collection(db, 'lembrancas_dela'), orderBy('data', 'asc'))
      const [snapDele, snapDela] = await Promise.all([getDocs(qDele), getDocs(qDela)])
      setLembrancasDele(snapDele.docs.map(d => ({ id: d.id, ...d.data() })))
      setLembrancasDela(snapDela.docs.map(d => ({ id: d.id, ...d.data() })))
    }
    fetch()
  }, [])

  async function handleSubmit() {
    if (!nome.trim() || !texto.trim()) return
    const colecao = aba === 'dele' ? 'lembrancas_dele' : 'lembrancas_dela'
    const nova = { nome, texto, icone, data: new Date() }
    const ref = await addDoc(collection(db, colecao), nova)
    const novaLembranca = { id: ref.id, ...nova }
    if (aba === 'dele') setLembrancasDele(prev => [...prev, novaLembranca])
    else setLembrancasDela(prev => [...prev, novaLembranca])
    setNome(''); setTexto(''); setIcone('heart')
    setFormOpen(false)
  }

  const lembrancas = aba === 'dele' ? lembrancasDele : lembrancasDela
  const podeAdicionar = (isAdmin && aba === 'dele') || aba === 'dela'

  return (
    <Wrapper id="lembrancas">
      <Inner>
        <Eyebrow>nos pequenos detalhes</Eyebrow>
        <Title>Coisas que me <em>lembram você</em></Title>
        <Divider />

        <Tabs>
          <Tab $active={aba === 'dele'} onClick={() => setAba('dele')}>
            Me lembram voce
          </Tab>
          <Tab $active={aba === 'dela'} onClick={() => setAba('dela')}>
            Te lembram de mim
          </Tab>
        </Tabs>

        <Grid>
          {lembrancas.map((l, i) => (
            <Card key={l.id} $index={i}>
              <CardIconWrap>
                <IconSvg icone={l.icone} />
              </CardIconWrap>
              <CardName>{l.nome}</CardName>
              <CardText>{l.texto}</CardText>
            </Card>
          ))}

          {podeAdicionar && (
            <CardAdd onClick={() => setFormOpen(true)}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
              <span>Adicionar</span>
            </CardAdd>
          )}
        </Grid>
      </Inner>

      <FormOverlay $visible={formOpen} onClick={e => e.target === e.currentTarget && setFormOpen(false)}>
        <FormCard $visible={formOpen}>
          <FormTitle>Nova lembrança</FormTitle>
          <FormGroup>
            <FormLabel>O que te lembra?</FormLabel>
            <FormInput
              value={nome}
              onChange={e => setNome(e.target.value)}
              placeholder="Ex: A lua..."
            />
          </FormGroup>
          <FormGroup>
            <FormLabel>Por que te lembra?</FormLabel>
            <FormTextarea
              value={texto}
              onChange={e => setTexto(e.target.value)}
              placeholder="Escreva aqui..."
            />
          </FormGroup>
          <FormGroup>
            <FormLabel>Escolha um ícone</FormLabel>
            <IconGrid>
              {ICONES.map(ic => (
                <IconBtn
                  key={ic.id}
                  $selected={icone === ic.id}
                  onClick={() => setIcone(ic.id)}
                  title={ic.label}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#B48FD4" strokeWidth="1.8">
                    {ic.svg}
                  </svg>
                </IconBtn>
              ))}
            </IconGrid>
          </FormGroup>
          <FormButtons>
            <BtnCancel onClick={() => setFormOpen(false)}>Cancelar</BtnCancel>
            <BtnSubmit onClick={handleSubmit}>Salvar</BtnSubmit>
          </FormButtons>
        </FormCard>
      </FormOverlay>
    </Wrapper>
  )
}