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
    const categoryFilters = document.querySelectorAll('.filter-btn');
    const priceSlider = document.querySelector('.price-slider');
    
    categoryFilters.forEach(filter => {
        filter.addEventListener('click', function() {
            // Remover active de todos os filtros
            categoryFilters.forEach(f => f.classList.remove('active'));
            // Adicionar active ao filtro clicado
            this.classList.add('active');
            
            applyGameFilters();
        });
    });
    
    if (priceSlider) {
        priceSlider.addEventListener('input', function() {
            applyGameFilters();
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
        renderGames();
        return;
    }
    
    const filteredGames = games.filter(game => 
        game.titulo.toLowerCase().includes(searchTerm) ||
        game.descricao.toLowerCase().includes(searchTerm) ||
        game.categoria.toLowerCase().includes(searchTerm) ||
        game.desenvolvedora.toLowerCase().includes(searchTerm)
    );
    
    renderFilteredGames(filteredGames);
}

// Aplicar filtros de jogos
function applyGameFilters() {
    const activeCategoryFilter = document.querySelector('.filter-btn.active');
    const priceSlider = document.querySelector('.price-slider');
    
    let filtered = [...games];
    
    // Filtro por categoria
    if (activeCategoryFilter && activeCategoryFilter.dataset.category) {
        const category = activeCategoryFilter.dataset.category.toLowerCase();
        filtered = filtered.filter(game => 
            game.categoria.toLowerCase() === category
        );
    }
    
    // Filtro por preço
    if (priceSlider) {
        const maxPrice = parseFloat(priceSlider.value);
        filtered = filtered.filter(game => game.preco <= maxPrice);
    }
    
    filteredGames = filtered;
    renderGames();
}

// Aplicar ordenação de jogos
function applyGameSorting() {
    const sortSelect = document.getElementById('gameSort');
    if (!sortSelect) return;
    
    const sortBy = sortSelect.value;
    let sorted = [...filteredGames];
    
    switch (sortBy) {
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
        case 'year-asc':
            sorted.sort((a, b) => a.anoLancamento - b.anoLancamento);
            break;
        case 'year-desc':
            sorted.sort((a, b) => b.anoLancamento - a.anoLancamento);
            break;
        case 'rating':
            sorted.sort((a, b) => (b.avaliacaoMedia || 0) - (a.avaliacaoMedia || 0));
            break;
        default:
            sorted.sort((a, b) => new Date(b.dataCadastro) - new Date(a.dataCadastro));
    }
    
    renderFilteredGames(sorted);
}

// Renderizar jogos filtrados
function renderFilteredGames(gameList) {
    renderGameSection('new-releases', getNewReleasesFromList(gameList));
    renderGameSection('trending', getTrendingGamesFromList(gameList));
    renderGameSection('recommendations', getRecommendedGamesFromList(gameList));
}

// Obter lançamentos de uma lista específica
function getNewReleasesFromList(gameList) {
    const currentYear = new Date().getFullYear();
    return gameList
        .filter(game => game.anoLancamento >= currentYear - 1)
        .sort((a, b) => new Date(b.dataCadastro) - new Date(a.dataCadastro))
        .slice(0, 3);
}

// Obter jogos em alta de uma lista específica
function getTrendingGamesFromList(gameList) {
    return gameList
        .sort((a, b) => (b.avaliacoes || 0) - (a.avaliacoes || 0))
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
    if (!isLoggedIn()) return;
    
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
        const response = await fetch(`${API_BASE_URL}/carrinho`, {
            headers: {
                'Authorization': `Bearer ${getAuthToken()}`
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
        const response = await fetch(`${API_BASE_URL}/lista-desejo`, {
            headers: {
                'Authorization': `Bearer ${getAuthToken()}`
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
    if (!requireAuth()) return false;
    
    try {
        const response = await fetch(`${API_BASE_URL}/carrinho`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getAuthToken()}`
            },
            body: JSON.stringify({
                jogoId: gameId,
                quantidade: quantity
            })
        });
        
        if (response.ok) {
            await loadCart();
            showSuccess('Jogo adicionado ao carrinho!');
            return true;
        } else {
            const data = await response.json();
            showError(data.message || 'Erro ao adicionar ao carrinho.');
            return false;
        }
    } catch (error) {
        console.error('Erro ao adicionar ao carrinho:', error);
        showError('Erro de conexão. Tente novamente.');
        return false;
    }
}

// Adicionar à lista de desejos
async function addToWishlist(gameId) {
    if (!requireAuth()) return false;
    
    try {
        const response = await fetch(`${API_BASE_URL}/lista-desejo`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getAuthToken()}`
            },
            body: JSON.stringify({
                jogoId: gameId
            })
        });
        
        if (response.ok) {
            await loadWishlist();
            showSuccess('Jogo adicionado à lista de desejos!');
            return true;
        } else {
            const data = await response.json();
            showError(data.message || 'Erro ao adicionar à lista de desejos.');
            return false;
        }
    } catch (error) {
        console.error('Erro ao adicionar à lista de desejos:', error);
        showError('Erro de conexão. Tente novamente.');
        return false;
    }
}

// Remover do carrinho
async function removeFromCart(itemId) {
    if (!requireAuth()) return false;
    
    try {
        const response = await fetch(`${API_BASE_URL}/carrinho/${itemId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${getAuthToken()}`
            }
        });
        
        if (response.ok) {
            await loadCart();
            showSuccess('Item removido do carrinho!');
            return true;
        } else {
            const data = await response.json();
            showError(data.message || 'Erro ao remover do carrinho.');
            return false;
        }
    } catch (error) {
        console.error('Erro ao remover do carrinho:', error);
        showError('Erro de conexão. Tente novamente.');
        return false;
    }
}

// Remover da lista de desejos
async function removeFromWishlist(gameId) {
    if (!requireAuth()) return false;
    
    try {
        const response = await fetch(`${API_BASE_URL}/lista-desejo/${gameId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${getAuthToken()}`
            }
        });
        
        if (response.ok) {
            await loadWishlist();
            showSuccess('Jogo removido da lista de desejos!');
            return true;
        } else {
            const data = await response.json();
            showError(data.message || 'Erro ao remover da lista de desejos.');
            return false;
        }
    } catch (error) {
        console.error('Erro ao remover da lista de desejos:', error);
        showError('Erro de conexão. Tente novamente.');
        return false;
    }
}

// Atualizar quantidade no carrinho
async function updateCartQuantity(itemId, quantity) {
    if (!requireAuth()) return false;
    
    try {
        const response = await fetch(`${API_BASE_URL}/carrinho/${itemId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getAuthToken()}`
            },
            body: JSON.stringify({
                quantidade: quantity
            })
        });
        
        if (response.ok) {
            await loadCart();
            return true;
        } else {
            const data = await response.json();
            showError(data.message || 'Erro ao atualizar quantidade.');
            return false;
        }
    } catch (error) {
        console.error('Erro ao atualizar quantidade:', error);
        showError('Erro de conexão. Tente novamente.');
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

// Obter avaliações de um jogo
async function getGameReviews(gameId) {
    try {
        const response = await fetch(`${API_BASE_URL}/avaliacao/jogo/${gameId}`);
        
        if (response.ok) {
            return await response.json();
        } else {
            throw new Error('Erro ao carregar avaliações');
        }
    } catch (error) {
        console.error('Erro ao carregar avaliações:', error);
        return [];
    }
}

// Adicionar avaliação
async function addGameReview(gameId, rating, comment) {
    if (!requireAuth()) return false;
    
    try {
        const response = await fetch(`${API_BASE_URL}/avaliacao`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getAuthToken()}`
            },
            body: JSON.stringify({
                jogoId: gameId,
                nota: rating,
                comentario: comment
            })
        });
        
        if (response.ok) {
            showSuccess('Avaliação adicionada com sucesso!');
            return true;
        } else {
            const data = await response.json();
            showError(data.message || 'Erro ao adicionar avaliação.');
            return false;
        }
    } catch (error) {
        console.error('Erro ao adicionar avaliação:', error);
        showError('Erro de conexão. Tente novamente.');
        return false;
    }
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
window.removeFromCart = removeFromCart;
window.removeFromWishlist = removeFromWishlist;
window.updateCartQuantity = updateCartQuantity;
window.getGameReviews = getGameReviews;
window.addGameReview = addGameReview;
window.isInCart = isInCart;
window.isInWishlist = isInWishlist;
