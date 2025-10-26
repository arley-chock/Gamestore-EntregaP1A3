if (typeof API_BASE_URL === 'undefined') { var API_BASE_URL = 'http://localhost:3000/api/v1'; }
let cartData = null;

document.addEventListener('DOMContentLoaded', function() {
    checkAuth();
    loadCart();
});

function checkAuth() {
    const token = localStorage.getItem('authToken');
    if (!token) {
        window.location.href = '../index.html';
    }
}

async function loadCart() {
    try {
        const token = localStorage.getItem('authToken');
    // solicita o carrinho ativo do usuário autenticado
        const response = await fetch(`${API_BASE_URL}/carrinho/ativo`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error('Falha ao carregar o carrinho');
        }

        const payload = await response.json();

    // o backend pode retornar { carrinho: { ... } } ou uma mensagem quando estiver vazio
    const cartObj = payload.carrinho || payload;

        if (!cartObj || !cartObj.itens || cartObj.itens.length === 0) {
            showEmptyCart();
            return;
        }

        // normalize cartData to the cart object (with id, itens...)
        cartData = cartObj;

        await renderCart();
        await updateSummary();
    } catch (error) {
        console.error('Erro ao carregar carrinho:', error);
        showEmptyCart();
    }
}

async function renderCart() {
    const container = document.getElementById('cartItems');
    
    const itemsHTML = await Promise.all(cartData.itens.map(async (item) => {
        const jogoId = item.fkJogo || item.fk_jogo || item.fk_jogo_id || item.fk_jogoId || item.jogoId || item.jogo_id;
        const game = await fetchGameDetails(jogoId);
        return `
            <div class="cart-item">
                <div class="item-image">
                    ${game.nome.charAt(0)}
                </div>
                <div class="item-details">
                    <h3 class="item-name">${game.nome}</h3>
                    <p class="item-info">${game.ano} | ${game.fkCategoria}</p>
                </div>
                <div class="item-price">R$ ${game.preco.toFixed(2)}</div>
                <button class="btn-remove" onclick="removeItem(${jogoId})">Remover</button>
            </div>
        `;
    }));

    container.innerHTML = itemsHTML.join('');
}

async function fetchGameDetails(gameId) {
    try {
        const response = await fetch(`${API_BASE_URL}/jogos/${gameId}`);
        if (response.ok) {
            return await response.json();
        }
    } catch (error) {
        console.error('Erro ao buscar detalhes do jogo:', error);
    }
    return { nome: 'Jogo', ano: 2025, preco: 0, fkCategoria: 'N/A' };
}

async function updateSummary() {
    let subtotal = 0;

    for (const item of cartData.itens) {
        const jogoId = item.fkJogo || item.fk_jogo || item.fk_jogo_id || item.fk_jogoId || item.jogoId || item.jogo_id;
        const game = await fetchGameDetails(jogoId);
        subtotal += (game.preco || 0);
    }

    const discount = 0;
    const total = subtotal - discount;

    document.getElementById('subtotal').textContent = `R$ ${subtotal.toFixed(2)}`;
    document.getElementById('discount').textContent = `R$ ${discount.toFixed(2)}`;
    document.getElementById('total').textContent = `R$ ${total.toFixed(2)}`;
}

async function removeItem(gameId) {
    try {
        const token = localStorage.getItem('authToken');
        const response = await fetch(`${API_BASE_URL}/carrinho/${gameId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            await loadCart();
        }
    } catch (error) {
        console.error('Erro ao remover item:', error);
        alert('Erro ao remover item do carrinho');
    }
}

function generateSerialKey() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    const segments = 4;
    const segmentLength = 4;
    let key = '';
    
    for (let i = 0; i < segments; i++) {
        for (let j = 0; j < segmentLength; j++) {
            key += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        if (i < segments - 1) key += '-';
    }
    
    return key;
}

async function processPayment(event) {
    event.preventDefault();

    const btn = document.querySelector('.btn-checkout');
    btn.disabled = true;
    btn.textContent = 'Processando...';

    try {
        const token = localStorage.getItem('authToken');
    // Chama o endpoint de checkout do backend que finaliza o carrinho ativo e gera chaves de ativação
        const response = await fetch(`${API_BASE_URL}/vendas/checkout`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            // o backend determina o carrinho ativo a partir do usuário autenticado; o corpo da requisição é opcional
            body: JSON.stringify({ cartId: cartData && cartData.id })
        });

        if (response.ok) {
            alert('Pagamento processado com sucesso! As chaves de ativação estarão disponíveis no seu perfil.');
            // redirect to the user profile page (same folder)
            window.location.href = 'usuario.html';
        } else {
            throw new Error('Falha ao processar pagamento');
        }
    } catch (error) {
        console.error('Erro ao processar pagamento:', error);
        alert('Erro ao processar pagamento');
    } finally {
        btn.disabled = false;
        btn.textContent = 'Finalizar Compra';
    }
}

function showEmptyCart() {
    const container = document.getElementById('checkoutContainer');
    container.innerHTML = `
        <div class="empty-cart">
            <h2>Seu carrinho está vazio</h2>
            <p>Adicione alguns jogos clássicos ao seu carrinho</p>
            <a href="classicos.html" class="btn-continue">Continuar Comprando</a>
        </div>
    `;
}