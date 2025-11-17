import React, { useState } from 'react'
import { useAuth } from '../hooks/useAuth'

const AuthModal = ({ show, onClose, mode, onModeChange }) => {
  const { login, register } = useAuth()
  const [formData, setFormData] = useState({
    email: '',
    senha: '',
    nome: '',
    dataNascimento: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  if (!show) return null

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      let result
      if (mode === 'login') {
        result = await login(formData.email, formData.senha)
      } else {
        if (!formData.dataNascimento) {
          setError('Data de nascimento é obrigatória')
          setLoading(false)
          return
        }
        result = await register(formData.nome, formData.email, formData.dataNascimento, formData.senha)
      }

      if (result.success) {
        onClose()
        setFormData({ email: '', senha: '', nome: '', dataNascimento: '' })
        setError('')
      } else {
        setError(result.message || 'Erro ao processar solicitação')
      }
    } catch (err) {
      setError('Erro interno do servidor')
      console.error('Erro no AuthModal:', err)
    } finally {
      setLoading(false)
    }
  }

  const switchMode = (newMode) => {
    onModeChange(newMode)
    setError('')
    setFormData({ email: '', senha: '', nome: '', dataNascimento: '' })
  }

  const togglePassword = () => {
    setShowPassword(!showPassword)
  }

  return (
    <div className="modal show" onClick={onClose}>
      <div className="conteudo-modal" onClick={(e) => e.stopPropagation()}>
        <span className="fechar" onClick={onClose}>&times;</span>
        
        <div className="abas-autenticacao">
          <button 
            type="button"
            className={`botao-aba ${mode === 'login' ? 'ativo' : ''}`}
            onClick={() => switchMode('login')}
          >
            Entrar
          </button>
          <button 
            type="button"
            className={`botao-aba ${mode === 'register' ? 'ativo' : ''}`}
            onClick={() => switchMode('register')}
          >
            Registrar
          </button>
        </div>

        {error && <div className="error-message" style={{ 
          color: '#DC143C', 
          padding: '10px', 
          margin: '10px 0',
          backgroundColor: '#ffe6e6',
          borderRadius: '4px',
          textAlign: 'center'
        }}>{error}</div>}

        {mode === 'login' && (
          <form onSubmit={handleSubmit} className="formulario-autenticacao ativo">
            <h3>Fazer Login</h3>
            
            <div className="grupo-formulario">
              <label htmlFor="loginEmail">E-mail</label>
              <input
                type="email"
                id="loginEmail"
                name="email"
                placeholder="seu@email.com"
                value={formData.email}
                onChange={handleInputChange}
                required
                autoComplete="email"
              />
            </div>
            
            <div className="grupo-formulario">
              <label htmlFor="loginPassword">Senha</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="loginPassword"
                  name="senha"
                  placeholder="Sua senha"
                  value={formData.senha}
                  onChange={handleInputChange}
                  required
                  autoComplete="current-password"
                  style={{ width: '100%', paddingRight: '40px' }}
                />
                <button
                  type="button"
                  onClick={togglePassword}
                  style={{
                    position: 'absolute',
                    right: '10px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '18px'
                  }}
                >
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>
            </div>
            
            <button type="submit" className="botao-enviar" disabled={loading}>
              {loading ? 'Entrando...' : 'Entrar'}
            </button>
          </form>
        )}

        {mode === 'register' && (
          <form onSubmit={handleSubmit} className="formulario-autenticacao ativo">
            <h3>Criar Conta</h3>
            
            <div className="grupo-formulario">
              <label htmlFor="registerName">Nome completo</label>
              <input
                type="text"
                id="registerName"
                name="nome"
                placeholder="Seu nome completo"
                value={formData.nome}
                onChange={handleInputChange}
                required
                autoComplete="name"
              />
            </div>
            
            <div className="grupo-formulario">
              <label htmlFor="registerEmail">E-mail</label>
              <input
                type="email"
                id="registerEmail"
                name="email"
                placeholder="seu@email.com"
                value={formData.email}
                onChange={handleInputChange}
                required
                autoComplete="email"
              />
            </div>

            <div className="grupo-formulario">
              <label htmlFor="registerBirth">Data de nascimento</label>
              <input
                type="date"
                id="registerBirth"
                name="dataNascimento"
                value={formData.dataNascimento}
                onChange={handleInputChange}
                required
                max={new Date().toISOString().split('T')[0]}
              />
            </div>
            
            <div className="grupo-formulario">
              <label htmlFor="registerPassword">Senha</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="registerPassword"
                  name="senha"
                  placeholder="Mínimo 8 caracteres"
                  value={formData.senha}
                  onChange={handleInputChange}
                  required
                  autoComplete="new-password"
                  minLength={8}
                  style={{ width: '100%', paddingRight: '40px' }}
                />
                <button
                  type="button"
                  onClick={togglePassword}
                  style={{
                    position: 'absolute',
                    right: '10px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '18px'
                  }}
                >
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>
            </div>
            
            <button type="submit" className="botao-enviar" disabled={loading}>
              {loading ? 'Registrando...' : 'Registrar'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}

export default AuthModal
