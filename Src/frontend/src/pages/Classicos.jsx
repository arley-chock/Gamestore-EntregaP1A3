import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

import { API_BASE_URL } from '../utils/api';

const Classicos = () => {
  const [games, setGames] = useState([]);
  const [filteredGames, setFilteredGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedDecade, setSelectedDecade] = useState('');
  const [maxPrice, setMaxPrice] = useState(50);
  const [sortBy, setSortBy] = useState('year-desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [gamesPerPage] = useState(12);

  const categories = ['RPG', 'FPS', 'MMORPG', 'Arcade', 'Plataforma'];
  const decades = ['1980', '1990', '2000', '2010'];

  useEffect(() => {
    loadGames();
  }, []);

  useEffect(() => {
    filterAndSortGames();
  }, [games, searchTerm, selectedCategory, selectedDecade, maxPrice, sortBy]);

  const loadGames = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/jogos`);
      if (!response.ok) throw new Error('Erro ao carregar jogos');
      
      const data = await response.json();
      // Filtrar apenas jogos clássicos (exemplo: jogos com mais de 10 anos ou por critérios específicos)
      const classicGames = data.filter(game => {
        const gameYear = new Date(game.ano).getFullYear();
        const currentYear = new Date().getFullYear();
        return (currentYear - gameYear) >= 10; // Jogos com 10+ anos
      });
      
      setGames(classicGames);
      setFilteredGames(classicGames);
    } catch (err) {
      setError('Erro ao carregar jogos clássicos');
      console.error('Erro:', err);
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortGames = () => {
    let filtered = [...games];

    // Filtrar por termo de busca
    if (searchTerm) {
      filtered = filtered.filter(game =>
        game.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        game.descricao.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtrar por categoria
    if (selectedCategory) {
      filtered = filtered.filter(game => game.categoria === selectedCategory);
    }

    // Filtrar por década
    if (selectedDecade) {
      const startYear = parseInt(selectedDecade);
      const endYear = startYear + 9;
      filtered = filtered.filter(game => {
        const gameYear = new Date(game.ano).getFullYear();
        return gameYear >= startYear && gameYear <= endYear;
      });
    }

    // Filtrar por preço
    filtered = filtered.filter(game => game.preco <= maxPrice);

    // Ordenar
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'year-desc':
          return new Date(a.ano) - new Date(b.ano); // Mais antigos primeiro
        case 'year-asc':
          return new Date(b.ano) - new Date(a.ano); // Mais recentes primeiro
        case 'title-asc':
          return a.nome.localeCompare(b.nome);
        case 'title-desc':
          return b.nome.localeCompare(a.nome);
        case 'price-asc':
          return a.preco - b.preco;
        case 'price-desc':
          return b.preco - a.preco;
        default:
          return 0;
      }
    });

    setFilteredGames(filtered);
    setCurrentPage(1);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleCategoryFilter = (category) => {
    setSelectedCategory(selectedCategory === category ? '' : category);
  };

  const handleDecadeFilter = (decade) => {
    setSelectedDecade(selectedDecade === decade ? '' : decade);
  };

  const handlePriceChange = (e) => {
    setMaxPrice(parseInt(e.target.value));
  };

  const handleSortChange = (e) => {
    setSortBy(e.target.value);
  };

  // Paginação
  const indexOfLastGame = currentPage * gamesPerPage;
  const indexOfFirstGame = indexOfLastGame - gamesPerPage;
  const currentGames = filteredGames.slice(indexOfFirstGame, indexOfLastGame);
  const totalPages = Math.ceil(filteredGames.length / gamesPerPage);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo(0, 0);
  };

  const getGameImage = (game) => {
    return game.imagem || `https://via.placeholder.com/300x400/8B4513/FFFFFF?text=${encodeURIComponent(game.nome)}`;
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading">Carregando jogos clássicos...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <div className="error">{error}</div>
      </div>
    );
  }

  return (
    <div className="classicos-page">
      {/* Breadcrumb */}
      <div className="breadcrumb">
        <button className="breadcrumb-btn">INÍCIO &gt; JOGOS CLÁSSICOS</button>
      </div>

      <div className="content-container">
        {/* Filtros Sidebar */}
        <aside className="filters-sidebar">
          <div className="filter-section">
            <h3 className="filter-title">FILTROS:</h3>
            <div className="filter-categories">
              {categories.map(category => (
                <button
                  key={category}
                  className={`filter-btn ${selectedCategory === category ? 'active' : ''}`}
                  onClick={() => handleCategoryFilter(category)}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          <div className="filter-section">
            <h3 className="filter-title">DÉCADA</h3>
            <div className="filter-categories">
              {decades.map(decade => (
                <button
                  key={decade}
                  className={`filter-btn ${selectedDecade === decade ? 'active' : ''}`}
                  onClick={() => handleDecadeFilter(decade)}
                >
                  {decade}s
                </button>
              ))}
            </div>
          </div>

          <div className="filter-section">
            <h3 className="filter-title">FAIXA DE PREÇO</h3>
            <div className="price-range">
              <input
                type="range"
                className="price-slider"
                min="0"
                max="50"
                value={maxPrice}
                onChange={handlePriceChange}
              />
              <div className="price-labels">
                <span>R$ 0</span>
                <span>R$ {maxPrice}</span>
              </div>
            </div>
          </div>
        </aside>

        {/* Games Content */}
        <section className="games-content">
          <div className="page-header">
            <h1 className="page-title">JOGOS CLÁSSICOS</h1>
            <p className="page-description">
              Descubra os jogos que marcaram época e definiram gerações
            </p>
            <div className="results-count">
              {filteredGames.length} jogo{filteredGames.length !== 1 ? 's' : ''} clássico{filteredGames.length !== 1 ? 's' : ''} encontrado{filteredGames.length !== 1 ? 's' : ''}
            </div>
          </div>

          {/* Search and Sort */}
          <div className="search-sort-bar">
            <div className="search-container">
              <input
                type="text"
                placeholder="Buscar jogos clássicos..."
                className="search-input"
                value={searchTerm}
                onChange={handleSearchChange}
              />
            </div>
            <div className="sort-container">
              <select className="sort-select" value={sortBy} onChange={handleSortChange}>
                <option value="year-desc">Mais Antigos</option>
                <option value="year-asc">Mais Recentes</option>
                <option value="title-asc">A-Z</option>
                <option value="title-desc">Z-A</option>
                <option value="price-asc">Menor Preço</option>
                <option value="price-desc">Maior Preço</option>
              </select>
            </div>
          </div>

          {/* Classic Games Grid */}
          {currentGames.length > 0 ? (
            <div className="games-grid">
              {currentGames.map(game => (
                <div key={game.id} className="game-card">
                  <div className="game-image">
                    <img
                      src={getGameImage(game)}
                      alt={game.nome}
                      onError={(e) => {
                        e.target.src = `https://via.placeholder.com/300x400/8B4513/FFFFFF?text=${encodeURIComponent(game.nome)}`;
                      }}
                    />
                    <div className="game-overlay">
                      <button className="btn-view-details">Ver Detalhes</button>
                    </div>
                  </div>
                  <div className="game-info">
                    <h3 className="game-title">{game.nome}</h3>
                    <p className="game-year">{new Date(game.ano).getFullYear()}</p>
                    <p className="game-category">{game.categoria}</p>
                    <p className="game-price">R$ {game.preco.toFixed(2)}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="no-games">
              <h3>Nenhum jogo clássico encontrado</h3>
              <p>Tente ajustar os filtros ou termo de busca.</p>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="pagination">
              <button
                className="pagination-btn"
                disabled={currentPage === 1}
                onClick={() => handlePageChange(currentPage - 1)}
              >
                Anterior
              </button>
              
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  className={`pagination-btn ${currentPage === page ? 'active' : ''}`}
                  onClick={() => handlePageChange(page)}
                >
                  {page}
                </button>
              ))}
              
              <button
                className="pagination-btn"
                disabled={currentPage === totalPages}
                onClick={() => handlePageChange(currentPage + 1)}
              >
                Próxima
              </button>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default Classicos;