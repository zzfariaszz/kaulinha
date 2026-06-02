import { useState } from 'react'
import styled, { keyframes } from 'styled-components'
import { useAuth } from '../../../hooks/useAuth'

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to   { opacity: 1; transform: translateY(0); }
`

const Overlay = styled.div`
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

const Card = styled.div`
  background: #2A0F45;
  border: 1px solid rgba(180,143,212,0.2);
  border-radius: 20px;
  padding: 40px 36px;
  max-width: 360px;
  width: 100%;
  text-align: center;
  animation: ${fadeIn} 0.3s ease forwards;
`

const Title = styled.h3`
  font-family: 'Playfair Display', serif;
  font-size: 1.3rem;
  color: #fff;
  margin-bottom: 8px;
  font-style: italic;
`

const Subtitle = styled.p`
  font-size: 0.78rem;
  color: var(--lilac);
  margin-bottom: 28px;
  font-weight: 300;
  line-height: 1.6;
`

const Input = styled.input`
  width: 100%;
  background: rgba(255,255,255,0.06);
  border: 1px solid ${({ $error }) => $error ? '#E8829A' : 'rgba(180,143,212,0.2)'};
  border-radius: 10px;
  padding: 12px 16px;
  color: #fff;
  font-family: 'Lato', sans-serif;
  font-size: 0.88rem;
  outline: none;
  text-align: center;
  letter-spacing: 0.2em;
  transition: border-color 0.2s;
  margin-bottom: 8px;

  &:focus { border-color: var(--pink-main); }
  &::placeholder { color: rgba(255,255,255,0.25); letter-spacing: 0.1em; }
`

const ErrorMsg = styled.p`
  font-size: 0.7rem;
  color: var(--pink-main);
  margin-bottom: 16px;
  min-height: 18px;
`

const BtnConfirm = styled.button`
  width: 100%;
  padding: 13px;
  border-radius: 30px;
  border: none;
  background: linear-gradient(135deg, var(--purple-deep), var(--pink-main));
  color: #fff;
  font-family: 'Lato', sans-serif;
  font-size: 0.72rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  cursor: pointer;
  box-shadow: 0 4px 16px rgba(232,130,154,0.3);
  transition: all 0.2s;
  margin-bottom: 12px;

  &:hover { transform: translateY(-2px); }
`

const BtnClose = styled.button`
  background: transparent;
  border: none;
  color: rgba(255,255,255,0.3);
  font-size: 0.7rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  cursor: pointer;
  transition: color 0.2s;

  &:hover { color: rgba(255,255,255,0.6); }
`

export default function LoginModal({ visible, onClose }) {
  const { login } = useAuth()
  const [senha, setSenha] = useState('')
  const [error, setError] = useState(false)

  function handleLogin() {
    const ok = login(senha)
    if (ok) {
      setSenha('')
      setError(false)
      onClose()
      window.location.reload()
    } else {
      setError(true)
      setSenha('')
    }
  }

  function handleKey(e) {
    if (e.key === 'Enter') handleLogin()
  }

  return (
    <Overlay $visible={visible} onClick={e => e.target === e.currentTarget && onClose()}>
      <Card>
        <Title>Acesso especial</Title>
        <Subtitle>Digite a senha para acessar as funcionalidades de edição.</Subtitle>
        <Input
          type="password"
          placeholder="••••••••"
          value={senha}
          onChange={e => { setSenha(e.target.value); setError(false) }}
          onKeyDown={handleKey}
          $error={error}
          autoFocus
        />
        <ErrorMsg>{error ? 'Senha incorreta. Tente novamente.' : ''}</ErrorMsg>
        <BtnConfirm onClick={handleLogin}>Entrar</BtnConfirm>
        <BtnClose onClick={onClose}>Cancelar</BtnClose>
      </Card>
    </Overlay>
  )
}