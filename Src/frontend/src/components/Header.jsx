import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import AuthModal from './AuthModal'

const Header = () => {
  const { user, isAdmin, logout } = useAuth()
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [authMode, setAuthMode] = useState('login')

  const handleLogout = () => {
    logout()
  }

  const openAuthModal = (mode) => {
    setAuthMode(mode)
    setShowAuthModal(true)
  }

  const getUserInitial = () => {
    return user?.nome?.charAt(0)?.toUpperCase() || 'U'
  }

  return (
    <>
      <header className="header">
        <div className="container">
          <div className="logo-container">
            <div className="logo">
              <div className="icone-logo">
                <div className="icone-alien"></div>
              </div>
              <Link to="/" className="link-logo">
                GameStore Digital
              </Link>
            </div>
          </div>

          <nav className="nav">
            <ul className="lista-navegacao">
              <li><Link to="/" className="link-navegacao">Início</Link></li>
              <li><Link to="/" className="link-navegacao">Jogos</Link></li>
              <li><Link to="/classicos" className="link-navegacao">Clássicos</Link></li>
              <li><Link to="/suporte" className="link-navegacao">Suporte</Link></li>
            </ul>
          </nav>

          <div className="user-area">
            {user ? (
              <div className="user-actions">
                <div className="user-pill">
                  <span className="user-avatar">{getUserInitial()}</span>
                  <span className="user-name">{user.nome}</span>
                </div>
                <Link to="/usuario" className="btn-profile">
                  MEU PERFIL
                </Link>
                <button onClick={handleLogout} className="btn-logout">
                  SAIR
                </button>
                {isAdmin && (
                  <Link to="/admin" className="admin-button">
                    <span className="admin-icon">👑</span> Admin
                  </Link>
                )}
              </div>
            ) : (
              <div className="user-actions">
                <button 
                  onClick={() => openAuthModal('login')}
                  className="botao-entrar"
                >
                  Entrar
                </button>
                <button 
                  onClick={() => openAuthModal('register')}
                  className="botao-registrar"
                >
                  Registrar
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <AuthModal 
        show={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        mode={authMode}
        onModeChange={setAuthMode}
      />
    </>
  )
}

export default Header