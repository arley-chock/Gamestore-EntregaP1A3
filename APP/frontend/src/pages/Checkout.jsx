import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { apiFetch } from '../utils/api';

const Checkout = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [cart, setCart] = useState(null);
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [subtotal, setSubtotal] = useState(0);
  const [discount, setDiscount] = useState(0);
  const [total, setTotal] = useState(0);
  
  const [paymentData, setPaymentData] = useState({
    cardName: '',
    cardNumber: '',
    expiryDate: '',
    cvv: ''
  });

  useEffect(() => {
    if (!user) {
      navigate('/');
      return;
    }
    loadCart();
  }, [user, navigate]);

  useEffect(() => {
    calculateTotals();
  }, [cartItems]);

  const loadCart = async () => {
    try {
      setLoading(true);
      const payload = await apiFetch('/carrinho/ativo', { auth: true });
      const cartObj = payload.carrinho || payload;

      if (!cartObj || !cartObj.itens || cartObj.itens.length === 0) {
        setCart(null);
        setCartItems([]);
        return;
      }

      setCart(cartObj);
      
      // Carregar detalhes dos jogos
      const itemsWithDetails = await Promise.all(
        cartObj.itens.map(async (item) => {
          const jogoId = item.fkJogo || item.fk_jogo || item.fk_jogo_id || item.fk_jogoId || item.jogoId || item.jogo_id;
          const gameDetails = await fetchGameDetails(jogoId);
          return {
            ...item,
            jogo: gameDetails,
            jogoId: jogoId
          };
        })
      );
      
      setCartItems(itemsWithDetails);
    } catch (error) {
      console.error('Erro ao carregar carrinho:', error);
      setCart(null);
      setCartItems([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchGameDetails = async (gameId) => {
    try {
      return await apiFetch(`/jogos/${gameId}`, { auth: true });
    } catch (error) {
      console.error('Erro ao buscar detalhes do jogo:', error);
    }
    return { nome: 'Jogo', ano: 2025, preco: 0, fkCategoria: 'N/A' };
  };

  const calculateTotals = () => {
    const sub = cartItems.reduce((sum, item) => {
      return sum + (item.jogo?.preco || 0);
    }, 0);
    
    setSubtotal(sub);
    setDiscount(0);
    setTotal(sub - discount);
  };

  const removeItem = async (gameId) => {
    try {
      await apiFetch(`/carrinho/${gameId}`, {
        method: 'DELETE',
        auth: true
      });
      await loadCart();
    } catch (error) {
      console.error('Erro ao remover item:', error);
      alert('Erro ao remover item do carrinho');
    }
  };

  const processPayment = async (e) => {
    e.preventDefault();
    
    if (!user) {
      alert('Você precisa estar logado para finalizar a compra.');
      return;
    }

    if (!paymentData.cardName || !paymentData.cardNumber || !paymentData.expiryDate || !paymentData.cvv) {
      alert('Por favor, preencha todos os campos de pagamento.');
      return;
    }

    if (cartItems.length === 0) {
      alert('Seu carrinho está vazio.');
      return;
    }

    setProcessing(true);

    try {
      await apiFetch('/vendas/checkout', {
        method: 'POST',
        auth: true,
        body: { cartId: cart && cart.id }
      });

      alert('Pagamento processado com sucesso! As chaves de ativação estarão disponíveis no seu perfil.');
      navigate('/usuario');
    } catch (error) {
      console.error('Erro ao processar pagamento:', error);
      alert('Erro ao processar pagamento');
    } finally {
      setProcessing(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setPaymentData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
  };

  if (!user) {
    return (
      <div className="error-container">
        <div className="error">Você precisa estar logado para acessar esta página.</div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading">Carregando carrinho...</div>
      </div>
    );
  }

  if (!cart || cartItems.length === 0) {
    return (
      <div className="checkout-page">
        <div className="breadcrumb">
          <button className="breadcrumb-btn">INÍCIO &gt; PERFIL &gt; CONFIRMAÇÃO</button>
        </div>
        <div className="checkout-container">
          <div className="empty-cart">
            <h2>Seu carrinho está vazio</h2>
            <p>Adicione alguns jogos ao seu carrinho</p>
            <button
              type="button"
              onClick={() => navigate('/classicos')}
              className="btn btn-secondary btn-lg"
            >
              Continuar Comprando
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="checkout-page">
      <div className="breadcrumb">
        <button className="breadcrumb-btn">INÍCIO &gt; PERFIL &gt; CONFIRMAÇÃO</button>
      </div>

      <div className="checkout-container">
        <div className="payment-section">
          <h2 className="section-title">Detalhes do Pagamento</h2>
          
          <div className="cart-items">
            {cartItems.map((item, index) => (
              <div key={index} className="cart-item">
                <div className="item-image">
                  {item.jogo?.nome?.charAt(0) || 'J'}
                </div>
                <div className="item-details">
                  <h3 className="item-name">{item.jogo?.nome || 'Jogo'}</h3>
                  <p className="item-info">
                    {item.jogo?.ano || '2025'} | {item.jogo?.fkCategoria || 'N/A'}
                  </p>
                </div>
                <div className="item-price">
                  {formatPrice(item.jogo?.preco || 0)}
                </div>
                <button
                  type="button"
                  className="btn btn-outline-danger btn-sm"
                  onClick={() => removeItem(item.jogoId)}
                >
                  Remover
                </button>
              </div>
            ))}
          </div>

          <form
            id="checkout-payment-form"
            className="payment-form"
            onSubmit={processPayment}
          >
            <div className="form-group">
              <label htmlFor="cardName">Nome no Cartão</label>
              <input
                type="text"
                id="cardName"
                name="cardName"
                value={paymentData.cardName}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="cardNumber">Número do Cartão</label>
              <input
                type="text"
                id="cardNumber"
                name="cardNumber"
                value={paymentData.cardNumber}
                onChange={handleInputChange}
                placeholder="0000 0000 0000 0000"
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="cardExpiry">Data de Expiração</label>
                <input
                  type="text"
                  id="cardExpiry"
                  name="expiryDate"
                  value={paymentData.expiryDate}
                  onChange={handleInputChange}
                  placeholder="MM/AA"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="cardCVV">CVV</label>
                <input
                  type="text"
                  id="cardCVV"
                  name="cvv"
                  value={paymentData.cvv}
                  onChange={handleInputChange}
                  placeholder="123"
                  required
                />
              </div>
            </div>
          </form>
        </div>

        <div className="order-summary">
          <h2 className="section-title">Resumo do Pedido</h2>
          
          <div className="summary-content">
            <div className="summary-item">
              <span className="summary-label">Subtotal</span>
              <span className="summary-value">{formatPrice(subtotal)}</span>
            </div>
            
            <div className="summary-item">
              <span className="summary-label">Desconto</span>
              <span className="summary-value">{formatPrice(discount)}</span>
            </div>
            
            <div className="summary-total">
              <span className="summary-label">Total</span>
              <span className="summary-value">{formatPrice(total)}</span>
            </div>
          </div>

          <button
            type="submit"
            form="checkout-payment-form"
            className="btn btn-primary btn-lg btn-block"
            disabled={processing || cartItems.length === 0}
          >
            {processing ? 'Processando...' : 'Finalizar Compra'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
