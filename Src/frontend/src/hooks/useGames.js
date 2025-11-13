import { useState, useEffect } from 'react'
import { fetchGames, testConnection } from '../utils/api'

export function useGames() {
  const [games, setGames] = useState([])
  const [filteredGames, setFilteredGames] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    loadGames()
  }, [])

  const loadGames = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Primeiro testar a conexão
      const connectionOk = await testConnection()
      if (!connectionOk) {
        throw new Error('Não foi possível conectar ao backend. Verifique se o servidor está rodando em http://localhost:3000')
      }
      
      // Buscar jogos
      const data = await fetchGames()
      
      if (Array.isArray(data)) {
        console.log(`✅ ${data.length} jogos carregados com sucesso`)
        setGames(data)
        setFilteredGames(data)
      } else {
        console.warn('⚠️ Resposta não é um array:', data)
        setGames([])
        setFilteredGames([])
      }
    } catch (err) {
      console.error('❌ Erro ao carregar jogos:', err)
      setError(err.message || 'Erro ao carregar jogos. Verifique se o backend está rodando.')
    } finally {
      setLoading(false)
    }
  }

  const getLancamentos = () => {
    const anoAtual = new Date().getFullYear()
    return filteredGames
      .filter(jogo => jogo.ano >= anoAtual - 1)
      .sort((a, b) => b.ano - a.ano)
      .slice(0, 3)
  }

  const getJogosEmAlta = () => {
    return filteredGames
      .sort((a, b) => b.preco - a.preco)
      .slice(0, 3)
  }

  const getJogosRecomendados = () => {
    return filteredGames
      .filter(jogo => jogo.preco < 50)
      .sort((a, b) => {
        // Ordenar por preço (mais barato primeiro), depois por ano (mais recente primeiro)
        if (a.preco !== b.preco) {
          return a.preco - b.preco
        }
        return b.ano - a.ano
      })
      .slice(0, 3)
  }

  const applyFilters = (searchTerm, category, maxPrice) => {
    let filtered = [...games]

    // Filtro de busca
    if (searchTerm) {
      filtered = filtered.filter(jogo =>
        jogo.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        jogo.descricao?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Filtro de categoria
    if (category) {
      filtered = filtered.filter(jogo =>
        jogo.fkCategoria?.toString().toLowerCase().includes(category.toLowerCase())
      )
    }

    // Filtro de preço
    if (maxPrice !== null && maxPrice !== undefined) {
      filtered = filtered.filter(jogo => jogo.preco <= maxPrice)
    }

    setFilteredGames(filtered)
  }

  return {
    games,
    filteredGames,
    loading,
    error,
    loadGames,
    getLancamentos,
    getJogosEmAlta,
    getJogosRecomendados,
    applyFilters
  }
}

