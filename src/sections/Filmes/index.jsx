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
  max-width: 760px;
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
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 16px;
  margin-bottom: 40px;

  @media (max-width: 480px) {
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
  }
`

const Card = styled.div`
  border-radius: 16px;
  overflow: hidden;
  background: rgba(255,255,255,0.05);
  border: 1px solid rgba(180,143,212,0.12);
  opacity: 0;
  animation: ${cardIn} 0.5s forwards;
  animation-delay: ${({ $index }) => $index * 0.07}s;
  transition: transform 0.3s, box-shadow 0.3s;
  cursor: pointer;

  &:hover {
    transform: translateY(-6px);
    box-shadow: 0 16px 40px rgba(0,0,0,0.4);
  }
`

const Poster = styled.img`
  width: 100%;
  aspect-ratio: 2/3;
  object-fit: cover;
  display: block;
`

const PosterPlaceholder = styled.div`
  width: 100%;
  aspect-ratio: 2/3;
  background: rgba(255,255,255,0.06);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  gap: 8px;
  color: rgba(255,255,255,0.2);
  font-size: 0.65rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
`

const CardBody = styled.div`
  padding: 12px;
`

const CardTitle = styled.p`
  font-family: 'Playfair Display', serif;
  font-size: 0.88rem;
  font-weight: 700;
  color: #fff;
  margin-bottom: 4px;
  line-height: 1.3;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`

const CardDate = styled.p`
  font-size: 0.62rem;
  color: var(--lilac);
  margin-bottom: 8px;
  letter-spacing: 0.06em;
`

const Stars = styled.div`
  display: flex;
  gap: 2px;
`

const Star = styled.span`
  font-size: 0.75rem;
  color: ${({ $filled }) => $filled ? '#FFD98E' : 'rgba(255,255,255,0.15)'};
`

const StarRow = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 3px;
`

const StarLabel = styled.span`
  font-size: 0.58rem;
  color: var(--lilac);
  letter-spacing: 0.06em;
  text-transform: uppercase;
  min-width: 28px;
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

// ── DETALHE MODAL ──
const DetailOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(20,8,36,0.85);
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

const DetailCard = styled.div`
  background: #1A0830;
  border: 1px solid rgba(180,143,212,0.2);
  border-radius: 20px;
  max-width: 480px;
  width: 100%;
  overflow: hidden;
  transform: ${({ $visible }) => $visible ? 'translateY(0) scale(1)' : 'translateY(20px) scale(0.96)'};
  transition: transform 0.35s;
`

const DetailHeader = styled.div`
  display: flex;
  gap: 20px;
  padding: 24px;
  border-bottom: 1px solid rgba(180,143,212,0.1);
`

const DetailPoster = styled.img`
  width: 80px;
  border-radius: 10px;
  object-fit: cover;
  flex-shrink: 0;
`

const DetailInfo = styled.div`
  flex: 1;
`

const DetailTitle = styled.h3`
  font-family: 'Playfair Display', serif;
  font-size: 1.2rem;
  color: #fff;
  margin-bottom: 6px;
`

const DetailDate = styled.p`
  font-size: 0.68rem;
  color: var(--lilac);
  margin-bottom: 12px;
  letter-spacing: 0.06em;
`

const DetailBody = styled.div`
  padding: 20px 24px;
`

const DetailStarRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
`

const DetailStarLabel = styled.span`
  font-size: 0.65rem;
  color: var(--lilac);
  letter-spacing: 0.1em;
  text-transform: uppercase;
`

const DetailStars = styled.div`
  display: flex;
  gap: 3px;
`

const InteractiveStar = styled.span`
  font-size: 1.1rem;
  cursor: pointer;
  color: ${({ $filled }) => $filled ? '#FFD98E' : 'rgba(255,255,255,0.2)'};
  transition: transform 0.15s;

  &:hover { transform: scale(1.2); }
`

const DetailComment = styled.textarea`
  width: 100%;
  background: rgba(255,255,255,0.05);
  border: 1px solid rgba(180,143,212,0.15);
  border-radius: 10px;
  padding: 10px 14px;
  color: #fff;
  font-family: 'Playfair Display', serif;
  font-style: italic;
  font-size: 0.85rem;
  outline: none;
  resize: none;
  min-height: 70px;
  line-height: 1.6;
  margin-top: 8px;
  transition: border-color 0.2s;

  &:focus { border-color: var(--pink-main); }
  &::placeholder { color: rgba(255,255,255,0.2); }
`

const DetailButtons = styled.div`
  display: flex;
  gap: 10px;
  padding: 0 24px 24px;
`

const BtnClose = styled.button`
  flex: 1; padding: 11px; border-radius: 30px;
  border: 1px solid rgba(255,255,255,0.15);
  background: transparent; color: rgba(255,255,255,0.5);
  font-family: 'Lato', sans-serif; font-size: 0.7rem;
  letter-spacing: 0.1em; text-transform: uppercase; cursor: pointer;
  transition: all 0.2s;
  &:hover { background: rgba(255,255,255,0.06); color: #fff; }
`

const BtnSave = styled.button`
  flex: 2; padding: 11px; border-radius: 30px; border: none;
  background: linear-gradient(135deg, var(--purple-deep), var(--pink-main));
  color: #fff; font-family: 'Lato', sans-serif; font-size: 0.7rem;
  letter-spacing: 0.1em; text-transform: uppercase; cursor: pointer;
  transition: all 0.2s;
  &:hover { transform: translateY(-2px); }
`

// ── FORM ──
const FormOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(20,8,36,0.8);
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

const SearchResults = styled.div`
  margin-top: 8px;
  border-radius: 10px;
  overflow: hidden;
  border: 1px solid rgba(180,143,212,0.2);
`

const SearchItem = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 14px;
  cursor: pointer;
  background: rgba(255,255,255,0.04);
  transition: background 0.2s;
  border-bottom: 1px solid rgba(180,143,212,0.1);

  &:last-child { border-bottom: none; }
  &:hover { background: rgba(255,255,255,0.09); }
`

const SearchPoster = styled.img`
  width: 36px;
  border-radius: 4px;
`

const SearchInfo = styled.div``

const SearchTitle = styled.p`
  font-size: 0.85rem;
  color: #fff;
  font-weight: 400;
`

const SearchYear = styled.p`
  font-size: 0.7rem;
  color: var(--lilac);
`

// ── TMDB ──
const TMDB_KEY = import.meta.env.VITE_TMDB_API_KEY

async function searchTMDB(query) {
  if (!TMDB_KEY) return []
  const res = await fetch(
    `https://api.themoviedb.org/3/search/movie?api_key=${TMDB_KEY}&query=${encodeURIComponent(query)}&language=pt-BR`
  )
  const data = await res.json()
  return data.results?.slice(0, 4) || []
}

function renderStars(nota, total = 5) {
  return Array.from({ length: total }, (_, i) => (
    <Star key={i} $filled={i < nota}>★</Star>
  ))
}

// ── COMPONENTE ──
export default function Filmes() {
  const { isAdmin } = useAuth()
  const [filmes, setFilmes]           = useState([])
  const [filmeAberto, setFilmeAberto] = useState(null)
  const [formOpen, setFormOpen]       = useState(false)
  const [loading, setLoading]         = useState(false)
  const [busca, setBusca]             = useState('')
  const [resultados, setResultados]   = useState([])
  const [buscando, setBuscando]       = useState(false)
  const [form, setForm] = useState({
    titulo: '', posterUrl: '', tmdbId: '', dataAssistido: '',
    notaFelipe: 0, notaDela: 0, comentFelipe: '', comentDela: ''
  })

  const [detailForm, setDetailForm] = useState({
    notaFelipe: 0, notaDela: 0, comentFelipe: '', comentDela: ''
  })

  useEffect(() => {
    async function fetch() {
      const q = query(collection(db, 'filmes'), orderBy('dataAssistido', 'desc'))
      const snap = await getDocs(q)
      setFilmes(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    }
    fetch()
  }, [])

  useEffect(() => {
    if (!filmeAberto) return
    setDetailForm({
      notaFelipe:   filmeAberto.notaFelipe   || 0,
      notaDela:     filmeAberto.notaDela     || 0,
      comentFelipe: filmeAberto.comentFelipe || '',
      comentDela:   filmeAberto.comentDela   || '',
    })
  }, [filmeAberto])

  async function handleBusca(e) {
    const val = e.target.value
    setBusca(val)
    if (val.length < 2) { setResultados([]); return }
    setBuscando(true)
    const res = await searchTMDB(val)
    setResultados(res)
    setBuscando(false)
  }

  function selecionarFilme(filme) {
    setForm(p => ({
      ...p,
      titulo:    filme.title,
      posterUrl: filme.poster_path ? `https://image.tmdb.org/t/p/w300${filme.poster_path}` : '',
      tmdbId:    String(filme.id),
    }))
    setBusca(filme.title)
    setResultados([])
  }

  async function handleSubmit() {
    if (!form.titulo.trim()) return
    setLoading(true)
    const novo = { ...form, dataAssistido: form.dataAssistido ? new Date(form.dataAssistido) : new Date() }
    const ref = await addDoc(collection(db, 'filmes'), novo)
    setFilmes(prev => [{ id: ref.id, ...novo }, ...prev])
    setForm({ titulo: '', posterUrl: '', tmdbId: '', dataAssistido: '', notaFelipe: 0, notaDela: 0, comentFelipe: '', comentDela: '' })
    setBusca('')
    setLoading(false)
    setFormOpen(false)
  }

  async function handleSaveDetail() {
    if (!filmeAberto) return
    await updateDoc(doc(db, 'filmes', filmeAberto.id), detailForm)
    setFilmes(prev => prev.map(f => f.id === filmeAberto.id ? { ...f, ...detailForm } : f))
    setFilmeAberto(null)
  }

  function formatDate(data) {
    if (!data) return ''
    const d = data.toDate ? data.toDate() : new Date(data)
    return d.toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' })
  }

  return (
    <Wrapper id="filmes">
      <Inner>
        <Eyebrow>assistidos juntos</Eyebrow>
        <Title>Nosso <em>cinema</em></Title>
        <Divider />

        <Grid>
          {filmes.map((f, i) => (
            <Card key={f.id} $index={i} onClick={() => setFilmeAberto(f)}>
              {f.posterUrl
                ? <Poster src={f.posterUrl} alt={f.titulo} />
                : <PosterPlaceholder>
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <rect x="2" y="2" width="20" height="20" rx="2"/><line x1="7" y1="2" x2="7" y2="22"/>
                      <line x1="17" y1="2" x2="17" y2="22"/><line x1="2" y1="12" x2="22" y2="12"/>
                    </svg>
                    <span>sem poster</span>
                  </PosterPlaceholder>
              }
              <CardBody>
                <CardTitle>{f.titulo}</CardTitle>
                <CardDate>{formatDate(f.dataAssistido)}</CardDate>
                <StarRow>
                  <StarLabel>eu</StarLabel>
                  <Stars>{renderStars(f.notaFelipe || 0)}</Stars>
                </StarRow>
                <StarRow>
                  <StarLabel>ela</StarLabel>
                  <Stars>{renderStars(f.notaDela || 0)}</Stars>
                </StarRow>
              </CardBody>
            </Card>
          ))}
        </Grid>

        <AddBtn onClick={() => setFormOpen(true)}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          Adicionar filme
        </AddBtn>
      </Inner>

      {/* Detalhe */}
      <DetailOverlay $visible={!!filmeAberto} onClick={e => e.target === e.currentTarget && setFilmeAberto(null)}>
        {filmeAberto && (
          <DetailCard $visible={!!filmeAberto}>
            <DetailHeader>
              {filmeAberto.posterUrl
                ? <DetailPoster src={filmeAberto.posterUrl} alt={filmeAberto.titulo} />
                : null
              }
              <DetailInfo>
                <DetailTitle>{filmeAberto.titulo}</DetailTitle>
                <DetailDate>{formatDate(filmeAberto.dataAssistido)}</DetailDate>
              </DetailInfo>
            </DetailHeader>
            <DetailBody>
              <DetailStarRow>
                <DetailStarLabel>Minha nota</DetailStarLabel>
                {isAdmin && (
                  <DetailStars>
                    {[1,2,3,4,5].map(n => (
                      <InteractiveStar key={n} $filled={n <= detailForm.notaFelipe} onClick={() => setDetailForm(p => ({ ...p, notaFelipe: n }))}>★</InteractiveStar>
                    ))}
                  </DetailStars>
                )}
                {!isAdmin && <Stars>{renderStars(filmeAberto.notaFelipe || 0)}</Stars>}
              </DetailStarRow>
              <DetailStarRow>
                <DetailStarLabel>Sua nota</DetailStarLabel>
                {!isAdmin && (
                  <DetailStars>
                    {[1,2,3,4,5].map(n => (
                      <InteractiveStar key={n} $filled={n <= detailForm.notaDela} onClick={() => setDetailForm(p => ({ ...p, notaDela: n }))}>★</InteractiveStar>
                    ))}
                  </DetailStars>
                )}
                {isAdmin && <Stars>{renderStars(filmeAberto.notaDela || 0)}</Stars>}
              </DetailStarRow>
              {isAdmin && (
                <DetailComment
                  value={detailForm.comentFelipe}
                  onChange={e => setDetailForm(p => ({ ...p, comentFelipe: e.target.value }))}
                  placeholder="O que você achou do filme..."
                />
              )}
              {!isAdmin && (
                <DetailComment
                  value={detailForm.comentDela}
                  onChange={e => setDetailForm(p => ({ ...p, comentDela: e.target.value }))}
                  placeholder="O que você achou do filme..."
                />
              )}
            </DetailBody>
            <DetailButtons>
              <BtnClose onClick={() => setFilmeAberto(null)}>Fechar</BtnClose>
              <BtnSave onClick={handleSaveDetail}>Salvar avaliação</BtnSave>
            </DetailButtons>
          </DetailCard>
        )}
      </DetailOverlay>

      {/* Form */}
      <FormOverlay $visible={formOpen} onClick={e => e.target === e.currentTarget && setFormOpen(false)}>
        <FormCard $visible={formOpen}>
          <FormTitle>Adicionar filme</FormTitle>
          <FormGroup>
            <FormLabel>Buscar filme</FormLabel>
            <FormInput
              value={busca}
              onChange={handleBusca}
              placeholder="Digite o nome do filme..."
            />
            {buscando && <p style={{ color: 'var(--lilac)', fontSize: '0.72rem', marginTop: '8px' }}>Buscando...</p>}
            {resultados.length > 0 && (
              <SearchResults>
                {resultados.map(r => (
                  <SearchItem key={r.id} onClick={() => selecionarFilme(r)}>
                    {r.poster_path && <SearchPoster src={`https://image.tmdb.org/t/p/w92${r.poster_path}`} alt={r.title} />}
                    <SearchInfo>
                      <SearchTitle>{r.title}</SearchTitle>
                      <SearchYear>{r.release_date?.split('-')[0]}</SearchYear>
                    </SearchInfo>
                  </SearchItem>
                ))}
              </SearchResults>
            )}
          </FormGroup>
          <FormGroup>
            <FormLabel>Data que assistiram</FormLabel>
            <FormInput
              type="date"
              value={form.dataAssistido}
              onChange={e => setForm(p => ({ ...p, dataAssistido: e.target.value }))}
            />
          </FormGroup>
          <FormButtons>
            <BtnCancel onClick={() => setFormOpen(false)}>Cancelar</BtnCancel>
            <BtnSubmit onClick={handleSubmit} disabled={loading || !form.titulo}>
              {loading ? 'Salvando...' : 'Salvar'}
            </BtnSubmit>
          </FormButtons>
        </FormCard>
      </FormOverlay>
    </Wrapper>
  )
}