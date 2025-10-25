const API_BASE_URL = 'http://localhost:3000/api/v1';
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
        
        // Atualizar informações do perfil
        document.getElementById('userName').textContent = currentUser.nome;
        document.getElementById('userAvatar').textContent = currentUser.nome.charAt(0);
        document.getElementById('userEmail').textContent = currentUser.email;
        
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
        
        libraryGrid.innerHTML = library.map(game => `
            <div class="game-card">
                <div class="game-image">${game.nome.charAt(0)}</div>
                <div class="game-info">
                    <h3 class="game-title">${game.nome}</h3>
                    <p class="game-key">KEY: ${game.chaveAtivacao}</p>
                </div>
            </div>
        `).join('');

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
        
        wishlistGrid.innerHTML = wishlist.map(game => `
            <div class="game-card">
                <div class="game-image">${game.nome.charAt(0)}</div>
                <div class="game-info">
                    <h3 class="game-title">${game.nome}</h3>
                    <p class="game-key">R$ ${game.preco.toFixed(2)}</p>
                </div>
            </div>
        `).join('');

        // Atualizar estatística
        document.getElementById('wishlistCount').textContent = wishlist.length;
    } catch (error) {
        console.error('Erro ao carregar lista de desejos:', error);
    }
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
                method: 'PUT',
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
        localStorage.removeItem('authToken');
        window.location.href = 'index.html';
    } else {
        window.location.href = 'auth.html';
    }
}