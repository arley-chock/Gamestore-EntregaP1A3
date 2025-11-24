import React, { useRef, useEffect, useState } from 'react'
import { getGifPath, getLocalImageCandidates } from '../utils/imageUtils'

const GameCard = ({ jogo, onClick }) => {
  const imgRef = useRef(null)
  const cardRef = useRef(null)
  const gifRef = useRef(null)
  const placeholderRef = useRef(null)
  const [loaded, setLoaded] = useState(false)

  const createPlaceholderDataUrl = (letter, width = 400, height = 200) => {
    const bg1 = '#8B4513'
    const bg2 = '#DC143C'
    const fontSize = Math.floor(height / 4)
    const svg = `
      <svg xmlns='http://www.w3.org/2000/svg' width='${width}' height='${height}'>
        <defs>
          <linearGradient id='g' x1='0' x2='1'>
            <stop offset='0' stop-color='${bg1}' />
            <stop offset='1' stop-color='${bg2}' />
          </linearGradient>
        </defs>
        <rect width='100%' height='100%' fill='url(#g)' />
        <text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' fill='white' font-family='Arial, Helvetica, sans-serif' font-size='${fontSize}' font-weight='700'>${(letter||'?').toString().charAt(0)}</text>
      </svg>`
    return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`
  }

  const handleImageError = (e) => {
    const img = e.target
    const candidates = img.dataset._candidates ? JSON.parse(img.dataset._candidates) : []
    let idx = Number(img.dataset._candidateIndex || 0)
    idx += 1
    if (idx < candidates.length) {
      img.dataset._candidateIndex = idx
      img.src = candidates[idx]
      return
    }

    // nenhum candidato restante: usar placeholder data-url e manter o <img>
    const ph = createPlaceholderDataUrl(jogo.nome ? jogo.nome.charAt(0) : '?', img.clientWidth || 400, img.clientHeight || 200)
    img.src = ph
    img.dataset._originalSrc = ph
    if (placeholderRef.current) placeholderRef.current.style.display = 'none'
    setLoaded(true)
  }

  const handleImageLoad = (e) => {
    if (placeholderRef.current) placeholderRef.current.style.display = 'none'
    setLoaded(true)
  }

  const getInitial = (name) => {
    return name ? name.charAt(0).toUpperCase() : '?'
  }

  const handleKeyDownCard = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      if (onClick) onClick()
    }
  }

  useEffect(() => {
    const img = imgRef.current

    if (!img || !jogo || !jogo.nome) return

    // preparar candidatos locais (png/jpg/webp)
    const candidates = getLocalImageCandidates(jogo.nome)
    img.dataset._candidates = JSON.stringify(candidates)
    img.dataset._candidateIndex = 0
    img.src = candidates[0]

    // verificar e anexar hover para GIF quando disponível
    const gifPath = getGifPath(jogo.nome)
    const probe = new Image()
    let enterHandler = null
    let leaveHandler = null

    probe.onload = () => {
      // se o GIF existe, vamos usar um overlay <img> para reproduzi-lo sem trocar o src principal
      enterHandler = () => {
        try {
          const g = gifRef.current
          if (!g) return
          g.src = gifPath
          g.style.display = 'block'
        } catch (e) {}
      }

      leaveHandler = () => {
        try {
          const g = gifRef.current
          if (!g) return
          g.style.display = 'none'
          g.src = ''
        } catch (e) {}
      }

      const cardEl = cardRef.current
      if (cardEl) {
        cardEl.addEventListener('mouseenter', enterHandler)
        cardEl.addEventListener('mouseleave', leaveHandler)
      }
    }
    probe.onerror = () => {}
    probe.src = gifPath

    return () => {
      try {
        const cardEl = cardRef.current
        if (cardEl && enterHandler) cardEl.removeEventListener('mouseenter', enterHandler)
        if (cardEl && leaveHandler) cardEl.removeEventListener('mouseleave', leaveHandler)
      } catch (e) {}
    }
  }, [jogo])

  if (!jogo || !jogo.nome) {
    return null
  }

  return (
    <div ref={cardRef} className="cartao-jogo" onClick={onClick} role="button" tabIndex={0} onKeyDown={handleKeyDownCard}>
      <div className="imagem-jogo" style={{ position: 'relative' }}>
        <img
          ref={imgRef}
          alt={jogo.nome}
          onError={handleImageError}
          onLoad={handleImageLoad}
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
        />
        <img
          ref={gifRef}
          alt={`${jogo.nome} gif`}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            display: 'none',
            pointerEvents: 'none'
          }}
        />
        <div
          ref={placeholderRef}
          className="image-placeholder"
          style={{
            width: '100%',
            height: '100%',
            background: 'linear-gradient(135deg, #8B4513, #DC143C)',
            display: loaded ? 'none' : 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontSize: '48px',
            fontWeight: 'bold',
            position: 'absolute',
            top: 0,
            left: 0
          }}
        >
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