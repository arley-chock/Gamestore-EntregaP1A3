import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import GameCard from '../components/GameCard';
import GameModal from '../components/GameModal';

import { apiFetch, fetchGames, getAuthToken } from '../utils/api';

const Classicos = () => {
    const navigate = useNavigate();

    const [games, setGames] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [selectedDecade, setSelectedDecade] = useState('');
    const [maxPrice, setMaxPrice] = useState(1000); 
    const [sortBy, setSortBy] = useState('year-desc');
    const [selectedGame, setSelectedGame] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [gamesPerPage] = useState(12);
    
    // 🆕 NOVO ESTADO: Mapa de categorias (ID -> Nome)
    const [categoryMap, setCategoryMap] = useState({}); 

    const staticCategories = ['RPG', 'FPS', 'MMORPG', 'Arcade', 'Plataforma'];
    const decades = ['1980', '1990', '2000', '2010'];

    // 🆕 ATUALIZADO: Carregamento inicial de dados (Categorias -> Jogos)
    useEffect(() => {
        const loadInitialData = async () => {
            setLoading(true);
            const map = await loadCategories(); // 1. Carrega o mapa
            await loadGames(map); // 2. Usa o mapa para carregar os jogos
            setLoading(false);
        };
        loadInitialData();
    }, []); 

    // Funções de utilidade
    const handleGameClick = useCallback((jogo) => {
        setSelectedGame(jogo);
    }, []);

    const handleCloseModal = useCallback(() => {
        setSelectedGame(null);
    }, []);
    
    // 🆕 NOVO: Função para carregar o mapa de categorias (Cópia da Home.js)
    const loadCategories = async () => {
        const token = getAuthToken();
        if (!token) {
            setCategoryMap({});
            return {};
        }

        try {
            const dadosCategorias = await apiFetch('/categorias', { auth: true });
            
            const newCategoryMap = dadosCategorias.reduce((acc, categoria) => {
                acc[categoria.id] = categoria.nome;
                return acc;
            }, {});

            setCategoryMap(newCategoryMap);
            return newCategoryMap; 

        } catch (error) {
            console.error('💥 Erro ao carregar categorias:', error);
            setCategoryMap({});
            return {};
        }
    };

    // 🛠️ ATUALIZADO: Função para carregar jogos (Agora recebe o mapa)
    const loadGames = async (categoriesMap) => {
        try {
            const data = await fetchGames();

            // Lógica de "Clássico": >= 10 anos de idade
            const currentYear = new Date().getFullYear();
            const classicGames = data.filter(game => {
                const gameYear = parseInt(game.ano, 10);
                
                if (isNaN(gameYear) || gameYear === 0) return false; 

                return (currentYear - gameYear) >= 10;
            });

            // 🛠️ NORMALIZAÇÃO: Mapeamento do ID para o NOME da Categoria
            const normalizedGames = classicGames.map((game, index) => {
                const fkCategoria = game.fkCategoria || game.fk_categoria;
                return {
                    ...game,
                    id: game.id || game.ID || `public-${index}`,
                    preco: parseFloat(game.preco) || 0,
                    ano: parseInt(game.ano, 10) || 0,
                    imagem: game.imagem || game.imgUrl || '',
                    gif: game.gif || game.videoUrl || '', 
                    categoria: categoriesMap[fkCategoria] || game.categoria || 'Desconhecida'
                };
            });

            if (!categoriesMap || Object.keys(categoriesMap).length === 0) {
                const categoriasDerivadas = [...new Set(normalizedGames.map(game => game.categoria).filter(Boolean))];
                const mapDerivado = categoriasDerivadas.reduce((acc, nome, idx) => {
                    acc[`local-${idx}`] = nome;
                    return acc;
                }, {});
                setCategoryMap(mapDerivado);
            }

            setGames(normalizedGames);
        } catch (err) {
            setError('Erro ao carregar jogos clássicos');
            console.error('Erro:', err);
        } 
    };

    const derivedCategories = useMemo(() => {
        const nomes = Object.values(categoryMap);
        return nomes.length > 0 ? nomes : staticCategories;
    }, [categoryMap]);

    // Lógica de Filtro e Ordenação usando useMemo
    const filteredAndSortedGames = useMemo(() => {
        let filtered = [...games];

        if (searchTerm) {
            filtered = filtered.filter(game =>
                game.nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                game.descricao?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        if (selectedCategory) {
            filtered = filtered.filter(game => 
                // 🛠️ Filtro de Categoria usa a string (nome da categoria)
                String(game.categoria).toLowerCase().includes(selectedCategory.toLowerCase())
            );
        }

        if (selectedDecade) {
            const startYear = parseInt(selectedDecade);
            const endYear = startYear + 9;
            filtered = filtered.filter(game => {
                const gameYear = game.ano;
                return gameYear >= startYear && gameYear <= endYear;
            });
        }

        filtered = filtered.filter(game => game.preco <= maxPrice);

        filtered.sort((a, b) => {
            switch (sortBy) {
                case 'year-desc':
                    // Ordena do mais antigo para o mais novo
                    return a.ano - b.ano; 
                case 'year-asc':
                    // Ordena do mais novo para o mais antigo
                    return b.ano - a.ano;
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

        return filtered;
    }, [games, searchTerm, selectedCategory, selectedDecade, maxPrice, sortBy]);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, selectedCategory, selectedDecade, maxPrice, sortBy]);


    // Paginação
    const indexOfLastGame = currentPage * gamesPerPage;
    const indexOfFirstGame = indexOfLastGame - gamesPerPage;
    const currentGames = filteredAndSortedGames.slice(indexOfFirstGame, indexOfLastGame);
    const totalPages = Math.ceil(filteredAndSortedGames.length / gamesPerPage);

    const handlePageChange = (page) => {
        setCurrentPage(page);
        window.scrollTo(0, 0);
    };

    // Renderização de Estados
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
                <button className="breadcrumb-btn" onClick={() => navigate('/')}>INÍCIO</button>
                <span className="breadcrumb-text">&gt; CLÁSSICOS</span>
            </div>

            <div className="content-container">
                <aside className="filters-sidebar">
                    <div className="filter-section">
                        <h3 className="filter-title">FILTROS:</h3>
                        <div className="filter-categories">
                            {derivedCategories.map(category => (
                                <button
                                    key={category}
                                    className={`filter-btn ${selectedCategory === category ? 'active' : ''}`}
                                    onClick={() => setSelectedCategory(selectedCategory === category ? '' : category)}
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
                                    onClick={() => setSelectedDecade(selectedDecade === decade ? '' : decade)}
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
                                max="1000" 
                                value={maxPrice}
                                onChange={(e) => setMaxPrice(parseInt(e.target.value))}
                            />
                            <div className="price-labels">
                                <span>R$ 0</span>
                                <span>R$ {maxPrice.toFixed(2)}</span>
                            </div>
                        </div>
                    </div>
                </aside>

                <main className="games-content">
                    <div className="page-header">
                        <h1 className="page-title">JOGOS CLÁSSICOS</h1>
                        <p className="page-description">
                            Descubra os jogos que marcaram época e definiram gerações
                        </p>
                        <div className="results-count">
                            {filteredAndSortedGames.length} jogo{filteredAndSortedGames.length !== 1 ? 's' : ''} clássico{filteredAndSortedGames.length !== 1 ? 's' : ''} encontrado{filteredAndSortedGames.length !== 1 ? 's' : ''}
                        </div>
                    </div>

                    <div className="search-sort-bar">
                        <div className="search-container">
                            <input
                                type="text"
                                placeholder="Buscar jogos clássicos..."
                                className="search-input"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="sort-container">
                            <select className="sort-select" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                                <option value="year-desc">Mais Antigos</option>
                                <option value="year-asc">Mais Recentes</option>
                                <option value="title-asc">A-Z</option>
                                <option value="title-desc">Z-A</option>
                                <option value="price-asc">Menor Preço</option>
                                <option value="price-desc">Maior Preço</option>
                            </select>
                        </div>
                    </div>

                    {currentGames.length > 0 ? (
                        <div className="games-grid">
                            {currentGames.map(game => (
                                <GameCard 
                                    key={game.id}
                                    jogo={game}
                                    onClick={() => handleGameClick(game)}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="no-games">
                            <h3>Nenhum jogo clássico encontrado</h3>
                            <p>Tente ajustar os filtros ou termo de busca.</p>
                        </div>
                    )}

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
                </main>
            </div>

            {selectedGame && (
                <GameModal
                    jogo={selectedGame}
                    onClose={handleCloseModal}
                />
            )}
        </div>
    );
};

export default Classicos;