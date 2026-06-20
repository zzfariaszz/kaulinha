import { useEffect, useRef, useState } from 'react'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '../../../services/firebase'
import styled, { keyframes, css } from 'styled-components'

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(24px); }
  to   { opacity: 1; transform: translateY(0); }
`

const fall = keyframes`
  0%   { transform: translateY(-20px) rotate(0deg); opacity: 0; }
  10%  { opacity: 0.8; }
  90%  { opacity: 0.5; }
  100% { transform: translateY(110vh) rotate(720deg); opacity: 0; }
`

const shake = keyframes`
  0%, 100% { transform: translateX(0); }
  20%       { transform: translateX(-10px); }
  40%       { transform: translateX(10px); }
  60%       { transform: translateX(-7px); }
  80%       { transform: translateX(7px); }
`

const pulse = keyframes`
  0%, 100% { box-shadow: 0 0 0 0 rgba(232,130,154,0.4); }
  50%       { box-shadow: 0 0 0 10px rgba(232,130,154,0); }
`

const heartbeat = keyframes`
  0%, 100% { transform: scale(1); }
  14%       { transform: scale(1.15); }
  28%       { transform: scale(1); }
  42%       { transform: scale(1.1); }
  70%       { transform: scale(1); }
`

const glow = keyframes`
  0%, 100% { opacity: 0.6; }
  50%       { opacity: 1; }
`

const Petal = styled.div`
  position: fixed;
  pointer-events: none;
  z-index: 1;
  border-radius: ${({ $round }) => $round ? '50%' : '50% 50% 50% 0'};
  animation: ${fall} ${({ $dur }) => $dur}s linear forwards;
  left: ${({ $left }) => $left}vw;
  width: ${({ $size }) => $size}px;
  height: ${({ $size }) => $size * 1.4}px;
  background: ${({ $color }) => $color};
  opacity: 0;
  animation-delay: ${({ $delay }) => $delay}s;
`

const Wrapper = styled.div`
  position: fixed;
  inset: 0;
  background: var(--bg);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  overflow: hidden;
  color-scheme: light only;
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

  &.b1 {
    width: 500px; height: 500px;
    background: var(--purple-deep);
    top: -100px; left: -100px;
  }
  &.b2 {
    width: 400px; height: 400px;
    background: var(--pink-main);
    bottom: -80px; right: -80px;
  }
  &.b3 {
    width: 300px; height: 300px;
    background: var(--lilac);
    top: 50%; left: 50%;
    transform: translate(-50%, -50%);
  }
`

const Card = styled.div`
  position: relative;
  z-index: 10;
  text-align: center;
  max-width: 380px;
  width: 100%;
  padding: 24px;
  animation: ${fadeIn} 1s ease forwards;
`

const HeartIcon = styled.div`
  width: 64px; height: 64px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--purple-deep), var(--pink-main));
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 28px;
  box-shadow: 0 8px 28px rgba(124,77,159,0.35);
  animation: ${pulse} 2s ease-in-out infinite, ${heartbeat} 2s ease-in-out infinite;
`

const Eyebrow = styled.p`
  font-size: 0.65rem;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: var(--purple-deep);
  margin-bottom: 12px;
  font-weight: 300;
  animation: ${glow} 3s ease-in-out infinite;
`

const Title = styled.h1`
  font-family: 'Playfair Display', serif;
  font-size: clamp(2rem, 5vw, 3rem);
  font-weight: 700;
  color: var(--purple-dark);
  line-height: 1.2;
  margin-bottom: 8px;

  em {
    font-style: italic;
    background: linear-gradient(135deg, var(--purple-deep), var(--pink-main));
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
`

const Subtitle = styled.p`
  font-family: 'Playfair Display', serif;
  font-style: italic;
  font-size: 0.9rem;
  color: var(--lilac);
  margin-bottom: 24px;
  line-height: 1.6;
`

const UltimoLogin = styled.div`
  background: rgba(124,77,159,0.08);
  border: 1px solid rgba(124,77,159,0.15);
  border-radius: 12px;
  padding: 10px 16px;
  margin-bottom: 24px;
  font-size: 0.72rem;
  color: var(--purple-deep);
  font-family: 'Lato', sans-serif;
  font-weight: 300;
  letter-spacing: 0.05em;

  span {
    font-weight: 600;
    color: var(--pink-main);
  }
`

const QuemWrap = styled.div`
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
`

const QuemBtn = styled.button`
  flex: 1;
  padding: 12px;
  border-radius: 30px;
  border: 1.5px solid ${({ $ativo }) => $ativo ? 'var(--purple-deep)' : 'rgba(124,77,159,0.2)'};
  background: ${({ $ativo }) => $ativo
    ? 'linear-gradient(135deg, var(--purple-deep), var(--pink-main))'
    : 'rgba(255,255,255,0.6)'
  };
  color: ${({ $ativo }) => $ativo ? '#fff' : 'var(--purple-deep)'};
  font-family: 'Lato', sans-serif;
  font-size: 0.78rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  cursor: pointer;
  transition: all 0.2s;
  font-weight: ${({ $ativo }) => $ativo ? '600' : '300'};

  &:hover {
    border-color: var(--purple-deep);
    background: ${({ $ativo }) => $ativo
      ? 'linear-gradient(135deg, var(--purple-deep), var(--pink-main))'
      : 'rgba(124,77,159,0.08)'
    };
  }
`

const InputWrap = styled.div`
  position: relative;
  margin-bottom: 12px;
  animation: ${({ $shake }) => $shake ? css`${shake} 0.5s ease` : 'none'};
`

const Input = styled.input`
  width: 100%;
  background: rgba(255,255,255,0.85);
  border: 1.5px solid ${({ $error }) => $error ? 'var(--pink-main)' : 'rgba(124,77,159,0.2)'};
  border-radius: 50px;
  padding: 15px 24px;
  font-family: 'Lato', sans-serif;
  font-size: 1rem;
  color: var(--purple-dark);
  text-align: center;
  letter-spacing: 0.3em;
  outline: none;
  transition: border-color 0.2s, box-shadow 0.2s;
  box-shadow: 0 2px 16px rgba(124,77,159,0.1);

  &:focus {
    border-color: var(--purple-deep);
    box-shadow: 0 4px 20px rgba(124,77,159,0.2);
  }

  &::placeholder {
    letter-spacing: 0.1em;
    color: rgba(124,77,159,0.3);
  }
`

const HintMsg = styled.p`
  font-family: 'Playfair Display', serif;
  font-style: italic;
  font-size: 0.8rem;
  color: var(--pink-main);
  min-height: 20px;
  margin-bottom: 20px;
  line-height: 1.5;
  transition: opacity 0.3s;
  opacity: ${({ $visible }) => $visible ? 1 : 0};
`

const Divider = styled.div`
  width: 40px; height: 1.5px;
  background: linear-gradient(90deg, var(--purple-deep), var(--pink-main));
  margin: 20px auto;
  border-radius: 2px;
`

const BtnEntrar = styled.button`
  width: 100%;
  padding: 15px;
  border-radius: 50px;
  border: none;
  background: linear-gradient(135deg, var(--purple-deep), var(--pink-main));
  color: #fff;
  font-family: 'Lato', sans-serif;
  font-size: 0.8rem;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  cursor: pointer;
  box-shadow: 0 6px 24px rgba(124,77,159,0.35);
  transition: transform 0.25s, box-shadow 0.25s;

  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 10px 32px rgba(124,77,159,0.45);
  }

  &:active { transform: translateY(0); }
`

const DICAS = [
  'te contei no zap, lembra?',
  'se não lembra, me manda msg que eu te relembro',
]

const PETAL_COLORS = ['#E8829A','#B48FD4','#F7C5D0','#7C4D9F','#FFD98E']

function criarPetalas(n = 25) {
  return Array.from({ length: n }, (_, i) => ({
    id: Date.now() + i,
    left: Math.random() * 100,
    size: 5 + Math.random() * 7,
    color: PETAL_COLORS[Math.floor(Math.random() * PETAL_COLORS.length)],
    dur: 6 + Math.random() * 5,
    delay: Math.random() * 4,
    round: Math.random() > 0.5,
  }))
}

const PASSWORD = import.meta.env.VITE_APP_PASSWORD

export default function LoginScreen({ onLogin }) {
  const canvasRef = useRef(null)
  const [senha, setSenha]       = useState('')
  const [erro, setErro]         = useState(false)
  const [shake, setShake]       = useState(false)
  const [dicaIndex, setDicaIndex] = useState(0)
  const [petalas, setPetalas]   = useState(() => criarPetalas(25))
  const [quem, setQuem]         = useState('')
  const [ultimoLogin, setUltimoLogin] = useState(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    const colors = ['#E8829A','#B48FD4','#F7C5D0','#7C4D9F','#FFD98E']
    const particles = Array.from({ length: 28 }, () => ({
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

  useEffect(() => {
    const id = setInterval(() => {
      setPetalas(criarPetalas(25))
    }, 10000)
    return () => clearInterval(id)
  }, [])

  // Busca último login no Firestore
  useEffect(() => {
    async function fetchUltimoLogin() {
      try {
        const snap = await getDoc(doc(db, 'config', 'ultimo_login'))
        if (snap.exists()) {
          setUltimoLogin(snap.data())
        }
      } catch (err) {
        console.error('Erro ao buscar último login:', err)
      }
    }
    fetchUltimoLogin()
  }, [])

  async function handleLogin() {
    if (!quem) {
      alert('Selecione quem está entrando!')
      return
    }

    if (senha === PASSWORD) {
      sessionStorage.setItem('auth', PASSWORD)
      sessionStorage.setItem('quem', quem)

      // Salva no Firestore
      try {
        const { doc: firestoreDoc, setDoc } = await import('firebase/firestore')
        await setDoc(firestoreDoc(db, 'config', 'ultimo_login'), {
          quem,
          horario: new Date(),
        })
      } catch (err) {
        console.error('Erro ao salvar login:', err)
      }

      onLogin()
    } else {
      setErro(true)
      setShake(true)
      setDicaIndex(i => (i + 1) % DICAS.length)
      setSenha('')
      setTimeout(() => setShake(false), 500)
    }
  }

  function handleKey(e) {
    if (e.key === 'Enter') handleLogin()
  }

  function formatHorario(horario) {
    if (!horario) return ''
    const d = horario.toDate ? horario.toDate() : new Date(horario)
    return d.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <Wrapper>
      <Canvas ref={canvasRef} />
      <Blob className="b1" />
      <Blob className="b2" />
      <Blob className="b3" />

      {petalas.map(p => (
        <Petal
          key={p.id}
          $left={p.left}
          $size={p.size}
          $color={p.color}
          $dur={p.dur}
          $round={p.round}
          $delay={p.delay}
        />
      ))}

      <Card>
        <HeartIcon>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="white">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
          </svg>
        </HeartIcon>

        <Eyebrow>feito especialmente para você</Eyebrow>

        <Title>
          bem vinda,<br />
          <em>meu solzinho</em>
        </Title>

        <Divider />

        <Subtitle>
          esse espaço é só nosso.<br />
          quem está entrando?
        </Subtitle>

        <QuemWrap>
          <QuemBtn
            $ativo={quem === 'Felipe'}
            onClick={() => setQuem('Felipe')}
          >
            Felipe
          </QuemBtn>
          <QuemBtn
            $ativo={quem === 'Kaulinha'}
            onClick={() => setQuem('Kaulinha')}
          >
            Kaulinha
          </QuemBtn>
        </QuemWrap>

        {ultimoLogin && (
          <UltimoLogin>
            último login: <span>{ultimoLogin.quem}</span>
            <br />
            {formatHorario(ultimoLogin.horario)}
          </UltimoLogin>
        )}

        <InputWrap $shake={shake}>
          <Input
            type="password"
            placeholder="••••••••"
            value={senha}
            onChange={e => { setSenha(e.target.value); setErro(false) }}
            onKeyDown={handleKey}
            $error={erro}
            autoFocus
          />
        </InputWrap>

        <HintMsg $visible={erro}>
          {DICAS[dicaIndex]}
        </HintMsg>

        <BtnEntrar onClick={handleLogin}>
          entrar
        </BtnEntrar>
      </Card>
    </Wrapper>
  )
}