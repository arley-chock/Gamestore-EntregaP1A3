// Funcionalidades específicas para a página de jogos clássicos
document.addEventListener('DOMContentLoaded', function() {
    initializeClassicsPage();
});

// Inicializar página de clássicos
function initializeClassicsPage() {
    loadClassicGames();
    setupClassicFilters();
    setupClassicSearch();
    setupClassicSorting();
}

// Carregar jogos clássicos
async function loadClassicGames() {
    try {
        showLoading();
        
        // Filtrar jogos clássicos (lançados antes de 2015)
        const classicGames = games.filter(game => game.anoLancamento < 2015);
        
        // Ordenar por ano de lançamento (mais antigos primeiro)
        classicGames.sort((a, b) => a.anoLancamento - b.anoLancamento);
        
        renderClassicGames(classicGames);
        hideLoading();
        
    } catch (error) {
        console.error('Erro ao carregar jogos clássicos:', error);
        showError('Erro ao carregar jogos clássicos.');
        hideLoading();
    }
}

// Renderizar jogos clássicos
function renderClassicGames(gamesList) {
    const container = document.getElementById('classic-games');
    if (!container) return;
    
    container.innerHTML = '';
    
    if (gamesList.length === 0) {
        container.innerHTML = `
            <div class="no-games">
                <h3>Nenhum jogo clássico encontrado</h3>
                <p>Tente ajustar os filtros para encontrar mais jogos.</p>
            </div>
        `;
        return;
    }
    
    gamesList.forEach(game => {
        const gameCard = createClassicGameCard(game);
        container.appendChild(gameCard);
    });
}

// Criar card de jogo clássico
function createClassicGameCard(game) {
    const card = document.createElement('div');
    card.className = 'game-card classic-card';
    card.onclick = () => showGameDetail(game);
    
    // Determinar década
    const decade = Math.floor(game.anoLancamento / 10) * 10;
    
    card.innerHTML = `
        <div class="game-image">
            <img src="${game.imagem || 'images/placeholder-classic.jpg'}" alt="${game.titulo}">
            <div class="classic-badge">${decade}s</div>
            <div class="game-overlay">
                <div class="game-title">${game.titulo.toUpperCase()}</div>
                <div class="game-subtitle">${game.desenvolvedora} • ${game.anoLancamento}</div>
            </div>
        </div>
        <div class="game-card-info">
            <div class="game-price">R$ ${game.preco.toFixed(2)}</div>
            <div class="game-category">${game.categoria}</div>
        </div>
    `;
    
    return card;
}

// Configurar filtros específicos para clássicos
function setupClassicFilters() {
    const categoryFilters = document.querySelectorAll('.filter-btn[data-category]');
    const decadeFilters = document.querySelectorAll('.filter-btn[data-decade]');
    const priceSlider = document.querySelector('.price-slider');
    
    // Filtros de categoria
    categoryFilters.forEach(filter => {
        filter.addEventListener('click', function() {
            // Remover active de todos os filtros de categoria
            categoryFilters.forEach(f => f.classList.remove('active'));
            // Adicionar active ao filtro clicado
            this.classList.add('active');
            
            applyClassicFilters();
        });
    });
    
    // Filtros de década
    decadeFilters.forEach(filter => {
        filter.addEventListener('click', function() {
            // Remover active de todos os filtros de década
            decadeFilters.forEach(f => f.classList.remove('active'));
            // Adicionar active ao filtro clicado
            this.classList.add('active');
            
            applyClassicFilters();
        });
    });
    
    // Filtro de preço
    if (priceSlider) {
        priceSlider.addEventListener('input', function() {
            applyClassicFilters();
        });
    }
}

// Configurar busca específica para clássicos
function setupClassicSearch() {
    const searchInput = document.getElementById('gameSearch');
    if (searchInput) {
        searchInput.addEventListener('input', debounce(handleClassicSearch, 300));
    }
}

// Configurar ordenação específica para clássicos
function setupClassicSorting() {
    const sortSelect = document.getElementById('gameSort');
    if (sortSelect) {
        sortSelect.addEventListener('change', function() {
            applyClassicSorting();
        });
    }
}

// Buscar jogos clássicos
function handleClassicSearch(event) {
    const searchTerm = event.target.value.toLowerCase();
    
    if (searchTerm.length < 2) {
        loadClassicGames();
        return;
    }
    
    const classicGames = games.filter(game => game.anoLancamento < 2015);
    const filteredGames = classicGames.filter(game => 
        game.titulo.toLowerCase().includes(searchTerm) ||
        game.descricao.toLowerCase().includes(searchTerm) ||
        game.categoria.toLowerCase().includes(searchTerm) ||
        game.desenvolvedora.toLowerCase().includes(searchTerm)
    );
    
    renderClassicGames(filteredGames);
}

// Aplicar filtros específicos para clássicos
function applyClassicFilters() {
    const activeCategoryFilter = document.querySelector('.filter-btn[data-category].active');
    const activeDecadeFilter = document.querySelector('.filter-btn[data-decade].active');
    const priceSlider = document.querySelector('.price-slider');
    
    let filtered = games.filter(game => game.anoLancamento < 2015);
    
    // Filtro por categoria
    if (activeCategoryFilter) {
        const category = activeCategoryFilter.dataset.category.toLowerCase();
        filtered = filtered.filter(game => 
            game.categoria.toLowerCase() === category
        );
    }
    
    // Filtro por década
    if (activeDecadeFilter) {
        const decade = parseInt(activeDecadeFilter.dataset.decade);
        filtered = filtered.filter(game => {
            const gameDecade = Math.floor(game.anoLancamento / 10) * 10;
            return gameDecade === decade;
        });
    }
    
    // Filtro por preço
    if (priceSlider) {
        const maxPrice = parseFloat(priceSlider.value);
        filtered = filtered.filter(game => game.preco <= maxPrice);
    }
    
    renderClassicGames(filtered);
}

// Aplicar ordenação específica para clássicos
function applyClassicSorting() {
    const sortSelect = document.getElementById('gameSort');
    if (!sortSelect) return;
    
    const sortBy = sortSelect.value;
    let classicGames = games.filter(game => game.anoLancamento < 2015);
    let sorted = [...classicGames];
    
    switch (sortBy) {
        case 'year-asc':
            sorted.sort((a, b) => a.anoLancamento - b.anoLancamento);
            break;
        case 'year-desc':
            sorted.sort((a, b) => b.anoLancamento - a.anoLancamento);
            break;
        case 'title-asc':
            sorted.sort((a, b) => a.titulo.localeCompare(b.titulo));
            break;
        case 'title-desc':
            sorted.sort((a, b) => b.titulo.localeCompare(a.titulo));
            break;
        case 'price-asc':
            sorted.sort((a, b) => a.preco - b.preco);
            break;
        case 'price-desc':
            sorted.sort((a, b) => b.preco - a.preco);
            break;
        case 'rating':
            sorted.sort((a, b) => (b.avaliacaoMedia || 0) - (a.avaliacaoMedia || 0));
            break;
        default:
            sorted.sort((a, b) => a.anoLancamento - b.anoLancamento);
    }
    
    renderClassicGames(sorted);
}

// Obter jogos por década
function getGamesByDecade(decade) {
    const startYear = decade;
    const endYear = decade + 9;
    
    return games.filter(game => 
        game.anoLancamento >= startYear && 
        game.anoLancamento <= endYear &&
        game.anoLancamento < 2015
    );
}

// Obter jogos mais influentes
function getMostInfluentialGames() {
    // Jogos clássicos com alta avaliação e muitos comentários
    return games
        .filter(game => game.anoLancamento < 2015)
        .filter(game => (game.avaliacaoMedia || 0) >= 4.0)
        .filter(game => (game.totalAvaliacoes || 0) >= 100)
        .sort((a, b) => (b.avaliacaoMedia || 0) - (a.avaliacaoMedia || 0))
        .slice(0, 10);
}

// Obter jogos por gênero clássico
function getGamesByClassicGenre(genre) {
    const classicGenres = {
        'arcade': ['Arcade', 'Retro', 'Classic'],
        'platform': ['Platform', 'Platformer', '2D Platform'],
        'rpg': ['RPG', 'JRPG', 'CRPG'],
        'fps': ['FPS', 'First Person Shooter', 'Shooter'],
        'strategy': ['Strategy', 'RTS', 'Turn-based Strategy']
    };
    
    const genres = classicGenres[genre.toLowerCase()] || [genre];
    
    return games.filter(game => 
        game.anoLancamento < 2015 &&
        genres.some(g => game.categoria.toLowerCase().includes(g.toLowerCase()))
    );
}

// Exportar funções para uso global
window.loadClassicGames = loadClassicGames;
window.renderClassicGames = renderClassicGames;
window.applyClassicFilters = applyClassicFilters;
window.applyClassicSorting = applyClassicSorting;
window.getGamesByDecade = getGamesByDecade;
window.getMostInfluentialGames = getMostInfluentialGames;
window.getGamesByClassicGenre = getGamesByClassicGenre;
