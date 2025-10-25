if (typeof API_BASE_URL === 'undefined') { var API_BASE_URL = 'http://localhost:3000/api/v1'; }
let cartData = null;

document.addEventListener('DOMContentLoaded', function() {
    checkAuth();
    loadCart();
});

function checkAuth() {
    const token = localStorage.getItem('authToken');
    if (!token) {
        window.location.href = 'auth.html';
    }
}

async function loadCart() {
    try {
        const token = localStorage.getItem('authToken');
        const response = await fetch(`${API_BASE_URL}/carrinho`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error('Falha ao carregar o carrinho');
        }

        cartData = await response.json();

        if (!cartData.itens || cartData.itens.length === 0) {
            showEmptyCart();
            return;
        }

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
        const game = await fetchGameDetails(item.fkJogo);
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
                <button class="btn-remove" onclick="removeItem(${item.fkJogo})">Remover</button>
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
        const game = await fetchGameDetails(item.fkJogo);
        subtotal += game.preco;
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

async function processPayment(event) {
    event.preventDefault();

    const btn = document.querySelector('.btn-checkout');
    btn.disabled = true;
    btn.textContent = 'Processando...';

    try {
        const token = localStorage.getItem('authToken');
        const response = await fetch(`${API_BASE_URL}/vendas`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                cartId: cartData.id
            })
        });

        if (response.ok) {
            alert('Pagamento processado com sucesso!');
            window.location.href = 'perfil-usuario.html';
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