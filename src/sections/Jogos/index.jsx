import { useState } from 'react'
import styled, { keyframes } from 'styled-components'
import Forca from './Forca'
import Trivia from './Trivia'
import QuebracAbeca from './QuebracAbeca'
import AdivinheMusica from './AdivinheMusica'

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to   { opacity: 1; transform: translateY(0); }
`

const Wrapper = styled.div`
  position: relative;
  min-height: 100vh;
  background: var(--bg);
  padding: 80px 24px;

  &::before {
    content: '';
    position: fixed;
    inset: 0;
    background-image:
      radial-gradient(circle at 10% 20%, rgba(124,77,159,0.06) 0%, transparent 50%),
      radial-gradient(circle at 90% 80%, rgba(232,130,154,0.07) 0%, transparent 50%);
    pointer-events: none;
  }
`

const Inner = styled.div`
  position: relative;
  z-index: 1;
  max-width: 720px;
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
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 16px;

  @media (max-width: 480px) {
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
  }
`

const GameCard = styled.div`
  border-radius: 20px;
  padding: 32px 24px;
  background: #fff;
  border: 1px solid rgba(180,143,212,0.2);
  box-shadow: 0 4px 20px rgba(61,26,94,0.08);
  text-align: center;
  cursor: pointer;
  transition: transform 0.3s, box-shadow 0.3s;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 14px 36px rgba(61,26,94,0.14);
      @media (max-width: 480px) {
    padding: 24px 16px;
  }
`

const GameIcon = styled.div`
  width: 60px; height: 60px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--purple-deep), var(--pink-main));
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 16px;
  box-shadow: 0 4px 16px rgba(124,77,159,0.3);
`

const GameTitle = styled.h3`
  font-family: 'Playfair Display', serif;
  font-size: 1.05rem;
  font-weight: 700;
  color: var(--purple-dark);
  margin-bottom: 6px;

  @media (max-width: 480px) {
    font-size: 0.9rem;
  }
`

const GameDesc = styled.p`
  font-size: 0.78rem;
  color: #6B5080;
  line-height: 1.5;
  font-weight: 300;

  @media (max-width: 480px) {
    display: none;
  }
`

const JOGOS = [
  {
    id: 'forca',
    titulo: 'Jogo da Forca',
    desc: 'Adivinhe a palavra antes que as pétalas caiam todas',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2">
        <path d="M12 22s-8-4.5-8-11.8A8 8 0 0 1 12 2a8 8 0 0 1 8 8.2c0 7.3-8 11.8-8 11.8z"/>
        <circle cx="12" cy="10" r="3"/>
      </svg>
    )
  },
  {
    id: 'trivia',
    titulo: 'Trivia',
    desc: 'Responda perguntas e veja o quanto você sabe',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2">
        <circle cx="12" cy="12" r="10"/>
        <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
        <line x1="12" y1="17" x2="12.01" y2="17"/>
      </svg>
    )
  },
  {
    id: 'quebracabeca',
    titulo: 'Quebra-cabeça',
    desc: 'Monte as fotos de vocês dois peça por peça',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2">
        <path d="M20.24 12.24a6 6 0 0 0-8.49-8.49L5 10.5V19h8.5z"/>
        <line x1="16" y1="8" x2="2" y2="22"/>
        <line x1="17.5" y1="15" x2="9" y2="15"/>
      </svg>
    )
  },
  {
    id: 'musica',
    titulo: 'Adivinhe a Música',
    desc: 'Ouça o trecho e descubra qual música é',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2">
        <path d="M9 18V5l12-2v13"/>
        <circle cx="6" cy="18" r="3"/>
        <circle cx="18" cy="16" r="3"/>
      </svg>
    )
  },
]
export default function Jogos() {
  const [jogoAtivo, setJogoAtivo] = useState(null)

  if (jogoAtivo === 'forca')        return <Forca        onVoltar={() => setJogoAtivo(null)} />
  if (jogoAtivo === 'trivia')       return <Trivia       onVoltar={() => setJogoAtivo(null)} />
  if (jogoAtivo === 'quebracabeca') return <QuebracAbeca onVoltar={() => setJogoAtivo(null)} />
  if (jogoAtivo === 'musica')       return <AdivinheMusica onVoltar={() => setJogoAtivo(null)} />

  return (
    <Wrapper id="jogos">
      <Inner>
        <Eyebrow>joguinhos</Eyebrow>
        <Title>Nossa <em>arcade</em></Title>
        <Divider />

        <Grid>
          {JOGOS.map(j => (
            <GameCard key={j.id} onClick={() => setJogoAtivo(j.id)}>
              <GameIcon>{j.icon}</GameIcon>
              <GameTitle>{j.titulo}</GameTitle>
              <GameDesc>{j.desc}</GameDesc>
            </GameCard>
          ))}
        </Grid>
      </Inner>
    </Wrapper>
  )
}