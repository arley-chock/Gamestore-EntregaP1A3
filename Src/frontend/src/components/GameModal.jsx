import React, { useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { useNavigate } from 'react-router-dom'

import { API_BASE_URL } from '../utils/api'

const GameModal = ({ jogo, onClose }) => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const slugifyGameName = (name) => {
    if (!name) return ''
    return name
      .toString()
      .normalize('NFD').replace(/\p{Diacritic}+/gu, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
  }

  const getImageUrl = (gameName) => {
    const slug = slugifyGameName(gameName)
    return `/images/${slug}.jpg`
  }

  const showMessage = (msg, type = 'success') => {
    setMessage(msg)
    setTimeout(() => setMessage(''), 3000)
  }

  const adicionarAoCarrinho = async () => {
    if (!user) {
      showMessage('Você precisa estar logado para adicionar itens ao carrinho.', 'error')
      return
    }

    try {
      setLoading(true)
      const token = localStorage.getItem('authToken')
      const response = await fetch(`${API_BASE_URL}/carrinho/add`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          jogoId: jogo.id,
          quantidade: 1
        })
      })

      if (response.ok) {
        showMessage('Jogo adicionado ao carrinho!')
      } else {
        const error = await response.json()
        throw new Error(error.message || 'Erro ao adicionar ao carrinho')
      }
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
      const token = localStorage.getItem('authToken')
      const response = await fetch(`${API_BASE_URL}/lista-desejo`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          jogoId: jogo.id
        })
      })

      if (response.ok) {
        showMessage('Jogo adicionado à lista de desejos!')
      } else {
        const error = await response.json()
        throw new Error(error.message || 'Erro ao adicionar à lista de desejos')
      }
    } catch (error) {
      showMessage(error.message, 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleCheckout = () => {
    navigate('/checkout')
    onClose()
  }

  if (!jogo) return null

  return (
    <div className="modal show" onClick={onClose}>
      <div className="conteudo-modal" onClick={(e) => e.stopPropagation()}>
        <span className="fechar" onClick={onClose}>&times;</span>
        
        {message && (
          <div className={message.includes('erro') ? 'error-message' : 'success-message'}>
            {message}
          </div>
        )}

        <div className="detalhe-jogo">
          <div className="conteudo-detalhe-jogo">
            <div className="imagem-jogo">
              <img 
                src={getImageUrl(jogo.nome)} 
                alt={jogo.nome}
                style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '10px' }}
                onError={(e) => {
                  e.target.style.display = 'none'
                }}
              />
              <div style={{
                width: '100%',
                height: '100%',
                background: 'linear-gradient(135deg, #8B4513, #DC143C)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: '64px',
                fontWeight: 'bold',
                borderRadius: '10px'
              }}>
                {jogo.nome.charAt(0)}
              </div>
            </div>

            <div className="informacoes-jogo">
              <h2>{jogo.nome}</h2>
              <p>{jogo.descricao}</p>
              
              <div className="meta-jogo">
                <span>Ano: {jogo.ano}</span>
                <span>Categoria: {jogo.categoria || jogo.fkCategoria}</span>
                <span>Preço: R$ {jogo.preco.toFixed(2)}</span>
              </div>

              <div className="acoes-jogo">
                <button 
                  className="btn-primary"
                  onClick={adicionarAoCarrinho}
                  disabled={loading}
                >
                  {loading ? 'Adicionando...' : 'Adicionar ao Carrinho'}
                </button>
                <button 
                  className="btn-secondary"
                  onClick={adicionarAListaDesejos}
                  disabled={loading}
                >
                  Lista de Desejos
                </button>
                {user && (
                  <button 
                    className="btn-success"
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