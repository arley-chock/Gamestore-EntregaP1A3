import { useState, useEffect } from 'react'
import { getLocalImageCandidates, getGifPath } from '../utils/imageUtils'
import '../../css/style.css'

function GameCard({ game, onClick }) {
  const [imageSrc, setImageSrc] = useState('')
  const [imageError, setImageError] = useState(false)
  const [isHovering, setIsHovering] = useState(false)

  useEffect(() => {
    loadImage()
  }, [game])

  const loadImage = () => {
    if (game.foto) {
      setImageSrc(game.foto)
      return
    }

    const candidates = getLocalImageCandidates(game.nome)
    let index = 0

    const tryNext = () => {
      if (index < candidates.length) {
        const img = new Image()
        img.onload = () => {
          setImageSrc(candidates[index])
          setImageError(false)
        }
        img.onerror = () => {
          index++
          tryNext()
        }
        img.src = candidates[index]
      } else {
        setImageError(true)
      }
    }

    tryNext()
  }

  const handleMouseEnter = () => {
    setIsHovering(true)
    const gifPath = getGifPath(game.nome)
    const img = new Image()
    img.onload = () => {
      setImageSrc(gifPath)
    }
    img.src = gifPath
  }

  const handleMouseLeave = () => {
    setIsHovering(false)
    loadImage()
  }

  return (
    <div
      className="cartao-jogo"
      onClick={() => onClick(game)}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="imagem-jogo">
        {imageError ? (
          <div
            style={{
              width: '100%',
              height: '200px',
              background: 'linear-gradient(135deg, #8B4513, #DC143C)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '24px',
              fontWeight: 'bold'
            }}
          >
            {game.nome.charAt(0).toUpperCase()}
          </div>
        ) : (
          <img
            className="imagem-jogo-src"
            src={imageSrc}
            alt={game.nome}
            style={{
              height: '200px',
              objectFit: 'cover',
              width: '100%'
            }}
          />
        )}
        <div className="sobreposicao-jogo">
          <div className="titulo-jogo">{game.nome.toUpperCase()}</div>
          <div className="subtitulo-jogo">{game.ano}</div>
        </div>
      </div>
    </div>
  )
}

export default GameCard
