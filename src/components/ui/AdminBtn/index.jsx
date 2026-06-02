import { useState } from 'react'
import styled from 'styled-components'
import { useAuth } from '../../../hooks/useAuth'
import LoginModal from '../LoginModal'

const Btn = styled.button`
  position: fixed;
  bottom: 24px;
  right: 24px;
  width: 44px; height: 44px;
  border-radius: 50%;
  border: none;
  background: linear-gradient(135deg, var(--purple-deep), var(--pink-main));
  color: #fff;
  cursor: pointer;
  z-index: 400;
  box-shadow: 0 4px 18px rgba(124,77,159,0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.2s, box-shadow 0.2s;
  opacity: 0.7;

  &:hover {
    transform: scale(1.1);
    box-shadow: 0 8px 24px rgba(124,77,159,0.5);
    opacity: 1;
  }
`

export default function AdminBtn() {
  const { isAdmin, logout } = useAuth()
  const [modal, setModal] = useState(false)

  return (
    <>
      <Btn
        title={isAdmin ? 'Sair do modo admin' : 'Entrar como admin'}
        onClick={() => isAdmin ? logout() : setModal(true)}
      >
        {isAdmin
          ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
          : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>
        }
      </Btn>
      <LoginModal visible={modal} onClose={() => setModal(false)} />
    </>
  )
}