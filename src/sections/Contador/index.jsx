import styled, { keyframes } from 'styled-components'

// ── ANIMAÇÕES ──
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to   { opacity: 1; transform: translateY(0); }
`

const float = keyframes`
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
`

// ── ESTILOS ──
const Wrapper = styled.div`
  position: relative;
  min-height: 100vh;
  background: var(--purple-dark);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  padding: 40px 24px;
`

const Blob = styled.div`
  position: absolute;
  border-radius: 50%;
  filter: blur(90px);
  opacity: 0.12;
  pointer-events: none;

  &.blob-1 {
    width: 400px; height: 400px;
    background: var(--purple-deep);
    top: -120px; left: -120px;
  }
  &.blob-2 {
    width: 350px; height: 350px;
    background: var(--pink-main);
    bottom: -100px; right: -100px;
  }
`

const Center = styled.div`
  position: relative;
  z-index: 2;
  text-align: center;
  max-width: 600px;
  width: 100%;
  animation: ${fadeIn} 1s ease forwards;
`

const SectionLabel = styled.p`
  font-size: 0.68rem;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: var(--lilac);
  margin-bottom: 48px;
  font-weight: 300;
`

const NumeroWrap = styled.div`
  animation: ${float} 4s ease-in-out infinite;
  margin-bottom: 24px;
`

const Numero = styled.h2`
  font-family: 'Playfair Display', serif;
  font-size: clamp(5rem, 18vw, 10rem);
  font-weight: 700;
  line-height: 1;
  background: linear-gradient(135deg, #fff, #F7C5D0);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 0;
`

const NumeroLabel = styled.p`
  font-family: 'Playfair Display', serif;
  font-style: italic;
  font-size: clamp(1rem, 3vw, 1.4rem);
  color: var(--lilac);
  margin-bottom: 40px;
  font-weight: 300;
  letter-spacing: 0.05em;
`

const Divider = styled.div`
  width: 50px; height: 1.5px;
  background: linear-gradient(90deg, var(--lilac), var(--pink-main));
  margin: 0 auto 40px;
  border-radius: 2px;
`

const Mensagem = styled.p`
  font-family: 'Playfair Display', serif;
  font-style: italic;
  font-size: clamp(1rem, 2.5vw, 1.2rem);
  color: rgba(255,255,255,0.7);
  line-height: 1.8;
  max-width: 460px;
  margin: 0 auto;
`

// ── CÁLCULO DE DIAS ──
function calcDias(dataInicio, dataFim) {
  const inicio = new Date(dataInicio)
  const fim = new Date(dataFim)
  const diff = Math.floor((fim - inicio) / (1000 * 60 * 60 * 24))
  return diff
}

const DATA_INICIO = '2019-10-23'
const DATA_FIM    = '2026-06-20'
const MENSAGEM    = 'foi um bom tempo juntos,não é? eu acabei escolhendo encerrar o contador porque você não quis inicia-lo e teve aquela explicação de como você  se sentia ontem, então como eu disse, vou respeitar a sua decisão e o seu momento. Saiba que eu te amo muito e que eu gostaria de passar muito mais tempo com você, mas se esse é o caminho que você escolheu, eu vou respeitar. Obrigado por tudo, por cada dia, por cada momento, por cada sorriso, por cada lágrima, por cada abraço, por cada palavra, por cada silêncio enfim por cada momento que passamos juntos, eu te amo muito e espero que você seja muito feliz, sempre. Estarei sempre torcendo por você, mesmo que de longe, e se um dia você quiser conversar ou se reaproximar, saiba que eu estarei aqui, de braços abertos. Obrigado por tudo, de verdade. Te amo muito.'
// ── COMPONENTE ──
export default function Contador() {
  const dias = calcDias(DATA_INICIO, DATA_FIM)

  return (
    <Wrapper id="contador">
      <Blob className="blob-1" />
      <Blob className="blob-2" />

      <Center>
        <SectionLabel>do primeiro ate o ultimo dia</SectionLabel>

        <NumeroWrap>
          <Numero>{dias.toLocaleString('pt-BR')}</Numero>
          <NumeroLabel>dias</NumeroLabel>
        </NumeroWrap>

        <Divider />

        <Mensagem>{MENSAGEM}</Mensagem>
      </Center>
    </Wrapper>
  )
}