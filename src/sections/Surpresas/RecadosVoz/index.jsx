import { useState, useEffect, useRef } from 'react'
import { collection, getDocs, addDoc, orderBy, query, serverTimestamp } from 'firebase/firestore'
import { db } from '../../../services/firebase'
import { useAuth } from '../../../hooks/useAuth'
import styled, { keyframes } from 'styled-components'

// ── ANIMAÇÕES ──
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to   { opacity: 1; transform: translateY(0); }
`

const float = keyframes`
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-8px); }
`

const pulse = keyframes`
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
`

// ── ESTILOS ──
const Wrapper = styled.div`
  position: relative;
  min-height: 100vh;
  background: var(--bg);
  padding: 80px 24px;
  display: flex;
  align-items: center;
  justify-content: center;
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
  max-width: 540px;
  width: 100%;
  text-align: center;
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

const EnvelopeWrap = styled.div`
  perspective: 1000px;
  margin-bottom: 40px;
  animation: ${fadeIn} 0.6s ease forwards;
`

const Envelope = styled.div`
  width: 100%;
  max-width: 380px;
  margin: 0 auto;
  background: linear-gradient(135deg, #FDF0F5 0%, #F7C5D0 100%);
  border: 2px solid var(--purple-deep);
  border-radius: 8px;
  padding: 40px 32px;
  box-shadow: 0 12px 48px rgba(61,26,94,0.15);
  position: relative;
  animation: ${float} 3s ease-in-out infinite;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 2px;
    background: linear-gradient(90deg, var(--purple-deep), var(--pink-main), var(--purple-deep));
    border-radius: 8px 8px 0 0;
  }
`

const EnvelopeIcon = styled.div`
  width: 60px;
  height: 60px;
  margin: 0 auto 24px;
  background: linear-gradient(135deg, var(--purple-deep), var(--pink-main));
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 6px 20px rgba(124,77,159,0.3);
`

const EnvelopeDate = styled.p`
  font-size: 0.65rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--purple-deep);
  margin-bottom: 20px;
  font-weight: 300;
`

const EnvelopeMsg = styled.p`
  font-family: 'Playfair Display', serif;
  font-style: italic;
  font-size: 1rem;
  color: var(--purple-dark);
  line-height: 1.8;
  margin-bottom: 28px;
`

const PlayerWrap = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  margin-bottom: 28px;
`

const PlayBtn = styled.button`
  width: 70px;
  height: 70px;
  border-radius: 50%;
  border: none;
  background: linear-gradient(135deg, var(--purple-deep), var(--pink-main));
  color: #fff;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8px 28px rgba(124,77,159,0.35);
  transition: transform 0.2s;
  animation: ${({ $tocando }) => $tocando ? pulse : 'none'} 1.5s ease-in-out infinite;

  &:hover { transform: scale(1.1); }
  &:disabled { opacity: 0.6; cursor: not-allowed; }

  svg { width: 28px; height: 28px; }
`

const ProgressWrap = styled.div`
  width: 100%;
  max-width: 300px;
`

const ProgressBar = styled.div`
  width: 100%;
  height: 3px;
  background: rgba(124,77,159,0.2);
  border-radius: 2px;
  overflow: hidden;
  margin-bottom: 8px;
`

const ProgressFill = styled.div`
  height: 100%;
  background: linear-gradient(90deg, var(--purple-deep), var(--pink-main));
  width: ${({ $pct }) => $pct}%;
  transition: width 0.1s linear;
`

const TimeText = styled.p`
  font-size: 0.65rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--purple-deep);
  font-weight: 300;
`

const BtnRow = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  align-items: center;
`

const BtnProxima = styled.button`
  font-family: 'Lato', sans-serif;
  font-size: 0.72rem;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  padding: 13px 34px;
  border-radius: 40px;
  border: none;
  cursor: pointer;
  background: linear-gradient(135deg, var(--purple-deep), var(--pink-main));
  color: #fff;
  box-shadow: 0 6px 24px rgba(124,77,159,0.35);
  transition: transform 0.25s;

  &:hover { transform: translateY(-3px); }
  &:disabled { opacity: 0.5; cursor: not-allowed; }
`

const BtnVoltar = styled.button`
  background: transparent;
  border: none;
  color: rgba(61,26,94,0.5);
  font-size: 0.7rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  cursor: pointer;
  transition: color 0.2s;

  &:hover { color: var(--purple-deep); }
`

const MensagemFim = styled.div`
  background: rgba(124,77,159,0.1);
  border: 1px solid rgba(124,77,159,0.2);
  border-radius: 20px;
  padding: 40px 32px;
  text-align: center;
  animation: ${fadeIn} 0.6s ease forwards;
`

const MensagemTitulo = styled.h3`
  font-family: 'Playfair Display', serif;
  font-size: 1.4rem;
  color: var(--purple-dark);
  margin-bottom: 12px;
  font-style: italic;
`

const MensagemTexto = styled.p`
  font-family: 'Playfair Display', serif;
  font-style: italic;
  font-size: 0.95rem;
  color: var(--purple-deep);
  line-height: 1.8;
  margin-bottom: 28px;
`

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
  min-height: 100px;
  line-height: 1.6;
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

const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET

async function uploadAudio(file) {
  const form = new FormData()
  form.append('file', file)
  form.append('upload_preset', UPLOAD_PRESET)
  form.append('resource_type', 'auto')
  const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/upload`, {
    method: 'POST',
    body: form,
  })
  const data = await res.json()
  return data.secure_url
}

export default function RecadosVoz({ onVoltar }) {
  const { isLogado } = useAuth()
  const [recados, setRecados]         = useState([])
  const [indiceAtual, setIndiceAtual] = useState(0)
  const [tocando, setTocando]         = useState(false)
  const [duracao, setDuracao]         = useState(0)
  const [progresso, setProgresso]     = useState(0)
  const [formOpen, setFormOpen]       = useState(false)
  const [loading, setLoading]         = useState(false)
  const [form, setForm] = useState({ mensagem: '', audioFile: null })
  const audioRef    = useRef(new Audio())
  const intervalRef = useRef(null)

  useEffect(() => {
    async function fetchRecados() {
      try {
        const q = query(collection(db, 'recados_voz'), orderBy('data', 'asc'))
        const snap = await getDocs(q)
        setRecados(snap.docs.map(d => ({ id: d.id, ...d.data() })))
      } catch (err) {
        console.error('Erro ao carregar recados:', err)
      }
    }
    fetchRecados()

    return () => {
      audioRef.current.pause()
      clearInterval(intervalRef.current)
    }
  }, [])

  function formatDate(data) {
    if (!data) return ''
    const d = data.toDate ? data.toDate() : new Date(data)
    return d.toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' })
  }

  function handlePlay() {
    if (!recados[indiceAtual]) return

    const audio = audioRef.current

    if (tocando) {
      audio.pause()
      setTocando(false)
      clearInterval(intervalRef.current)
      return
    }

    if (audio.src !== recados[indiceAtual].audioUrl) {
      audio.src = recados[indiceAtual].audioUrl
    }

    audio.onloadedmetadata = () => {
      setDuracao(audio.duration)
    }

    audio.onended = () => {
      setTocando(false)
      setProgresso(0)
      clearInterval(intervalRef.current)
    }

    const promise = audio.play()

    if (promise !== undefined) {
      promise.then(() => {
        setTocando(true)
        intervalRef.current = setInterval(() => {
          setProgresso(audio.currentTime)
        }, 100)
      }).catch(err => {
        console.error('Erro ao tocar:', err)
        alert('Toque na tela e tente novamente')
      })
    }
  }

  function handleProxima() {
    const audio = audioRef.current
    audio.pause()
    audio.src = ''
    clearInterval(intervalRef.current)
    setProgresso(0)
    setTocando(false)
    setDuracao(0)
    setIndiceAtual(prev => prev + 1)
  }

  async function handleAddRecado() {
    if (!form.audioFile) {
      alert('Selecione um arquivo de áudio!')
      return
    }

    setLoading(true)
    try {
      const audioUrl = await uploadAudio(form.audioFile)
      const novo = {
        mensagem: form.mensagem,
        audioUrl,
        data: serverTimestamp(),
      }
      const ref = await addDoc(collection(db, 'recados_voz'), novo)
      setRecados(prev => [...prev, { id: ref.id, ...novo, data: new Date() }])
      setForm({ mensagem: '', audioFile: null })
      setFormOpen(false)
    } catch (err) {
      console.error('Erro ao salvar:', err)
      alert('Erro ao salvar o recado')
    } finally {
      setLoading(false)
    }
  }

  const FormRecado = (
    <FormOverlay $visible={formOpen} onClick={e => e.target === e.currentTarget && setFormOpen(false)}>
      <FormCard $visible={formOpen}>
        <FormTitle>Novo recado de voz</FormTitle>
        <FormGroup>
          <FormLabel>Mensagem (opcional)</FormLabel>
          <FormTextarea
            value={form.mensagem}
            onChange={e => setForm(p => ({ ...p, mensagem: e.target.value }))}
            placeholder="Deixe uma mensagem curta..."
            disabled={loading}
          />
        </FormGroup>
        <FormGroup>
          <FormLabel>Arquivo de áudio</FormLabel>
          <FormInput
            type="file"
            accept="audio/mp3,audio/mpeg,audio/wav,audio/ogg,audio/m4a,audio/aac,.mp3,.wav,.ogg,.m4a,.aac"
            onChange={e => setForm(p => ({ ...p, audioFile: e.target.files[0] }))}
            disabled={loading}
          />
          <FormHint>Formatos suportados: MP3, WAV, M4A, OGG, AAC</FormHint>
        </FormGroup>
        <FormButtons>
          <BtnCancel onClick={() => setFormOpen(false)} disabled={loading}>
            Cancelar
          </BtnCancel>
          <BtnSubmit onClick={handleAddRecado} disabled={loading}>
            {loading ? 'Salvando...' : 'Salvar'}
          </BtnSubmit>
        </FormButtons>
      </FormCard>
    </FormOverlay>
  )

  if (recados.length === 0) {
    return (
      <Wrapper>
        <Inner>
          <Eyebrow>para você</Eyebrow>
          <Title>Recados de <em>Voz</em></Title>
          <Divider />
          <MensagemFim style={{ marginBottom: '32px' }}>
            <MensagemTitulo>Nenhum recado ainda</MensagemTitulo>
            <MensagemTexto>
              Felipe ainda não gravou nenhum recado para você. Volte depois para descobrir!
            </MensagemTexto>
          </MensagemFim>
          <BtnRow>
            {isLogado && (
              <AddBtn onClick={() => setFormOpen(true)}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                </svg>
                Adicionar recado
              </AddBtn>
            )}
            {onVoltar && <BtnVoltar onClick={onVoltar}>Voltar às surpresas</BtnVoltar>}
          </BtnRow>
        </Inner>
        {FormRecado}
      </Wrapper>
    )
  }

  if (indiceAtual >= recados.length) {
    return (
      <Wrapper>
        <Inner>
          <MensagemFim>
            <MensagemTitulo>Você ouviu todos! 💜</MensagemTitulo>
            <MensagemTexto>
              Obrigado por ouvir cada recado com o coração. Cada um foi feito pensando em você.
            </MensagemTexto>
          </MensagemFim>
          <BtnRow style={{ marginTop: '32px' }}>
            {isLogado && (
              <AddBtn onClick={() => setFormOpen(true)}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                </svg>
                Adicionar recado
              </AddBtn>
            )}
            {onVoltar && <BtnVoltar onClick={onVoltar}>Voltar às surpresas</BtnVoltar>}
          </BtnRow>
        </Inner>
        {FormRecado}
      </Wrapper>
    )
  }

  const recadoAtual = recados[indiceAtual]
  const pct = duracao > 0 ? (progresso / duracao) * 100 : 0

  return (
    <Wrapper>
      <Inner>
        <Eyebrow>para você</Eyebrow>
        <Title>Recado {indiceAtual + 1} de {recados.length}</Title>
        <Divider />

        <EnvelopeWrap>
          <Envelope>
            <EnvelopeIcon>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
              </svg>
            </EnvelopeIcon>

            <EnvelopeDate>{formatDate(recadoAtual.data)}</EnvelopeDate>

            {recadoAtual.mensagem && (
              <EnvelopeMsg>{recadoAtual.mensagem}</EnvelopeMsg>
            )}

            <PlayerWrap>
              <PlayBtn onClick={handlePlay} $tocando={tocando}>
                {tocando ? (
                  <svg viewBox="0 0 24 24" fill="white">
                    <rect x="6" y="4" width="4" height="16"/>
                    <rect x="14" y="4" width="4" height="16"/>
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24" fill="white">
                    <polygon points="5 3 19 12 5 21 5 3"/>
                  </svg>
                )}
              </PlayBtn>

              {duracao > 0 && (
                <ProgressWrap>
                  <ProgressBar>
                    <ProgressFill $pct={pct} />
                  </ProgressBar>
                  <TimeText>
                    {Math.floor(progresso)}s / {Math.floor(duracao)}s
                  </TimeText>
                </ProgressWrap>
              )}
            </PlayerWrap>
          </Envelope>
        </EnvelopeWrap>

        <BtnRow>
          {indiceAtual < recados.length - 1 ? (
            <BtnProxima onClick={handleProxima}>Próximo recado</BtnProxima>
          ) : (
            <BtnProxima onClick={handleProxima}>Terminar</BtnProxima>
          )}
          {isLogado && (
            <AddBtn onClick={() => setFormOpen(true)} style={{ marginTop: '12px' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
              Adicionar recado
            </AddBtn>
          )}
          {onVoltar && <BtnVoltar onClick={onVoltar}>Voltar às surpresas</BtnVoltar>}
        </BtnRow>
      </Inner>
      {FormRecado}
    </Wrapper>
  )
}