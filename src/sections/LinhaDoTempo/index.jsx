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
  from { opacity: 0; transform: translateY(20px); }
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
      radial-gradient(circle at 10% 20%, rgba(124,77,159,0.06) 0%, transparent 50%),
      radial-gradient(circle at 90% 80%, rgba(232,130,154,0.07) 0%, transparent 50%);
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
  margin: 16px auto 56px;
  border-radius: 2px;
`

const Timeline = styled.div`
  position: relative;
  padding-bottom: 40px;

  &::before {
    content: '';
    position: absolute;
    top: 0; bottom: 0;
    left: 50%;
    transform: translateX(-50%);
    width: 2px;
    background: linear-gradient(180deg, var(--purple-deep), var(--pink-main), var(--lilac));
    border-radius: 2px;
    opacity: 0.3;
  }

  @media (max-width: 520px) {
    &::before { left: 20px; }
  }
`

const Event = styled.div`
  display: flex;
  align-items: flex-start;
  margin-bottom: 48px;
  position: relative;
  opacity: 0;
  animation: ${cardIn} 0.6s forwards;
  animation-delay: ${({ $index }) => $index * 0.1}s;
  flex-direction: ${({ $index }) => $index % 2 === 0 ? 'row' : 'row-reverse'};

  @media (max-width: 520px) {
    flex-direction: column;
    padding-left: 48px;
  }
`

const Dot = styled.div`
  position: absolute;
  left: 50%;
  top: 20px;
  transform: translateX(-50%);
  width: 16px; height: 16px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--purple-deep), var(--pink-main));
  box-shadow: 0 0 0 4px var(--bg), 0 0 0 6px rgba(124,77,159,0.25);
  z-index: 2;

  @media (max-width: 520px) {
    left: 20px;
  }
`

const tagColors = {
  'Começo':   '#F7C5D0',
  'Encontro': '#EDE7F6',
  'Marco':    '#E8D5F5',
  'Viagem':   '#FFE8EF',
  'Especial': '#F3E8FF',
}

const Card = styled.div`
  width: calc(50% - 36px);
  background: #fff;
  border-radius: 18px;
  padding: 24px;
  box-shadow: 0 4px 20px rgba(61,26,94,0.08);
  border: 1px solid rgba(180,143,212,0.15);
  transition: transform 0.3s, box-shadow 0.3s;
  position: relative;
  margin-left: ${({ $index }) => $index % 2 === 0 ? 'auto' : '0'};
  margin-right: ${({ $index }) => $index % 2 === 0 ? '36px' : 'auto'};

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 32px rgba(61,26,94,0.14);
  }

  &::after {
    content: '';
    position: absolute;
    top: 22px;
    ${({ $index }) => $index % 2 === 0 ? 'right: -8px;' : 'left: -8px;'}
    width: 16px; height: 16px;
    background: #fff;
    border-right: ${({ $index }) => $index % 2 === 0 ? '1px solid rgba(180,143,212,0.15)' : 'none'};
    border-top: ${({ $index }) => $index % 2 === 0 ? '1px solid rgba(180,143,212,0.15)' : 'none'};
    border-left: ${({ $index }) => $index % 2 !== 0 ? '1px solid rgba(180,143,212,0.15)' : 'none'};
    border-bottom: ${({ $index }) => $index % 2 !== 0 ? '1px solid rgba(180,143,212,0.15)' : 'none'};
    transform: rotate(45deg);
  }

  @media (max-width: 520px) {
    width: 100%;
    margin: 0;
    &::after { display: none; }
  }
`

const Tag = styled.span`
  display: inline-block;
  font-size: 0.6rem;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  padding: 4px 12px;
  border-radius: 20px;
  margin-bottom: 10px;
  background: ${({ $tag }) => tagColors[$tag] || '#F7C5D0'};
  color: var(--purple-dark);
`

const EventDate = styled.p`
  font-size: 0.65rem;
  letter-spacing: 0.1em;
  color: var(--lilac);
  font-weight: 300;
  margin-bottom: 6px;
`

const EventTitle = styled.h3`
  font-family: 'Playfair Display', serif;
  font-size: 1.05rem;
  font-weight: 700;
  color: var(--purple-dark);
  margin-bottom: 8px;
  line-height: 1.3;
`

const EventDesc = styled.p`
  font-size: 0.82rem;
  color: #6B5080;
  line-height: 1.65;
  font-weight: 300;
`

const EventPhoto = styled.img`
  margin-top: 14px;
  width: 100%;
  height: 120px;
  border-radius: 10px;
  object-fit: cover;
`

const AddEvent = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  margin: 0 auto;
  position: relative;
  z-index: 2;
  cursor: pointer;
`

const AddDot = styled.div`
  width: 40px; height: 40px;
  border-radius: 50%;
  border: 2px dashed rgba(124,77,159,0.35);
  background: var(--bg);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--purple-deep);
  transition: all 0.25s;

  &:hover {
    background: var(--purple-deep);
    color: #fff;
    border-style: solid;
    border-color: var(--purple-deep);
  }
`

const AddLabel = styled.span`
  font-size: 0.65rem;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--purple-deep);
  font-weight: 300;
`

// ── FORM ──
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

const FormSelect = styled.select`
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
  cursor: pointer;

  option { background: #2A0F45; color: #fff; }
  &:focus { border-color: var(--pink-main); }
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
  min-height: 90px;
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

// ── UPLOAD CLOUDINARY ──
const CLOUD_NAME   = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET

async function uploadImagem(file) {
  const form = new FormData()
  form.append('file', file)
  form.append('upload_preset', UPLOAD_PRESET)
  const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
    method: 'POST',
    body: form,
  })
  const data = await res.json()
  return data.secure_url
}

// ── COMPONENTE ──
export default function LinhaDoTempo() {
  const { isAdmin } = useAuth()
  const [eventos, setEventos] = useState([])
  const [formOpen, setFormOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    titulo: '', descricao: '', data: '', tag: 'Marco', foto: null
  })

  useEffect(() => {
    async function fetch() {
      const q = query(collection(db, 'timeline'), orderBy('data', 'asc'))
      const snap = await getDocs(q)
      setEventos(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    }
    fetch()
  }, [])

  function formatDate(data) {
    if (!data) return ''
    const d = data.toDate ? data.toDate() : new Date(data)
    return d.toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' })
  }

  async function handleSubmit() {
    if (!form.titulo.trim() || !form.descricao.trim()) return
    setLoading(true)
    let fotoUrl = null
    if (form.foto) fotoUrl = await uploadImagem(form.foto)
    const novo = {
      titulo: form.titulo,
      descricao: form.descricao,
      data: form.data ? new Date(form.data) : new Date(),
      tag: form.tag,
      fotoUrl,
    }
    const ref = await addDoc(collection(db, 'timeline'), novo)
    setEventos(prev => [...prev, { id: ref.id, ...novo }].sort((a, b) => {
      const da = a.data.toDate ? a.data.toDate() : new Date(a.data)
      const db2 = b.data.toDate ? b.data.toDate() : new Date(b.data)
      return da - db2
    }))
    setForm({ titulo: '', descricao: '', data: '', tag: 'Marco', foto: null })
    setLoading(false)
    setFormOpen(false)
  }

  return (
    <Wrapper id="timeline">
      <Inner>
        <Eyebrow>cada momento importa</Eyebrow>
        <Title>Nossa <em>história</em></Title>
        <Divider />

        <Timeline>
          {eventos.map((ev, i) => (
            <Event key={ev.id} $index={i}>
              <Dot />
              <Card $index={i}>
                <Tag $tag={ev.tag}>{ev.tag}</Tag>
                <EventDate>{formatDate(ev.data)}</EventDate>
                <EventTitle>{ev.titulo}</EventTitle>
                <EventDesc>{ev.descricao}</EventDesc>
                {ev.fotoUrl && <EventPhoto src={ev.fotoUrl} alt={ev.titulo} />}
              </Card>
            </Event>
          ))}

          <AddEvent onClick={() => setFormOpen(true)}>
            <AddDot>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
            </AddDot>
            <AddLabel>Adicionar momento</AddLabel>
          </AddEvent>
        </Timeline>
      </Inner>

      <FormOverlay $visible={formOpen} onClick={e => e.target === e.currentTarget && setFormOpen(false)}>
        <FormCard $visible={formOpen}>
          <FormTitle>Novo momento</FormTitle>
          <FormGroup>
            <FormLabel>Título</FormLabel>
            <FormInput
              value={form.titulo}
              onChange={e => setForm(p => ({ ...p, titulo: e.target.value }))}
              placeholder="Ex: Primeiro encontro..."
            />
          </FormGroup>
          <FormGroup>
            <FormLabel>Categoria</FormLabel>
            <FormSelect
              value={form.tag}
              onChange={e => setForm(p => ({ ...p, tag: e.target.value }))}
            >
              {['Começo','Encontro','Marco','Viagem','Especial'].map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </FormSelect>
          </FormGroup>
          <FormGroup>
            <FormLabel>Data</FormLabel>
            <FormInput
              type="date"
              value={form.data}
              onChange={e => setForm(p => ({ ...p, data: e.target.value }))}
            />
          </FormGroup>
          <FormGroup>
            <FormLabel>Descrição</FormLabel>
            <FormTextarea
              value={form.descricao}
              onChange={e => setForm(p => ({ ...p, descricao: e.target.value }))}
              placeholder="Conta o que aconteceu..."
            />
          </FormGroup>
          <FormGroup>
            <FormLabel>Foto (opcional)</FormLabel>
            <FormInput
              type="file"
              accept="image/*"
              onChange={e => setForm(p => ({ ...p, foto: e.target.files[0] }))}
              style={{ padding: '10px 16px' }}
            />
          </FormGroup>
          <FormButtons>
            <BtnCancel onClick={() => setFormOpen(false)}>Cancelar</BtnCancel>
            <BtnSubmit onClick={handleSubmit} disabled={loading}>
              {loading ? 'Salvando...' : 'Salvar'}
            </BtnSubmit>
          </FormButtons>
        </FormCard>
      </FormOverlay>
    </Wrapper>
  )
}