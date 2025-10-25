if (typeof API_BASE_URL === 'undefined') { var API_BASE_URL = 'http://localhost:3000/api/v1'; }
let currentUser = null;

// Carregar dados do perfil ao iniciar
document.addEventListener('DOMContentLoaded', function() {
    loadUserProfile();
});

function switchSection(sectionName) {
    const sections = document.querySelectorAll('.section-content');
    const buttons = document.querySelectorAll('.section-btn');
    
    sections.forEach(s => s.classList.remove('active'));
    buttons.forEach(b => b.classList.remove('active'));
    
    document.getElementById(sectionName).classList.add('active');
    event.target.classList.add('active');
}

async function loadUserProfile() {
    const token = localStorage.getItem('authToken');
    
    if (!token) {
        window.location.href = 'auth.html';
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/perfil`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error('Falha ao carregar perfil');
        }

        currentUser = await response.json();
        await loadCart(); // Load cart after profile loads
        
        // Atualizar informações do perfil
        document.getElementById('userName').textContent = currentUser.nome;
        document.getElementById('userAvatar').textContent = currentUser.nome.charAt(0);
    document.getElementById('userEmail').textContent = currentUser.email;
    // Atualizar header
    const userNameHeader = document.getElementById('userNameHeader');
    const btnSairHeader = document.getElementById('btnSairHeader');
    const userGreeting = document.getElementById('userGreeting');
    if (userNameHeader) userNameHeader.textContent = currentUser.nome;
    if (btnSairHeader) btnSairHeader.style.display = 'inline-block';
    if (userGreeting) userGreeting.style.display = 'inline-block';
        
        // Carregar biblioteca, lista de desejos e histórico
        await loadLibrary();
        await loadWishlist();
        await loadPurchaseHistory();
    } catch (error) {
        console.error('Erro ao carregar perfil:', error);
        alert('Erro ao carregar perfil');
    }
}

async function loadLibrary() {
    try {
        const token = localStorage.getItem('authToken');
        const response = await fetch(`${API_BASE_URL}/perfil/biblioteca`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error('Falha ao carregar biblioteca');
        }

        const library = await response.json();
        const libraryGrid = document.getElementById('libraryGrid');

        // library pode trazer DTOs (com { chaveAtivacao, jogo }) ou diretamente objetos jogo
        libraryGrid.innerHTML = library.map(item => {
            const jogo = item.jogo || item;
            const chave = item.chaveAtivacao || item.chave_ativacao || '';
            const title = jogo.nome || 'Jogo';
            const first = title.charAt(0) || 'J';
            const id = jogo.id || jogo.ID || 0;

            return `
            <div class="game-card">
                <div class="game-image">${first}</div>
                <div class="game-info">
                    <h3 class="game-title">${title}</h3>
                    <p class="game-key">KEY: ${chave}</p>
                    <div class="game-actions">
                        <button class="btn-primary" onclick="addToCart(${id})">Adicionar ao Carrinho</button>
                    </div>
                </div>
            </div>
            `;
        }).join('');

        // Atualizar estatística
        document.getElementById('gamesOwned').textContent = library.length;
    } catch (error) {
        console.error('Erro ao carregar biblioteca:', error);
    }
}

async function loadWishlist() {
    try {
        const token = localStorage.getItem('authToken');
        const response = await fetch(`${API_BASE_URL}/lista-desejo`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error('Falha ao carregar lista de desejos');
        }

        const wishlist = await response.json();
        const wishlistGrid = document.getElementById('wishlistGrid');

        wishlistGrid.innerHTML = wishlist.map(item => {
            const jogo = item.jogo || item;
            const title = jogo.nome || 'Jogo';
            const first = title.charAt(0) || 'J';
            const id = jogo.id || jogo.ID || 0;
            const preco = jogo.preco ? jogo.preco.toFixed(2) : '0.00';

            return `
            <div class="game-card">
                <div class="game-image">${first}</div>
                <div class="game-info">
                    <h3 class="game-title">${title}</h3>
                    <p class="game-key">R$ ${preco}</p>
                    <div class="game-actions">
                        <button class="btn-primary" onclick="addToCart(${id})">Adicionar ao Carrinho</button>
                    </div>
                </div>
            </div>
            `;
        }).join('');

        // Atualizar estatística
        document.getElementById('wishlistCount').textContent = wishlist.length;
    } catch (error) {
        console.error('Erro ao carregar lista de desejos:', error);
    }
}

async function loadCart() {
    try {
        const token = localStorage.getItem('authToken');
        // Use the 'ativo' route to get the active cart for the user
        const response = await fetch(`${API_BASE_URL}/carrinho/ativo`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error('Falha ao carregar carrinho');
        }

        const cartData = await response.json();

    // O backend retorna { carrinho: { ... } } para a rota do carrinho ativo.
    const cartObj = cartData.carrinho || cartData;
        const itens = (cartObj && cartObj.itens) ? cartObj.itens : [];

        // Update profile cart count if present
        const profileCartCount = document.getElementById('profileCartCount');
        if (profileCartCount) {
            profileCartCount.textContent = itens.length;
        }

        // If we're on a cart UI (elements present), render full cart
        const cartItems = document.getElementById('cartItems');
        const cartTotal = document.getElementById('cartTotal');
        if (!cartItems || !cartTotal) {
            return; // Not on cart page, no need to render detailed view
        }

        let total = 0;
        if (itens.length > 0) {
            const itemsHTML = await Promise.all(itens.map(async (item) => {
                // item may use fk_jogo or fkJogo depending on DAO
                const jogoId = item.fkJogo || item.fk_jogo || item.fk_jogo_id || item.fk_jogo_id;
                const gameDetails = await fetchGameDetails(jogoId);
                total += (gameDetails.preco || 0);
                return `
                    <div class="cart-item">
                        <div class="item-details">
                            <h3>${gameDetails.nome}</h3>
                            <p>R$ ${Number(gameDetails.preco || 0).toFixed(2)}</p>
                        </div>
                        <button onclick="removeFromCart(${jogoId})" class="btn-remove">Remover</button>
                    </div>
                `;
            }));
            cartItems.innerHTML = itemsHTML.join('');
            cartTotal.textContent = `R$ ${total.toFixed(2)}`;
        } else {
            cartItems.innerHTML = '<p>Seu carrinho está vazio</p>';
            cartTotal.textContent = 'R$ 0,00';
        }
    } catch (error) {
        console.error('Erro ao carregar carrinho:', error);
    }
}

async function fetchGameDetails(gameId) {
    try {
        const response = await fetch(`${API_BASE_URL}/jogos/${gameId}`);
        if (!response.ok) throw new Error('Falha ao carregar detalhes do jogo');
        return await response.json();
    } catch (error) {
        console.error('Erro ao carregar detalhes do jogo:', error);
        return { nome: 'Jogo não encontrado', preco: 0 };
    }
}

async function removeFromCart(gameId) {
    try {
        const token = localStorage.getItem('authToken');
        const response = await fetch(`${API_BASE_URL}/carrinho/${gameId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) throw new Error('Falha ao remover item do carrinho');
        await loadCart(); // Reload cart after removing item
    } catch (error) {
        console.error('Erro ao remover item do carrinho:', error);
        alert('Erro ao remover item do carrinho');
    }
}

function goToCheckout() {
    window.location.href = 'checkout.html';
}

async function loadPurchaseHistory() {
    try {
        const token = localStorage.getItem('authToken');
        const response = await fetch(`${API_BASE_URL}/vendas`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error('Falha ao carregar histórico');
        }

        const purchases = await response.json();
        const historyContainer = document.getElementById('purchaseHistory');
        
        historyContainer.innerHTML = purchases.map(purchase => `
            <div class="purchase-item">
                <div class="purchase-info">
                    <h3>Pedido #${purchase.id}</h3>
                    <p class="purchase-details">Data: ${new Date(purchase.dataVenda).toLocaleDateString()}</p>
                </div>
                <div class="purchase-total">R$ ${purchase.valorTotal.toFixed(2)}</div>
            </div>
        `).join('');

        // Atualizar estatística
        document.getElementById('purchaseCount').textContent = purchases.length;
    } catch (error) {
        console.error('Erro ao carregar histórico:', error);
    }
}

async function saveConfig(event) {
    event.preventDefault();
    
    const currentPassword = document.getElementById('currentPassword').value;
    const newPassword = document.getElementById('newPassword').value;

    if (newPassword) {
        try {
            const token = localStorage.getItem('authToken');
            const response = await fetch(`${API_BASE_URL}/perfil/senha`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    senhaAtual: currentPassword,
                    novaSenha: newPassword
                })
            });

            if (response.ok) {
                alert('Senha atualizada com sucesso!');
                document.getElementById('configForm').reset();
            } else {
                throw new Error('Falha ao atualizar senha');
            }
        } catch (error) {
            console.error('Erro ao atualizar senha:', error);
            alert('Erro ao atualizar senha');
        }
    }
}

function handleAuth() {
    const token = localStorage.getItem('authToken');
    if (token) {
        // se já está logado, sair
        localStorage.removeItem('authToken');
        window.location.href = '../index.html';
    } else {
        // ir para a página de autenticação (mesma pasta pages)
        window.location.href = 'auth.html';
    }
}

async function addToCart(gameId) {
    try {
        const token = localStorage.getItem('authToken');
        // Use the /carrinho/add endpoint and send the expected field 'jogoId'
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

        if (!response.ok) {
            throw new Error('Falha ao adicionar ao carrinho');
        }

        await loadCart(); // Reload cart after adding item
        alert('Jogo adicionado ao carrinho!');
    } catch (error) {
        console.error('Erro ao adicionar ao carrinho:', error);
        alert('Erro ao adicionar ao carrinho');
    }
}

// Função de logout usada pelo botão da navbar
function logout() {
    localStorage.removeItem('authToken');
    window.location.href = '../index.html';
}