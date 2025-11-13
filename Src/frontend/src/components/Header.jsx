import { useAuth } from '../hooks/useAuth'
import '../../css/style.css'

function Header({ onOpenAuthModal }) {
  const { user, isAdmin, logout } = useAuth()

  const handleLogout = () => {
    logout()
  }

  const handleAuthClick = () => {
    if (onOpenAuthModal) {
      onOpenAuthModal()
    }
  }

  return (
    <header className="cabecalho">
      <div className="conteiner">
        <div className="logo-container">
          <div className="logo">
            <div className="icone-logo">
              <div className="icone-alien"></div>
            </div>
            <a href="/" className="link-logo">
              GameStore Digital
            </a>
          </div>
        </div>
        <nav className="nav">
          <ul className="lista-navegacao">
            <li>
              <a href="/" className="link-navegacao">
                Jogos
              </a>
            </li>
            <li>
              <a href="/pages/classicos.html" className="link-navegacao">
                Clássicos
              </a>
            </li>
            <li>
              <a href="/pages/noticias.html" className="link-navegacao">
                Notícias
              </a>
            </li>
            <li>
              <a href="/pages/suporte.html" className="link-navegacao">
                Suporte
              </a>
            </li>
          </ul>
        </nav>
        <div className="acoes-usuario" id="userActions">
          <span className="user-greeting" id="userGreeting">
            Olá,{' '}
            <span id="userName" className="user-name">
              {user ? user.nome : 'Cliente'}
            </span>
          </span>
          {isAdmin && (
            <a
              href="/pages/admin.html"
              id="admin-button"
              className="admin-button"
              style={{ display: 'inline-flex' }}
            >
              <span className="admin-icon">👑</span> Admin
            </a>
          )}
          {user ? (
            <>
              <button
                id="btnPerfil"
                className="botao-perfil"
                onClick={() => (window.location.href = '/pages/usuario.html')}
                style={{ display: 'inline-block' }}
              >
                MEU PERFIL
              </button>
              <button
                id="btnSair"
                className="botao-sair"
                onClick={handleLogout}
                style={{ display: 'inline-block' }}
              >
                SAIR
              </button>
            </>
          ) : (
            <>
              <button
                id="btnEntrar"
                className="botao-entrar"
                onClick={handleAuthClick}
                style={{ display: 'inline-block' }}
              >
                Entrar
              </button>
              <button
                id="btnRegistrar"
                className="botao-registrar"
                onClick={handleAuthClick}
                style={{ display: 'inline-block' }}
              >
                Registrar
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  )
}

export default Header
