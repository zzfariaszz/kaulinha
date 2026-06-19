import { useState, useEffect } from 'react'
import { collection, getDocs, addDoc } from 'firebase/firestore'
import { db } from '../../../services/firebase'
import { useAuth } from '../../../hooks/useAuth'
import styled, { keyframes } from 'styled-components'
import confetti from 'canvas-confetti'

// ── ANIMAÇÕES ──
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to   { opacity: 1; transform: translateY(0); }
`

const popIn = keyframes`
  from { transform: scale(0.8); opacity: 0; }
  to   { transform: scale(1); opacity: 1; }
`

const pulse = keyframes`
  0%, 100% { transform: scale(1); }
  50%       { transform: scale(1.05); }
`

// ── ESTILOS ──
const Wrapper = styled.div`
  position: relative;
  min-height: 100vh;
  background: var(--purple-dark);
  padding: 80px 24px;
  display: flex;
  align-items: center;
  justify-content: center;

  &::before {
    content: '';
    position: fixed;
    inset: 0;
    background-image:
      radial-gradient(circle at 15% 15%, rgba(124,77,159,0.2) 0%, transparent 50%),
      radial-gradient(circle at 85% 85%, rgba(232,130,154,0.15) 0%, transparent 50%);
    pointer-events: none;
  }
`

const Game = styled.div`
  position: relative;
  z-index: 1;
  max-width: 540px;
  width: 100%;
  text-align: center;
  animation: ${fadeIn} 0.8s ease forwards;
`

const Eyebrow = styled.p`
  font-size: 0.68rem;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: var(--lilac);
  margin-bottom: 12px;
  font-weight: 300;
`

const Title = styled.h2`
  font-family: 'Playfair Display', serif;
  font-size: clamp(1.8rem, 4vw, 2.4rem);
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
  margin: 16px auto 40px;
  border-radius: 2px;
`

const ScoreBadge = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: rgba(255,255,255,0.06);
  border: 1px solid rgba(180,143,212,0.2);
  border-radius: 30px;
  padding: 6px 18px;
  font-size: 0.72rem;
  color: var(--lilac);
  letter-spacing: 0.08em;
  margin-bottom: 28px;
`

const LetraCard = styled.div`
  background: rgba(255,255,255,0.05);
  border: 1px solid rgba(180,143,212,0.2);
  border-radius: 24px;
  padding: 36px 32px;
  margin-bottom: 28px;
  animation: ${popIn} 0.5s ease;
`

const LetraIcone = styled.div`
  width: 48px; height: 48px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--purple-deep), var(--pink-main));
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 20px;
  animation: ${pulse} 2s ease-in-out infinite;
`

const LetraTexto = styled.p`
  font-family: 'Playfair Display', serif;
  font-style: italic;
  font-size: 1.05rem;
  color: #fff;
  line-height: 1.9;
  white-space: pre-line;
`

const PerguntaText = styled.p`
  font-family: 'Playfair Display', serif;
  font-style: italic;
  font-size: 0.9rem;
  color: var(--lilac);
  margin-bottom: 24px;
`

const OpcoesGrid = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 24px;
`

const OpcaoBtn = styled.button`
  width: 100%;
  padding: 14px 20px;
  border-radius: 14px;
  border: 1.5px solid ${({ $estado }) => {
    if ($estado === 'certa')  return 'var(--pink-main)'
    if ($estado === 'errada') return 'rgba(180,143,212,0.2)'
    return 'rgba(180,143,212,0.2)'
  }};
  background: ${({ $estado }) => {
    if ($estado === 'certa')  return 'rgba(232,130,154,0.15)'
    if ($estado === 'errada') return 'rgba(255,255,255,0.02)'
    return 'rgba(255,255,255,0.05)'
  }};
  color: ${({ $estado }) => $estado === 'errada' ? 'rgba(255,255,255,0.3)' : '#fff'};
  font-family: 'Playfair Display', serif;
  font-size: 0.9rem;
  text-align: left;
  cursor: ${({ $estado }) => $estado ? 'default' : 'pointer'};
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 12px;

  &:hover:not(:disabled) {
    border-color: var(--lilac);
    background: rgba(180,143,212,0.1);
  }
`

const OpcaoLetra = styled.span`
  width: 28px; height: 28px;
  border-radius: 50%;
  background: ${({ $estado }) => $estado === 'certa'
    ? 'linear-gradient(135deg, var(--purple-deep), var(--pink-main))'
    : 'rgba(180,143,212,0.15)'
  };
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.72rem;
  font-weight: 700;
  flex-shrink: 0;
`

const FeedbackMsg = styled.p`
  font-family: 'Playfair Display', serif;
  font-style: italic;
  font-size: 0.88rem;
  color: ${({ $certa }) => $certa ? 'var(--pink-light)' : 'var(--lilac)'};
  margin-bottom: 16px;
  animation: ${popIn} 0.3s ease;
`

const ResultadoWrap = styled.div`
  background: rgba(255,255,255,0.05);
  border: 1px solid rgba(180,143,212,0.2);
  border-radius: 24px;
  padding: 40px 32px;
  margin-bottom: 24px;
  animation: ${popIn} 0.5s ease;
`

const ResultadoTitle = styled.h3`
  font-family: 'Playfair Display', serif;
  font-size: 1.6rem;
  color: var(--pink-light);
  margin-bottom: 8px;
`

const ResultadoScore = styled.p`
  font-family: 'Playfair Display', serif;
  font-style: italic;
  font-size: 1rem;
  color: var(--lilac);
  margin-bottom: 8px;
`

const ResultadoMsg = styled.p`
  font-size: 0.85rem;
  color: rgba(255,255,255,0.4);
  line-height: 1.6;
  margin-bottom: 28px;
`

const BtnRow = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
`

const BtnNovo = styled.button`
  font-family: 'Lato', sans-serif;
  font-size: 0.74rem;
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
`

const BtnVoltar = styled.button`
  background: transparent;
  border: none;
  color: rgba(255,255,255,0.35);
  font-size: 0.7rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  cursor: pointer;
  transition: color 0.2s;
  &:hover { color: rgba(255,255,255,0.7); }
`

const BtnAddMusica = styled.button`
  background: transparent;
  border: 1px dashed rgba(180,143,212,0.3);
  border-radius: 30px;
  color: rgba(180,143,212,0.6);
  font-size: 0.65rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  padding: 8px 20px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    border-color: var(--lilac);
    color: var(--lilac);
  }
`

const SemMusicas = styled.div`
  background: rgba(255,255,255,0.05);
  border: 1px solid rgba(180,143,212,0.15);
  border-radius: 20px;
  padding: 40px 32px;
  margin-bottom: 28px;
`

const FormOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(20,8,36,0.8);
  backdrop-filter: blur(8px);
  z-index: 500;
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
  font-size: 1.2rem;
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
  font-size: 0.88rem;
  outline: none;
  resize: vertical;
  min-height: 120px;
  line-height: 1.7;
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

const LETRAS_OPCAO = ['A', 'B', 'C', 'D']
const TOTAL_RODADAS = 5

function getMensagem(acertos, total) {
  const pct = acertos / total
  if (pct === 1)   return 'Você conhece todas as músicas! Incrível!'
  if (pct >= 0.75) return 'Muito bem! Você conhece bem essa playlist!'
  if (pct >= 0.5)  return 'Não foi mal! Mas tem músicas pra descobrir ainda...'
  return 'Hmm, precisa ouvir mais as músicas!'
}

// ── COMPONENTE ──
export default function AdivinheMusica({ onVoltar }) {
  const { isLogado } = useAuth()
  const [musicas, setMusicas]         = useState([])
  const [rodada, setRodada]           = useState(null)
  const [opcoes, setOpcoes]           = useState([])
  const [selecionada, setSelecionada] = useState(null)
  const [acertos, setAcertos]         = useState(0)
  const [rodadaNum, setRodadaNum]     = useState(0)
  const [fim, setFim]                 = useState(false)
  const [formOpen, setFormOpen]       = useState(false)
  const [novaMusica, setNovaMusica]   = useState({
    titulo: '', artista: '', letra: ''
  })

  useEffect(() => {
    async function fetchMusicas() {
      try {
        const snap = await getDocs(collection(db, 'jogo_musicas'))
        const lista = snap.docs.map(d => ({ id: d.id, ...d.data() }))
        setMusicas(lista)
        if (lista.length >= 4) iniciarRodada(lista, 0)
      } catch (err) {
        console.error('Erro ao carregar músicas:', err)
      }
    }
    fetchMusicas()
  }, [])

  function iniciarRodada(lista, num) {
    if (num >= TOTAL_RODADAS) { setFim(true); return }
    const embaralhadas = [...lista].sort(() => Math.random() - 0.5)
    const correta = embaralhadas[0]
    const erradas = embaralhadas.slice(1, 4)
    const todasOpcoes = [...erradas, correta].sort(() => Math.random() - 0.5)
    setRodada(correta)
    setOpcoes(todasOpcoes)
    setSelecionada(null)
    setRodadaNum(num)
  }

  function handleOpcao(i) {
    if (selecionada !== null) return
    setSelecionada(i)
    const certa = opcoes[i].id === rodada.id
    if (certa) {
      setAcertos(a => a + 1)
      confetti({ particleCount: 80, spread: 70, colors: ['#7C4D9F','#E8829A','#FFD98E'] })
    }
  }

  function handleProxima() {
    iniciarRodada(musicas, rodadaNum + 1)
  }

  function reiniciar() {
    setAcertos(0)
    setFim(false)
    iniciarRodada(musicas, 0)
  }

  async function handleAddMusica() {
    if (!novaMusica.titulo.trim() || !novaMusica.letra.trim()) {
      alert('Preencha o título e a letra!')
      return
    }
    try {
      const nova = { ...novaMusica }
      const ref = await addDoc(collection(db, 'jogo_musicas'), nova)
      setMusicas(prev => [...prev, { id: ref.id, ...nova }])
      setNovaMusica({ titulo: '', artista: '', letra: '' })
      setFormOpen(false)
    } catch (err) {
      console.error('Erro ao salvar:', err)
      alert('Erro ao salvar a música')
    }
  }

  const FormMusica = (
    <FormOverlay $visible={formOpen} onClick={e => e.target === e.currentTarget && setFormOpen(false)}>
      <FormCard $visible={formOpen}>
        <FormTitle>Nova música para o jogo</FormTitle>
        <FormGroup>
          <FormLabel>Nome da música</FormLabel>
          <FormInput
            value={novaMusica.titulo}
            onChange={e => setNovaMusica(p => ({ ...p, titulo: e.target.value }))}
            placeholder="Ex: Lover..."
          />
        </FormGroup>
        <FormGroup>
          <FormLabel>Artista</FormLabel>
          <FormInput
            value={novaMusica.artista}
            onChange={e => setNovaMusica(p => ({ ...p, artista: e.target.value }))}
            placeholder="Ex: Taylor Swift..."
          />
        </FormGroup>
        <FormGroup>
          <FormLabel>Trecho da letra (refrão)</FormLabel>
          <FormTextarea
            value={novaMusica.letra}
            onChange={e => setNovaMusica(p => ({ ...p, letra: e.target.value }))}
            placeholder={"Ex:\nAnd I will love you\nUntil we're dust and bones..."}
          />
          <FormHint>Cole o refrão ou um trecho marcante da música</FormHint>
        </FormGroup>
        <FormButtons>
          <BtnCancel onClick={() => setFormOpen(false)}>Cancelar</BtnCancel>
          <BtnSubmit onClick={handleAddMusica}>Salvar</BtnSubmit>
        </FormButtons>
      </FormCard>
    </FormOverlay>
  )

  if (musicas.length < 4) {
    return (
      <Wrapper>
        <Game>
          <Eyebrow>joguinhos</Eyebrow>
          <Title>Adivinhe a <em>Música</em></Title>
          <Divider />
          <SemMusicas>
            <p style={{ color: 'var(--lilac)', marginBottom: '8px', fontFamily: 'Playfair Display', fontStyle: 'italic' }}>
              Precisa de pelo menos 4 músicas para jogar!
            </p>
            <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.78rem' }}>
              Você tem {musicas.length} de 4 músicas cadastradas.
            </p>
          </SemMusicas>
          <BtnRow>
            {isLogado && (
              <BtnAddMusica onClick={() => setFormOpen(true)}>
                + Adicionar música ao jogo
              </BtnAddMusica>
            )}
            {onVoltar && <BtnVoltar onClick={onVoltar}>Voltar aos jogos</BtnVoltar>}
          </BtnRow>
        </Game>
        {FormMusica}
      </Wrapper>
    )
  }

  if (fim) {
    return (
      <Wrapper>
        <Game>
          <Eyebrow>joguinhos</Eyebrow>
          <Title>Adivinhe a <em>Música</em></Title>
          <Divider />
          <ResultadoWrap>
            <ResultadoTitle>Fim do jogo!</ResultadoTitle>
            <ResultadoScore>{acertos} de {TOTAL_RODADAS} acertos</ResultadoScore>
            <ResultadoMsg>{getMensagem(acertos, TOTAL_RODADAS)}</ResultadoMsg>
          </ResultadoWrap>
          <BtnRow>
            <BtnNovo onClick={reiniciar}>Jogar novamente</BtnNovo>
            {isLogado && (
              <BtnAddMusica onClick={() => setFormOpen(true)}>
                + Adicionar música ao jogo
              </BtnAddMusica>
            )}
            {onVoltar && <BtnVoltar onClick={onVoltar}>Voltar aos jogos</BtnVoltar>}
          </BtnRow>
        </Game>
        {FormMusica}
      </Wrapper>
    )
  }

  if (!rodada) return null

  const certaIndex = opcoes.findIndex(o => o.id === rodada.id)

  return (
    <Wrapper>
      <Game>
        <Eyebrow>joguinhos</Eyebrow>
        <Title>Adivinhe a <em>Música</em></Title>
        <Divider />

        <ScoreBadge>
          Rodada {rodadaNum + 1} de {TOTAL_RODADAS} &nbsp;·&nbsp; {acertos} acertos
        </ScoreBadge>

        <LetraCard>
          <LetraIcone>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
              <path d="M9 18V5l12-2v13"/>
              <circle cx="6" cy="18" r="3"/>
              <circle cx="18" cy="16" r="3"/>
            </svg>
          </LetraIcone>
          <LetraTexto>{rodada.letra}</LetraTexto>
        </LetraCard>

        <PerguntaText>De qual música é essa letra?</PerguntaText>

        <OpcoesGrid>
          {opcoes.map((op, i) => {
            let estado = null
            if (selecionada !== null) {
              if (i === certaIndex)       estado = 'certa'
              else if (i === selecionada) estado = 'errada'
            }
            return (
              <OpcaoBtn
                key={op.id}
                $estado={estado}
                disabled={selecionada !== null}
                onClick={() => handleOpcao(i)}
              >
                <OpcaoLetra $estado={estado}>{LETRAS_OPCAO[i]}</OpcaoLetra>
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontSize: '0.92rem', fontFamily: 'Playfair Display', color: '#fff' }}>{op.titulo}</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--lilac)', marginTop: '2px' }}>{op.artista}</div>
                </div>
              </OpcaoBtn>
            )
          })}
        </OpcoesGrid>

        {selecionada !== null && (
          <FeedbackMsg $certa={selecionada === certaIndex}>
            {selecionada === certaIndex
              ? 'Acertou! Você conhece bem essa playlist!'
              : `Era: ${rodada.titulo} — ${rodada.artista}`
            }
          </FeedbackMsg>
        )}

        <BtnRow>
          {selecionada !== null && (
            <BtnNovo onClick={handleProxima}>
              {rodadaNum + 1 >= TOTAL_RODADAS ? 'Ver resultado' : 'Próxima'}
            </BtnNovo>
          )}
          {isLogado && (
            <BtnAddMusica onClick={() => setFormOpen(true)}>
              + Adicionar música ao jogo
            </BtnAddMusica>
          )}
          {onVoltar && <BtnVoltar onClick={onVoltar}>Voltar aos jogos</BtnVoltar>}
        </BtnRow>
      </Game>
      {FormMusica}
    </Wrapper>
  )
}