import { useState, useEffect } from 'react'
import { useAuth } from '../hooks/useAuth'
import { getLocalImageCandidates, getGifPath } from '../utils/imageUtils'
import { showError, showSuccess } from '../utils/notifications'
import { API_BASE_URL } from '../utils/api'
import '../../css/style.css'

function GameModal({ game, isOpen, onClose }) {
  const { user } = useAuth()
  const [imageSrc, setImageSrc] = useState('')
  const [categoryName, setCategoryName] = useState('')
  const [isHovering, setIsHovering] = useState(false)

  useEffect(() => {
    if (game && isOpen) {
      loadImage()
      loadCategoryName()
    }
  }, [game, isOpen])

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
        }
        img.onerror = () => {
          index++
          tryNext()
        }
        img.src = candidates[index]
      }
    }

    tryNext()
  }

  const loadCategoryName = async () => {
    try {
      let displayCategoria = game.categoria || game.fkCategoria || game.fk_categoria || 'N/A'
      
      if (displayCategoria && !isNaN(Number(displayCategoria))) {
        const resp = await fetch(`${API_BASE_URL}/categorias/${displayCategoria}`, {
          mode: 'cors'
        })
        
        if (resp.ok) {
          const cat = await resp.json()
          displayCategoria = cat.nome || displayCategoria
        }
      }
      
      setCategoryName(displayCategoria)
    } catch (err) {
      console.warn('Não foi possível resolver o nome da categoria:', err)
      setCategoryName(game.fkCategoria || 'N/A')
    }
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

  const handleAddToCart = async () => {
    if (!user) {
      showError('Você precisa estar logado para adicionar itens ao carrinho.')
      return
    }

    try {
      const response = await fetch(`${API_BASE_URL}/carrinho/add`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify({
          jogoId: game.id,
          quantidade: 1
        }),
        mode: 'cors'
      })

      if (response.ok) {
        showSuccess('Jogo adicionado ao carrinho!')
      } else {
        const data = await response.json()
        showError(data.message || 'Erro ao adicionar ao carrinho')
      }
    } catch (error) {
      console.error('Erro ao adicionar ao carrinho:', error)
      showError('Erro ao adicionar ao carrinho. Tente novamente.')
    }
  }

  const handleAddToWishlist = async () => {
    if (!user) {
      showError('Você precisa estar logado para adicionar à lista de desejos.')
      return
    }

    try {
      const response = await fetch(`${API_BASE_URL}/lista-desejo`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify({
          jogoId: game.id
        }),
        mode: 'cors'
      })

      if (response.ok) {
        showSuccess('Jogo adicionado à lista de desejos!')
      } else {
        const data = await response.json()
        showError(data.message || 'Erro ao adicionar à lista de desejos')
      }
    } catch (error) {
      console.error('Erro ao adicionar à lista de desejos:', error)
      showError('Erro ao adicionar à lista de desejos. Tente novamente.')
    }
  }

  if (!isOpen || !game) return null

  return (
    <div
      id="modalJogo"
      className="modal"
      style={{ display: isOpen ? 'block' : 'none' }}
      onClick={(e) => {
        if (e.target.id === 'modalJogo') {
          onClose()
        }
      }}
    >
      <div className="conteudo-modal detalhe-jogo">
        <span className="fechar" onClick={onClose}>
          ×
        </span>
        <div className="conteudo-detalhe-jogo">
          <div
            className="imagem-jogo"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            <img
              id="imagemJogo"
              src={imageSrc}
              alt={game.nome}
              style={{
                height: '250px',
                objectFit: 'cover',
                width: '100%'
              }}
            />
          </div>

          <div className="informacoes-jogo">
            <h2 id="tituloJogo">{game.nome}</h2>
            <p id="descricaoJogo">{game.descricao || 'Sem descrição disponível'}</p>
            <div className="meta-jogo">
              <span id="categoriaJogo">Categoria: {categoryName}</span>
              <span id="precoJogo">R$ {game.preco?.toFixed(2) || '0.00'}</span>
              <span id="anoJogo">Ano: {game.ano}</span>
            </div>
            <div className="acoes-jogo">
              <button
                type="button"
                className="botao-adicionar-carrinho"
                onClick={handleAddToCart}
              >
                Adicionar ao Carrinho
              </button>
              <button
                type="button"
                className="botao-adicionar-lista-desejos"
                onClick={handleAddToWishlist}
              >
                Lista de Desejos
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default GameModal

