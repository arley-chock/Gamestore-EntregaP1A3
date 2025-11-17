import React, { useState, useEffect } from 'react'
import { useAuth } from '../hooks/useAuth'
import GameCard from '../components/GameCard'
import GameModal from '../components/GameModal'

import { API_BASE_URL } from '../utils/api'

const Home = () => {
  const { user } = useAuth()
  const [jogos, setJogos] = useState([])
  const [jogosFiltrados, setJogosFiltrados] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedGame, setSelectedGame] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filtroCategoria, setFiltroCategoria] = useState('todos')
  const [precoMaximo, setPrecoMaximo] = useState(1000)

  useEffect(() => {
    carregarJogos()
  }, [])

  useEffect(() => {
    aplicarFiltros()
  }, [jogos, searchTerm, filtroCategoria, precoMaximo])

  const carregarJogos = async () => {
    try {
      setLoading(true)
      console.log('🔄 Carregando jogos de:', `${API_BASE_URL}/jogos`)
      
      const response = await fetch(`${API_BASE_URL}/jogos`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        mode: 'cors'
      })
      
      console.log('📡 Resposta recebida:', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok
      })

      // Status 204 significa "No Content" - não há jogos no banco (mas agora retornamos 200 com array vazio)
      if (response.status === 204) {
        console.warn('⚠️ Nenhum jogo encontrado no banco de dados (status 204)')
        console.warn('💡 Dica: Verifique se o banco de dados foi populado corretamente')
        setJogos([])
        setLoading(false)
        return
      }

      // Verificar se a resposta é JSON antes de fazer parse
      const contentType = response.headers.get('content-type') || ''
      console.log('📋 Content-Type da resposta:', contentType)
      
      if (!contentType.includes('application/json')) {
        // Clonar a resposta para poder ler o texto sem consumir o body original
        const clonedResponse = response.clone()
        const textResponse = await clonedResponse.text()
        console.error('❌ Resposta não é JSON. Content-Type:', contentType)
        console.error('❌ Conteúdo recebido (primeiros 200 chars):', textResponse.substring(0, 200))
        throw new Error('A API retornou HTML em vez de JSON. Verifique se a rota está correta e se o backend está configurado corretamente.')
      }

      if (!response.ok) {
        const errorText = await response.text()
        console.error('❌ Erro na resposta:', errorText)
        throw new Error(`Erro HTTP ${response.status}: ${response.statusText}`)
      }

      const dadosJogos = await response.json()
      console.log('✅ Dados recebidos:', Array.isArray(dadosJogos) ? `${dadosJogos.length} jogos` : dadosJogos)
      
      if (!Array.isArray(dadosJogos)) {
        console.warn('⚠️ Resposta não é um array:', dadosJogos)
        setJogos([])
        return
      }

      // Normalizar os dados (garantir que fk_empresa e fk_categoria sejam mapeados corretamente)
      const jogosNormalizados = dadosJogos.map(jogo => ({
        ...jogo,
        fkEmpresa: jogo.fkEmpresa || jogo.fk_empresa,
        fkCategoria: jogo.fkCategoria || jogo.fk_categoria,
        categoria: jogo.categoria || jogo.fkCategoria || jogo.fk_categoria
      }))

      if (jogosNormalizados.length === 0) {
        console.warn('⚠️ Nenhum jogo retornado da API')
      } else {
        console.log('✅ Jogos normalizados:', jogosNormalizados.length)
      }

      setJogos(jogosNormalizados)
    } catch (error) {
      console.error('💥 Erro ao carregar jogos:', error)
      // Verificar se é erro de rede
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        console.error('❌ Erro de conexão: Não foi possível conectar ao servidor. Verifique se o backend está rodando em http://localhost:3000')
      }
      setJogos([])
    } finally {
      setLoading(false)
    }
  }

  const aplicarFiltros = () => {
    let filtrados = [...jogos]

    if (searchTerm) {
      filtrados = filtrados.filter(jogo =>
        jogo.nome?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (filtroCategoria !== 'todos') {
      filtrados = filtrados.filter(jogo => {
        // Verificar se a categoria corresponde (pode ser ID ou nome)
        const categoriaJogo = String(jogo.categoria || jogo.fkCategoria || '').toLowerCase()
        const categoriaFiltro = filtroCategoria.toLowerCase()
        return categoriaJogo.includes(categoriaFiltro)
      })
    }

    filtrados = filtrados.filter(jogo => {
      const preco = parseFloat(jogo.preco) || 0
      return preco <= precoMaximo
    })

    setJogosFiltrados(filtrados)
  }

  const obterLancamentos = () => {
    if (!jogos || jogos.length === 0) return []
    
    const anoAtual = new Date().getFullYear()
    return jogos
      .filter(jogo => {
        // Tratar diferentes formatos de ano
        let anoJogo = jogo.ano
        if (typeof anoJogo === 'string') {
          // Se for string, tentar extrair o ano
          const anoExtraido = parseInt(anoJogo.split('-')[0] || anoJogo)
          anoJogo = isNaN(anoExtraido) ? 0 : anoExtraido
        }
        return anoJogo >= anoAtual - 1
      })
      .sort((a, b) => {
        let anoA = typeof a.ano === 'string' ? parseInt(a.ano.split('-')[0] || a.ano) : a.ano
        let anoB = typeof b.ano === 'string' ? parseInt(b.ano.split('-')[0] || b.ano) : b.ano
        return (anoB || 0) - (anoA || 0)
      })
      .slice(0, 6)
  }

  const obterJogosEmAlta = () => {
    if (!jogos || jogos.length === 0) return []
    
    return jogos
      .filter(jogo => jogo.preco != null && !isNaN(jogo.preco))
      .sort((a, b) => (b.preco || 0) - (a.preco || 0))
      .slice(0, 6)
  }

  const obterJogosRecomendados = () => {
    if (!jogos || jogos.length === 0) return []
    
    return jogos
      .filter(jogo => {
        const preco = parseFloat(jogo.preco) || 0
        return preco > 0 && preco < 50
      })
      .sort((a, b) => {
        const precoA = parseFloat(a.preco) || 0
        const precoB = parseFloat(b.preco) || 0
        if (precoA !== precoB) {
          return precoA - precoB
        }
        let anoA = typeof a.ano === 'string' ? parseInt(a.ano.split('-')[0] || a.ano) : a.ano
        let anoB = typeof b.ano === 'string' ? parseInt(b.ano.split('-')[0] || b.ano) : b.ano
        return (anoB || 0) - (anoA || 0)
      })
      .slice(0, 6)
  }

  const handleGameClick = (jogo) => {
    setSelectedGame(jogo)
  }

  const handleCloseModal = () => {
    setSelectedGame(null)
  }

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading">Carregando jogos...</div>
      </div>
    )
  }

  // Debug: mostrar informações sobre os jogos carregados
  if (jogos.length > 0) {
    console.log('📊 Estado atual:', {
      totalJogos: jogos.length,
      lancamentos: obterLancamentos().length,
      emAlta: obterJogosEmAlta().length,
      recomendados: obterJogosRecomendados().length,
      primeiroJogo: jogos[0]
    })
  }

  return (
    <div className="container">
      {/* Breadcrumb */}
      <div className="navegacao-breadcrumb">
        <button className="botao-breadcrumb">
          INÍCIO &gt; CATÁLOGO DE JOGOS
        </button>
      </div>

      {/* Search and Filters */}
      <div className="conteiner-conteudo">
        <aside className="barra-lateral-filtros">
          <div className="secao-filtro">
            <h3 className="titulo-filtro">Buscar Jogos</h3>
            <input
              type="text"
              id="gameSearchInput"
              placeholder="Digite o nome do jogo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="secao-filtro">
            <h3 className="titulo-filtro">Categoria</h3>
            <div className="categorias-filtro">
              <button 
                className={`botao-filtro ${filtroCategoria === 'todos' ? 'ativo' : ''}`}
                onClick={() => setFiltroCategoria('todos')}
              >
                Todos
              </button>
              <button 
                className={`botao-filtro ${filtroCategoria === 'acao' ? 'ativo' : ''}`}
                onClick={() => setFiltroCategoria('acao')}
              >
                Ação
              </button>
              <button 
                className={`botao-filtro ${filtroCategoria === 'aventura' ? 'ativo' : ''}`}
                onClick={() => setFiltroCategoria('aventura')}
              >
                Aventura
              </button>
              <button 
                className={`botao-filtro ${filtroCategoria === 'rpg' ? 'ativo' : ''}`}
                onClick={() => setFiltroCategoria('rpg')}
              >
                RPG
              </button>
              <button 
                className={`botao-filtro ${filtroCategoria === 'estrategia' ? 'ativo' : ''}`}
                onClick={() => setFiltroCategoria('estrategia')}
              >
                Estratégia
              </button>
            </div>
          </div>

          <div className="secao-filtro">
            <h3 className="titulo-filtro">Preço Máximo</h3>
            <div className="faixa-preco">
              <input
                type="range"
                className="slider-preco"
                min="0"
                max="1000"
                value={precoMaximo}
                onChange={(e) => setPrecoMaximo(Number(e.target.value))}
              />
              <div className="rotulos-preco">
                <span>R$ 0</span>
                <span>R$ {precoMaximo}</span>
              </div>
            </div>
          </div>
        </aside>

        <main className="conteudo-jogos">
          {/* Mensagem se não houver jogos */}
          {jogos.length === 0 && (
            <div style={{ 
              textAlign: 'center', 
              padding: '60px 20px',
              background: 'rgba(255, 255, 255, 0.9)',
              borderRadius: '15px',
              marginBottom: '30px'
            }}>
              <h2 style={{ color: '#2F2F2F', marginBottom: '15px' }}>Nenhum jogo encontrado</h2>
              <p style={{ color: '#666', marginBottom: '20px' }}>
                Não há jogos cadastrados no banco de dados no momento.
              </p>
              <p style={{ color: '#999', fontSize: '14px' }}>
                Verifique o console do navegador (F12) para mais detalhes sobre a conexão com a API.
              </p>
            </div>
          )}

          {/* Lançamentos */}
          {jogos.length > 0 && (
            <section className="secao-jogo">
              <h2 className="titulo-secao">Lançamentos</h2>
              <div className="grade-jogos">
                {obterLancamentos().length > 0 ? (
                  obterLancamentos().map(jogo => (
                    <GameCard 
                      key={jogo.id} 
                      jogo={jogo} 
                      onClick={() => handleGameClick(jogo)} 
                    />
                  ))
                ) : (
                  <p style={{ textAlign: 'center', color: '#666', padding: '40px', gridColumn: '1 / -1' }}>
                    Nenhum lançamento disponível no momento.
                  </p>
                )}
              </div>
            </section>
          )}

          {/* Em Alta */}
          {jogos.length > 0 && (
            <section className="secao-jogo">
              <h2 className="titulo-secao">Em Alta</h2>
              <div className="grade-jogos">
                {obterJogosEmAlta().length > 0 ? (
                  obterJogosEmAlta().map(jogo => (
                    <GameCard 
                      key={jogo.id} 
                      jogo={jogo} 
                      onClick={() => handleGameClick(jogo)} 
                    />
                  ))
                ) : (
                  <p style={{ textAlign: 'center', color: '#666', padding: '40px', gridColumn: '1 / -1' }}>
                    Nenhum jogo em alta no momento.
                  </p>
                )}
              </div>
            </section>
          )}

          {/* Recomendados */}
          {jogos.length > 0 && (
            <section className="secao-jogo">
              <h2 className="titulo-secao">Recomendados</h2>
              <div className="grade-jogos">
                {obterJogosRecomendados().length > 0 ? (
                  obterJogosRecomendados().map(jogo => (
                    <GameCard 
                      key={jogo.id} 
                      jogo={jogo} 
                      onClick={() => handleGameClick(jogo)} 
                    />
                  ))
                ) : (
                  <p style={{ textAlign: 'center', color: '#666', padding: '40px', gridColumn: '1 / -1' }}>
                    Nenhuma recomendação disponível no momento.
                  </p>
                )}
              </div>
            </section>
          )}

          {/* Resultados Filtrados */}
          {(searchTerm || filtroCategoria !== 'todos' || precoMaximo < 1000) && (
            <section className="secao-jogo">
              <h2 className="titulo-secao">
                Resultados da Busca ({jogosFiltrados.length} jogos encontrados)
              </h2>
              {jogosFiltrados.length > 0 ? (
                <div className="grade-jogos">
                  {jogosFiltrados.map(jogo => (
                    <GameCard 
                      key={jogo.id} 
                      jogo={jogo} 
                      onClick={() => handleGameClick(jogo)} 
                    />
                  ))}
                </div>
              ) : (
                <p style={{ textAlign: 'center', color: '#666', padding: '40px' }}>
                  Nenhum jogo encontrado com os filtros aplicados.
                </p>
              )}
            </section>
          )}
        </main>
      </div>

      {/* Game Detail Modal */}
      {selectedGame && (
        <GameModal 
          jogo={selectedGame}
          onClose={handleCloseModal}
        />
      )}
    </div>
  )
}

export default Home