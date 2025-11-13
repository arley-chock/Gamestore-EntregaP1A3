import GameCard from './GameCard'
import '../../css/style.css'

function GameSection({ title, games, onGameClick }) {
  if (!games || games.length === 0) {
    return (
      <div className="secao-jogo">
        <h2 className="titulo-secao">{title}</h2>
        <div className="grade-jogos">
          <p>Nenhum jogo encontrado.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="secao-jogo">
      <h2 className="titulo-secao">{title}</h2>
      <div className="grade-jogos">
        {games.map((game) => (
          <GameCard key={game.id} game={game} onClick={onGameClick} />
        ))}
      </div>
    </div>
  )
}

export default GameSection

