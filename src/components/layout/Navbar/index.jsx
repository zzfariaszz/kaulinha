import { useState, useEffect } from 'react'
import styled, { keyframes } from 'styled-components'

const SECOES = [
  { id: 'home',        label: 'Início',      icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg> },
  { id: 'contador',    label: 'Contador',    icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg> },
  { id: 'mensagens', label: 'Mensagens', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg> },
  { id: 'razoes',      label: 'Razões',      icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg> },
  { id: 'timeline', label: 'História', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg> },
  { id: 'lembrancas',  label: 'Lembranças',  icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s-8-4.5-8-11.8A8 8 0 0 1 12 2a8 8 0 0 1 8 8.2c0 7.3-8 11.8-8 11.8z"/><circle cx="12" cy="10" r="3"/></svg> },
  { id: 'musicas',     label: 'Músicas',     icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg> },
  { id: 'galeria',     label: 'Galeria',     icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg> },
  { id: 'filmes',      label: 'Filmes',      icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="2" width="20" height="20" rx="2"/><line x1="7" y1="2" x2="7" y2="22"/><line x1="17" y1="2" x2="17" y2="22"/><line x1="2" y1="12" x2="22" y2="12"/></svg> },
  { id: 'mapa',        label: 'Lugares',     icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg> },
  { id: 'planos',      label: 'Planos',      icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg> },
  { id: 'jogos',       label: 'Jogos',       icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="6" y1="12" x2="10" y2="12"/><line x1="8" y1="10" x2="8" y2="14"/><circle cx="15" cy="11" r="1"/><circle cx="17" cy="13" r="1"/><path d="M6 2h12a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2z"/></svg> },
  { id: 'surpresas',   label: 'Surpresas',   icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 12 20 22 4 22 4 12"/><rect x="2" y="7" width="20" height="5"/><line x1="12" y1="22" x2="12" y2="7"/><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"/><path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"/></svg> },
]

// ── ANIMAÇÕES ──
const slideDown = keyframes`
  from { opacity: 0; transform: translateY(-20px); }
  to   { opacity: 1; transform: translateY(0); }
`

const slideUp = keyframes`
  from { opacity: 0; transform: translateY(100%); }
  to   { opacity: 1; transform: translateY(0); }
`

const fadeIn = keyframes`
  from { opacity: 0; }
  to   { opacity: 1; }
`

// ── ESTILOS ──

// Navbar desktop — lateral esquerda
const NavDesktop = styled.nav`
  position: fixed;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  z-index: 50;
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 8px 6px;
  background: rgba(20,8,36,0.6);
  backdrop-filter: blur(12px);
  border-radius: 0 16px 16px 0;
  border: 1px solid rgba(180,143,212,0.15);
  border-left: none;
  box-shadow: 4px 0 24px rgba(0,0,0,0.2);
  animation: ${slideDown} 0.6s ease forwards;
  max-height: 90vh;
  overflow-y: auto;
  scrollbar-width: none;

  &::-webkit-scrollbar { display: none; }

  @media (max-width: 768px) {
    display: none;
  }
`

const NavItem = styled.button`
  display: flex;
  align-items: center;
  gap: 0;
  width: 32px;
  height: 32px;
  border-radius: 8px;
  border: none;
  background: ${({ $active }) => $active ? 'linear-gradient(135deg, var(--purple-deep), var(--pink-main))' : 'transparent'};
  color: ${({ $active }) => $active ? '#fff' : 'rgba(255,255,255,0.4)'};
  cursor: pointer;
  transition: all 0.2s;
  overflow: hidden;
  position: relative;
  justify-content: center;

  &:hover {
    background: ${({ $active }) => $active ? 'linear-gradient(135deg, var(--purple-deep), var(--pink-main))' : 'rgba(255,255,255,0.08)'};
    color: #fff;
    width: 120px;
    justify-content: flex-start;
    padding-left: 10px;
    gap: 8px;
  }

  span {
    font-family: 'Lato', sans-serif;
    font-size: 0.68rem;
    letter-spacing: 0.08em;
    white-space: nowrap;
    opacity: 0;
    max-width: 0;
    transition: all 0.2s;
  }

  &:hover span {
    opacity: 1;
    max-width: 100px;
  }

  @media (max-width: 768px) {
    display: none;
  }
`

// Navbar mobile — barra inferior
const NavMobile = styled.nav`
  display: none;
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 50;
  background: rgba(20,8,36,0.92);
  backdrop-filter: blur(12px);
  border-top: 1px solid rgba(180,143,212,0.15);
  padding: 8px 0 env(safe-area-inset-bottom, 8px);
  animation: ${slideUp} 0.4s ease forwards;

  @media (max-width: 768px) {
    display: flex;
  }
`

const NavMobileScroll = styled.div`
  display: flex;
  gap: 0;
  overflow-x: auto;
  width: 100%;
  padding: 0 8px;
  scrollbar-width: none;

  &::-webkit-scrollbar { display: none; }
`

const NavMobileItem = styled.button`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  min-width: 60px;
  padding: 6px 8px;
  border: none;
  background: transparent;
  color: ${({ $active }) => $active ? 'var(--pink-main)' : 'rgba(255,255,255,0.35)'};
  cursor: pointer;
  transition: all 0.2s;
  border-radius: 10px;
  flex-shrink: 0;

  &:hover { color: #fff; }

  svg {
    stroke: ${({ $active }) => $active ? 'var(--pink-main)' : 'rgba(255,255,255,0.35)'};
    transition: stroke 0.2s;
  }

  &:hover svg { stroke: #fff; }
`

const NavMobileLabel = styled.span`
  font-family: 'Lato', sans-serif;
  font-size: 0.55rem;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  white-space: nowrap;
`

// Indicador de seção atual (desktop)
const SecaoAtual = styled.div`
  position: fixed;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 49;
  background: rgba(20,8,36,0.7);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(180,143,212,0.2);
  border-radius: 30px;
  padding: 6px 18px;
  font-family: 'Lato', sans-serif;
  font-size: 0.65rem;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--lilac);
  animation: ${fadeIn} 0.3s ease;
  pointer-events: none;

  @media (max-width: 768px) {
    display: none;
  }
`

// ── COMPONENTE ──
export default function Navbar() {
  const [secaoAtiva, setSecaoAtiva] = useState('home')

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            setSecaoAtiva(entry.target.id)
          }
        })
      },
      { threshold: 0.4 }
    )

    SECOES.forEach(s => {
      const el = document.getElementById(s.id)
      if (el) observer.observe(el)
    })

    return () => observer.disconnect()
  }, [])

  function scrollTo(id) {
    const el = document.getElementById(id)
    if (el) el.scrollIntoView({ behavior: 'smooth' })
  }

  const secaoLabel = SECOES.find(s => s.id === secaoAtiva)?.label || ''

  return (
    <>
      <SecaoAtual>{secaoLabel}</SecaoAtual>

      {/* Desktop — lateral */}
      <NavDesktop>
        {SECOES.map(s => (
          <NavItem
            key={s.id}
            $active={secaoAtiva === s.id}
            onClick={() => scrollTo(s.id)}
            title={s.label}
          >
            {s.icon}
            <span>{s.label}</span>
          </NavItem>
        ))}
      </NavDesktop>

      {/* Mobile — barra inferior */}
      <NavMobile>
        <NavMobileScroll>
          {SECOES.map(s => (
            <NavMobileItem
              key={s.id}
              $active={secaoAtiva === s.id}
              onClick={() => scrollTo(s.id)}
            >
              {s.icon}
              <NavMobileLabel>{s.label}</NavMobileLabel>
            </NavMobileItem>
          ))}
        </NavMobileScroll>
      </NavMobile>
    </>
  )
}