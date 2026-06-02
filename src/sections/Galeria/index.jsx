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

const photoIn = keyframes`
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
  margin: 16px auto 40px;
  border-radius: 2px;
`

const Masonry = styled.div`
  columns: 3;
  column-gap: 14px;
  margin-bottom: 36px;

  @media (max-width: 560px) { columns: 2; }
`

const PhotoItem = styled.div`
  break-inside: avoid;
  margin-bottom: 14px;
  position: relative;
  border-radius: 14px;
  overflow: hidden;
  cursor: pointer;
  opacity: 0;
  animation: ${photoIn} 0.5s forwards;
  animation-delay: ${({ $index }) => $index * 0.07}s;

  &:hover img { transform: scale(1.04); }
  &:hover .overlay { opacity: 1; }
`

const Photo = styled.img`
  width: 100%;
  display: block;
  border-radius: 14px;
  transition: transform 0.4s ease;
`

const PhotoOverlay = styled.div`
  className: overlay;
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, transparent 40%, rgba(61,26,94,0.75) 100%);
  border-radius: 14px;
  opacity: 0;
  transition: opacity 0.3s;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  padding: 14px;
`

const OverlayCaption = styled.p`
  font-family: 'Dancing Script', cursive;
  font-size: 0.9rem;
  color: #fff;
  line-height: 1.3;
`

const OverlayDate = styled.p`
  font-size: 0.58rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: rgba(255,255,255,0.6);
  margin-top: 3px;
`

const UploadBtn = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0 auto;
  font-family: 'Lato', sans-serif;
  font-size: 0.72rem;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  padding: 13px 28px;
  border-radius: 40px;
  border: 1.5px dashed rgba(124,77,159,0.35);
  background: transparent;
  color: var(--purple-deep);
  cursor: pointer;
  transition: all 0.25s;

  &:hover {
    background: var(--purple-deep);
    color: #fff;
    border-style: solid;
    box-shadow: 0 6px 20px rgba(124,77,159,0.3);
  }
`

// ── LIGHTBOX ──
const LightboxOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(20,8,36,0.92);
  backdrop-filter: blur(12px);
  z-index: 300;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  opacity: ${({ $visible }) => $visible ? 1 : 0};
  pointer-events: ${({ $visible }) => $visible ? 'all' : 'none'};
  transition: opacity 0.35s;
`

const LightboxInner = styled.div`
  max-width: 520px;
  width: 100%;
  text-align: center;
  transform: ${({ $visible }) => $visible ? 'scale(1)' : 'scale(0.94)'};
  transition: transform 0.35s;
`

const LightboxPhoto = styled.img`
  width: 100%;
  border-radius: 16px;
  margin-bottom: 20px;
  box-shadow: 0 16px 48px rgba(0,0,0,0.4);
`

const LightboxCaption = styled.p`
  font-family: 'Dancing Script', cursive;
  font-size: 1.4rem;
  color: #fff;
  margin-bottom: 4px;
`

const LightboxDate = styled.p`
  font-size: 0.65rem;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--lilac);
  margin-bottom: 24px;
`

const LightboxClose = styled.button`
  width: 36px; height: 36px;
  border-radius: 50%;
  border: 1px solid rgba(255,255,255,0.2);
  background: transparent;
  color: rgba(255,255,255,0.6);
  cursor: pointer;
  font-size: 1rem;
  transition: all 0.2s;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover { background: rgba(255,255,255,0.1); color: #fff; }
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

const PreviewImg = styled.img`
  width: 100%;
  border-radius: 10px;
  margin-top: 10px;
  max-height: 200px;
  object-fit: cover;
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
  &:disabled { opacity: 0.6; cursor: not-allowed; }
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
export default function Galeria() {
  const { isAdmin } = useAuth()
  const [fotos, setFotos]           = useState([])
  const [fotoAberta, setFotoAberta] = useState(null)
  const [formOpen, setFormOpen]     = useState(false)
  const [loading, setLoading]       = useState(false)
  const [preview, setPreview]       = useState(null)
  const [form, setForm] = useState({ legenda: '', data: '', arquivo: null })

  useEffect(() => {
    async function fetch() {
      const q = query(collection(db, 'galeria'), orderBy('data', 'desc'))
      const snap = await getDocs(q)
      setFotos(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    }
    fetch()
  }, [])

  function handleFile(e) {
    const file = e.target.files[0]
    if (!file) return
    setForm(p => ({ ...p, arquivo: file }))
    setPreview(URL.createObjectURL(file))
  }

  async function handleSubmit() {
    if (!form.arquivo) return
    setLoading(true)
    const fotoUrl = await uploadImagem(form.arquivo)
    const nova = {
      fotoUrl,
      legenda: form.legenda,
      data: form.data ? new Date(form.data) : new Date(),
    }
    const ref = await addDoc(collection(db, 'galeria'), nova)
    setFotos(prev => [{ id: ref.id, ...nova }, ...prev])
    setForm({ legenda: '', data: '', arquivo: null })
    setPreview(null)
    setLoading(false)
    setFormOpen(false)
  }

  function formatDate(data) {
    if (!data) return ''
    const d = data.toDate ? data.toDate() : new Date(data)
    return d.toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' })
  }

  return (
    <Wrapper id="galeria">
      <Inner>
        <Eyebrow>nossos momentos</Eyebrow>
        <Title>Nossa <em>galeria</em></Title>
        <Divider />

        <Masonry>
          {fotos.map((f, i) => (
            <PhotoItem key={f.id} $index={i} onClick={() => setFotoAberta(f)}>
              <Photo src={f.fotoUrl} alt={f.legenda} />
              <PhotoOverlay className="overlay">
                {f.legenda && <OverlayCaption>{f.legenda}</OverlayCaption>}
                <OverlayDate>{formatDate(f.data)}</OverlayDate>
              </PhotoOverlay>
            </PhotoItem>
          ))}
        </Masonry>

        <UploadBtn onClick={() => setFormOpen(true)}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          Adicionar foto
        </UploadBtn>
      </Inner>

      {/* Lightbox */}
      <LightboxOverlay $visible={!!fotoAberta} onClick={e => e.target === e.currentTarget && setFotoAberta(null)}>
        <LightboxInner $visible={!!fotoAberta}>
          {fotoAberta && <LightboxPhoto src={fotoAberta.fotoUrl} alt={fotoAberta.legenda} />}
          {fotoAberta?.legenda && <LightboxCaption>{fotoAberta.legenda}</LightboxCaption>}
          <LightboxDate>{formatDate(fotoAberta?.data)}</LightboxDate>
          <LightboxClose onClick={() => setFotoAberta(null)}>✕</LightboxClose>
        </LightboxInner>
      </LightboxOverlay>

      {/* Form */}
      <FormOverlay $visible={formOpen} onClick={e => e.target === e.currentTarget && setFormOpen(false)}>
        <FormCard $visible={formOpen}>
          <FormTitle>Adicionar foto</FormTitle>
          <FormGroup>
            <FormLabel>Foto</FormLabel>
            <FormInput type="file" accept="image/*" onChange={handleFile} style={{ padding: '10px 16px' }} />
            {preview && <PreviewImg src={preview} alt="preview" />}
          </FormGroup>
          <FormGroup>
            <FormLabel>Legenda (opcional)</FormLabel>
            <FormInput
              value={form.legenda}
              onChange={e => setForm(p => ({ ...p, legenda: e.target.value }))}
              placeholder="Ex: nossa primeira viagem..."
            />
          </FormGroup>
          <FormGroup>
            <FormLabel>Data (opcional)</FormLabel>
            <FormInput
              type="date"
              value={form.data}
              onChange={e => setForm(p => ({ ...p, data: e.target.value }))}
            />
          </FormGroup>
          <FormButtons>
            <BtnCancel onClick={() => { setFormOpen(false); setPreview(null) }}>Cancelar</BtnCancel>
            <BtnSubmit onClick={handleSubmit} disabled={loading}>
              {loading ? 'Enviando...' : 'Salvar'}
            </BtnSubmit>
          </FormButtons>
        </FormCard>
      </FormOverlay>
    </Wrapper>
  )
}