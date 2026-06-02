import { useState, useEffect } from 'react'
import { collection, addDoc, getDocs, updateDoc, doc, orderBy, query } from 'firebase/firestore'
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
      radial-gradient(circle at 10% 20%, rgba(124,77,159,0.06) 0%, transparent 50%),
      radial-gradient(circle at 90% 80%, rgba(232,130,154,0.07) 0%, transparent 50%);
    pointer-events: none;
  }
`

const Inner = styled.div`
  position: relative;
  z-index: 1;
  max-width: 760px;
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
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 16px;
  margin-bottom: 36px;
`

const Card = styled.div`
  border-radius: 20px;
  padding: 24px;
  background: ${({ $realizado }) => $realizado ? 'linear-gradient(135deg, #EDE7F6, #F7C5D0)' : '#fff'};
  border: 1px solid ${({ $realizado }) => $realizado ? 'rgba(124,77,159,0.2)' : 'rgba(180,143,212,0.2)'};
  box-shadow: 0 4px 20px rgba(61,26,94,0.08);
  position: relative;
  overflow: hidden;
  opacity: 0;
  animation: ${cardIn} 0.5s forwards;
  animation-delay: ${({ $index }) => $index * 0.07}s;
  transition: transform 0.3s, box-shadow 0.3s;
  cursor: pointer;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 32px rgba(61,26,94,0.14);
  }
`

const CardSelo = styled.div`
  position: absolute;
  top: 14px;
  right: 14px;
  width: 28px; height: 28px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--purple-deep), var(--pink-main));
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 8px rgba(124,77,159,0.4);
`

const CardStatus = styled.span`
  display: inline-block;
  font-size: 0.58rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  padding: 3px 10px;
  border-radius: 20px;
  margin-bottom: 12px;
  background: ${({ $realizado }) => $realizado ? 'rgba(124,77,159,0.15)' : 'rgba(232,130,154,0.15)'};
  color: ${({ $realizado }) => $realizado ? 'var(--purple-deep)' : 'var(--pink-main)'};
`

const CardTitle = styled.h3`
  font-family: 'Playfair Display', serif;
  font-size: 1rem;
  font-weight: 700;
  color: var(--purple-dark);
  margin-bottom: 8px;
  line-height: 1.3;
  padding-right: 32px;
`

const CardDesc = styled.p`
  font-family: 'Playfair Display', serif;
  font-style: italic;
  font-size: 0.82rem;
  color: #6B5080;
  line-height: 1.6;
  margin-bottom: 12px;
`

const CardPhoto = styled.img`
  width: 100%;
  height: 120px;
  object-fit: cover;
  border-radius: 10px;
  margin-bottom: 10px;
`

const CardDate = styled.p`
  font-size: 0.62rem;
  letter-spacing: 0.08em;
  color: var(--lilac);
`

const CardAdd = styled.button`
  border-radius: 20px;
  padding: 24px;
  border: 2px dashed rgba(124,77,159,0.25);
  background: transparent;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  cursor: pointer;
  transition: all 0.25s;
  min-height: 140px;
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

// ── DETALHE MODAL ──
const DetailOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(20,8,36,0.7);
  backdrop-filter: blur(8px);
  z-index: 300;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  opacity: ${({ $visible }) => $visible ? 1 : 0};
  pointer-events: ${({ $visible }) => $visible ? 'all' : 'none'};
  transition: opacity 0.35s;
`

const DetailCard = styled.div`
  background: #2A0F45;
  border: 1px solid rgba(180,143,212,0.2);
  border-radius: 20px;
  padding: 40px 36px;
  max-width: 420px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  transform: ${({ $visible }) => $visible ? 'translateY(0) scale(1)' : 'translateY(20px) scale(0.96)'};
  transition: transform 0.35s;
`

const DetailTitle = styled.h3`
  font-family: 'Playfair Display', serif;
  font-size: 1.3rem;
  color: #fff;
  margin-bottom: 24px;
  font-style: italic;
`

const DetailPhoto = styled.img`
  width: 100%;
  border-radius: 12px;
  margin-bottom: 16px;
`

const DetailGroup = styled.div`
  margin-bottom: 16px;
`

const DetailLabel = styled.label`
  display: block;
  font-size: 0.65rem;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--lilac);
  margin-bottom: 8px;
  font-weight: 300;
`

const DetailInput = styled.input`
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
`

const BtnRealizar = styled.button`
  width: 100%;
  padding: 13px;
  border-radius: 30px;
  border: none;
  background: linear-gradient(135deg, var(--purple-deep), var(--pink-main));
  color: #fff;
  font-family: 'Lato', sans-serif;
  font-size: 0.72rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  cursor: pointer;
  box-shadow: 0 4px 16px rgba(232,130,154,0.3);
  transition: all 0.2s;
  margin-bottom: 10px;

  &:hover { transform: translateY(-2px); }
  &:disabled { opacity: 0.5; cursor: not-allowed; }
`

const BtnFechar = styled.button`
  width: 100%;
  padding: 12px;
  border-radius: 30px;
  border: 1px solid rgba(255,255,255,0.15);
  background: transparent;
  color: rgba(255,255,255,0.5);
  font-family: 'Lato', sans-serif;
  font-size: 0.72rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  cursor: pointer;
  transition: all 0.2s;

  &:hover { background: rgba(255,255,255,0.06); color: #fff; }
`

// ── FORM ──
const FormOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(20,8,36,0.7);
  backdrop-filter: blur(8px);
  z-index: 400;
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

// ── CLOUDINARY ──
const CLOUD_NAME    = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET

async function uploadImagem(file) {
  const form = new FormData()
  form.append('file', file)
  form.append('upload_preset', UPLOAD_PRESET)
  const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
    method: 'POST', body: form,
  })
  const data = await res.json()
  return data.secure_url
}

// ── COMPONENTE ──
export default function Planos() {
  const { isAdmin } = useAuth()
  const [aba, setAba]               = useState('sonhos')
  const [planos, setPlanos]         = useState([])
  const [planoAberto, setPlanoAberto] = useState(null)
  const [formOpen, setFormOpen]     = useState(false)
  const [loading, setLoading]       = useState(false)
  const [realizandoFoto, setRealizandoFoto] = useState(null)
  const [form, setForm] = useState({ titulo: '', descricao: '' })

  useEffect(() => {
    async function fetch() {
      const q = query(collection(db, 'planos'), orderBy('data', 'desc'))
      const snap = await getDocs(q)
      setPlanos(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    }
    fetch()
  }, [])

  const filtrados = planos.filter(p => aba === 'sonhos' ? !p.realizado : p.realizado)

  async function handleSubmit() {
    if (!form.titulo.trim()) return
    const novo = { titulo: form.titulo, descricao: form.descricao, realizado: false, data: new Date() }
    const ref = await addDoc(collection(db, 'planos'), novo)
    setPlanos(prev => [{ id: ref.id, ...novo }, ...prev])
    setForm({ titulo: '', descricao: '' })
    setFormOpen(false)
  }

  async function handleRealizar() {
    if (!planoAberto) return
    setLoading(true)
    let fotoUrl = null
    if (realizandoFoto) fotoUrl = await uploadImagem(realizandoFoto)
    const updates = { realizado: true, dataRealizado: new Date(), fotoUrl }
    await updateDoc(doc(db, 'planos', planoAberto.id), updates)
    setPlanos(prev => prev.map(p => p.id === planoAberto.id ? { ...p, ...updates } : p))
    setPlanoAberto(null)
    setRealizandoFoto(null)
    setLoading(false)
  }

  function formatDate(data) {
    if (!data) return ''
    const d = data.toDate ? data.toDate() : new Date(data)
    return d.toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' })
  }

  return (
    <Wrapper id="planos">
      <Inner>
        <Eyebrow>o que queremos viver</Eyebrow>
        <Title>Planos e <em>sonhos</em></Title>
        <Divider />

        <Tabs>
          <Tab $active={aba === 'sonhos'} onClick={() => setAba('sonhos')}>
            Sonhos
          </Tab>
          <Tab $active={aba === 'realizados'} onClick={() => setAba('realizados')}>
            Realizados
          </Tab>
        </Tabs>

        <Grid>
          {filtrados.map((p, i) => (
            <Card key={p.id} $index={i} $realizado={p.realizado} onClick={() => setPlanoAberto(p)}>
              {p.realizado && (
                <CardSelo>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                </CardSelo>
              )}
              {p.fotoUrl && <CardPhoto src={p.fotoUrl} alt={p.titulo} />}
              <CardStatus $realizado={p.realizado}>
                {p.realizado ? 'Realizado' : 'Sonho'}
              </CardStatus>
              <CardTitle>{p.titulo}</CardTitle>
              {p.descricao && <CardDesc>{p.descricao}</CardDesc>}
              {p.dataRealizado && <CardDate>{formatDate(p.dataRealizado)}</CardDate>}
            </Card>
          ))}

          <CardAdd onClick={() => setFormOpen(true)}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            <span>Novo plano</span>
          </CardAdd>
        </Grid>
      </Inner>

      {/* Detalhe */}
      <DetailOverlay $visible={!!planoAberto} onClick={e => e.target === e.currentTarget && setPlanoAberto(null)}>
        {planoAberto && (
          <DetailCard $visible={!!planoAberto}>
            <DetailTitle>{planoAberto.titulo}</DetailTitle>
            {planoAberto.fotoUrl && <DetailPhoto src={planoAberto.fotoUrl} alt={planoAberto.titulo} />}
            {!planoAberto.realizado && (
              <>
                <DetailGroup>
                  <DetailLabel>Adicionar foto ao realizar (opcional)</DetailLabel>
                  <DetailInput
                    type="file"
                    accept="image/*"
                    onChange={e => setRealizandoFoto(e.target.files[0])}
                    style={{ padding: '10px 16px' }}
                  />
                </DetailGroup>
                <BtnRealizar onClick={handleRealizar} disabled={loading}>
                  {loading ? 'Salvando...' : 'Marcar como realizado'}
                </BtnRealizar>
              </>
            )}
            {planoAberto.realizado && planoAberto.dataRealizado && (
              <p style={{ color: 'var(--lilac)', fontSize: '0.72rem', marginBottom: '20px' }}>
                Realizado em {formatDate(planoAberto.dataRealizado)}
              </p>
            )}
            <BtnFechar onClick={() => setPlanoAberto(null)}>Fechar</BtnFechar>
          </DetailCard>
        )}
      </DetailOverlay>

      {/* Form */}
      <FormOverlay $visible={formOpen} onClick={e => e.target === e.currentTarget && setFormOpen(false)}>
        <FormCard $visible={formOpen}>
          <FormTitle>Novo plano</FormTitle>
          <FormGroup>
            <FormLabel>Título</FormLabel>
            <FormInput
              value={form.titulo}
              onChange={e => setForm(p => ({ ...p, titulo: e.target.value }))}
              placeholder="Ex: Viajar para o litoral..."
            />
          </FormGroup>
          <FormGroup>
            <FormLabel>Descrição (opcional)</FormLabel>
            <FormTextarea
              value={form.descricao}
              onChange={e => setForm(p => ({ ...p, descricao: e.target.value }))}
              placeholder="Conta um pouco sobre esse sonho..."
            />
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