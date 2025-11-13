import { useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { showError, showSuccess } from '../utils/notifications'
import '../../css/style.css'
import '../../css/auth.css'

function AuthModal({ isOpen, onClose }) {
  const { login, register } = useAuth()
  const [activeTab, setActiveTab] = useState('entrar')
  const [loginData, setLoginData] = useState({ email: '', senha: '' })
  const [registerData, setRegisterData] = useState({
    nome: '',
    email: '',
    dataNascimento: '',
    senha: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (!isOpen) return null

  const handleLogin = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)

    if (!loginData.email || !loginData.senha) {
      showError('Por favor, preencha todos os campos.')
      setIsSubmitting(false)
      return
    }

    const result = await login(loginData.email, loginData.senha)
    
    if (result.success) {
      showSuccess('Login realizado com sucesso!')
      setLoginData({ email: '', senha: '' })
      onClose()
    } else {
      showError(result.message)
    }
    
    setIsSubmitting(false)
  }

  const handleRegister = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)

    if (!registerData.nome || !registerData.email || !registerData.dataNascimento || !registerData.senha) {
      showError('Por favor, preencha todos os campos.')
      setIsSubmitting(false)
      return
    }

    if (registerData.senha.length < 8) {
      showError('A senha deve ter pelo menos 8 caracteres.')
      setIsSubmitting(false)
      return
    }

    const result = await register(
      registerData.nome,
      registerData.email,
      registerData.dataNascimento,
      registerData.senha
    )

    if (result.success) {
      showSuccess('Conta criada com sucesso!')
      setRegisterData({ nome: '', email: '', dataNascimento: '', senha: '' })
      onClose()
    } else {
      showError(result.message)
    }

    setIsSubmitting(false)
  }

  return (
    <div
      id="modalAutenticacao"
      className="modal"
      style={{ display: isOpen ? 'block' : 'none' }}
      onClick={(e) => {
        if (e.target.id === 'modalAutenticacao') {
          onClose()
        }
      }}
    >
      <div className="conteudo-modal">
        <span className="fechar" onClick={onClose}>
          ×
        </span>
        <div className="abas-autenticacao">
          <button
            className={`botao-aba ${activeTab === 'entrar' ? 'ativo' : ''}`}
            onClick={() => setActiveTab('entrar')}
          >
            Entrar
          </button>
          <button
            className={`botao-aba ${activeTab === 'registrar' ? 'ativo' : ''}`}
            onClick={() => setActiveTab('registrar')}
          >
            Registrar
          </button>
        </div>

        {/* Formulário de Login */}
        <form
          id="formularioEntrar"
          className={`formulario-autenticacao ${activeTab === 'entrar' ? 'ativo' : ''}`}
          onSubmit={handleLogin}
        >
          <h3>Entrar na sua conta</h3>
          <div className="grupo-formulario">
            <input
              type="email"
              id="emailEntrar"
              placeholder="E-mail"
              required
              value={loginData.email}
              onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
            />
          </div>
          <div className="grupo-formulario">
            <input
              type="password"
              id="senhaEntrar"
              placeholder="Senha"
              required
              autoComplete="current-password"
              value={loginData.senha}
              onChange={(e) => setLoginData({ ...loginData, senha: e.target.value })}
            />
          </div>
          <button type="submit" className="botao-enviar" disabled={isSubmitting}>
            {isSubmitting ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        {/* Formulário de Registro */}
        <form
          id="formularioRegistrar"
          className={`formulario-autenticacao ${activeTab === 'registrar' ? 'ativo' : ''}`}
          onSubmit={handleRegister}
        >
          <h3>Criar nova conta</h3>
          <div className="grupo-formulario">
            <input
              type="text"
              id="nomeRegistrar"
              placeholder="Nome completo"
              required
              value={registerData.nome}
              onChange={(e) => setRegisterData({ ...registerData, nome: e.target.value })}
            />
          </div>
          <div className="grupo-formulario">
            <input
              type="email"
              id="emailRegistrar"
              placeholder="E-mail"
              required
              value={registerData.email}
              onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
            />
          </div>
          <div className="grupo-formulario">
            <input
              type="date"
              id="nascimentoRegistrar"
              required
              value={registerData.dataNascimento}
              onChange={(e) => setRegisterData({ ...registerData, dataNascimento: e.target.value })}
            />
          </div>
          <div className="grupo-formulario">
            <input
              type="password"
              id="senhaRegistrar"
              placeholder="Senha"
              required
              autoComplete="new-password"
              value={registerData.senha}
              onChange={(e) => setRegisterData({ ...registerData, senha: e.target.value })}
            />
          </div>
          <button type="submit" className="botao-enviar" disabled={isSubmitting}>
            {isSubmitting ? 'Registrando...' : 'Registrar'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default AuthModal

