import { useState, useEffect } from 'react'
import { collection, addDoc, getDocs } from 'firebase/firestore'
import { db } from '../../services/firebase'
import { useAuth } from '../../hooks/useAuth'
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet'
import L from 'leaflet'
import styled, { keyframes } from 'styled-components'
import 'leaflet/dist/leaflet.css'

// ── ÍCONE CUSTOMIZADO ──
function createIcon() {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="36" height="44" viewBox="0 0 36 44">
    <defs>
      <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#7C4D9F"/>
        <stop offset="100%" stop-color="#E8829A"/>
      </linearGradient>
    </defs>
    <path d="M18 0C8.06 0 0 8.06 0 18c0 13.5 18 26 18 26S36 31.5 36 18C36 8.06 27.94 0 18 0z" fill="url(#g)"/>
    <circle cx="18" cy="18" r="7" fill="white" opacity="0.9"/>
  </svg>`

  return L.divIcon({
    html: svg,
    iconSize: [36, 44],
    iconAnchor: [18, 44],
    popupAnchor: [0, -44],
    className: ''
  })
}

// ── CLIQUE NO MAPA ──
function MapClick({ onMapClick }) {
  useMapEvents({
    click(e) { onMapClick(e.latlng) }
  })
  return null
}

// ── ANIMAÇÕES ──
const fadeIn = keyframes`
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

const MapWrap = styled.div`
  border-radius: 24px;
  overflow: hidden;
  box-shadow: 0 8px 40px rgba(61,26,94,0.15);
  margin-bottom: 24px;
  border: 1px solid rgba(180,143,212,0.2);
  position: relative;

  .leaflet-container {
    height: 420px;
    width: 100%;
    font-family: 'Lato', sans-serif;

    @media (max-width: 480px) {
      height: 300px;
    }
  }

  .leaflet-control-zoom {
    border: none !important;
    box-shadow: 0 2px 12px rgba(61,26,94,0.15) !important;
    border-radius: 10px !important;
    overflow: hidden;
  }

  .leaflet-popup-content-wrapper {
    border-radius: 16px !important;
    box-shadow: 0 8px 32px rgba(61,26,94,0.2) !important;
    border: 1px solid rgba(180,143,212,0.2) !important;
    padding: 0 !important;
    overflow: hidden;
  }

  .leaflet-popup-content {
    margin: 0 !important;
    width: 220px !important;
  }

  .leaflet-popup-tip-container { display: none; }
`

const MapAddBtn = styled.button`
  position: absolute;
  bottom: 16px;
  right: 16px;
  z-index: 1000;
  display: flex;
  align-items: center;
  gap: 8px;
  font-family: 'Lato', sans-serif;
  font-size: 0.68rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  padding: 10px 20px;
  border-radius: 30px;
  border: none;
  background: linear-gradient(135deg, var(--purple-deep), var(--pink-main));
  color: #fff;
  cursor: pointer;
  box-shadow: 0 4px 18px rgba(124,77,159,0.4);
  transition: transform 0.2s;

  &:hover { transform: translateY(-2px); }
`

const AddingModeMsg = styled.div`
  position: absolute;
  top: 16px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 1000;
  background: rgba(20,8,36,0.8);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(180,143,212,0.3);
  border-radius: 30px;
  padding: 8px 20px;
  font-family: 'Lato', sans-serif;
  font-size: 0.68rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--pink-light);
  white-space: nowrap;
`

const PopupInner = styled.div`
  padding: 16px;
`

const PopupTag = styled.span`
  display: inline-block;
  font-size: 0.58rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  padding: 3px 10px;
  border-radius: 20px;
  background: var(--pink-light);
  color: var(--purple-dark);
  margin-bottom: 6px;
`

const PopupName = styled.p`
  font-family: 'Playfair Display', serif;
  font-size: 1rem;
  font-weight: 700;
  color: var(--purple-dark);
  margin-bottom: 4px;
`

const PopupDesc = styled.p`
  font-family: 'Playfair Display', serif;
  font-style: italic;
  font-size: 0.78rem;
  color: #6B5080;
  line-height: 1.55;
  margin-bottom: 6px;
`

const PopupDate = styled.p`
  font-size: 0.6rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--lilac);
`

const PopupPhoto = styled.img`
  width: 100%;
  height: 100px;
  object-fit: cover;
`

const Chips = styled.div`
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  margin-top: 8px;
`

const Chip = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  border-radius: 30px;
  background: #fff;
  border: 1px solid rgba(180,143,212,0.25);
  box-shadow: 0 2px 10px rgba(61,26,94,0.07);
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: var(--purple-deep);
    border-color: var(--purple-deep);
    span { color: #fff; }
    div { background: #fff; }
  }
`

const ChipDot = styled.div`
  width: 8px; height: 8px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--purple-deep), var(--pink-main));
  flex-shrink: 0;
  transition: background 0.2s;
`

const ChipName = styled.span`
  font-size: 0.72rem;
  letter-spacing: 0.06em;
  color: var(--purple-dark);
  white-space: nowrap;
  transition: color 0.2s;
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
  margin-bottom: 8px;
  font-style: italic;
`

const FormSubtitle = styled.p`
  font-size: 0.72rem;
  color: var(--lilac);
  margin-bottom: 24px;
  font-weight: 300;
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
  cursor: pointer;
  transition: border-color 0.2s;

  option { background: #2A0F45; }
  &:focus { border-color: var(--pink-main); }
`

const CoordInfo = styled.p`
  font-size: 0.65rem;
  color: rgba(180,143,212,0.6);
  margin-top: 6px;
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
export default function Mapa() {
  const { isAdmin } = useAuth()
  const [lugares, setLugares]       = useState([])
  const [formOpen, setFormOpen]     = useState(false)
  const [loading, setLoading]       = useState(false)
  const [coords, setCoords]         = useState(null)
  const [addingMode, setAddingMode] = useState(false)
  const [form, setForm] = useState({
    nome: '', descricao: '', data: '', tag: 'Especial', foto: null
  })

  useEffect(() => {
    async function fetch() {
      const snap = await getDocs(collection(db, 'lugares'))
      setLugares(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    }
    fetch()
  }, [])

  function handleMapClick(latlng) {
    if (!addingMode) return
    setCoords(latlng)
    setAddingMode(false)
    setFormOpen(true)
  }

  async function handleSubmit() {
    if (!form.nome.trim() || !coords) return
    setLoading(true)
    let fotoUrl = null
    if (form.foto) fotoUrl = await uploadImagem(form.foto)
    const novo = {
      nome: form.nome,
      descricao: form.descricao,
      data: form.data ? new Date(form.data) : new Date(),
      tag: form.tag,
      fotoUrl,
      lat: coords.lat,
      lng: coords.lng,
    }
    const ref = await addDoc(collection(db, 'lugares'), novo)
    setLugares(prev => [...prev, { id: ref.id, ...novo }])
    setForm({ nome: '', descricao: '', data: '', tag: 'Especial', foto: null })
    setCoords(null)
    setLoading(false)
    setFormOpen(false)
  }

  function formatDate(data) {
    if (!data) return ''
    const d = data.toDate ? data.toDate() : new Date(data)
    return d.toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' })
  }

  const icon = createIcon()

  return (
    <Wrapper id="mapa">
      <Inner>
        <Eyebrow>onde a gente esteve</Eyebrow>
        <Title>Nossos <em>lugares</em></Title>
        <Divider />

        <MapWrap>
          <MapContainer
            center={[-7.6278, -72.6716]}
            zoom={13}
            scrollWheelZoom={false}
            style={{ height: '420px', width: '100%' }}
          >
            <TileLayer
              attribution='&copy; OpenStreetMap contributors &copy; CARTO'
              url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
            />
            <MapClick onMapClick={handleMapClick} />
            {lugares.map(l => (
              <Marker key={l.id} position={[l.lat, l.lng]} icon={icon}>
                <Popup>
                  {l.fotoUrl && <PopupPhoto src={l.fotoUrl} alt={l.nome} />}
                  <PopupInner>
                    <PopupTag>{l.tag}</PopupTag>
                    <PopupName>{l.nome}</PopupName>
                    {l.descricao && <PopupDesc>{l.descricao}</PopupDesc>}
                    <PopupDate>{formatDate(l.data)}</PopupDate>
                  </PopupInner>
                </Popup>
              </Marker>
            ))}
          </MapContainer>

          {addingMode && (
            <AddingModeMsg>
              Clique no mapa para marcar o lugar
            </AddingModeMsg>
          )}

          <MapAddBtn onClick={() => setAddingMode(true)}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            {addingMode ? 'Clicando...' : 'Marcar lugar'}
          </MapAddBtn>
        </MapWrap>

        <Chips>
          {lugares.map(l => (
            <Chip key={l.id}>
              <ChipDot />
              <ChipName>{l.nome}</ChipName>
            </Chip>
          ))}
        </Chips>
      </Inner>

      <FormOverlay $visible={formOpen} onClick={e => e.target === e.currentTarget && setFormOpen(false)}>
        <FormCard $visible={formOpen}>
          <FormTitle>Novo lugar</FormTitle>
          <FormSubtitle>Ponto marcado no mapa. Preencha os detalhes abaixo.</FormSubtitle>
          <FormGroup>
            <FormLabel>Nome do lugar</FormLabel>
            <FormInput
              value={form.nome}
              onChange={e => setForm(p => ({ ...p, nome: e.target.value }))}
              placeholder="Ex: Restaurante favorito..."
            />
          </FormGroup>
          <FormGroup>
            <FormLabel>Categoria</FormLabel>
            <FormSelect
              value={form.tag}
              onChange={e => setForm(p => ({ ...p, tag: e.target.value }))}
            >
              {['Especial','Encontro','Viagem','Começo','Marco'].map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </FormSelect>
          </FormGroup>
          <FormGroup>
            <FormLabel>O que aconteceu aqui?</FormLabel>
            <FormTextarea
              value={form.descricao}
              onChange={e => setForm(p => ({ ...p, descricao: e.target.value }))}
              placeholder="Conta um pouco sobre esse lugar..."
            />
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
            <FormLabel>Foto (opcional)</FormLabel>
            <FormInput
              type="file"
              accept="image/*"
              onChange={e => setForm(p => ({ ...p, foto: e.target.files[0] }))}
              style={{ padding: '10px 16px' }}
            />
          </FormGroup>
          {coords && (
            <CoordInfo>
              Coordenadas: {coords.lat.toFixed(4)}, {coords.lng.toFixed(4)}
            </CoordInfo>
          )}
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