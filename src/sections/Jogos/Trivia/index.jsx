import { useState, useEffect } from 'react'
import { collection, addDoc, getDocs } from 'firebase/firestore'
import { db } from '../../../services/firebase'
import { useAuth } from '../../../hooks/useAuth'
import styled, { keyframes } from 'styled-components'
import confetti from 'canvas-confetti'

// ── PERGUNTAS PADRÃO (sobre vocês dois) ──
const PERGUNTAS_PADRAO = [
  {
    pergunta: 'Qual é a sua cor?',
    opcoes: ['Azul', 'Rosa', 'Roxo', 'Amarelo'],
    correta: 1,
    tipo: 'pessoal'
  },
  {
    pergunta: 'Qual é o apelido especial dela?',
    opcoes: ['Meu sol', 'Solzinho', 'Princesa', 'Deusa'],
    correta: 1,
    tipo: 'pessoal'
  },
]

// ── ANIMAÇÕES ──
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to   { opacity: 1; transform: translateY(0); }
`

const popIn = keyframes`
  from { transform: scale(0.8); opacity: 0; }
  to   { transform: scale(1); opacity: 1; }
`

const slideIn = keyframes`
  from { opacity: 0; transform: translateX(30px); }
  to   { opacity: 1; transform: translateX(0); }
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

const Game = styled.div`
  position: relative;
  z-index: 1;
  max-width: 580px;
  width: 100%;
  text-align: center;
  animation: ${fadeIn} 0.8s ease forwards;
`

const Eyebrow = styled.p`
  font-size: 0.68rem;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: var(--purple-deep);
  margin-bottom: 12px;
  font-weight: 300;
`

const Title = styled.h2`
  font-family: 'Playfair Display', serif;
  font-size: clamp(1.8rem, 4vw, 2.4rem);
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

const ProgressWrap = styled.div`
  margin-bottom: 32px;
`

const ProgressBar = styled.div`
  width: 100%;
  height: 4px;
  background: rgba(124,77,159,0.15);
  border-radius: 2px;
  overflow: hidden;
  margin-bottom: 8px;
`

const ProgressFill = styled.div`
  height: 100%;
  border-radius: 2px;
  background: linear-gradient(90deg, var(--purple-deep), var(--pink-main));
  width: ${({ $pct }) => $pct}%;
  transition: width 0.4s ease;
`

const ProgressText = styled.p`
  font-size: 0.65rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--lilac);
`

const QuestionCard = styled.div`
  background: #fff;
  border-radius: 20px;
  padding: 32px;
  box-shadow: 0 4px 24px rgba(61,26,94,0.1);
  border: 1px solid rgba(180,143,212,0.15);
  margin-bottom: 20px;
  animation: ${slideIn} 0.4s ease forwards;
`

const QuestionType = styled.span`
  display: inline-block;
  font-size: 0.6rem;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  padding: 3px 12px;
  border-radius: 20px;
  background: ${({ $tipo }) => $tipo === 'pessoal' ? 'var(--pink-light)' : '#EDE7F6'};
  color: var(--purple-dark);
  margin-bottom: 16px;
`

const QuestionText = styled.p`
  font-family: 'Playfair Display', serif;
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--purple-dark);
  line-height: 1.5;
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
    if ($estado === 'certa')  return 'var(--purple-deep)'
    if ($estado === 'errada') return 'rgba(232,130,154,0.5)'
    return 'rgba(180,143,212,0.25)'
  }};
  background: ${({ $estado }) => {
    if ($estado === 'certa')  return 'linear-gradient(135deg, rgba(124,77,159,0.1), rgba(232,130,154,0.1))'
    if ($estado === 'errada') return 'rgba(232,130,154,0.05)'
    return '#fff'
  }};
  color: ${({ $estado }) => {
    if ($estado === 'certa')  return 'var(--purple-dark)'
    if ($estado === 'errada') return 'var(--lilac)'
    return 'var(--purple-dark)'
  }};
  font-family: 'Playfair Display', serif;
  font-size: 0.92rem;
  text-align: left;
  cursor: ${({ $estado }) => $estado ? 'default' : 'pointer'};
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 12px;

  &:hover:not(:disabled) {
    border-color: var(--purple-deep);
    background: rgba(124,77,159,0.05);
  }
`

const OpcaoLetra = styled.span`
  width: 28px; height: 28px;
  border-radius: 50%;
  background: ${({ $estado }) => {
    if ($estado === 'certa')  return 'linear-gradient(135deg, var(--purple-deep), var(--pink-main))'
    if ($estado === 'errada') return 'rgba(180,143,212,0.2)'
    return 'rgba(124,77,159,0.1)'
  }};
  color: ${({ $estado }) => $estado === 'certa' ? '#fff' : 'var(--purple-deep)'};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.72rem;
  font-weight: 700;
  flex-shrink: 0;
  transition: all 0.2s;
`

const FeedbackMsg = styled.p`
  font-family: 'Playfair Display', serif;
  font-style: italic;
  font-size: 0.88rem;
  color: ${({ $certa }) => $certa ? 'var(--purple-deep)' : 'var(--pink-main)'};
  margin-bottom: 16px;
  animation: ${popIn} 0.3s ease;
`

const BtnProxima = styled.button`
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
  transition: transform 0.25s, box-shadow 0.25s;

  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 10px 32px rgba(124,77,159,0.45);
  }
`

// ── RESULTADO FINAL ──
const ResultadoWrap = styled.div`
  background: #fff;
  border-radius: 24px;
  padding: 48px 36px;
  box-shadow: 0 8px 40px rgba(61,26,94,0.12);
  border: 1px solid rgba(180,143,212,0.2);
  animation: ${popIn} 0.5s ease;
`

const ResultadoEmoji = styled.div`
  font-size: 3rem;
  margin-bottom: 16px;
`

const ResultadoTitle = styled.h3`
  font-family: 'Playfair Display', serif;
  font-size: 1.6rem;
  font-weight: 700;
  color: var(--purple-dark);
  margin-bottom: 8px;
`

const ResultadoScore = styled.p`
  font-family: 'Playfair Display', serif;
  font-size: 1rem;
  color: var(--lilac);
  margin-bottom: 8px;
  font-style: italic;
`

const ResultadoMsg = styled.p`
  font-size: 0.88rem;
  color: #6B5080;
  line-height: 1.6;
  margin-bottom: 32px;
`

const BtnRow = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
`

const BtnVoltar = styled.button`
  background: transparent;
  border: none;
  color: var(--lilac);
  font-size: 0.7rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  cursor: pointer;
  transition: color 0.2s;

  &:hover { color: var(--purple-deep); }
`

const BtnAddPergunta = styled.button`
  background: transparent;
  border: 1px dashed rgba(124,77,159,0.3);
  border-radius: 30px;
  color: rgba(124,77,159,0.6);
  font-size: 0.65rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  padding: 8px 20px;
  cursor: pointer;
  transition: all 0.2s;
  margin-top: 8px;

  &:hover {
    border-color: var(--purple-deep);
    color: var(--purple-deep);
  }
`

// ── FORM MODAL ──
const FormOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(20,8,36,0.7);
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

function getMensagem(acertos, total) {
  const pct = acertos / total
  if (pct === 1)   return 'Perfeito! Você me conhece muito bem!'
  if (pct >= 0.75) return 'Muito bem! Você sabe bastante sobre mim!'
  if (pct >= 0.5)  return 'Não foi mal! Mas ainda tem muito pra aprender...'
  return 'Hmm, acho que precisamos conversar mais!'
}

// ── COMPONENTE ──
export default function Trivia({ onVoltar }) {
  const { isAdmin } = useAuth()
  const [perguntas, setPerguntas]     = useState([])
  const [indice, setIndice]           = useState(0)
  const [selecionada, setSelecionada] = useState(null)
  const [acertos, setAcertos]         = useState(0)
  const [fim, setFim]                 = useState(false)
  const [formOpen, setFormOpen]       = useState(false)
  const [form, setForm] = useState({
    pergunta: '', opcao0: '', opcao1: '', opcao2: '', opcao3: '',
    correta: '0', tipo: 'pessoal'
  })

  useEffect(() => {
    async function fetchPerguntas() {
      const snap = await getDocs(collection(db, 'trivia_perguntas'))
      const doFirestore = snap.docs.map(d => ({ id: d.id, ...d.data() }))
      const todas = [...PERGUNTAS_PADRAO, ...doFirestore]
      const embaralhadas = todas.sort(() => Math.random() - 0.5).slice(0, 10)
      setPerguntas(embaralhadas)
    }
    fetchPerguntas()
  }, [])

  function handleOpcao(i) {
    if (selecionada !== null) return
    setSelecionada(i)
    const certa = i === perguntas[indice].correta
    if (certa) {
      setAcertos(a => a + 1)
      confetti({ particleCount: 60, spread: 60, colors: ['#7C4D9F','#E8829A','#FFD98E'] })
    }
  }

  function handleProxima() {
    if (indice + 1 >= perguntas.length) {
      setFim(true)
      if (acertos + (selecionada === perguntas[indice].correta ? 1 : 0) === perguntas.length) {
        confetti({ particleCount: 200, spread: 100, colors: ['#7C4D9F','#E8829A','#B48FD4','#FFD98E'] })
      }
    } else {
      setIndice(i => i + 1)
      setSelecionada(null)
    }
  }

  function reiniciar() {
    const embaralhadas = perguntas.sort(() => Math.random() - 0.5)
    setPerguntas([...embaralhadas])
    setIndice(0)
    setSelecionada(null)
    setAcertos(0)
    setFim(false)
  }

  async function handleAddPergunta() {
    if (!form.pergunta.trim() || !form.opcao0 || !form.opcao1 || !form.opcao2 || !form.opcao3) return
    const nova = {
      pergunta: form.pergunta,
      opcoes: [form.opcao0, form.opcao1, form.opcao2, form.opcao3],
      correta: parseInt(form.correta),
      tipo: form.tipo,
    }
    const ref = await addDoc(collection(db, 'trivia_perguntas'), nova)
    setPerguntas(prev => [...prev, { id: ref.id, ...nova }])
    setForm({ pergunta: '', opcao0: '', opcao1: '', opcao2: '', opcao3: '', correta: '0', tipo: 'pessoal' })
    setFormOpen(false)
  }

  if (perguntas.length === 0) return null

  const perguntaAtual = perguntas[indice]

  if (fim) {
    const total = perguntas.length
    return (
      <Wrapper>
        <Game>
          <ResultadoWrap>
            <ResultadoEmoji>
              {acertos === total ? '🌟' : acertos >= total * 0.75 ? '💜' : '🌸'}
            </ResultadoEmoji>
            <ResultadoTitle>
              {acertos === total ? 'Perfeita!' : 'Fim do jogo!'}
            </ResultadoTitle>
            <ResultadoScore>
              {acertos} de {total} acertos
            </ResultadoScore>
            <ResultadoMsg>{getMensagem(acertos, total)}</ResultadoMsg>
            <BtnRow>
              <BtnProxima onClick={reiniciar}>Jogar novamente</BtnProxima>
              {isAdmin && (
                <BtnAddPergunta onClick={() => setFormOpen(true)}>
                  + Adicionar pergunta
                </BtnAddPergunta>
              )}
              {onVoltar && <BtnVoltar onClick={onVoltar}>Voltar aos jogos</BtnVoltar>}
            </BtnRow>
          </ResultadoWrap>
        </Game>

        <FormOverlay $visible={formOpen} onClick={e => e.target === e.currentTarget && setFormOpen(false)}>
          <FormCard $visible={formOpen}>
            <FormTitle>Nova pergunta</FormTitle>
            <FormGroup>
              <FormLabel>Pergunta</FormLabel>
              <FormInput value={form.pergunta} onChange={e => setForm(p => ({ ...p, pergunta: e.target.value }))} placeholder="Ex: Qual é meu prato favorito?" />
            </FormGroup>
            <FormGroup>
              <FormLabel>Tipo</FormLabel>
              <FormSelect value={form.tipo} onChange={e => setForm(p => ({ ...p, tipo: e.target.value }))}>
                <option value="pessoal">Pessoal</option>
                <option value="geral">Geral</option>
              </FormSelect>
            </FormGroup>
            {['opcao0','opcao1','opcao2','opcao3'].map((k, i) => (
              <FormGroup key={k}>
                <FormLabel>Opção {LETRAS_OPCAO[i]}</FormLabel>
                <FormInput value={form[k]} onChange={e => setForm(p => ({ ...p, [k]: e.target.value }))} placeholder={`Opção ${LETRAS_OPCAO[i]}...`} />
              </FormGroup>
            ))}
            <FormGroup>
              <FormLabel>Opção correta</FormLabel>
              <FormSelect value={form.correta} onChange={e => setForm(p => ({ ...p, correta: e.target.value }))}>
                {LETRAS_OPCAO.map((l, i) => <option key={i} value={i}>Opção {l}</option>)}
              </FormSelect>
            </FormGroup>
            <FormButtons>
              <BtnCancel onClick={() => setFormOpen(false)}>Cancelar</BtnCancel>
              <BtnSubmit onClick={handleAddPergunta}>Salvar</BtnSubmit>
            </FormButtons>
          </FormCard>
        </FormOverlay>
      </Wrapper>
    )
  }

  return (
    <Wrapper>
      <Game>
        <Eyebrow>joguinhos</Eyebrow>
        <Title>Trivia <em>especial</em></Title>
        <Divider />

        <ProgressWrap>
          <ProgressBar>
            <ProgressFill $pct={((indice) / perguntas.length) * 100} />
          </ProgressBar>
          <ProgressText>Pergunta {indice + 1} de {perguntas.length}</ProgressText>
        </ProgressWrap>

        <QuestionCard key={indice}>
          <QuestionType $tipo={perguntaAtual.tipo}>
            {perguntaAtual.tipo === 'pessoal' ? 'Pessoal' : 'Geral'}
          </QuestionType>
          <QuestionText>{perguntaAtual.pergunta}</QuestionText>
        </QuestionCard>

        <OpcoesGrid>
          {perguntaAtual.opcoes.map((op, i) => {
            let estado = null
            if (selecionada !== null) {
              if (i === perguntaAtual.correta) estado = 'certa'
              else if (i === selecionada)      estado = 'errada'
            }
            return (
              <OpcaoBtn
                key={i}
                $estado={estado}
                disabled={selecionada !== null}
                onClick={() => handleOpcao(i)}
              >
                <OpcaoLetra $estado={estado}>{LETRAS_OPCAO[i]}</OpcaoLetra>
                {op}
              </OpcaoBtn>
            )
          })}
        </OpcoesGrid>

        {selecionada !== null && (
          <FeedbackMsg $certa={selecionada === perguntaAtual.correta}>
            {selecionada === perguntaAtual.correta
              ? 'Correto! Você é incrível!'
              : `Quase! A resposta era: ${perguntaAtual.opcoes[perguntaAtual.correta]}`
            }
          </FeedbackMsg>
        )}

        <BtnRow>
          {selecionada !== null && (
            <BtnProxima onClick={handleProxima}>
              {indice + 1 >= perguntas.length ? 'Ver resultado' : 'Próxima'}
            </BtnProxima>
          )}
          {isAdmin && (
            <BtnAddPergunta onClick={() => setFormOpen(true)}>
              + Adicionar pergunta
            </BtnAddPergunta>
          )}
          {onVoltar && <BtnVoltar onClick={onVoltar}>Voltar aos jogos</BtnVoltar>}
        </BtnRow>
      </Game>

      <FormOverlay $visible={formOpen} onClick={e => e.target === e.currentTarget && setFormOpen(false)}>
        <FormCard $visible={formOpen}>
          <FormTitle>Nova pergunta</FormTitle>
          <FormGroup>
            <FormLabel>Pergunta</FormLabel>
            <FormInput value={form.pergunta} onChange={e => setForm(p => ({ ...p, pergunta: e.target.value }))} placeholder="Ex: Qual é meu prato favorito?" />
          </FormGroup>
          <FormGroup>
            <FormLabel>Tipo</FormLabel>
            <FormSelect value={form.tipo} onChange={e => setForm(p => ({ ...p, tipo: e.target.value }))}>
              <option value="pessoal">Pessoal</option>
              <option value="geral">Geral</option>
            </FormSelect>
          </FormGroup>
          {['opcao0','opcao1','opcao2','opcao3'].map((k, i) => (
            <FormGroup key={k}>
              <FormLabel>Opção {LETRAS_OPCAO[i]}</FormLabel>
              <FormInput value={form[k]} onChange={e => setForm(p => ({ ...p, [k]: e.target.value }))} placeholder={`Opção ${LETRAS_OPCAO[i]}...`} />
            </FormGroup>
          ))}
          <FormGroup>
            <FormLabel>Opção correta</FormLabel>
            <FormSelect value={form.correta} onChange={e => setForm(p => ({ ...p, correta: e.target.value }))}>
              {LETRAS_OPCAO.map((l, i) => <option key={i} value={i}>Opção {l}</option>)}
            </FormSelect>
          </FormGroup>
          <FormButtons>
            <BtnCancel onClick={() => setFormOpen(false)}>Cancelar</BtnCancel>
            <BtnSubmit onClick={handleAddPergunta}>Salvar</BtnSubmit>
          </FormButtons>
        </FormCard>
      </FormOverlay>
    </Wrapper>
  )
}