import React from 'react'

const GameCard = ({ jogo, onClick }) => {
  const slugifyGameName = (name) => {
    if (!name) return ''
    return name
      .toString()
      .normalize('NFD').replace(/\p{Diacritic}+/gu, '') // remove acentos
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
  }

  const getImageUrl = (gameName) => {
    const slug = slugifyGameName(gameName)
    // Tentar primeiro com imagem local, depois fallback para placeholder
    return `/images/${slug}.jpg`
  }

  const handleImageError = (e) => {
    // Se a imagem local não existir, usar um placeholder gradiente
    e.target.style.display = 'none'
    const placeholder = e.target.parentElement.querySelector('.image-placeholder')
    if (placeholder) {
      placeholder.style.display = 'flex'
    }
  }

  const handleImageLoad = (e) => {
    const placeholder = e.target.parentElement.querySelector('.image-placeholder')
    if (placeholder) {
      placeholder.style.display = 'none'
    }
  }

  const getInitial = (name) => {
    return name ? name.charAt(0).toUpperCase() : '?'
  }

  if (!jogo || !jogo.nome) {
    return null
  }

  return (
    <div className="cartao-jogo" onClick={onClick}>
      <div className="imagem-jogo">
        <img 
          src={getImageUrl(jogo.nome)} 
          alt={jogo.nome}
          onError={handleImageError}
          onLoad={handleImageLoad}
          style={{ display: 'none' }}
        />
        <div className="image-placeholder" style={{
          width: '100%',
          height: '100%',
          background: 'linear-gradient(135deg, #8B4513, #DC143C)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontSize: '48px',
          fontWeight: 'bold',
          position: 'absolute',
          top: 0,
          left: 0
        }}>
          {getInitial(jogo.nome)}
        </div>
        <div className="sobreposicao-jogo">
          <div className="titulo-jogo">{(jogo.nome || '').toUpperCase()}</div>
          <div className="subtitulo-jogo">
            {jogo.ano || 'N/A'} • R$ {(jogo.preco || 0).toFixed(2)}
          </div>
        </div>
      </div>
    </div>
  )
}

export default GameCard