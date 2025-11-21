const sanitizeUrl = (url) => {
  if (!url) return ''
  return url.endsWith('/') ? url.slice(0, -1) : url
}

const SERVER_BASE_URL = sanitizeUrl(import.meta.env.VITE_SERVER_URL || 'http://localhost:3000')
const DEFAULT_API_BASE = import.meta.env.DEV ? '/api/v1' : `${SERVER_BASE_URL}/api/v1`
const API_BASE_URL = sanitizeUrl(import.meta.env.VITE_API_BASE_URL || DEFAULT_API_BASE)
const PUBLIC_API_BASE_URL = `${API_BASE_URL}/public`

const joinUrl = (base, path = '') => {
  if (!path) return base
  return `${base}${path.startsWith('/') ? path : `/${path}`}`
}

const getDefaultHeaders = (body) => {
  if (body instanceof FormData) return {}
  return { 'Content-Type': 'application/json' }
}

export const getAuthToken = () => {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('authToken')
}

export const getAuthHeaders = () => {
  const token = getAuthToken()
  return token ? { Authorization: `Bearer ${token}` } : {}
}

export async function apiFetch(path, { method = 'GET', body, headers = {}, auth = false, base = 'private' } = {}) {
  const selectedBase = base === 'public' ? PUBLIC_API_BASE_URL : API_BASE_URL
  const url = joinUrl(selectedBase, path)

  const finalHeaders = {
    ...getDefaultHeaders(body),
    ...headers
  }

  if (auth) {
    const token = getAuthToken()
    if (!token) {
      throw new Error('Token de autenticação não encontrado. Faça login novamente.')
    }
    finalHeaders.Authorization = `Bearer ${token}`
  }

  const response = await fetch(url, {
    method,
    headers: finalHeaders,
    body: body
      ? body instanceof FormData
        ? body
        : JSON.stringify(body)
      : undefined,
    mode: 'cors'
  })

  if (response.status === 204) {
    return null
  }

  const contentType = response.headers.get('content-type') || ''
  const parsedBody = contentType.includes('application/json')
    ? await response.json()
    : await response.text()

  if (!response.ok) {
    const message = typeof parsedBody === 'string'
      ? parsedBody
      : parsedBody?.message || parsedBody?.error || 'Erro ao comunicar com o servidor.'
    throw new Error(message)
  }

  return parsedBody
}

export async function fetchGames() {
  try {
    console.log('🔍 Buscando jogos do backend...')
    const token = getAuthToken()

    try {
      const privateGames = await apiFetch('/jogos', {
        auth: Boolean(token)
      })
      if (Array.isArray(privateGames) && privateGames.length > 0) {
        return privateGames
      }
    } catch (privateError) {
      console.warn('⚠️ Falha ao acessar /jogos autenticado. Tentando rota pública...', privateError.message)
    }

    const publicGames = await apiFetch('/jogos', { base: 'public' })

    if (!Array.isArray(publicGames)) {
      console.warn('⚠️ Resposta pública não é um array:', publicGames)
      return []
    }

    return publicGames.map((game, index) => ({
      id: game.id || `public-${index}`,
      ...game
    }))
  } catch (error) {
    console.error('💥 Erro ao buscar jogos:', error)
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      throw new Error(`Não foi possível conectar ao servidor em ${SERVER_BASE_URL}.`)
    }
    throw error
  }
}

export async function testConnection() {
  try {
    console.log('🧪 Testando conexão com backend...')
    const response = await fetch(`${SERVER_BASE_URL}/check`, {
      method: 'GET',
      mode: 'cors'
    })

    if (response.ok) {
      const data = await response.json()
      console.log('✅ Conexão OK:', data)
      return true
    }
    return false
  } catch (error) {
    console.error('❌ Erro ao testar conexão:', error)
    return false
  }
}

export {
  API_BASE_URL,
  PUBLIC_API_BASE_URL,
  SERVER_BASE_URL
}
