// Utilitário centralizado para chamadas de API
// Usar proxy do Vite (em dev) ou URL completa (em produção)
const API_BASE_URL = import.meta.env.DEV 
  ? '/api/v1'  // Em desenvolvimento, usar proxy do Vite
  : 'http://localhost:3000/api/v1'  // Em produção, usar URL completa

export async function fetchGames() {
  try {
    console.log('🔍 Buscando jogos de:', `${API_BASE_URL}/jogos`)
    
    const response = await fetch(`${API_BASE_URL}/jogos`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      mode: 'cors', // Garantir que CORS está habilitado
    })

    console.log('📡 Resposta recebida:', {
      status: response.status,
      statusText: response.statusText,
      ok: response.ok,
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('❌ Erro na resposta:', errorText)
      throw new Error(`Erro HTTP ${response.status}: ${response.statusText}`)
    }

    const data = await response.json()
    console.log('✅ Dados recebidos:', Array.isArray(data) ? `${data.length} jogos` : data)
    
    if (!Array.isArray(data)) {
      console.warn('⚠️ Resposta não é um array:', data)
      return []
    }
    
    return data
  } catch (error) {
    console.error('💥 Erro ao fazer fetch:', error)
    
    // Verificar se é erro de rede
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      throw new Error('Não foi possível conectar ao servidor. Verifique se o backend está rodando em http://localhost:3000')
    }
    
    throw error
  }
}

export async function testConnection() {
  try {
    console.log('🧪 Testando conexão com backend...')
    const response = await fetch('http://localhost:3000/check', {
      method: 'GET',
      mode: 'cors',
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

export { API_BASE_URL }
