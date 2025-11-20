import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../utils/api';

const Usuario = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('library');
  const [loading, setLoading] = useState(true);
  
  // Estados para biblioteca
  const [library, setLibrary] = useState([]);
  
  // Estados para lista de desejos
  const [wishlist, setWishlist] = useState([]);
  
  // Estados para histórico
  const [purchaseHistory, setPurchaseHistory] = useState([]);
  
  // Estados para carrinho
  const [cartCount, setCartCount] = useState(0);
  
  // Estados para estatísticas
  const [stats, setStats] = useState({
    gamesOwned: 0,
    wishlistCount: 0,
    purchaseCount: 0
  });
  
  // Estados para configurações
  const [configForm, setConfigForm] = useState({
    currentPassword: '',
    newPassword: ''
  });

  useEffect(() => {
    if (!user) {
      navigate('/');
      return;
    }
    loadUserProfile();
  }, [user, navigate]);

  const loadUserProfile = async () => {
    try {
      setLoading(true);
      await Promise.all([
        loadLibrary(),
        loadWishlist(),
        loadPurchaseHistory(),
        loadCart()
      ]);
    } catch (error) {
      console.error('Erro ao carregar perfil:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadLibrary = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${API_BASE_URL}/perfil/biblioteca`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setLibrary(data);
        setStats(prev => ({ ...prev, gamesOwned: data.length }));
      }
    } catch (error) {
      console.error('Erro ao carregar biblioteca:', error);
    }
  };

  const loadWishlist = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${API_BASE_URL}/lista-desejo`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setWishlist(data);
        setStats(prev => ({ ...prev, wishlistCount: data.length }));
      }
    } catch (error) {
      console.error('Erro ao carregar lista de desejos:', error);
    }
  };

  const loadPurchaseHistory = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${API_BASE_URL}/vendas`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setPurchaseHistory(data);
        setStats(prev => ({ ...prev, purchaseCount: data.length }));
      }
    } catch (error) {
      console.error('Erro ao carregar histórico:', error);
    }
  };

  const loadCart = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${API_BASE_URL}/carrinho/ativo`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        const cartObj = data.carrinho || data;
        const items = (cartObj && cartObj.itens) ? cartObj.itens : [];
        setCartCount(items.length);
      }
    } catch (error) {
      console.error('Erro ao carregar carrinho:', error);
    }
  };

  const addToCart = async (gameId) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${API_BASE_URL}/carrinho/add`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          jogoId: gameId,
          quantidade: 1
        })
      });

      if (response.ok) {
        await loadCart();
        alert('Jogo adicionado ao carrinho!');
      } else {
        alert('Erro ao adicionar ao carrinho');
      }
    } catch (error) {
      console.error('Erro ao adicionar ao carrinho:', error);
      alert('Erro ao adicionar ao carrinho');
    }
  };

  const saveConfig = async (e) => {
    e.preventDefault();

    if (!configForm.newPassword) {
      alert('Digite uma nova senha');
      return;
    }

    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${API_BASE_URL}/perfil/senha`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          senhaAtual: configForm.currentPassword,
          novaSenha: configForm.newPassword
        })
      });

      if (response.ok) {
        alert('Senha atualizada com sucesso!');
        setConfigForm({
          currentPassword: '',
          newPassword: ''
        });
      } else {
        throw new Error('Falha ao atualizar senha');
      }
    } catch (error) {
      console.error('Erro ao atualizar senha:', error);
      alert('Erro ao atualizar senha');
    }
  };

  const goToCheckout = () => {
    navigate('/checkout');
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
        <div className="loading">Carregando perfil...</div>
      </div>
    );
  }

  return (
    <div className="usuario-page">
      <div className="breadcrumb">
        <button className="breadcrumb-btn" onClick={() => navigate('/')}>INÍCIOS</button>
        <span className="breadcrumb-text">&gt; PERFIL DE USUÁRIO</span>
      </div>
      <div className="profile-container">
        <div className="profile-header">
          <div className="profile-info">
            <div className="avatar">
              {user.nome?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <div className="user-details">
              <h1>{user.nome || 'Usuário'}</h1>
              <p style={{ color: '#666' }}>{user.email || 'email@exemplo.com'}</p>
              <div className="user-stats">
                <div className="stat-item">
                  <div className="stat-value">{stats.gamesOwned}</div>
                  <div className="stat-label">Jogos</div>
                </div>
                <div className="stat-item">
                  <div className="stat-value">{stats.wishlistCount}</div>
                  <div className="stat-label">Lista de Desejos</div>
                </div>
                <div className="stat-item">
                  <div className="stat-value">{stats.purchaseCount}</div>
                  <div className="stat-label">Compras</div>
                </div>
              </div>
              <div className="profile-actions" style={{ marginTop: '12px' }}>
                <button className="btn-primary" onClick={goToCheckout}>
                  Meu Carrinho ({cartCount})
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="profile-sections">
          <div className="sections-nav">
            <button
              className={`section-btn ${activeSection === 'library' ? 'active' : ''}`}
              onClick={() => setActiveSection('library')}
            >
              Biblioteca
            </button>
            <button
              className={`section-btn ${activeSection === 'wishlist' ? 'active' : ''}`}
              onClick={() => setActiveSection('wishlist')}
            >
              Lista de Desejos
            </button>
            <button
              className={`section-btn ${activeSection === 'history' ? 'active' : ''}`}
              onClick={() => setActiveSection('history')}
            >
              Histórico
            </button>
            <button
              className={`section-btn ${activeSection === 'config' ? 'active' : ''}`}
              onClick={() => setActiveSection('config')}
            >
              Configurações
            </button>
          </div>

          <div className="section-content">
            {activeSection === 'library' && (
              <div className={`section-content ${activeSection === 'library' ? 'active' : ''}`} id="library">
                <div className="library-grid">
                  {library.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '40px' }}>
                      <h3>Sua biblioteca está vazia</h3>
                      <p>Compre jogos para adicioná-los à sua biblioteca</p>
                    </div>
                  ) : (
                    library.map((item, index) => {
                      const jogo = item.jogo || item;
                      const chave = item.chaveAtivacao || item.chave_ativacao || '';
                      const title = jogo.nome || 'Jogo';
                      const first = title.charAt(0) || 'J';
                      const id = jogo.id || jogo.ID || 0;

                      return (
                        <div key={index} className="game-card">
                          <div className="game-image">{first}</div>
                          <div className="game-info">
                            <h3 className="game-title">{title}</h3>
                            <p className="game-key">KEY: {chave || 'N/A'}</p>
                            <div className="game-actions">
                              <button
                                className="btn-primary"
                                onClick={() => addToCart(id)}
                              >
                                Adicionar ao Carrinho
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            )}

            {activeSection === 'wishlist' && (
              <div className={`section-content ${activeSection === 'wishlist' ? 'active' : ''}`} id="wishlist">
                <div className="library-grid">
                  {wishlist.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '40px' }}>
                      <h3>Sua lista de desejos está vazia</h3>
                      <p>Adicione jogos à sua lista de desejos</p>
                    </div>
                  ) : (
                    wishlist.map((item, index) => {
                      const jogo = item.jogo || item;
                      const title = jogo.nome || 'Jogo';
                      const first = title.charAt(0) || 'J';
                      const id = jogo.id || jogo.ID || 0;
                      const preco = jogo.preco ? jogo.preco.toFixed(2) : '0.00';

                      return (
                        <div key={index} className="game-card">
                          <div className="game-image">{first}</div>
                          <div className="game-info">
                            <h3 className="game-title">{title}</h3>
                            <p className="game-key">R$ {preco}</p>
                            <div className="game-actions">
                              <button
                                className="btn-primary"
                                onClick={() => addToCart(id)}
                              >
                                Adicionar ao Carrinho
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            )}

            {activeSection === 'history' && (
              <div className={`section-content ${activeSection === 'history' ? 'active' : ''}`} id="history">
                <div className="purchase-history">
                  {purchaseHistory.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '40px' }}>
                      <h3>Nenhuma compra realizada</h3>
                      <p>Seu histórico de compras aparecerá aqui</p>
                    </div>
                  ) : (
                    purchaseHistory.map(purchase => (
                      <div key={purchase.id} className="purchase-item">
                        <div className="purchase-info">
                          <h3>Pedido #{purchase.id}</h3>
                          <p className="purchase-details">
                            Data: {new Date(purchase.dataVenda).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="purchase-total">
                          R$ {purchase.valorTotal?.toFixed(2) || '0.00'}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {activeSection === 'config' && (
              <div className={`section-content ${activeSection === 'config' ? 'active' : ''}`} id="config">
                <form className="config-form" onSubmit={saveConfig}>
                  <div className="form-group">
                    <label className="form-label" htmlFor="currentPassword">Senha Atual</label>
                    <input
                      type="password"
                      id="currentPassword"
                      className="form-input"
                      value={configForm.currentPassword}
                      onChange={(e) => setConfigForm({ ...configForm, currentPassword: e.target.value })}
                      required
                      autoComplete="current-password"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="newPassword">Nova Senha</label>
                    <input
                      type="password"
                      id="newPassword"
                      className="form-input"
                      value={configForm.newPassword}
                      onChange={(e) => setConfigForm({ ...configForm, newPassword: e.target.value })}
                      required
                      autoComplete="new-password"
                    />
                  </div>
                  <button type="submit" className="btn-submit">Atualizar Senha</button>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Usuario;
