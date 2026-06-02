import { useState, useEffect, useRef } from 'react'
import { collection, getDocs, addDoc } from 'firebase/firestore'
import { db } from '../../../services/firebase'
import styled, { keyframes } from 'styled-components'
import confetti from 'canvas-confetti'

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

// ── ANIMAÇÕES ──
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to   { opacity: 1; transform: translateY(0); }
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
  max-width: 640px;
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
  margin: 16px auto 32px;
  border-radius: 2px;
`

const FotoGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 12px;
  margin-bottom: 32px;
`

const FotoCard = styled.div`
  border-radius: 14px;
  overflow: hidden;
  cursor: pointer;
  border: 2px solid ${({ $selected }) => $selected ? 'var(--pink-main)' : 'transparent'};
  transition: all 0.2s;
  box-shadow: ${({ $selected }) => $selected ? '0 0 0 3px rgba(232,130,154,0.3)' : 'none'};

  &:hover { border-color: var(--lilac); }

  img {
    width: 100%;
    height: 100px;
    object-fit: cover;
    display: block;
  }
`

const NovaFotoCard = styled.div`
  border-radius: 14px;
  overflow: hidden;
  cursor: pointer;
  border: 2px dashed rgba(180,143,212,0.4);
  transition: all 0.2s;
  height: 100px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  color: var(--lilac);
  background: rgba(255,255,255,0.03);
  position: relative;

  &:hover {
    border-color: var(--pink-main);
    color: var(--pink-main);
    background: rgba(232,130,154,0.05);
  }
`

const NovaFotoLabel = styled.span`
  font-size: 0.62rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
`

const UploadInput = styled.input`
  display: none;
`

const LoadingCard = styled.div`
  border-radius: 14px;
  height: 100px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255,255,255,0.03);
  border: 1px solid rgba(180,143,212,0.15);
  color: var(--lilac);
  font-size: 0.72rem;
  letter-spacing: 0.08em;
`

const DiffRow = styled.div`
  display: flex;
  gap: 8px;
  justify-content: center;
  margin-bottom: 32px;
`

const DiffBtn = styled.button`
  font-family: 'Lato', sans-serif;
  font-size: 0.68rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  padding: 8px 20px;
  border-radius: 30px;
  border: 1.5px solid ${({ $active }) => $active ? 'transparent' : 'rgba(180,143,212,0.3)'};
  background: ${({ $active }) => $active ? 'linear-gradient(135deg, var(--purple-deep), var(--pink-main))' : 'transparent'};
  color: ${({ $active }) => $active ? '#fff' : 'var(--lilac)'};
  cursor: pointer;
  transition: all 0.2s;

  &:hover { border-color: var(--lilac); color: #fff; }
`

const BoardWrap = styled.div`
  display: flex;
  gap: 20px;
  justify-content: center;
  align-items: flex-start;
  flex-wrap: wrap;
  margin-bottom: 28px;
`

const Board = styled.div`
  display: grid;
  grid-template-columns: repeat(${({ $cols }) => $cols}, 1fr);
  gap: 3px;
  background: rgba(255,255,255,0.05);
  border-radius: 12px;
  padding: 8px;
  border: 1px solid rgba(180,143,212,0.2);
`

const Slot = styled.div`
  width: ${({ $size }) => $size}px;
  height: ${({ $size }) => $size}px;
  border-radius: 6px;
  background: ${({ $ocupado }) => $ocupado ? 'transparent' : 'rgba(255,255,255,0.05)'};
  border: 1.5px dashed ${({ $ocupado }) => $ocupado ? 'transparent' : 'rgba(180,143,212,0.2)'};
  transition: all 0.2s;
  overflow: hidden;

  &.drag-over {
    border-color: var(--pink-main);
    background: rgba(232,130,154,0.1);
  }
`

const PecasWrap = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  align-items: center;
`

const PecasLabel = styled.p`
  font-size: 0.62rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--lilac);
  margin-bottom: 4px;
`

const PecasGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 4px;
  background: rgba(255,255,255,0.03);
  border-radius: 12px;
  padding: 8px;
  border: 1px solid rgba(180,143,212,0.15);
  max-height: 320px;
  overflow-y: auto;
`

const Peca = styled.div`
  width: ${({ $size }) => $size}px;
  height: ${({ $size }) => $size}px;
  border-radius: 6px;
  overflow: hidden;
  cursor: grab;
  border: 1.5px solid rgba(180,143,212,0.2);
  transition: transform 0.15s, box-shadow 0.15s;
  opacity: ${({ $usada }) => $usada ? 0.2 : 1};
  pointer-events: ${({ $usada }) => $usada ? 'none' : 'all'};

  &:hover { transform: scale(1.05); box-shadow: 0 4px 12px rgba(232,130,154,0.3); }
  &:active { cursor: grabbing; }
`

const InfoRow = styled.div`
  display: flex;
  gap: 16px;
  justify-content: center;
  margin-bottom: 24px;
`

const InfoBadge = styled.div`
  background: rgba(255,255,255,0.06);
  border: 1px solid rgba(180,143,212,0.15);
  border-radius: 30px;
  padding: 6px 16px;
  font-size: 0.68rem;
  color: var(--lilac);
  letter-spacing: 0.08em;
`

const BtnRow = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
`

const BtnIniciar = styled.button`
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
  &:disabled { opacity: 0.4; cursor: not-allowed; }
  &:hover:not(:disabled) { transform: translateY(-3px); }
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

const ResultadoWrap = styled.div`
  background: rgba(255,255,255,0.05);
  border: 1px solid rgba(180,143,212,0.2);
  border-radius: 20px;
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

const ResultadoDesc = styled.p`
  font-size: 0.88rem;
  color: var(--lilac);
  line-height: 1.6;
`

const DIFICULDADES = [
  { label: 'Fácil',   cols: 3, rows: 3 },
  { label: 'Médio',   cols: 4, rows: 4 },
  { label: 'Difícil', cols: 5, rows: 5 },
]

const PIECE_SIZE = 72

// ── COMPONENTE ──
export default function QuebracAbeca({ onVoltar }) {
  const [fotos, setFotos]           = useState([])
  const [fotoSel, setFotoSel]       = useState(null)
  const [diff, setDiff]             = useState(0)
  const [jogando, setJogando]       = useState(false)
  const [pecas, setPecas]           = useState([])
  const [tabuleiro, setTabuleiro]   = useState([])
  const [ganhou, setGanhou]         = useState(false)
  const [movimentos, setMovimentos] = useState(0)
  const [uploading, setUploading]   = useState(false)
  const dragPeca     = useRef(null)
  const uploadInputRef = useRef(null)

  useEffect(() => {
    async function fetchFotos() {
      const snap = await getDocs(collection(db, 'galeria'))
      setFotos(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    }
    fetchFotos()
  }, [])

  async function handleNovaFoto(e) {
    const file = e.target.files[0]
    if (!file) return
    setUploading(true)
    const fotoUrl = await uploadImagem(file)
    const nova = { fotoUrl, legenda: '', data: new Date() }
    const ref = await addDoc(collection(db, 'galeria'), nova)
    const novaFoto = { id: ref.id, ...nova }
    setFotos(prev => [...prev, novaFoto])
    setFotoSel(novaFoto)
    setUploading(false)
  }

  function iniciarJogo() {
    if (!fotoSel) return
    const { cols, rows } = DIFICULDADES[diff]
    const total = cols * rows
    const ordem = Array.from({ length: total }, (_, i) => i)
    const embaralhada = ordem.sort(() => Math.random() - 0.5)
    setPecas(embaralhada.map(i => ({ index: i, usada: false })))
    setTabuleiro(Array(total).fill(null))
    setGanhou(false)
    setMovimentos(0)
    setJogando(true)
  }

  function handleDragStart(pecaIndex) {
    dragPeca.current = pecaIndex
  }

  function handleDrop(slotIndex) {
    if (dragPeca.current === null) return
    const peca = pecas[dragPeca.current]
    if (peca.usada) return

    const novoTab = [...tabuleiro]
    novoTab[slotIndex] = peca.index

    const novasPecas = pecas.map((p, i) =>
      i === dragPeca.current ? { ...p, usada: true } : p
    )

    setPecas(novasPecas)
    setTabuleiro(novoTab)
    setMovimentos(m => m + 1)
    dragPeca.current = null

    const { cols, rows } = DIFICULDADES[diff]
    const total = cols * rows
    const completo = novoTab.every((v, i) => v === i)
    if (completo && novoTab.filter(v => v !== null).length === total) {
      setGanhou(true)
      confetti({ particleCount: 150, spread: 90, colors: ['#7C4D9F','#E8829A','#B48FD4','#FFD98E'] })
    }
  }

  function handleDragOver(e) {
    e.preventDefault()
    e.currentTarget.classList.add('drag-over')
  }

  function handleDragLeave(e) {
    e.currentTarget.classList.remove('drag-over')
  }

  function handleDropSlot(e, slotIndex) {
    e.preventDefault()
    e.currentTarget.classList.remove('drag-over')
    handleDrop(slotIndex)
  }

  function getPecaStyle(index) {
    const { cols, rows } = DIFICULDADES[diff]
    const col = index % cols
    const row = Math.floor(index / cols)
    return {
      backgroundImage: `url(${fotoSel?.fotoUrl})`,
      backgroundSize: `${cols * 100}% ${rows * 100}%`,
      backgroundPosition: `${col * (100 / (cols - 1))}% ${row * (100 / (rows - 1))}%`,
    }
  }

  const { cols, rows } = DIFICULDADES[diff]

  if (!jogando) {
    return (
      <Wrapper>
        <Game>
          <Eyebrow>joguinhos</Eyebrow>
          <Title>Quebra-<em>cabeça</em></Title>
          <Divider />

          <p style={{ color: 'var(--lilac)', fontSize: '0.78rem', marginBottom: '16px', letterSpacing: '0.08em' }}>
            Escolha uma foto
          </p>

          <FotoGrid>
            {fotos.map(f => (
              <FotoCard
                key={f.id}
                $selected={fotoSel?.id === f.id}
                onClick={() => setFotoSel(f)}
              >
                <img src={f.fotoUrl} alt={f.legenda} />
              </FotoCard>
            ))}

            {uploading ? (
              <LoadingCard>enviando...</LoadingCard>
            ) : (
              <NovaFotoCard onClick={() => uploadInputRef.current?.click()}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <line x1="12" y1="5" x2="12" y2="19"/>
                  <line x1="5" y1="12" x2="19" y2="12"/>
                </svg>
                <NovaFotoLabel>Nova foto</NovaFotoLabel>
                <UploadInput
                  ref={uploadInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleNovaFoto}
                />
              </NovaFotoCard>
            )}
          </FotoGrid>

          <p style={{ color: 'var(--lilac)', fontSize: '0.78rem', marginBottom: '16px', letterSpacing: '0.08em' }}>
            Dificuldade
          </p>
          <DiffRow>
            {DIFICULDADES.map((d, i) => (
              <DiffBtn key={i} $active={diff === i} onClick={() => setDiff(i)}>
                {d.label} ({d.cols}x{d.rows})
              </DiffBtn>
            ))}
          </DiffRow>

          <BtnRow>
            <BtnIniciar onClick={iniciarJogo} disabled={!fotoSel}>
              Iniciar jogo
            </BtnIniciar>
            {onVoltar && <BtnVoltar onClick={onVoltar}>Voltar aos jogos</BtnVoltar>}
          </BtnRow>
        </Game>
      </Wrapper>
    )
  }

  return (
    <Wrapper>
      <Game>
        <Eyebrow>joguinhos</Eyebrow>
        <Title>Quebra-<em>cabeça</em></Title>
        <Divider />

        <InfoRow>
          <InfoBadge>{DIFICULDADES[diff].label} — {cols}x{rows}</InfoBadge>
          <InfoBadge>{movimentos} movimentos</InfoBadge>
          <InfoBadge>
            {tabuleiro.filter(v => v !== null).length} / {cols * rows} peças
          </InfoBadge>
        </InfoRow>

        {ganhou ? (
          <>
            <ResultadoWrap>
              <ResultadoTitle>Você montou!</ResultadoTitle>
              <ResultadoDesc>
                Parabéns! Você completou o quebra-cabeça em {movimentos} movimentos.
              </ResultadoDesc>
            </ResultadoWrap>
            <BtnRow>
              <BtnIniciar onClick={() => setJogando(false)}>Jogar novamente</BtnIniciar>
              {onVoltar && <BtnVoltar onClick={onVoltar}>Voltar aos jogos</BtnVoltar>}
            </BtnRow>
          </>
        ) : (
          <>
            <BoardWrap>
              <div>
                <PecasLabel style={{ textAlign: 'center', marginBottom: '8px' }}>Tabuleiro</PecasLabel>
                <Board $cols={cols}>
                  {tabuleiro.map((v, i) => (
                    <Slot
                      key={i}
                      $size={PIECE_SIZE}
                      $ocupado={v !== null}
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={e => handleDropSlot(e, i)}
                    >
                      {v !== null && (
                        <div style={{ width: '100%', height: '100%', ...getPecaStyle(v) }} />
                      )}
                    </Slot>
                  ))}
                </Board>
              </div>

              <PecasWrap>
                <PecasLabel>Peças</PecasLabel>
                <PecasGrid>
                  {pecas.map((p, i) => (
                    <Peca
                      key={i}
                      $size={PIECE_SIZE}
                      $usada={p.usada}
                      draggable={!p.usada}
                      onDragStart={() => handleDragStart(i)}
                    >
                      <div style={{ width: '100%', height: '100%', ...getPecaStyle(p.index) }} />
                    </Peca>
                  ))}
                </PecasGrid>
              </PecasWrap>
            </BoardWrap>

            <BtnRow>
              <BtnIniciar onClick={() => setJogando(false)}>Recomeçar</BtnIniciar>
              {onVoltar && <BtnVoltar onClick={onVoltar}>Voltar aos jogos</BtnVoltar>}
            </BtnRow>
          </>
        )}
      </Game>
    </Wrapper>
  )
}