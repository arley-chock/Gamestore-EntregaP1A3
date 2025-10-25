const API_BASE_URL = 'http://localhost:3000/api/v1';
let allGames = [];
let categories = [];
let companies = [];

document.addEventListener('DOMContentLoaded', function() {
    checkAdminAuth();
    loadDashboardData();
});

function checkAdminAuth() {
    const token = localStorage.getItem('authToken');
    if (!token) {
        window.location.href = 'auth.html';
        return;
    }

    // Verificar se é admin
    fetch(`${API_BASE_URL}/auth/check-admin`, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    }).then(response => {
        if (!response.ok) {
            window.location.href = 'index.html';
        }
    });
}

async function loadDashboardData() {
    await Promise.all([
        loadGames(),
        loadCategories(),
        loadCompanies(),
        loadStats()
    ]);
}

async function loadStats() {
    try {
        const token = localStorage.getItem('authToken');
        const response = await fetch(`${API_BASE_URL}/relatorios/vendas`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error('Falha ao carregar estatísticas');
        }

        const stats = await response.json();
        document.getElementById('totalGames').textContent = allGames.length;
        document.getElementById('totalCompanies').textContent = companies.length;
        document.getElementById('totalSales').textContent = '1,847';
    } catch (error) {
        console.error('Erro ao carregar estatísticas:', error);
    }
}

async function loadGames() {
    try {
        const response = await fetch(`${API_BASE_URL}/jogos`);
        if (response.ok) {
            allGames = await response.json();
            renderGames(allGames);
        }
    } catch (error) {
        console.error('Erro ao carregar jogos:', error);
    }
}

function renderGames(games) {
    const tbody = document.getElementById('gamesTableBody');
    
    if (games.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" style="text-align: center;">Nenhum jogo encontrado</td></tr>`;
        return;
    }

    tbody.innerHTML = games.map(game => `
        <tr>
            <td>${game.id}</td>
            <td>${game.nome}</td>
            <td>${game.ano}</td>
            <td>R$ ${game.preco.toFixed(2)}</td>
            <td>${game.fkCategoria}</td>
            <td>
                <button class="btn-action btn-edit" onclick="editGame(${game.id})">Editar</button>
                <button class="btn-action btn-delete" onclick="deleteGame(${game.id})">Excluir</button>
            </td>
        </tr>
    `).join('');
}

async function loadCategories() {
    try {
        const response = await fetch(`${API_BASE_URL}/categorias`);
        if (response.ok) {
            categories = await response.json();
            
            const categorySelects = document.querySelectorAll('.category-select');
            categorySelects.forEach(select => {
                select.innerHTML = `
                    <option value="">Selecione uma categoria</option>
                    ${categories.map(cat => `
                        <option value="${cat.id}">${cat.nome}</option>
                    `).join('')}
                `;
            });
        }
    } catch (error) {
        console.error('Erro ao carregar categorias:', error);
    }
}

async function loadCompanies() {
    try {
        const response = await fetch(`${API_BASE_URL}/empresas`);
        if (response.ok) {
            companies = await response.json();
            renderCompanies();
            
            const companySelects = document.querySelectorAll('.company-select');
            companySelects.forEach(select => {
                select.innerHTML = `
                    <option value="">Selecione uma empresa</option>
                    ${companies.map(comp => `
                        <option value="${comp.id}">${comp.nome}</option>
                    `).join('')}
                `;
            });
        }
    } catch (error) {
        console.error('Erro ao carregar empresas:', error);
    }
}

function renderCompanies() {
    const tbody = document.getElementById('companiesTableBody');
    
    if (!companies.length) {
        tbody.innerHTML = `<tr><td colspan="3" style="text-align: center;">Nenhuma empresa encontrada</td></tr>`;
        return;
    }

    tbody.innerHTML = companies.map(company => `
        <tr>
            <td>${company.id}</td>
            <td>${company.nome}</td>
            <td>
                <button class="btn-action btn-delete" onclick="deleteCompany(${company.id})">Excluir</button>
            </td>
        </tr>
    `).join('');
}

async function addGame(event) {
    event.preventDefault();

    const formData = {
        nome: document.getElementById('gameName').value,
        ano: parseInt(document.getElementById('gameYear').value),
        preco: parseFloat(document.getElementById('gamePrice').value),
        descricao: document.getElementById('gameDescription').value,
        fkCategoria: document.getElementById('gameCategory').value,
        fkEmpresa: document.getElementById('gameCompany').value
    };

    try {
        const token = localStorage.getItem('authToken');
        const response = await fetch(`${API_BASE_URL}/jogos`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(formData)
        });

        if (response.ok) {
            alert('Jogo adicionado com sucesso!');
            document.getElementById('addGameForm').reset();
            await loadGames();
        } else {
            throw new Error('Falha ao adicionar jogo');
        }
    } catch (error) {
        console.error('Erro ao adicionar jogo:', error);
        alert('Erro ao adicionar jogo');
    }
}

async function editGame(gameId) {
    const game = allGames.find(g => g.id === gameId);
    if (!game) return;

    document.getElementById('editGameId').value = game.id;
    document.getElementById('editGameName').value = game.nome;
    document.getElementById('editGameYear').value = game.ano;
    document.getElementById('editGamePrice').value = game.preco;
    document.getElementById('editGameDescription').value = game.descricao;
    document.getElementById('editGameCategory').value = game.fkCategoria;
    document.getElementById('editGameCompany').value = game.fkEmpresa;

    document.getElementById('editModal').style.display = 'block';
}

async function updateGame(event) {
    event.preventDefault();

    const gameId = document.getElementById('editGameId').value;
    const formData = {
        nome: document.getElementById('editGameName').value,
        ano: parseInt(document.getElementById('editGameYear').value),
        preco: parseFloat(document.getElementById('editGamePrice').value),
        descricao: document.getElementById('editGameDescription').value,
        fkCategoria: document.getElementById('editGameCategory').value,
        fkEmpresa: document.getElementById('editGameCompany').value
    };

    try {
        const token = localStorage.getItem('authToken');
        const response = await fetch(`${API_BASE_URL}/jogos/${gameId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(formData)
        });

        if (response.ok) {
            alert('Jogo atualizado com sucesso!');
            closeEditModal();
            await loadGames();
        } else {
            throw new Error('Falha ao atualizar jogo');
        }
    } catch (error) {
        console.error('Erro ao atualizar jogo:', error);
        alert('Erro ao atualizar jogo');
    }
}

async function deleteGame(gameId) {
    if (!confirm('Tem certeza que deseja excluir este jogo?')) return;

    try {
        const token = localStorage.getItem('authToken');
        const response = await fetch(`${API_BASE_URL}/jogos/${gameId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            alert('Jogo excluído com sucesso!');
            await loadGames();
        } else {
            throw new Error('Falha ao excluir jogo');
        }
    } catch (error) {
        console.error('Erro ao excluir jogo:', error);
        alert('Erro ao excluir jogo');
    }
}

async function addCompany() {
    const companyName = document.getElementById('companyName').value;
    if (!companyName) {
        alert('Digite o nome da empresa');
        return;
    }

    try {
        const token = localStorage.getItem('authToken');
        const response = await fetch(`${API_BASE_URL}/empresas`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ nome: companyName })
        });

        if (response.ok) {
            alert('Empresa adicionada com sucesso!');
            document.getElementById('companyName').value = '';
            await loadCompanies();
        } else {
            throw new Error('Falha ao adicionar empresa');
        }
    } catch (error) {
        console.error('Erro ao adicionar empresa:', error);
        alert('Erro ao adicionar empresa');
    }
}

async function deleteCompany(companyId) {
    if (!confirm('Tem certeza que deseja excluir esta empresa?')) return;

    try {
        const token = localStorage.getItem('authToken');
        const response = await fetch(`${API_BASE_URL}/empresas/${companyId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            alert('Empresa excluída com sucesso!');
            await loadCompanies();
        } else {
            throw new Error('Falha ao excluir empresa');
        }
    } catch (error) {
        console.error('Erro ao excluir empresa:', error);
        alert('Erro ao excluir empresa');
    }
}

function filterGames() {
    const searchTerm = document.getElementById('searchGames').value.toLowerCase();
    const filteredGames = allGames.filter(game => 
        game.nome.toLowerCase().includes(searchTerm) || 
        game.fkCategoria.toLowerCase().includes(searchTerm)
    );
    renderGames(filteredGames);
}

function switchTab(tabName) {
    const tabs = document.querySelectorAll('.tab-content');
    const buttons = document.querySelectorAll('.tab-btn');
    
    tabs.forEach(tab => tab.classList.remove('active'));
    buttons.forEach(btn => btn.classList.remove('active'));
    
    document.getElementById(tabName).classList.add('active');
    event.target.classList.add('active');
}

function closeEditModal() {
    document.getElementById('editModal').style.display = 'none';
}

window.onclick = function(event) {
    const modal = document.getElementById('editModal');
    if (event.target == modal) {
        closeEditModal();
    }
}