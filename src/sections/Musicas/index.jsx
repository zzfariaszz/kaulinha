import { useState, useEffect } from 'react'
import { collection, addDoc, getDocs, orderBy, query, serverTimestamp } from 'firebase/firestore'
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
  background: var(--purple-dark);
  padding: 80px 24px;
  overflow-x: hidden;

  &::before {
    content: '';
    position: fixed;
    inset: 0;
    background-image:
      radial-gradient(circle at 15% 15%, rgba(124,77,159,0.15) 0%, transparent 50%),
      radial-gradient(circle at 85% 85%, rgba(232,130,154,0.12) 0%, transparent 50%);
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
    background: linear-gradient(135deg, var(--lilac), var(--pink-main));
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
`

const Divider = styled.div`
  width: 50px; height: 1.5px;
  background: linear-gradient(90deg, var(--lilac), var(--pink-main));
  margin: 16px auto 48px;
  border-radius: 2px;
`

const Grid = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 36px;
`

const Card = styled.div`
  background: rgba(255,255,255,0.05);
  border: 1px solid rgba(180,143,212,0.15);
  border-radius: 16px;
  padding: 16px 20px;
  display: flex;
  align-items: center;
  gap: 16px;
  opacity: 0;
  animation: ${cardIn} 0.5s forwards;
  animation-delay: ${({ $index }) => $index * 0.07}s;
  transition: background 0.2s, transform 0.2s;

  &:hover {
    background: rgba(255,255,255,0.08);
    transform: translateX(4px);
  }
`

const CardNumber = styled.span`
  font-family: 'Playfair Display', serif;
  font-size: 1.1rem;
  font-weight: 700;
  color: rgba(255,255,255,0.15);
  min-width: 28px;
  text-align: right;
`

const CardIcon = styled.div`
  width: 44px; height: 44px;
  border-radius: 10px;
  background: linear-gradient(135deg, var(--purple-deep), var(--pink-main));
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  box-shadow: 0 4px 12px rgba(124,77,159,0.4);
`

const CardInfo = styled.div`
  flex: 1;
  min-width: 0;
`

const CardTitle = styled.p`
  font-family: 'Playfair Display', serif;
  font-size: 0.95rem;
  font-weight: 700;
  color: #fff;
  margin-bottom: 3px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`

const CardArtist = styled.p`
  font-size: 0.75rem;
  color: var(--lilac);
  font-weight: 300;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`

const CardNote = styled.p`
  font-family: 'Playfair Display', serif;
  font-style: italic;
  font-size: 0.75rem;
  color: rgba(255,255,255,0.35);
  text-align: right;
  max-width: 160px;
  line-height: 1.4;
  flex-shrink: 0;

  @media (max-width: 480px) { display: none; }
`

const SpotifyEmbed = styled.div`
  margin-bottom: 48px;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 8px 32px rgba(0,0,0,0.3);

  iframe {
    display: block;
    border-radius: 16px;
  }
`

const AddBtn = styled.button`
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
  border: 1.5px dashed rgba(180,143,212,0.4);
  background: transparent;
  color: var(--lilac);
  cursor: pointer;
  transition: all 0.25s;

  &:hover {
    background: rgba(180,143,212,0.1);
    border-color: var(--lilac);
    color: #fff;
  }
`

// ── FORM ──
const FormOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(20,8,36,0.8);
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

// ── COMPONENTE ──
export default function Musicas() {
  const { isLogado } = useAuth()
  const [musicas, setMusicas]   = useState([])
  const [formOpen, setFormOpen] = useState(false)
  const [form, setForm]         = useState({ titulo: '', artista: '', nota: '', spotifyId: '' })
  const [playlistId, setPlaylistId] = useState('')

  useEffect(() => {
    async function fetchData() {
      try {
        const q = query(collection(db, 'musicas'), orderBy('data', 'asc'))
        const snap = await getDocs(q)
        setMusicas(snap.docs.map(d => ({ id: d.id, ...d.data() })))

        const playlistSnap = await getDocs(collection(db, 'config'))
        playlistSnap.docs.forEach(d => {
          if (d.id === 'spotify') setPlaylistId(d.data().playlistId || '')
        })
      } catch (err) {
        console.error('Erro ao carregar músicas:', err)
      }
    }
    fetchData()
  }, [])

  async function handleSubmit() {
    if (!form.titulo.trim()) return
    try {
      const nova = { ...form, data: serverTimestamp() }
      const ref = await addDoc(collection(db, 'musicas'), nova)
      setMusicas(prev => [...prev, { id: ref.id, ...nova, data: new Date() }])
      setForm({ titulo: '', artista: '', nota: '', spotifyId: '' })
      setFormOpen(false)
    } catch (err) {
      console.error('Erro ao salvar:', err)
      alert('Erro ao salvar a música')
    }
  }

  return (
    <Wrapper id="musicas">
      <Inner>
        <Eyebrow>músicas pra nós</Eyebrow>
        <Title>Nossas <em>Músicas</em></Title>
        <Divider />

        {playlistId && (
          <SpotifyEmbed>
            <iframe
              src={`https://open.spotify.com/embed/playlist/${playlistId}?utm_source=generator&theme=0`}
              width="100%"
              height="352"
              frameBorder="0"
              allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
              loading="lazy"
            />
          </SpotifyEmbed>
        )}

        <Grid>
          {musicas.map((m, i) => (
            <Card key={m.id} $index={i}>
              <CardNumber>{String(i + 1).padStart(2, '0')}</CardNumber>
              <CardIcon>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2">
                  <path d="M9 18V5l12-2v13"/>
                  <circle cx="6" cy="18" r="3"/>
                  <circle cx="18" cy="16" r="3"/>
                </svg>
              </CardIcon>
              <CardInfo>
                <CardTitle>{m.titulo}</CardTitle>
                <CardArtist>{m.artista}</CardArtist>
              </CardInfo>
              {m.nota && <CardNote>{m.nota}</CardNote>}
            </Card>
          ))}
        </Grid>

        {isLogado && (
          <AddBtn onClick={() => setFormOpen(true)}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            Adicionar música
          </AddBtn>
        )}
      </Inner>

      <FormOverlay $visible={formOpen} onClick={e => e.target === e.currentTarget && setFormOpen(false)}>
        <FormCard $visible={formOpen}>
          <FormTitle>Nova música</FormTitle>
          <FormGroup>
            <FormLabel>Nome da música</FormLabel>
            <FormInput
              value={form.titulo}
              onChange={e => setForm(p => ({ ...p, titulo: e.target.value }))}
              placeholder="Ex: Lover..."
            />
          </FormGroup>
          <FormGroup>
            <FormLabel>Artista</FormLabel>
            <FormInput
              value={form.artista}
              onChange={e => setForm(p => ({ ...p, artista: e.target.value }))}
              placeholder="Ex: Taylor Swift..."
            />
          </FormGroup>
          <FormGroup>
            <FormLabel>Por que essa música? (opcional)</FormLabel>
            <FormInput
              value={form.nota}
              onChange={e => setForm(p => ({ ...p, nota: e.target.value }))}
              placeholder="Ex: toca toda vez que penso em você..."
            />
          </FormGroup>
          <FormGroup>
            <FormLabel>ID da música no Spotify (opcional)</FormLabel>
            <FormInput
              value={form.spotifyId}
              onChange={e => setForm(p => ({ ...p, spotifyId: e.target.value }))}
              placeholder="Ex: 1dGr1c8CrMLDpV6mPbImSI"
            />
            <FormHint>
              O ID fica no link da música: open.spotify.com/track/<strong>ID_AQUI</strong>
            </FormHint>
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