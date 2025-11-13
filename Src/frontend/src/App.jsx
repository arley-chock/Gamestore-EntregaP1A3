import { useState } from 'react'
import { useAuth } from './hooks/useAuth'
import { useGames } from './hooks/useGames'
import Header from './components/Header'
import Footer from './components/Footer'
import Sidebar from './components/Sidebar'
import GameSection from './components/GameSection'
import AuthModal from './components/AuthModal'
import GameModal from './components/GameModal'
import './App.css'
import '../css/style.css'

function App() {
  const { user } = useAuth()
  const { filteredGames, loading, error, applyFilters, getLancamentos, getJogosEmAlta, getJogosRecomendados } = useGames()
  
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
  const [selectedGame, setSelectedGame] = useState(null)
  const [isGameModalOpen, setIsGameModalOpen] = useState(false)

  const handleFilterChange = (filters) => {
    applyFilters(filters.searchTerm, filters.category, filters.maxPrice)
  }

  const handleGameClick = (game) => {
    setSelectedGame(game)
    setIsGameModalOpen(true)
  }

  const handleCloseGameModal = () => {
    setIsGameModalOpen(false)
    setSelectedGame(null)
  }

  if (loading) {
    return (
      <div className="App">
        <Header />
        <main className="conteudo-principal" style={{ marginTop: '80px', padding: '2rem' }}>
          <div style={{ textAlign: 'center' }}>
            <p>Carregando jogos...</p>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  if (error) {
    return (
      <div className="App">
        <Header onOpenAuthModal={() => setIsAuthModalOpen(true)} />
        <main className="conteudo-principal" style={{ marginTop: '80px', padding: '2rem' }}>
          <div style={{ 
            textAlign: 'center', 
            color: '#DC143C',
            background: 'rgba(255, 255, 255, 0.9)',
            padding: '2rem',
            borderRadius: '8px',
            maxWidth: '600px',
            margin: '2rem auto',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
          }}>
            <h2 style={{ marginBottom: '1rem' }}>❌ Erro ao carregar jogos</h2>
            <p style={{ marginBottom: '1rem' }}>{error}</p>
            <div style={{ marginTop: '1.5rem' }}>
              <p style={{ fontSize: '0.9rem', color: '#666', marginBottom: '0.5rem' }}>
                Verifique se:
              </p>
              <ul style={{ textAlign: 'left', display: 'inline-block', fontSize: '0.9rem', color: '#666' }}>
                <li>O backend está rodando na porta 3000</li>
                <li>A URL da API está correta: http://localhost:3000/api/v1</li>
                <li>Não há problemas de CORS</li>
                <li>O console do navegador para mais detalhes</li>
              </ul>
            </div>
            <button
              onClick={() => window.location.reload()}
              style={{
                marginTop: '1rem',
                padding: '10px 20px',
                background: '#DC143C',
                color: 'white',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer',
                fontWeight: 'bold'
              }}
            >
              Tentar Novamente
            </button>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  const lancamentos = getLancamentos()
  const emAlta = getJogosEmAlta()
  const recomendacoes = getJogosRecomendados()

  return (
    <div className="App">
      <Header onOpenAuthModal={() => setIsAuthModalOpen(true)} />
      
      <main className="conteudo-principal">
        <div className="navegacao-breadcrumb">
          <nav className="breadcrumb-nav" aria-label="Navegação breadcrumb">
            <a href="/" className="botao-breadcrumb">
              INÍCIO
            </a>
            <span className="breadcrumb-separator" aria-hidden="true">
              &gt;
            </span>
            <a href="/" className="botao-breadcrumb">
              JOGOS EM DESTAQUE
            </a>
          </nav>
        </div>

        <div className="conteiner-conteudo">
          <Sidebar onFilterChange={handleFilterChange} />

          <section className="conteudo-jogos">
            <GameSection
              title="LANÇAMENTOS"
              games={lancamentos}
              onGameClick={handleGameClick}
            />

            <GameSection
              title="EM ALTA"
              games={emAlta}
              onGameClick={handleGameClick}
            />

            <GameSection
              title="RECOMENDAÇÕES"
              games={recomendacoes}
              onGameClick={handleGameClick}
            />
          </section>
        </div>
      </main>

      <Footer />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />

      {selectedGame && (
        <GameModal
          game={selectedGame}
          isOpen={isGameModalOpen}
          onClose={handleCloseGameModal}
        />
      )}
    </div>
  )
}

export default App
