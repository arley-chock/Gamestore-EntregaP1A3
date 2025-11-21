import { useState, useEffect, createContext, useContext } from 'react'
import { apiFetch, getAuthToken } from '../utils/api'

// Criar o contexto de autenticação
const AuthContext = createContext(null)

// Hook para usar o contexto de autenticação
export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider')
  }
  return context
}

// Provider de autenticação
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    checkAuthStatus()
  }, [])

  const decodeToken = (token) => {
    try {
      const payload = token.split('.')[1]
      return JSON.parse(atob(payload))
    } catch (error) {
      console.error('Token inválido:', error)
      return null
    }
  }

  const checkAuthStatus = async () => {
    setIsLoading(true)
    try {
      const token = getAuthToken()
      if (!token) {
        setUser(null)
        setIsAdmin(false)
        return
      }

      const decoded = decodeToken(token)
      if (!decoded?.id) {
        localStorage.removeItem('authToken')
        setUser(null)
        setIsAdmin(false)
        return
      }

      const userData = await apiFetch(`/usuarios/${decoded.id}`, {
        auth: true
      })

      setUser({
        ...userData,
        perfil: decoded.perfil
      })
      setIsAdmin(decoded.perfil === 'Administrador')
    } catch (error) {
      console.error('Erro ao verificar autenticação:', error)
      localStorage.removeItem('authToken')
      setUser(null)
      setIsAdmin(false)
    } finally {
      setIsLoading(false)
    }
  }

  const login = async (email, senha) => {
    try {
      const data = await apiFetch('/auth/login', {
        method: 'POST',
        body: { email, senha }
      })

      if (data?.token) {
        localStorage.setItem('authToken', data.token)
        await checkAuthStatus()
        return { success: true }
      }

      return { success: false, message: 'Token não retornado pelo servidor.' }
    } catch (error) {
      console.error('Erro no login:', error)
      return { success: false, message: error.message || 'Erro de conexão. Tente novamente.' }
    }
  }

  const register = async (nome, email, dataNascimento, senha) => {
    try {
      // Converter data de YYYY-MM-DD para DD/MM/YYYY
      let formattedDate = dataNascimento
      if (dataNascimento.includes('-')) {
        const [ano, mes, dia] = dataNascimento.split('-')
        formattedDate = `${dia}/${mes}/${ano}`
      }

      await apiFetch('/auth/register', {
        method: 'POST',
        body: {
          nome,
          email,
          dataNascimento: formattedDate,
          senha
        }
      })

      const loginResult = await login(email, senha)
      if (!loginResult.success) {
        return {
          success: false,
          message: 'Conta criada, mas houve erro ao fazer login automático. Tente entrar manualmente.'
        }
      }

      return { success: true }
    } catch (error) {
      console.error('Erro no registro:', error)
      return { success: false, message: error.message || 'Erro de conexão. Tente novamente.' }
    }
  }

  const logout = () => {
    localStorage.removeItem('authToken')
    setUser(null)
    setIsAdmin(false)
    window.location.reload()
  }

  const value = {
    user,
    isAdmin,
    isLoading,
    login,
    register,
    logout,
    checkAuthStatus
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
