import { useState, useEffect } from 'react'
import { fetchGames } from '../utils/api'
import GameCard from './GameCard'
import './GameList.css'

function GameList() {
  const [games, setGames] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const loadGames = async () => {
      try {
        setLoading(true)
        const data = await fetchGames()
        setGames(Array.isArray(data) ? data : [])
        setError(null)
      } catch (err) {
        setError(err.message)
        console.error('Erro ao buscar jogos:', err)
      } finally {
        setLoading(false)
      }
    }

    loadGames()
  }, [])

  if (loading) {
    return <div className="loading">Carregando jogos...</div>
  }

  if (error) {
    return <div className="error">Erro: {error}</div>
  }

  return (
    <div className="game-list">
      <h2>Jogos Disponíveis</h2>
      {games.length > 0 ? (
        <div className="games-grid">
          {games.map((game) => (
            <GameCard key={game.id} game={game} />
          ))}
        </div>
      ) : (
        <p>Nenhum jogo disponível no momento.</p>
      )}
    </div>
  )
}

export default GameList

