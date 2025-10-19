// Gerenciamento de jogos e funcionalidades relacionadas
let cart = [];
let wishlist = [];

// Inicializar funcionalidades de jogos
document.addEventListener('DOMContentLoaded', function() {
    initializeGameFeatures();
});

// Inicializar funcionalidades de jogos
function initializeGameFeatures() {
    setupGameSearch();
    setupGameFilters();
    setupGameSorting();
    loadUserGameData();
}

// Configurar busca de jogos
function setupGameSearch() {
    const searchInput = document.getElementById('gameSearch');
    if (searchInput) {
        searchInput.addEventListener('input', debounce(handleGameSearch, 300));
    }
}

// Configurar filtros de jogos
function setupGameFilters() {
    const categoryFilters = document.querySelectorAll('.botao-filtro');
    const priceSlider = document.querySelector('.slider-preco');
    
    categoryFilters.forEach(filter => {
        filter.addEventListener('click', function() {
            // Remover active de todos os filtros
            categoryFilters.forEach(f => f.classList.remove('ativo'));
            // Adicionar active ao filtro clicado
            this.classList.add('ativo');
            
            aplicarFiltros();
        });
    });
    
    if (priceSlider) {
        priceSlider.addEventListener('input', function() {
            aplicarFiltros();
        });
    }
}

// Configurar ordenação de jogos
function setupGameSorting() {
    const sortSelect = document.getElementById('gameSort');
    if (sortSelect) {
        sortSelect.addEventListener('change', function() {
            applyGameSorting();
        });
    }
}

// Buscar jogos
function handleGameSearch(event) {
    const searchTerm = event.target.value.toLowerCase();
    
    if (searchTerm.length < 2) {
        renderizarJogos();
        return;
    }
    
    const filteredGames = jogos.filter(game => 
        game.nome.toLowerCase().includes(searchTerm) ||
        game.descricao.toLowerCase().includes(searchTerm) ||
        game.fkCategoria.toString().toLowerCase().includes(searchTerm) ||
        game.fkEmpresa.toString().toLowerCase().includes(searchTerm)
    );
    
    renderFilteredGames(filteredGames);
}

// Aplicar filtros de jogos
function aplicarFiltros() {
    const activeCategoryFilter = document.querySelector('.botao-filtro.ativo');
    const priceSlider = document.querySelector('.slider-preco');
    
    let filtered = [...jogos];
    
    // Filtro por categoria
    if (activeCategoryFilter && activeCategoryFilter.dataset.category) {
        const category = activeCategoryFilter.dataset.category.toLowerCase();
        filtered = filtered.filter(game => 
            game.fkCategoria.toString().toLowerCase().includes(category)
        );
    }
    
    // Filtro por preço
    if (priceSlider) {
        const maxPrice = parseFloat(priceSlider.value);
        filtered = filtered.filter(game => game.preco <= maxPrice);
    }
    
    jogosFiltrados = filtered;
    renderizarJogos();
}

// Aplicar ordenação de jogos
function applyGameSorting() {
    const sortSelect = document.getElementById('gameSort');
    if (!sortSelect) return;
    
    const sortBy = sortSelect.value;
    let sorted = [...jogosFiltrados];
    
    switch (sortBy) {
        case 'title-asc':
            sorted.sort((a, b) => a.nome.localeCompare(b.nome));
            break;
        case 'title-desc':
            sorted.sort((a, b) => b.nome.localeCompare(a.nome));
            break;
        case 'price-asc':
            sorted.sort((a, b) => a.preco - b.preco);
            break;
        case 'price-desc':
            sorted.sort((a, b) => b.preco - a.preco);
            break;
        case 'year-asc':
            sorted.sort((a, b) => a.ano - b.ano);
            break;
        case 'year-desc':
            sorted.sort((a, b) => b.ano - a.ano);
            break;
        default:
            sorted.sort((a, b) => new Date(b.dataCadastro) - new Date(a.dataCadastro));
    }
    
    renderFilteredGames(sorted);
}

// Renderizar jogos filtrados
function renderFilteredGames(gameList) {
    renderizarSecaoJogos('lancamentos', getNewReleasesFromList(gameList));
    renderizarSecaoJogos('em-alta', getTrendingGamesFromList(gameList));
    renderizarSecaoJogos('recomendacoes', getRecommendedGamesFromList(gameList));
}

// Obter lançamentos de uma lista específica
function getNewReleasesFromList(gameList) {
    const currentYear = new Date().getFullYear();
    return gameList
        .filter(game => game.ano >= currentYear - 1)
        .sort((a, b) => b.ano - a.ano)
        .slice(0, 3);
}

// Obter jogos em alta de uma lista específica
function getTrendingGamesFromList(gameList) {
    return gameList
        .sort((a, b) => b.preco - a.preco)
        .slice(0, 3);
}

// Obter recomendações de uma lista específica
function getRecommendedGamesFromList(gameList) {
    return gameList
        .filter(game => game.preco < 50)
        .sort((a, b) => Math.random() - 0.5)
        .slice(0, 3);
}

// Carregar dados de jogos do usuário
async function loadUserGameData() {
    if (!usuarioAtual) return;
    
    try {
        await Promise.all([
            loadCart(),
            loadWishlist()
        ]);
    } catch (error) {
        console.error('Erro ao carregar dados de jogos do usuário:', error);
    }
}

// Carregar carrinho
async function loadCart() {
    try {
        const response = await fetch(`${URL_BASE_API}/carrinho`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('authToken')}`
            }
        });
        
        if (response.ok) {
            cart = await response.json();
            updateCartCounter();
        }
    } catch (error) {
        console.error('Erro ao carregar carrinho:', error);
    }
}

// Carregar lista de desejos
async function loadWishlist() {
    try {
        const response = await fetch(`${URL_BASE_API}/lista-desejo`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('authToken')}`
            }
        });
        
        if (response.ok) {
            wishlist = await response.json();
            updateWishlistCounter();
        }
    } catch (error) {
        console.error('Erro ao carregar lista de desejos:', error);
    }
}

// Adicionar ao carrinho
async function addToCart(gameId, quantity = 1) {
    if (!usuarioAtual) {
        mostrarErro('Você precisa estar logado para adicionar itens ao carrinho.');
        alternarModalAutenticacao();
        return false;
    }
    
    try {
        const response = await fetch(`${URL_BASE_API}/carrinho`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('authToken')}`
            },
            body: JSON.stringify({
                jogoId: gameId,
                quantidade: quantity
            })
        });
        
        if (response.ok) {
            await loadCart();
            mostrarSucesso('Jogo adicionado ao carrinho!');
            return true;
        } else {
            const data = await response.json();
            mostrarErro(data.message || 'Erro ao adicionar ao carrinho.');
            return false;
        }
    } catch (error) {
        console.error('Erro ao adicionar ao carrinho:', error);
        mostrarErro('Erro de conexão. Tente novamente.');
        return false;
    }
}

// Adicionar à lista de desejos
async function addToWishlist(gameId) {
    if (!usuarioAtual) {
        mostrarErro('Você precisa estar logado para adicionar à lista de desejos.');
        alternarModalAutenticacao();
        return false;
    }
    
    try {
        const response = await fetch(`${URL_BASE_API}/lista-desejo`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('authToken')}`
            },
            body: JSON.stringify({
                jogoId: gameId
            })
        });
        
        if (response.ok) {
            await loadWishlist();
            mostrarSucesso('Jogo adicionado à lista de desejos!');
            return true;
        } else {
            const data = await response.json();
            mostrarErro(data.message || 'Erro ao adicionar à lista de desejos.');
            return false;
        }
    } catch (error) {
        console.error('Erro ao adicionar à lista de desejos:', error);
        mostrarErro('Erro de conexão. Tente novamente.');
        return false;
    }
}

// Atualizar contador do carrinho
function updateCartCounter() {
    const counter = document.getElementById('cartCounter');
    if (counter) {
        const totalItems = cart.reduce((sum, item) => sum + item.quantidade, 0);
        counter.textContent = totalItems;
        counter.style.display = totalItems > 0 ? 'block' : 'none';
    }
}

// Atualizar contador da lista de desejos
function updateWishlistCounter() {
    const counter = document.getElementById('wishlistCounter');
    if (counter) {
        counter.textContent = wishlist.length;
        counter.style.display = wishlist.length > 0 ? 'block' : 'none';
    }
}

// Verificar se jogo está no carrinho
function isInCart(gameId) {
    return cart.some(item => item.jogoId === gameId);
}

// Verificar se jogo está na lista de desejos
function isInWishlist(gameId) {
    return wishlist.some(item => item.jogoId === gameId);
}

// Função debounce para busca
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Exportar funções para uso global
window.addToCart = addToCart;
window.addToWishlist = addToWishlist;
window.isInCart = isInCart;
window.isInWishlist = isInWishlist;