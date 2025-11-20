import React, { useState, useEffect } from 'react'
import { useAuth } from '../hooks/useAuth'
import GameCard from '../components/GameCard'
import GameModal from '../components/GameModal'

import { API_BASE_URL } from '../utils/api'

let CATEGORIA_MAP = {}

const Home = () => {
  const { user } = useAuth()
  const [jogos, setJogos] = useState([])
  const [jogosFiltrados, setJogosFiltrados] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedGame, setSelectedGame] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filtroCategoria, setFiltroCategoria] = useState('todos')
  const [precoMaximo, setPrecoMaximo] = useState(1000)
  const [categorias, setCategorias] = useState([]) 


  useEffect(() => {
    carregarDadosIniciais()
  }, [])

  useEffect(() => {
    aplicarFiltros()
  }, [jogos, searchTerm, filtroCategoria, precoMaximo])


 
  const carregarCategorias = async () => {
    try {
      console.log(' Carregando categorias de:', `${API_BASE_URL}/categorias`)
      const response = await fetch(`${API_BASE_URL}/categorias`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        mode: 'cors'
      })

      if (!response.ok) {
        throw new Error(`Erro HTTP ${response.status} ao carregar categorias`)
      }

      const dadosCategorias = await response.json()
      setCategorias(dadosCategorias)
      
      // Cria o mapa globalmente para ser usado na normalização dos jogos
      CATEGORIA_MAP = dadosCategorias.reduce((acc, categoria) => {
        acc[categoria.id] = categoria.nome;
        return acc;
      }, {})
      console.log('✅ Mapa de Categorias criado:', CATEGORIA_MAP)
      return CATEGORIA_MAP;

    } catch (error) {
      console.error('💥 Erro ao carregar categorias:', error)
      return {};
    }
  }

  /* 2. FUNÇÃO UNIFICADA PARA CARREGAR DADOS INICIAIS */
  const carregarDadosIniciais = async () => {
    setLoading(true)
    const categoriasMap = await carregarCategorias()
    await carregarJogos(categoriasMap)
    setLoading(false)
  }

  /* 3. FUNÇÃO PARA CARREGAR JOGOS (Agora recebe o mapa de categorias)*/
  const carregarJogos = async (categoriasMap) => {
    try {
      console.log('🔄 Carregando jogos de:', `${API_BASE_URL}/jogos`)
      
      const response = await fetch(`${API_BASE_URL}/jogos`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        mode: 'cors'
      })
      
      if (response.status === 204) {
        console.warn('⚠️ Nenhum jogo encontrado no banco de dados (status 204)')
        setJogos([])
        return
      }

      const contentType = response.headers.get('content-type') || ''
      if (!contentType.includes('application/json')) {
        const textResponse = await response.clone().text()
        console.error('❌ Resposta não é JSON. Conteúdo:', textResponse.substring(0, 200))
        throw new Error('A API retornou HTML em vez de JSON.')
      }

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Erro HTTP ${response.status}: ${errorText}`)
      }

      const dadosJogos = await response.json()
      
      if (!Array.isArray(dadosJogos)) {
        console.warn('⚠️ Resposta não é um array:', dadosJogos)
        setJogos([])
        return
      }

      const jogosNormalizados = dadosJogos.map(jogo => {
        const fkCategoria = jogo.fkCategoria || jogo.fk_categoria;
        
        return {
          ...jogo,
          fkEmpresa: jogo.fkEmpresa || jogo.fk_empresa,
          fkCategoria: fkCategoria,
          categoria: categoriasMap[fkCategoria] || jogo.categoria || 'Desconhecida'
        }
      })

      if (jogosNormalizados.length === 0) {
        console.warn('⚠️ Nenhum jogo retornado da API')
      } else {
        console.log('✅ Jogos normalizados e mapeados para nome:', jogosNormalizados.length)
      }

      setJogos(jogosNormalizados)

    } catch (error) {
      console.error('💥 Erro ao carregar jogos:', error)
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        console.error('❌ Erro de conexão: Verifique se o backend está rodando.')
      }
      setJogos([])
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
        const categoriaJogo = String(jogo.categoria || '').toLowerCase()
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
        let anoJogo = jogo.ano
        if (typeof anoJogo === 'string') {
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

  if (jogos.length > 0) {
    console.log('📊 Estado atual (com categorias mapeadas):', {
      totalJogos: jogos.length,
      primeiroJogoCategoria: jogos[0]?.categoria // Deve ser o nome da categoria
    })
  }

  const isDefaultView = !searchTerm && filtroCategoria === 'todos' && precoMaximo === 1000

  return (
    <div className="container">
      <div className="navegacao-breadcrumb">
        <button className="botao-breadcrumb">
          INÍCIO &gt; CATÁLOGO DE JOGOS
        </button>
      </div>


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
              {categorias.map((cat) => (
                <button  key={cat.id}className={`botao-filtro ${filtroCategoria === cat.nome.toLowerCase() ? 'ativo' : ''}`}
                  onClick={() => setFiltroCategoria(cat.nome.toLowerCase())}>{cat.nome}</button>
              ))}
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
                Não há jogos cadastrados no banco de dados ou a conexão falhou.
              </p>
              <p style={{ color: '#999', fontSize: '14px' }}>
                Verifique o console (F12) para detalhes sobre a API.
              </p>
            </div>
          )}

          {isDefaultView && jogos.length > 0 && (
            <>
              {/* Lançamentos */}
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

              {/* Em Alta */}
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

              {/* Recomendados */}
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
            </>
          )}

          {/* Resultados Filtrados - EXIBE SE HOUVER BUSCA/FILTRO ATIVO */}
          {(!isDefaultView && jogos.length > 0) && (
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