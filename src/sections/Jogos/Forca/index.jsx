import { useState, useEffect } from 'react'
import { collection, addDoc, getDocs } from 'firebase/firestore'
import { db } from '../../../services/firebase'
import { useAuth } from '../../../hooks/useAuth'
import styled, { keyframes } from 'styled-components'
import confetti from 'canvas-confetti'

// ── PALAVRAS PADRÃO (usadas se o Firestore estiver vazio) ──
const PALAVRAS_PADRAO = [
  { palavra: 'SAUDADE',    dica: 'O que eu sinto sem você' },
  { palavra: 'BEIJO',      dica: 'Algo que eu quero te dar' },
  { palavra: 'AMOR',       dica: 'O que sinto por você' },
  { palavra: 'FELICIDADE', dica: 'O que você me dá' },
  { palavra: 'CORACAO',    dica: 'O que acelera quando te vejo' },
  { palavra: 'SORRISO',    dica: 'Minha parte favorita de você' },
  { palavra: 'ABRACO',     dica: 'O que eu mais quero agora' },
  { palavra: 'ESTRELAS',   dica: 'Seus olhos me lembram' },
]

const LETRAS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')
const MAX_ERROS = 4

// ── ANIMAÇÕES ──
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to   { opacity: 1; transform: translateY(0); }
`

const shake = keyframes`
  0%, 100% { transform: translateX(0); }
  20%       { transform: translateX(-8px); }
  40%       { transform: translateX(8px); }
  60%       { transform: translateX(-6px); }
  80%       { transform: translateX(6px); }
`

const popIn = keyframes`
  from { transform: scale(0.8); opacity: 0; }
  to   { transform: scale(1); opacity: 1; }
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
  max-width: 600px;
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

const FlowerWrap = styled.div`
  display: flex;
  justify-content: center;
  gap: 12px;
  margin-bottom: 32px;
`

const Petal = styled.div`
  width: 24px; height: 24px;
  border-radius: 50%;
  background: ${({ $caiu }) => $caiu
    ? 'rgba(255,255,255,0.1)'
    : 'linear-gradient(135deg, var(--pink-main), var(--lilac))'
  };
  box-shadow: ${({ $caiu }) => $caiu ? 'none' : '0 2px 8px rgba(232,130,154,0.4)'};
  transition: all 0.4s;
  transform: ${({ $caiu }) => $caiu ? 'scale(0.7)' : 'scale(1)'};
`

const Dica = styled.p`
  font-family: 'Playfair Display', serif;
  font-style: italic;
  font-size: 0.88rem;
  color: var(--lilac);
  margin-bottom: 32px;
`

const PalavraWrap = styled.div`
  display: flex;
  gap: 10px;
  justify-content: center;
  flex-wrap: wrap;
  margin-bottom: 40px;
  animation: ${({ $shake }) => $shake ? shake : 'none'} 0.5s ease;
`

const Letra = styled.div`
  width: 36px;
  border-bottom: 2px solid ${({ $acertada }) => $acertada ? 'var(--pink-main)' : 'rgba(255,255,255,0.3)'};
  height: 48px;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  padding-bottom: 4px;
  font-family: 'Playfair Display', serif;
  font-size: 1.4rem;
  font-weight: 700;
  color: #fff;
  animation: ${({ $acertada }) => $acertada ? popIn : 'none'} 0.3s ease;
`

const Espaco = styled.div`
  width: 20px;
`

const Teclado = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  justify-content: center;
  margin-bottom: 32px;
  max-width: 440px;
  margin-left: auto;
  margin-right: auto;

  @media (max-width: 480px) {
    gap: 6px;
    max-width: 320px;
  }
`
const TeclaBtn = styled.button`
  width: 40px; height: 40px;
  border-radius: 10px;
   @media (max-width: 480px) {
    width: 32px; height: 32px;
    font-size: 0.72rem;
    border-radius: 8px;
  }
  border: 1px solid rgba(180,143,212,0.25);
  background: ${({ $estado }) => {
    if ($estado === 'certo')  return 'linear-gradient(135deg, var(--purple-deep), var(--pink-main))'
    if ($estado === 'errado') return 'rgba(255,255,255,0.05)'
    return 'rgba(255,255,255,0.08)'
  }};
  color: ${({ $estado }) => $estado === 'errado' ? 'rgba(255,255,255,0.2)' : '#fff'};
  font-family: 'Lato', sans-serif;
  font-size: 0.82rem;
  font-weight: 700;
  cursor: ${({ $estado }) => $estado ? 'not-allowed' : 'pointer'};
  transition: all 0.2s;
  box-shadow: ${({ $estado }) => $estado === 'certo' ? '0 2px 10px rgba(232,130,154,0.3)' : 'none'};

  &:hover:not(:disabled) {
    background: rgba(180,143,212,0.2);
    border-color: var(--lilac);
  }
`

const ErroCount = styled.p`
  font-size: 0.72rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: ${({ $critico }) => $critico ? 'var(--pink-main)' : 'var(--lilac)'};
  margin-bottom: 24px;
`

const ResultadoWrap = styled.div`
  background: rgba(255,255,255,0.05);
  border: 1px solid rgba(180,143,212,0.2);
  border-radius: 20px;
  padding: 32px;
  margin-bottom: 24px;
  animation: ${popIn} 0.4s ease;
`

const ResultadoTitle = styled.h3`
  font-family: 'Playfair Display', serif;
  font-size: 1.4rem;
  color: ${({ $ganhou }) => $ganhou ? 'var(--pink-light)' : 'var(--lilac)'};
  margin-bottom: 8px;
`

const ResultadoDesc = styled.p`
  font-size: 0.85rem;
  color: var(--lilac);
  line-height: 1.6;
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
  transition: transform 0.25s, box-shadow 0.25s;

  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 10px 32px rgba(124,77,159,0.45);
  }
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

const BtnAddPalavra = styled.button`
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
  margin-top: 8px;

  &:hover {
    border-color: var(--lilac);
    color: var(--lilac);
  }
`

const TotalPalavras = styled.p`
  font-size: 0.62rem;
  color: rgba(255,255,255,0.2);
  letter-spacing: 0.08em;
  margin-bottom: 8px;
`

// ── FORM MODAL ──
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
  max-width: 380px;
  width: 100%;
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
  text-transform: uppercase;
  letter-spacing: 0.1em;
  transition: border-color 0.2s;

  &:focus { border-color: var(--pink-main); }
  &::placeholder { color: rgba(255,255,255,0.25); text-transform: none; letter-spacing: 0; }
`

const FormInputNormal = styled(FormInput)`
  text-transform: none;
  letter-spacing: 0;
`

const FormHint = styled.p`
  font-size: 0.62rem;
  color: rgba(180,143,212,0.5);
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
`

// ── COMPONENTE ──
export default function Forca({ onVoltar }) {
  const { isAdmin } = useAuth()
  const [palavras, setPalavras]         = useState([])
  const [rodada, setRodada]             = useState(null)
  const [tentativas, setTentativas]     = useState([])
  const [shakePalavra, setShakePalavra] = useState(false)
  const [formOpen, setFormOpen]         = useState(false)
  const [novaPalavra, setNovaPalavra]   = useState('')
  const [novaDica, setNovaDica]         = useState('')

  useEffect(() => {
    async function fetchPalavras() {
      const snap = await getDocs(collection(db, 'forca_palavras'))
      const doFirestore = snap.docs.map(d => ({ id: d.id, ...d.data() }))
      const todas = doFirestore.length > 0
        ? [...PALAVRAS_PADRAO, ...doFirestore]
        : PALAVRAS_PADRAO
      setPalavras(todas)
      iniciarRodada(todas)
    }
    fetchPalavras()
  }, [])

  function iniciarRodada(lista) {
    const l = lista || palavras
    if (l.length === 0) return
    const r = l[Math.floor(Math.random() * l.length)]
    setRodada(r)
    setTentativas([])
    setShakePalavra(false)
  }

  function novaRodada() { iniciarRodada(palavras) }

  async function handleAddPalavra() {
    if (!novaPalavra.trim() || !novaDica.trim()) return
    const nova = {
      palavra: novaPalavra.toUpperCase().trim(),
      dica: novaDica.trim(),
    }
    const ref = await addDoc(collection(db, 'forca_palavras'), nova)
    const novaLista = [...palavras, { id: ref.id, ...nova }]
    setPalavras(novaLista)
    setNovaPalavra('')
    setNovaDica('')
    setFormOpen(false)
  }

  if (!rodada) return null

  const erros   = tentativas.filter(l => !rodada.palavra.includes(l))
  const acertos = tentativas.filter(l => rodada.palavra.includes(l))
  const ganhou  = rodada.palavra.split('').every(l => acertos.includes(l))
  const perdeu  = erros.length >= MAX_ERROS

  function handleLetra(letra) {
    if (tentativas.includes(letra) || ganhou || perdeu) return
    const novas = [...tentativas, letra]
    setTentativas(novas)

    if (!rodada.palavra.includes(letra)) {
      setShakePalavra(true)
      setTimeout(() => setShakePalavra(false), 500)
    }

    const novosAcertos = novas.filter(l => rodada.palavra.includes(l))
    const venceu = rodada.palavra.split('').every(l => novosAcertos.includes(l))
    if (venceu) {
      confetti({
        particleCount: 120,
        spread: 80,
        colors: ['#7C4D9F','#E8829A','#B48FD4','#FFD98E']
      })
    }
  }

  return (
    <Wrapper>
      <Game>
        <Eyebrow>joguinhos</Eyebrow>
        <Title>Jogo da <em>Forca</em></Title>
        <Divider />

        <FlowerWrap>
          {Array.from({ length: MAX_ERROS }, (_, i) => (
            <Petal key={i} $caiu={i < erros.length} />
          ))}
        </FlowerWrap>

        <Dica>Dica: {rodada.dica}</Dica>

        <PalavraWrap $shake={shakePalavra}>
          {rodada.palavra.split('').map((l, i) =>
            l === ' '
              ? <Espaco key={i} />
              : <Letra key={i} $acertada={acertos.includes(l)}>
                  {acertos.includes(l) || ganhou || perdeu ? l : ''}
                </Letra>
          )}
        </PalavraWrap>

        <ErroCount $critico={erros.length >= MAX_ERROS - 1}>
          {erros.length} / {MAX_ERROS} erros
        </ErroCount>

        {(ganhou || perdeu) ? (
          <ResultadoWrap>
            <ResultadoTitle $ganhou={ganhou}>
              {ganhou ? 'Você acertou!' : 'Que pena...'}
            </ResultadoTitle>
            <ResultadoDesc>
              {ganhou
                ? 'Parabéns! Você é incrível!'
                : `A palavra era: ${rodada.palavra}`
              }
            </ResultadoDesc>
          </ResultadoWrap>
        ) : (
          <Teclado>
            {LETRAS.map(l => {
              const estado = tentativas.includes(l)
                ? rodada.palavra.includes(l) ? 'certo' : 'errado'
                : null
              return (
                <TeclaBtn
                  key={l}
                  $estado={estado}
                  disabled={!!estado || ganhou || perdeu}
                  onClick={() => handleLetra(l)}
                >
                  {l}
                </TeclaBtn>
              )
            })}
          </Teclado>
        )}

        <BtnRow>
          <TotalPalavras>{palavras.length} palavras no banco</TotalPalavras>
          <BtnNovo onClick={novaRodada}>
            {ganhou || perdeu ? 'Jogar novamente' : 'Nova palavra'}
          </BtnNovo>
          {isAdmin && (
            <BtnAddPalavra onClick={() => setFormOpen(true)}>
              + Adicionar palavra
            </BtnAddPalavra>
          )}
          {onVoltar && (
            <BtnVoltar onClick={onVoltar}>Voltar aos jogos</BtnVoltar>
          )}
        </BtnRow>
      </Game>

      <FormOverlay $visible={formOpen} onClick={e => e.target === e.currentTarget && setFormOpen(false)}>
        <FormCard $visible={formOpen}>
          <FormTitle>Nova palavra</FormTitle>
          <FormGroup>
            <FormLabel>Palavra</FormLabel>
            <FormInput
              value={novaPalavra}
              onChange={e => setNovaPalavra(e.target.value)}
              placeholder="Ex: FELICIDADE"
            />
            <FormHint>Será convertida para maiúsculas automaticamente.</FormHint>
          </FormGroup>
          <FormGroup>
            <FormLabel>Dica</FormLabel>
            <FormInputNormal
              value={novaDica}
              onChange={e => setNovaDica(e.target.value)}
              placeholder="Ex: O que você me dá todo dia..."
            />
          </FormGroup>
          <FormButtons>
            <BtnCancel onClick={() => setFormOpen(false)}>Cancelar</BtnCancel>
            <BtnSubmit onClick={handleAddPalavra}>Salvar</BtnSubmit>
          </FormButtons>
        </FormCard>
      </FormOverlay>
    </Wrapper>
  )
}