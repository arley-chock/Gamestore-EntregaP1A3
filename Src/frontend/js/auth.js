// Autenticação e gerenciamento de usuários
document.addEventListener('DOMContentLoaded', function() {
    setupAuthForms();
});

// Configurar formulários de autenticação
function setupAuthForms() {
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
    
    if (registerForm) {
        registerForm.addEventListener('submit', handleRegister);
    }
}

// Lidar com login
async function handleLogin(event) {
    event.preventDefault();
    
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    
    if (!email || !password) {
        showError('Por favor, preencha todos os campos.');
        return;
    }
    
    try {
        showLoading('Entrando...');
        
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: email,
                senha: password
            })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            // Login bem-sucedido
            localStorage.setItem('authToken', data.token);
            currentUser = data.usuario;
            
            updateUserInterface();
            closeAuthModal();
            clearAuthForms();
            showSuccess('Login realizado com sucesso!');
            
            // Recarregar dados do usuário
            await loadUserData();
            
        } else {
            // Erro no login
            showError(data.message || 'Erro ao fazer login. Verifique suas credenciais.');
        }
        
    } catch (error) {
        console.error('Erro no login:', error);
        showError('Erro de conexão. Tente novamente.');
    } finally {
        hideLoading();
    }
}

// Lidar com registro
async function handleRegister(event) {
    event.preventDefault();
    
    const name = document.getElementById('registerName').value;
    const email = document.getElementById('registerEmail').value;
    const birthDate = document.getElementById('registerBirth').value;
    const password = document.getElementById('registerPassword').value;
    
    if (!name || !email || !birthDate || !password) {
        showError('Por favor, preencha todos os campos.');
        return;
    }
    
    if (password.length < 8) {
        showError('A senha deve ter pelo menos 8 caracteres.');
        return;
    }
    
    if (!isValidEmail(email)) {
        showError('Por favor, insira um e-mail válido.');
        return;
    }
    
    try {
        showLoading('Criando conta...');
        
        const response = await fetch(`${API_BASE_URL}/auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                nome: name,
                email: email,
                dataNascimento: birthDate,
                senha: password
            })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            // Registro bem-sucedido
            localStorage.setItem('authToken', data.token);
            currentUser = data.usuario;
            
            updateUserInterface();
            closeAuthModal();
            clearAuthForms();
            showSuccess('Conta criada com sucesso!');
            
            // Recarregar dados do usuário
            await loadUserData();
            
        } else {
            // Erro no registro
            showError(data.message || 'Erro ao criar conta. Tente novamente.');
        }
        
    } catch (error) {
        console.error('Erro no registro:', error);
        showError('Erro de conexão. Tente novamente.');
    } finally {
        hideLoading();
    }
}

// Carregar dados do usuário
async function loadUserData() {
    if (!currentUser) return;
    
    try {
        // Carregar carrinho
        await loadCart();
        
        // Carregar lista de desejos
        await loadWishlist();
        
        // Carregar histórico de compras
        await loadPurchaseHistory();
        
    } catch (error) {
        console.error('Erro ao carregar dados do usuário:', error);
    }
}

// Carregar carrinho
async function loadCart() {
    try {
        const response = await fetch(`${API_BASE_URL}/carrinho`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('authToken')}`
            }
        });
        
        if (response.ok) {
            const cart = await response.json();
            updateCartUI(cart);
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
                'Authorization': `Bearer ${localStorage.getItem('authToken')}`
            }
        });
        
        if (response.ok) {
            const wishlist = await response.json();
            updateWishlistUI(wishlist);
        }
    } catch (error) {
        console.error('Erro ao carregar lista de desejos:', error);
    }
}

// Carregar histórico de compras
async function loadPurchaseHistory() {
    try {
        const response = await fetch(`${API_BASE_URL}/vendas/historico`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('authToken')}`
            }
        });
        
        if (response.ok) {
            const history = await response.json();
            updatePurchaseHistoryUI(history);
        }
    } catch (error) {
        console.error('Erro ao carregar histórico:', error);
    }
}

// Atualizar UI do carrinho
function updateCartUI(cart) {
    // Implementar atualização da UI do carrinho
    console.log('Carrinho atualizado:', cart);
}

// Atualizar UI da lista de desejos
function updateWishlistUI(wishlist) {
    // Implementar atualização da UI da lista de desejos
    console.log('Lista de desejos atualizada:', wishlist);
}

// Atualizar UI do histórico de compras
function updatePurchaseHistoryUI(history) {
    // Implementar atualização da UI do histórico
    console.log('Histórico atualizado:', history);
}

// Limpar formulários de autenticação
function clearAuthForms() {
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    
    if (loginForm) {
        loginForm.reset();
    }
    
    if (registerForm) {
        registerForm.reset();
    }
}

// Validar e-mail
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Verificar se usuário está logado
function isLoggedIn() {
    return currentUser !== null && localStorage.getItem('authToken') !== null;
}

// Obter token de autenticação
function getAuthToken() {
    return localStorage.getItem('authToken');
}

// Requerer autenticação
function requireAuth() {
    if (!isLoggedIn()) {
        showError('Você precisa estar logado para acessar esta funcionalidade.');
        toggleAuthModal();
        return false;
    }
    return true;
}

// Atualizar perfil do usuário
async function updateProfile(profileData) {
    if (!requireAuth()) return;
    
    try {
        const response = await fetch(`${API_BASE_URL}/usuario/perfil`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getAuthToken()}`
            },
            body: JSON.stringify(profileData)
        });
        
        const data = await response.json();
        
        if (response.ok) {
            currentUser = data.usuario;
            updateUserInterface();
            showSuccess('Perfil atualizado com sucesso!');
        } else {
            showError(data.message || 'Erro ao atualizar perfil.');
        }
        
    } catch (error) {
        console.error('Erro ao atualizar perfil:', error);
        showError('Erro de conexão. Tente novamente.');
    }
}

// Alterar senha
async function changePassword(currentPassword, newPassword) {
    if (!requireAuth()) return;
    
    try {
        const response = await fetch(`${API_BASE_URL}/usuario/senha`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getAuthToken()}`
            },
            body: JSON.stringify({
                senhaAtual: currentPassword,
                novaSenha: newPassword
            })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            showSuccess('Senha alterada com sucesso!');
        } else {
            showError(data.message || 'Erro ao alterar senha.');
        }
        
    } catch (error) {
        console.error('Erro ao alterar senha:', error);
        showError('Erro de conexão. Tente novamente.');
    }
}

// Deletar conta
async function deleteAccount() {
    if (!requireAuth()) return;
    
    const confirmed = confirm('Tem certeza que deseja deletar sua conta? Esta ação não pode ser desfeita.');
    if (!confirmed) return;
    
    try {
        const response = await fetch(`${API_BASE_URL}/usuario/conta`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${getAuthToken()}`
            }
        });
        
        if (response.ok) {
            logout();
            showSuccess('Conta deletada com sucesso.');
        } else {
            const data = await response.json();
            showError(data.message || 'Erro ao deletar conta.');
        }
        
    } catch (error) {
        console.error('Erro ao deletar conta:', error);
        showError('Erro de conexão. Tente novamente.');
    }
}
