import React, { useEffect, useMemo, useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { useNavigate } from 'react-router-dom'

import { apiFetch } from '../utils/api'
import { getLocalImageCandidates, slugifyGameName } from '../utils/imageUtils'

const MEDIA_SOURCE_KEYS = ['url', 'src', 'path', 'value', 'link']

const normalizeMediaSource = (value) => {
  if (!value || typeof value !== 'string') return null
  const trimmed = value.trim()
  if (!trimmed) return null

  if (trimmed.startsWith('//')) {
    return `https:${trimmed}`
  }

  if (/^(https?:|data:|blob:)/i.test(trimmed)) {
    return trimmed
  }

  if (trimmed.startsWith('/')) {
    return trimmed
  }

  if (trimmed.startsWith('./')) {
    return normalizeMediaSource(trimmed.replace(/^\.\//, ''))
  }

  if (/^images\//i.test(trimmed)) {
    return `/${trimmed.replace(/^\/*/, '')}`
  }

  return `/images/${trimmed.replace(/^\/*/, '')}`
}

const collectMediaSources = (candidates = []) => {
  const seen = new Set()
  const normalized = []

  const register = (value) => {
    const mediaSrc = normalizeMediaSource(value)
    if (mediaSrc && !seen.has(mediaSrc)) {
      seen.add(mediaSrc)
      normalized.push(mediaSrc)
    }
  }

  const extract = (entry) => {
    if (!entry) return

    if (Array.isArray(entry)) {
      entry.forEach(extract)
      return
    }

    if (typeof entry === 'string') {
      register(entry)
      return
    }

    if (typeof entry === 'object') {
      MEDIA_SOURCE_KEYS.forEach((key) => {
        if (entry[key]) register(entry[key])
      })
    }
  }

  candidates.forEach(extract)
  return normalized
}

const GameModal = ({ jogo, onClose }) => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [alert, setAlert] = useState({ text: '', type: '' })
  const [currentSlide, setCurrentSlide] = useState(0)
  const [mediaErrors, setMediaErrors] = useState({})
  const [mediaSourceIndex, setMediaSourceIndex] = useState({})

  useEffect(() => {
    setMediaErrors({})
    setCurrentSlide(0)
    setMediaSourceIndex({})
  }, [jogo])

  const imageSources = useMemo(() => {
    if (!jogo) return []

    const directSources = [
      jogo.imagem,
      jogo.image,
      jogo.imageUrl,
      jogo.imgUrl,
      jogo.capa,
      jogo.capaUrl,
      jogo.cover,
      jogo.coverUrl,
      jogo.thumbnail,
      jogo.thumbnailUrl,
      jogo.poster,
      jogo.posterUrl,
      jogo.background,
      jogo.backgroundUrl
    ]

    const groupedSources = [
      jogo.imagens,
      jogo.images,
      jogo.galeria,
      jogo.gallery,
      jogo.screenshots
    ]

    const fallback = jogo?.nome ? getLocalImageCandidates(jogo.nome) : []

    return collectMediaSources([...directSources, ...groupedSources, fallback])
  }, [jogo])

  const gifSources = useMemo(() => {
    if (!jogo) return []
    const slug = slugifyGameName(jogo?.nome || '')

    const gifCandidates = [
      jogo.gif,
      jogo.gifUrl,
      jogo.video,
      jogo.videoUrl,
      jogo.trailer,
      jogo.trailerUrl,
      jogo.media?.gif,
      jogo.media?.video,
      jogo.media?.videoUrl,
      jogo.media?.trailer,
      jogo.media?.trailerUrl,
      Array.isArray(jogo.gifs) ? jogo.gifs : [],
      slug ? `/images/Gifs/${slug}.gif` : null,
      slug ? `/images/gifs/${slug}.gif` : null
    ]

    return collectMediaSources(gifCandidates)
  }, [jogo])

  const mediaItems = useMemo(() => {
    const items = []
    if (imageSources.length) {
      items.push({ id: 'imagem', label: 'Imagem', sources: imageSources })
    }
    if (gifSources.length) {
      items.push({ id: 'gif', label: 'GIF animado', sources: gifSources })
    }
    return items
  }, [imageSources, gifSources])

  useEffect(() => {
    if (currentSlide >= mediaItems.length) {
      setCurrentSlide(0)
    }
  }, [currentSlide, mediaItems])

  const currentMedia = mediaItems[currentSlide]
  const currentSourceIndex = currentMedia ? (mediaSourceIndex[currentMedia.id] || 0) : 0
  const currentMediaSrc = currentMedia?.sources?.[currentSourceIndex]

  const handleMediaError = (id) => {
    const mediaItem = mediaItems.find((item) => item.id === id)
    if (!mediaItem) return

    setMediaSourceIndex((prev) => {
      const currentIndex = prev[id] || 0
      if (currentIndex + 1 < (mediaItem.sources?.length || 0)) {
        return {
          ...prev,
          [id]: currentIndex + 1
        }
      }
      setMediaErrors((prevErrors) => ({ ...prevErrors, [id]: true }))
      return prev
    })
  }

  const showPreviousMedia = () => {
    setCurrentSlide((prev) => (prev - 1 + mediaItems.length) % mediaItems.length)
  }

  const showNextMedia = () => {
    setCurrentSlide((prev) => (prev + 1) % mediaItems.length)
  }

  const showMessage = (text, type = 'success') => {
    setAlert({ text, type })
    setTimeout(() => setAlert({ text: '', type: '' }), 3000)
  }

  const adicionarAoCarrinho = async () => {
    if (!user) {
      showMessage('Você precisa estar logado para adicionar itens ao carrinho.', 'error')
      return
    }

    if (!jogo?.id) {
      showMessage('Não foi possível identificar este jogo para adicionar ao carrinho.', 'error')
      return
    }

    try {
      setLoading(true)
      await apiFetch('/carrinho/add', {
        method: 'POST',
        auth: true,
        body: {
          jogoId: jogo.id
        }
      })

      showMessage('Jogo adicionado ao carrinho!')
    } catch (error) {
      showMessage(error.message, 'error')
    } finally {
      setLoading(false)
    }
  }

  const adicionarAListaDesejos = async () => {
    if (!user) {
      showMessage('Você precisa estar logado para adicionar à lista de desejos.', 'error')
      return
    }

    try {
      setLoading(true)
      await apiFetch('/lista-desejo', {
        method: 'POST',
        auth: true,
        body: {
          jogoId: jogo.id
        }
      })

      showMessage('Jogo adicionado à lista de desejos!')
    } catch (error) {
      showMessage(error.message, 'error')
    } finally {
      setLoading(false)
    }
  }

  const metaInfo = useMemo(() => {
    if (!jogo) return []
    return [
      { id: 'ano', label: 'Ano', value: jogo.ano ?? '—' },
      { id: 'categoria', label: 'Categoria', value: jogo.categoria || jogo.fkCategoria || '—' },
      { id: 'preco', label: 'Preço', value: `R$ ${jogo.preco?.toFixed ? jogo.preco.toFixed(2) : '0,00'}` }
    ]
  }, [jogo])

  const handleCheckout = () => {
    navigate('/checkout')
    onClose()
  }

  if (!jogo) return null

  return (
    <div className="modal show" onClick={onClose}>
      <div 
        className="conteudo-modal" 
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '1100px', width: '95vw' }}
      >
        <span className="fechar" onClick={onClose}>&times;</span>
        
        {alert.text && (
          <div className={alert.type === 'error' ? 'error-message' : 'success-message'}>
            {alert.text}
          </div>
        )}

        <div className="detalhe-jogo">
          <div
            className="conteudo-detalhe-jogo"
            style={{
              display: 'grid',
                  gridTemplateColumns: 'minmax(280px, 420px) minmax(320px, 1fr)',
              gap: '32px',
              alignItems: 'stretch'
            }}
          >
            <div 
              className="modal-media-wrapper"
              style={{
                minHeight: '360px',
                maxHeight: '520px',
                maxWidth: '420px',
                width: '100%',
                justifySelf: 'center'
              }}
            >
              <div
                className="carrossel-midia"
                style={{
                  position: 'relative',
                  borderRadius: '20px',
                  overflow: 'hidden',
                  height: '100%',
                  background: '#0f0f0f',
                  display: 'flex',
                  flexDirection: 'column'
                }}
              >
                <div style={{ flex: 1, position: 'relative' }}>
                  {currentMedia && currentMediaSrc && !mediaErrors[currentMedia.id] ? (
                    <img
                      key={`${currentMedia.id}-${currentSourceIndex}`}
                      src={currentMediaSrc}
                      alt={`${currentMedia.label} de ${jogo.nome}`}
                      style={{
                        width: '100%',
                        height: '100%',
                        maxWidth: '100%',
                        maxHeight: '100%',
                        objectFit: 'contain',
                        objectPosition: 'center',
                        display: 'block',
                        backgroundColor: '#000'
                      }}
                      onError={() => handleMediaError(currentMedia.id)}
                    />
                  ) : (
                    <div style={{
                      width: '100%',
                      height: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: 'linear-gradient(135deg, #8B4513, #DC143C)',
                      color: '#fff',
                      fontSize: '72px',
                      fontWeight: 'bold'
                    }}>
                      {jogo.nome.charAt(0)}
                    </div>
                  )}

                  {mediaItems.length > 1 && (
                    <>
                      <button
                        type="button"
                        onClick={showPreviousMedia}
                        style={{
                          position: 'absolute',
                          top: '50%',
                          left: '16px',
                          transform: 'translateY(-50%)',
                          background: 'rgba(0,0,0,0.65)',
                          border: 'none',
                          color: '#fff',
                          width: '44px',
                          height: '44px',
                          borderRadius: '50%',
                          cursor: 'pointer'
                        }}
                        aria-label="Mostrar mídia anterior"
                      >
                        ‹
                      </button>
                      <button
                        type="button"
                        onClick={showNextMedia}
                        style={{
                          position: 'absolute',
                          top: '50%',
                          right: '16px',
                          transform: 'translateY(-50%)',
                          background: 'rgba(0,0,0,0.65)',
                          border: 'none',
                          color: '#fff',
                          width: '44px',
                          height: '44px',
                          borderRadius: '50%',
                          cursor: 'pointer'
                        }}
                        aria-label="Mostrar próxima mídia"
                      >
                        ›
                      </button>
                    </>
                  )}
                </div>

                {mediaItems.length > 0 && (
                  <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px', background: 'rgba(0,0,0,0.6)', color: '#fff' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <strong>{currentMedia?.label}</strong>
                      {currentMedia?.sources?.length > 1 && (
                        <span style={{ fontSize: '12px', opacity: 0.8 }}>
                          Fonte {currentSourceIndex + 1}/{currentMedia.sources.length}
                        </span>
                      )}
                    </div>
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                      {mediaItems.map((item, index) => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => setCurrentSlide(index)}
                          style={{
                            width: index === currentSlide ? '32px' : '14px',
                            height: '10px',
                            borderRadius: '999px',
                            border: 'none',
                            background: index === currentSlide ? '#fff' : 'rgba(255,255,255,0.4)',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease'
                          }}
                          aria-label={`Mostrar ${item.label}`}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="informacoes-jogo" style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              <h2>{jogo.nome}</h2>
              <p>{jogo.descricao}</p>
              
              <div
                className="meta-jogo"
                style={{
                  
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
                  gap: '12px'
                }}
              >
                {metaInfo.map((info) => (
                  <div
                    key={info.id}
                    style={{
                      background: 'linear-gradient(135deg, #1E3CFF, #5398FF)',
                      color: '#fff',
                      borderRadius: '12px',
                      padding: '12px 16px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '4px',
                      border: '1px solid rgba(255,255,255,0.08)'
                    }}
                  >
                    <span style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.08em', opacity: 0.8 }}>
                      {info.label}
                    </span>
                    <strong style={{ fontSize: info.id === 'preco' ? '20px' : '16px' }}>
                      {info.value}
                    </strong>
                  </div>
                ))}
              </div>

              <div className="acoes-jogo" style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: 'auto' }}>
                <button 
                  className="btn btn-primary"
                  onClick={adicionarAoCarrinho}
                  disabled={loading}
                >
                  {loading ? 'Adicionando...' : 'Adicionar ao Carrinho'}
                </button>
                <button 
                  className="btn btn-secondary"
                  onClick={adicionarAListaDesejos}
                  disabled={loading}
                >
                  Lista de Desejos
                </button>
                {user && (
                  <button 
                    className="btn btn-success"
                    onClick={handleCheckout}
                  >
                    Comprar Agora
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default GameModal