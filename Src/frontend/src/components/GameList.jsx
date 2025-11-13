import { useState, useEffect } from 'react'
import GameCard from './GameCard'
import './GameList.css'

function GameList() {
  const [games, setGames] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchGames = async () => {
      try {
        setLoading(true)
        const response = await fetch('http://localhost:3000/api/v1/jogos')
        if (!response.ok) {
          throw new Error('Erro ao buscar jogos')
        }
        const data = await response.json()
        setGames(data)
        setError(null)
      } catch (err) {
        setError(err.message)
        console.error('Erro ao buscar jogos:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchGames()
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

