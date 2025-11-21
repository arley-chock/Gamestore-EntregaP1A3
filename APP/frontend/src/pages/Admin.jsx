import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { apiFetch } from '../utils/api';

const Admin = () => {
  const { user, isAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState('games');
  const [loading, setLoading] = useState(true);
  
  // Estados para estatísticas
  const [stats, setStats] = useState({
    totalJogos: 0,
    totalCompanies: 0,
    totalSales: 0
  });
  
  // Estados para jogos
  const [games, setGames] = useState([]);
  const [filteredGames, setFilteredGames] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Estados para formulário de jogo
  const [gameForm, setGameForm] = useState({
    nome: '',
    ano: new Date().getFullYear(),
    preco: 0,
    descricao: '',
    fkCategoria: '',
    fkEmpresa: ''
  });
  
  // Estados para edição
  const [editingGame, setEditingGame] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  
  // Estados para categorias e empresas
  const [categories, setCategories] = useState([]);
  const [companies, setCompanies] = useState([]);
  
  // Estados para empresas
  const [companyName, setCompanyName] = useState('');
  const [filteredCompanies, setFilteredCompanies] = useState([]);

  useEffect(() => {
    if (!isAdmin) return;
    loadDashboardData();
  }, [isAdmin]);

  useEffect(() => {
    filterGames();
  }, [searchTerm, games]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        loadGames(),
        loadCategories(),
        loadCompanies(),
        loadSalesCount()
      ]);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadSalesCount = async () => {
    try {
      const data = await apiFetch('/vendas', { auth: true })
      setStats(prev => ({
        ...prev,
        totalSales: Array.isArray(data) ? data.length : 0
      }))
    } catch (error) {
      console.error('Erro ao carregar estatísticas de vendas:', error)
    }
  }

  const loadGames = async () => {
    try {
      const data = await apiFetch('/jogos', { auth: true })
      const lista = Array.isArray(data) ? data : []
      setGames(lista)
      setFilteredGames(lista)
      setStats(prev => ({ ...prev, totalJogos: lista.length }))
    } catch (error) {
      console.error('Erro ao carregar jogos:', error)
    }
  }

  const loadCategories = async () => {
    try {
      const data = await apiFetch('/categorias', { auth: true })
      setCategories(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Erro ao carregar categorias:', error)
    }
  }

  const loadCompanies = async () => {
    try {
      const data = await apiFetch('/empresas', { auth: true })
      const lista = Array.isArray(data) ? data : []
      setCompanies(lista)
      setFilteredCompanies(lista)
      setStats(prev => ({ ...prev, totalCompanies: lista.length }))
    } catch (error) {
      console.error('Erro ao carregar empresas:', error)
    }
  }

  const filterGames = () => {
    if (!searchTerm) {
      setFilteredGames(games);
      return;
    }

    const filtered = games.filter(game =>
      game.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (game.fkCategoria && game.fkCategoria.toString().toLowerCase().includes(searchTerm.toLowerCase()))
    );
    setFilteredGames(filtered);
  };

  const handleAddGame = async (e) => {
    e.preventDefault();

    try {
      await apiFetch('/jogos', {
        method: 'POST',
        auth: true,
        body: gameForm
      });

      alert('Jogo adicionado com sucesso!');
      setGameForm({
        nome: '',
        ano: new Date().getFullYear(),
        preco: 0,
        descricao: '',
        fkCategoria: '',
        fkEmpresa: ''
      });
      await loadGames();
      await loadSalesCount();
    } catch (error) {
      console.error('Erro ao adicionar jogo:', error);
      alert('Erro ao adicionar jogo');
    }
  };

  const handleEditGame = (game) => {
    setEditingGame(game);
    setGameForm({
      nome: game.nome,
      ano: game.ano,
      preco: game.preco,
      descricao: game.descricao || '',
      fkCategoria: game.fkCategoria || '',
      fkEmpresa: game.fkEmpresa || ''
    });
    setShowEditModal(true);
  };

  const handleUpdateGame = async (e) => {
    e.preventDefault();

    try {
      await apiFetch(`/jogos/${editingGame.id}`, {
        method: 'PUT',
        auth: true,
        body: gameForm
      });

      alert('Jogo atualizado com sucesso!');
      setShowEditModal(false);
      setEditingGame(null);
      await loadGames();
      await loadSalesCount();
    } catch (error) {
      console.error('Erro ao atualizar jogo:', error);
      alert('Erro ao atualizar jogo');
    }
  };

  const handleDeleteGame = async (gameId) => {
    if (!confirm('Tem certeza que deseja excluir este jogo?')) return;

    try {
      await apiFetch(`/jogos/${gameId}`, {
        method: 'DELETE',
        auth: true
      });

      alert('Jogo excluído com sucesso!');
      await loadGames();
      await loadSalesCount();
    } catch (error) {
      console.error('Erro ao excluir jogo:', error);
      alert('Erro ao excluir jogo');
    }
  };

  const handleAddCompany = async () => {
    if (!companyName) {
      alert('Digite o nome da empresa');
      return;
    }

    try {
      await apiFetch('/empresas', {
        method: 'POST',
        auth: true,
        body: { nome: companyName }
      });

      alert('Empresa adicionada com sucesso!');
      setCompanyName('');
      await loadCompanies();
      await loadSalesCount();
    } catch (error) {
      console.error('Erro ao adicionar empresa:', error);
      alert('Erro ao adicionar empresa');
    }
  };

  const handleDeleteCompany = async (companyId) => {
    if (!confirm('Tem certeza que deseja excluir esta empresa?')) return;

    try {
      await apiFetch(`/empresas/${companyId}`, {
        method: 'DELETE',
        auth: true
      });

      alert('Empresa excluída com sucesso!');
      await loadCompanies();
      await loadSalesCount();
    } catch (error) {
      console.error('Erro ao excluir empresa:', error);
      alert('Erro ao excluir empresa');
    }
  };

  if (!isAdmin) {
    return (
      <div className="error-container">
        <div className="error">Acesso negado. Você não tem permissão para acessar esta área.</div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading">Carregando painel administrativo...</div>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <div className="breadcrumb">
        <button className="breadcrumb-btn">ADMINISTRAÇÃO &gt; GERENCIAMENTO</button>
      </div>

      <div className="admin-container">
        <div className="admin-header">
          <h1>Painel de Administração</h1>
          <p style={{ color: '#666', marginTop: '10px' }}>
            Gerencie jogos, empresas e monitore as vendas da plataforma
          </p>
        </div>

        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-value">{stats.totalJogos}</div>
            <div className="stat-label">Jogos Cadastrados</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{stats.totalCompanies}</div>
            <div className="stat-label">Empresas Parceiras</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{stats.totalSales}</div>
            <div className="stat-label">Vendas Realizadas</div>
          </div>
        </div>

        <div className="tabs-nav">
          <button
            className={`tab-btn ${activeTab === 'games' ? 'active' : ''}`}
            onClick={() => setActiveTab('games')}
          >
            Gerenciar Jogos
          </button>
          <button
            className={`tab-btn ${activeTab === 'add' ? 'active' : ''}`}
            onClick={() => setActiveTab('add')}
          >
            Adicionar Jogo
          </button>
          <button
            className={`tab-btn ${activeTab === 'companies' ? 'active' : ''}`}
            onClick={() => setActiveTab('companies')}
          >
            Empresas
          </button>
        </div>

        <div className="tab-content">
          {activeTab === 'games' && (
            <div className="tab-content active">
              <h2 style={{ marginBottom: '20px', color: '#2F2F2F' }}>LISTA DE JOGOS</h2>
              
              <div className="search-bar">
                <input
                  type="text"
                  className="search-input"
                  placeholder="Buscar jogos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <table className="games-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Nome</th>
                    <th>Ano</th>
                    <th>Preço</th>
                    <th>Categoria</th>
                    <th>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredGames.length === 0 ? (
                    <tr>
                      <td colSpan="6" style={{ textAlign: 'center' }}>Nenhum jogo encontrado</td>
                    </tr>
                  ) : (
                    filteredGames.map(game => (
                      <tr key={game.id}>
                        <td>{game.id}</td>
                        <td>{game.nome}</td>
                        <td>{game.ano}</td>
                        <td>R$ {game.preco.toFixed(2)}</td>
                        <td>{game.fkCategoria || 'N/A'}</td>
                        <td>
                          <button
                            className="btn btn-outline btn-sm"
                            onClick={() => handleEditGame(game)}
                          >
                            Editar
                          </button>
                          <button
                            className="btn btn-outline-danger btn-sm"
                            onClick={() => handleDeleteGame(game.id)}
                          >
                            Excluir
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'add' && (
            <div className="tab-content active">
              <h2 style={{ marginBottom: '30px', color: '#2F2F2F' }}>ADICIONAR NOVO JOGO</h2>
              
              <form onSubmit={handleAddGame}>
                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label" htmlFor="gameName">Nome do Jogo</label>
                    <input
                      type="text"
                      id="gameName"
                      className="form-input"
                      value={gameForm.nome}
                      onChange={(e) => setGameForm({ ...gameForm, nome: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="gameYear">Ano</label>
                    <input
                      type="number"
                      id="gameYear"
                      className="form-input"
                      min="1970"
                      max="2025"
                      value={gameForm.ano}
                      onChange={(e) => setGameForm({ ...gameForm, ano: parseInt(e.target.value) })}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="gamePrice">Preço</label>
                    <input
                      type="number"
                      id="gamePrice"
                      className="form-input"
                      min="0"
                      step="0.01"
                      value={gameForm.preco}
                      onChange={(e) => setGameForm({ ...gameForm, preco: parseFloat(e.target.value) })}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="gameCategory">Categoria</label>
                    <select
                      id="gameCategory"
                      className="form-select"
                      value={gameForm.fkCategoria}
                      onChange={(e) => setGameForm({ ...gameForm, fkCategoria: e.target.value })}
                      required
                    >
                      <option value="">Selecione uma categoria</option>
                      {categories.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.nome}</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="gameCompany">Empresa</label>
                    <select
                      id="gameCompany"
                      className="form-select"
                      value={gameForm.fkEmpresa}
                      onChange={(e) => setGameForm({ ...gameForm, fkEmpresa: e.target.value })}
                      required
                    >
                      <option value="">Selecione uma empresa</option>
                      {companies.map(comp => (
                        <option key={comp.id} value={comp.id}>{comp.nome}</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group full-width">
                    <label className="form-label" htmlFor="gameDescription">Descrição</label>
                    <textarea
                      id="gameDescription"
                      className="form-textarea"
                      value={gameForm.descricao}
                      onChange={(e) => setGameForm({ ...gameForm, descricao: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <button type="submit" className="btn btn-primary">Adicionar Jogo</button>
              </form>
            </div>
          )}

          {activeTab === 'companies' && (
            <div className="tab-content active">
              <h2 style={{ marginBottom: '30px', color: '#2F2F2F' }}>GERENCIAR EMPRESAS</h2>
              
              <div className="form-grid" style={{ maxWidth: '600px' }}>
                <div className="form-group">
                  <label className="form-label" htmlFor="companyName">Nome da Empresa</label>
                  <input
                    type="text"
                    id="companyName"
                    className="form-input"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                  />
                </div>
                <div className="form-group" style={{ justifyContent: 'flex-end' }}>
                  <button className="btn btn-primary" onClick={handleAddCompany}>
                    Adicionar Empresa
                  </button>
                </div>
              </div>

              <table className="games-table" style={{ marginTop: '30px' }}>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Nome</th>
                    <th>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCompanies.length === 0 ? (
                    <tr>
                      <td colSpan="3" style={{ textAlign: 'center' }}>Nenhuma empresa encontrada</td>
                    </tr>
                  ) : (
                    filteredCompanies.map(company => (
                      <tr key={company.id}>
                        <td>{company.id}</td>
                        <td>{company.nome}</td>
                        <td>
                            <button
                              className="btn btn-outline-danger btn-sm"
                              onClick={() => handleDeleteCompany(company.id)}
                            >
                            Excluir
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Modal de Edição */}
      {showEditModal && (
        <div className="modal" style={{ display: 'block' }} onClick={() => setShowEditModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <span className="close" onClick={() => setShowEditModal(false)}>&times;</span>
            <h2 style={{ marginBottom: '30px', color: '#2F2F2F' }}>EDITAR JOGO</h2>
            
            <form onSubmit={handleUpdateGame}>
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label" htmlFor="editGameName">Nome do Jogo</label>
                  <input
                    type="text"
                    id="editGameName"
                    className="form-input"
                    value={gameForm.nome}
                    onChange={(e) => setGameForm({ ...gameForm, nome: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="editGameYear">Ano</label>
                  <input
                    type="number"
                    id="editGameYear"
                    className="form-input"
                    min="1970"
                    max="2025"
                    value={gameForm.ano}
                    onChange={(e) => setGameForm({ ...gameForm, ano: parseInt(e.target.value) })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="editGamePrice">Preço</label>
                  <input
                    type="number"
                    id="editGamePrice"
                    className="form-input"
                    min="0"
                    step="0.01"
                    value={gameForm.preco}
                    onChange={(e) => setGameForm({ ...gameForm, preco: parseFloat(e.target.value) })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="editGameCategory">Categoria</label>
                  <select
                    id="editGameCategory"
                    className="form-select"
                    value={gameForm.fkCategoria}
                    onChange={(e) => setGameForm({ ...gameForm, fkCategoria: e.target.value })}
                    required
                  >
                    <option value="">Selecione uma categoria</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.nome}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="editGameCompany">Empresa</label>
                  <select
                    id="editGameCompany"
                    className="form-select"
                    value={gameForm.fkEmpresa}
                    onChange={(e) => setGameForm({ ...gameForm, fkEmpresa: e.target.value })}
                    required
                  >
                    <option value="">Selecione uma empresa</option>
                    {companies.map(comp => (
                      <option key={comp.id} value={comp.id}>{comp.nome}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group full-width">
                  <label className="form-label" htmlFor="editGameDescription">Descrição</label>
                  <textarea
                    id="editGameDescription"
                    className="form-textarea"
                    value={gameForm.descricao}
                    onChange={(e) => setGameForm({ ...gameForm, descricao: e.target.value })}
                    required
                  />
                </div>
              </div>

              <button type="submit" className="btn btn-primary">Salvar Alterações</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Admin;
