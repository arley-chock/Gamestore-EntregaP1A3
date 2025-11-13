import { useState, useEffect } from 'react'
import { API_BASE_URL } from '../utils/api'

export function useAuth() {
  const [user, setUser] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    checkAuthStatus()
  }, [])

  const checkAuthStatus = async () => {
    try {
      const token = localStorage.getItem('authToken')
      if (!token) {
        setUser(null)
        setIsAdmin(false)
        setIsLoading(false)
        return
      }

      const response = await fetch(`${API_BASE_URL}/perfil`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        mode: 'cors'
      })

      if (response.ok) {
        const userData = await response.json()
        setUser(userData)
        
        // Verificar se é admin
        const adminResponse = await fetch(`${API_BASE_URL}/auth/check-admin`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          mode: 'cors'
        })
        
        if (adminResponse.ok) {
          setIsAdmin(true)
        } else {
          setIsAdmin(false)
        }
      } else {
        localStorage.removeItem('authToken')
        setUser(null)
        setIsAdmin(false)
      }
    } catch (error) {
      console.error('Erro ao verificar autenticação:', error)
      setUser(null)
      setIsAdmin(false)
    } finally {
      setIsLoading(false)
    }
  }

  const login = async (email, senha) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, senha }),
        mode: 'cors'
      })

      const data = await response.json()

      if (response.ok) {
        localStorage.setItem('authToken', data.token)
        await checkAuthStatus()
        return { success: true }
      } else {
        return { success: false, message: data.message || 'Erro ao fazer login' }
      }
    } catch (error) {
      console.error('Erro no login:', error)
      return { success: false, message: 'Erro de conexão. Tente novamente.' }
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

      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          nome,
          email,
          dataNascimento: formattedDate,
          senha
        }),
        mode: 'cors'
      })

      const data = await response.json()

      if (response.ok) {
        if (data.token) {
          localStorage.setItem('authToken', data.token)
          await checkAuthStatus()
        }
        return { success: true }
      } else {
        return { success: false, message: data.message || 'Erro ao criar conta' }
      }
    } catch (error) {
      console.error('Erro no registro:', error)
      return { success: false, message: 'Erro de conexão. Tente novamente.' }
    }
  }

  const logout = () => {
    localStorage.removeItem('authToken')
    setUser(null)
    setIsAdmin(false)
    window.location.reload()
  }

  return {
    user,
    isAdmin,
    isLoading,
    login,
    register,
    logout,
    checkAuthStatus
  }
}

