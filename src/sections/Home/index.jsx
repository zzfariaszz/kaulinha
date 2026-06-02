import { useEffect, useRef } from 'react'
import styled, { keyframes } from 'styled-components'
const FOTOS = [
`https://res.cloudinary.com/dtg6bxqaz/image/upload/v1780368131/foto1_nsidz5.jpg`,
`https://res.cloudinary.com/dtg6bxqaz/image/upload/v1780368131/foto2_mtgglu.jpg`,
`https://res.cloudinary.com/dtg6bxqaz/image/upload/v1780368131/foto3_loq7io.jpg`,
`https://res.cloudinary.com/dtg6bxqaz/image/upload/v1780368131/foto4_fbswyc.jpg`,
`https://res.cloudinary.com/dtg6bxqaz/image/upload/v1780368131/foto5_tjpqlm.jpg`,
`https://res.cloudinary.com/dtg6bxqaz/image/upload/v1780368131/foto6_u1nb0k.jpg`,
`https://res.cloudinary.com/dtg6bxqaz/image/upload/v1780368132/foto7_um8ht0.jpg`,
`https://res.cloudinary.com/dtg6bxqaz/image/upload/v1780368132/foto8_sldqcw.jpg`
];

// ── ANIMAÇÕES ──
const float1 = keyframes`
  0%, 100% { transform: rotate(-8deg) translateY(0px); }
  50%       { transform: rotate(-6deg) translateY(-12px); }
`
const float2 = keyframes`
  0%, 100% { transform: rotate(5deg) translateY(0px); }
  50%       { transform: rotate(7deg) translateY(-10px); }
`
const float3 = keyframes`
  0%, 100% { transform: rotate(6deg) translateY(0px); }
  50%       { transform: rotate(4deg) translateY(-14px); }
`
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to   { opacity: 1; transform: translateY(0); }
`

// ── ESTILOS ──
const Wrapper = styled.div`
  position: relative;
  min-height: 100vh;
  background: var(--bg);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
`

const Canvas = styled.canvas`
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 0;
`

const Blob = styled.div`
  position: fixed;
  border-radius: 50%;
  filter: blur(80px);
  opacity: 0.18;
  pointer-events: none;
  z-index: 0;

  &.blob-1 {
    width: 500px; height: 500px;
    background: var(--purple-deep);
    top: -100px; left: -100px;
  }
  &.blob-2 {
    width: 400px; height: 400px;
    background: var(--pink-main);
    bottom: -80px; right: -80px;
  }
  &.blob-3 {
    width: 300px; height: 300px;
    background: var(--lilac);
    top: 50%; left: 50%;
    transform: translate(-50%, -50%);
  }
`

const PolaroidBase = styled.div`
  position: fixed;
  background: #fff;
  padding: 10px 10px 34px 10px;
  box-shadow: 0 8px 32px rgba(61,26,94,0.18);
  z-index: 1;

  .placeholder {
    display: flex;
    align-items: center;
    justify-content: center;
    background: #EDE7F6;
  }
`

const PolaroidsLeft = styled.div`
  position: fixed;
  left: 0;
  top: 0;
  height: 100vh;
  width: 260px;
  pointer-events: none;
  z-index: 1;

  @media (max-width: 768px) {
    display: none;
  }

  ${PolaroidBase}:nth-child(1) {
    width: 155px; height: 185px;
    top: 5%; left: 2%;
    animation: ${float1} 6s ease-in-out infinite;
  }
  ${PolaroidBase}:nth-child(2) {
    width: 135px; height: 162px;
    top: 1%; left: 16%;
    animation: ${float2} 7s ease-in-out infinite;
  }
  ${PolaroidBase}:nth-child(3) {
    width: 165px; height: 196px;
    bottom: 7%; left: 1%;
    animation: ${float3} 8s ease-in-out infinite;
  }
  ${PolaroidBase}:nth-child(4) {
    width: 142px; height: 168px;
    bottom: 3%; left: 17%;
    animation: ${float1} 9s ease-in-out infinite;
  }
`

const PolaroidsRight = styled.div`
  position: fixed;
  right: 0;
  top: 0;
  height: 100vh;
  width: 260px;
  pointer-events: none;
  z-index: 1;

  @media (max-width: 768px) {
    display: none;
  }

  ${PolaroidBase}:nth-child(1) {
    width: 155px; height: 185px;
    top: 4%; right: 2%;
    animation: ${float2} 6.5s ease-in-out infinite;
  }
  ${PolaroidBase}:nth-child(2) {
    width: 132px; height: 156px;
    top: 2%; right: 17%;
    animation: ${float3} 7.5s ease-in-out infinite;
  }
  ${PolaroidBase}:nth-child(3) {
    width: 150px; height: 180px;
    bottom: 5%; right: 1%;
    animation: ${float1} 8.5s ease-in-out infinite;
  }
  ${PolaroidBase}:nth-child(4) {
    width: 138px; height: 164px;
    bottom: 2%; right: 17%;
    animation: ${float2} 7s ease-in-out infinite;
  }
`

const Polaroid = styled(PolaroidBase)`
  .placeholder {
    width: 100%;
    height: calc(100% - 24px);
  }

  img {
    width: 100%;
    height: calc(100% - 24px);
    object-fit: cover;
    display: block;
  }
`

const Center = styled.div`
  position: relative;
  z-index: 5;
  text-align: center;
  max-width: 420px;
  padding: 24px;
  animation: ${fadeIn} 1.2s ease forwards;
`

const Eyebrow = styled.p`
  font-size: 0.68rem;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: var(--purple-deep);
  margin-bottom: 16px;
  font-weight: 300;
`

const Title = styled.h1`
  font-family: 'Playfair Display', serif;
  font-size: clamp(2.4rem, 5vw, 3.8rem);
  font-weight: 700;
  color: var(--purple-dark);
  line-height: 1.15;
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
  width: 60px;
  height: 1.5px;
  background: linear-gradient(90deg, var(--purple-deep), var(--pink-main));
  margin: 18px auto 22px;
  border-radius: 2px;
`

const Subtitle = styled.p`
  font-family: 'Playfair Display', serif;
  font-style: italic;
  font-size: 1rem;
  color: var(--lilac);
  margin-bottom: 28px;
  line-height: 1.65;
`

const Counter = styled.div`
  display: flex;
  gap: 12px;
  justify-content: center;
  align-items: flex-start;
  margin-bottom: 32px;
  flex-wrap: wrap;

  @media (max-width: 480px) {
    gap: 6px;
  }
`

const CounterItem = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3px;
`

const Num = styled.span`
  font-family: 'Playfair Display', serif;
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--purple-dark);
  line-height: 1;

  @media (max-width: 480px) {
    font-size: 1.1rem;
  }
`
const Label = styled.span`
  font-size: 0.58rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--lilac);
  font-weight: 300;
`

const Sep = styled.span`
  font-family: 'Playfair Display', serif;
  font-size: 1.3rem;
  color: var(--pink-main);
  margin-top: 2px;
`

const Button = styled.button`
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

// ── COMPONENTE ──
export default function Home() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    const colors = ['#E8829A', '#B48FD4', '#F7C5D0', '#7C4D9F', '#FFD98E']
    const particles = Array.from({ length: 30 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      size: 4 + Math.random() * 6,
      color: colors[Math.floor(Math.random() * colors.length)],
      speedY: 0.3 + Math.random() * 0.7,
      speedX: (Math.random() - 0.5) * 0.4,
      opacity: 0.4 + Math.random() * 0.4,
      rotation: Math.random() * 360,
      rotationSpeed: (Math.random() - 0.5) * 1.5,
    }))

    let animId
    function animate() {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      particles.forEach(p => {
        p.y += p.speedY
        p.x += p.speedX
        p.rotation += p.rotationSpeed
        if (p.y > canvas.height) { p.y = -10; p.x = Math.random() * canvas.width }
        ctx.save()
        ctx.globalAlpha = p.opacity
        ctx.translate(p.x, p.y)
        ctx.rotate((p.rotation * Math.PI) / 180)
        ctx.fillStyle = p.color
        ctx.beginPath()
        ctx.ellipse(0, 0, p.size / 2, p.size, 0, 0, Math.PI * 2)
        ctx.fill()
        ctx.restore()
      })
      animId = requestAnimationFrame(animate)
    }

    animate()

    const handleResize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    window.addEventListener('resize', handleResize)
    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  return (
    <Wrapper id="home">
      <Canvas ref={canvasRef} />
      <Blob className="blob-1" />
      <Blob className="blob-2" />
      <Blob className="blob-3" />

    <PolaroidsLeft>
      {[FOTOS[0], FOTOS[1], FOTOS[2], FOTOS[3]].map((foto, i) => (
    <Polaroid key={i}>
      <img src={foto} alt="" />
    </Polaroid>
  ))}
</PolaroidsLeft>

  <PolaroidsRight>
  {[FOTOS[4], FOTOS[5], FOTOS[6], FOTOS[7]].map((foto, i) => (
    <Polaroid key={i}>
      <img src={foto} alt="" />
    </Polaroid>
  ))}
</PolaroidsRight>

      <Center>
        <Eyebrow>um projeto feito com amor</Eyebrow>
        <Title>
          bem vinda,<br />
          <em>meu solzinho</em>
        </Title>
        <Divider />
        <Subtitle>cada detalhe aqui foi pensado especialmente para você.</Subtitle>
        <Counter>
          <CounterItem><Num>00</Num><Label>anos</Label></CounterItem>
          <Sep>·</Sep>
          <CounterItem><Num>00</Num><Label>meses</Label></CounterItem>
          <Sep>·</Sep>
          <CounterItem><Num>00</Num><Label>dias</Label></CounterItem>
          <Sep>·</Sep>
          <CounterItem><Num>00</Num><Label>horas</Label></CounterItem>
          <Sep>·</Sep>
          <CounterItem><Num>00</Num><Label>min</Label></CounterItem>
        </Counter>
      </Center>
    </Wrapper>
  )
}