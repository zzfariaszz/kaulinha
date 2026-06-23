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
  from { opacity: 0; transform: translateY(24px); }
  to   { opacity: 1; transform: translateY(0); }
`

// ── ESTILOS ──
const Wrapper = styled.div`
  position: relative;
  min-height: 100vh;
  background: var(--bg);
  padding: 80px 24px;
  overflow-x: hidden;
  color-scheme: light only;

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
  max-width: 680px;
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

const Grid = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
  margin-bottom: 40px;
`

const Card = styled.div`
  background: #fffaf8;
  border-radius: 4px;
  padding: 40px 36px 36px;
  position: relative;
  box-shadow: 0 4px 24px rgba(61,26,94,0.09);
  border-top: 3px solid;
  border-image: linear-gradient(90deg, #7C4D9F, #E8829A) 1;
  opacity: 0;
  animation: ${cardIn} 0.6s forwards;
  animation-delay: ${({ $index }) => $index * 0.1}s;

  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background-image: repeating-linear-gradient(
      transparent, transparent 27px, rgba(180,143,212,0.08) 28px
    );
    pointer-events: none;
    border-radius: 4px;
  }

  &::after {
    content: '✦';
    position: absolute;
    top: 16px;
    right: 20px;
    font-size: 0.8rem;
    color: var(--pink-main);
    opacity: 0.4;
  }
`

const CardDate = styled.p`
  font-size: 0.62rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--lilac);
  margin-bottom: 16px;
  font-weight: 300;
  position: relative;
  z-index: 1;
`

const CardTitulo = styled.h3`
  font-family: 'Dancing Script', cursive;
  font-size: 1.6rem;
  color: var(--purple-dark);
  margin-bottom: 20px;
  position: relative;
  z-index: 1;
  line-height: 1.2;
`

const CardTexto = styled.p`
  font-family: 'Playfair Display', serif;
  font-style: italic;
  font-size: 1rem;
  color: #4a3060;
  line-height: 2;
  white-space: pre-line;
  position: relative;
  z-index: 1;
  margin-bottom: 24px;
`

const CardAssinatura = styled.p`
  font-family: 'Dancing Script', cursive;
  font-size: 1.2rem;
  color: var(--purple-deep);
  text-align: right;
  position: relative;
  z-index: 1;
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
  max-width: 480px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  transform: ${({ $visible }) => $visible ? 'translateY(0)' : 'translateY(20px)'};
  transition: transform 0.3s;

  @media (max-width: 480px) {
    padding: 28px 20px;
  }
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
  min-height: 200px;
  line-height: 1.8;
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
  &:disabled { opacity: 0.5; cursor: not-allowed; }
`

// ── COMPONENTE ──
export default function Poesias() {
  const { isLogado } = useAuth()
  const [poesias, setPoesias]   = useState([])
  const [formOpen, setFormOpen] = useState(false)
  const [loading, setLoading]   = useState(false)
  const [form, setForm] = useState({ titulo: '', texto: '' })

  useEffect(() => {
    async function fetchPoesias() {
      try {
        const q = query(collection(db, 'poesias'), orderBy('data', 'desc'))
        const snap = await getDocs(q)
        setPoesias(snap.docs.map(d => ({ id: d.id, ...d.data() })))
      } catch (err) {
        console.error('Erro ao carregar poesias:', err)
      }
    }
    fetchPoesias()
  }, [])

  function formatDate(data) {
    if (!data) return ''
    const d = data.toDate ? data.toDate() : new Date(data)
    return d.toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' })
  }

  async function handleSubmit() {
    if (!form.titulo.trim() || !form.texto.trim()) {
      alert('Preencha o título e a poesia!')
      return
    }

    setLoading(true)
    try {
      const nova = {
        titulo: form.titulo,
        texto: form.texto,
        data: serverTimestamp(),
      }
      const ref = await addDoc(collection(db, 'poesias'), nova)
      setPoesias(prev => [{ id: ref.id, ...nova, data: new Date() }, ...prev])
      setForm({ titulo: '', texto: '' })
      setFormOpen(false)
    } catch (err) {
      console.error('Erro ao salvar:', err)
      alert('Erro ao salvar a poesia')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Wrapper id="poesias">
      <Inner>
        <Eyebrow>escritas para você</Eyebrow>
        <Title>Minhas <em>poesias</em></Title>
        <Divider />

        <Grid>
          {poesias.map((p, i) => (
            <Card key={p.id} $index={i}>
              <CardDate>{formatDate(p.data)}</CardDate>
              <CardTitulo>{p.titulo}</CardTitulo>
              <CardTexto>{p.texto}</CardTexto>
              <CardAssinatura>Felipe</CardAssinatura>
            </Card>
          ))}
        </Grid>

        {isLogado && (
          <AddBtn onClick={() => setFormOpen(true)}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            Nova poesia
          </AddBtn>
        )}
      </Inner>

      <FormOverlay $visible={formOpen} onClick={e => e.target === e.currentTarget && setFormOpen(false)}>
        <FormCard $visible={formOpen}>
          <FormTitle>Nova poesia</FormTitle>
          <FormGroup>
            <FormLabel>Título</FormLabel>
            <FormInput
              value={form.titulo}
              onChange={e => setForm(p => ({ ...p, titulo: e.target.value }))}
              placeholder="Ex: Para você..."
              disabled={loading}
            />
          </FormGroup>
          <FormGroup>
            <FormLabel>Poesia</FormLabel>
            <FormTextarea
              value={form.texto}
              onChange={e => setForm(p => ({ ...p, texto: e.target.value }))}
              placeholder={"Escreva sua poesia aqui...\n\nUse Enter para quebrar as linhas"}
              disabled={loading}
            />
            <FormHint>As quebras de linha serão preservadas na exibição</FormHint>
          </FormGroup>
          <FormButtons>
            <BtnCancel onClick={() => setFormOpen(false)} disabled={loading}>
              Cancelar
            </BtnCancel>
            <BtnSubmit onClick={handleSubmit} disabled={loading}>
              {loading ? 'Salvando...' : 'Salvar'}
            </BtnSubmit>
          </FormButtons>
        </FormCard>
      </FormOverlay>
    </Wrapper>
  )
}