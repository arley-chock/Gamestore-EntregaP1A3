// Autenticação simplificada - usa funções do main.js
if (typeof API_BASE_URL === 'undefined') { var API_BASE_URL = 'http://localhost:3000/api/v1'; }

document.addEventListener('DOMContentLoaded', function() {
    setupAuthForms();
    initializeAuth();
});

async function initializeAuth() {
    const token = localStorage.getItem('authToken');
    const btnPerfil = document.getElementById('btnPerfil');
    const btnSair = document.getElementById('btnSair');
    
    if (!token) {
        if (btnPerfil) btnPerfil.style.display = 'none';
        if (btnSair) btnSair.style.display = 'none';
        return;
    }
    
    if (btnPerfil) btnPerfil.style.display = 'inline-block';
    if (btnSair) btnSair.style.display = 'inline-block';
    
    try {
        const adminResponse = await fetch(`${API_BASE_URL}/auth/check-admin`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (adminResponse.ok) {
            const adminButton = document.getElementById('admin-button');
            if (adminButton) {
                adminButton.style.display = 'inline-flex';
                const userName = document.getElementById('userName');
                if (userName) userName.textContent = 'Admin';
                console.log('Admin status verificado: É administrador');
            }
        }
    } catch (error) {
        console.error('Erro ao verificar status de admin:', error);
    }
}

// Verificar se o usuário é admin e mostrar/esconder o botão
async function checkAdminStatus() {
    const token = localStorage.getItem('authToken');
    const adminButton = document.getElementById('admin-button');
    
    if (!token || !adminButton) return;

    try {
        const response = await fetch(`${API_BASE_URL}/auth/check-admin`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            adminButton.style.display = 'inline-flex';
            document.getElementById('userName').textContent = 'Admin';
            adminButton.classList.add('visible');
        } else {
            adminButton.style.display = 'none';
            adminButton.classList.remove('visible');
        }
    } catch (error) {
        console.error('Erro ao verificar status de admin:', error);
        adminButton.style.display = 'none';
        adminButton.classList.remove('visible');
    }
}

// Configurar formulários de autenticação
function setupAuthForms() {
    const loginForm = document.getElementById('formularioEntrar');
    const registerForm = document.getElementById('formularioRegistrar');
    
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
    
    const emailInput = document.getElementById('emailEntrar');
    const passwordInput = document.getElementById('senhaEntrar');
    
    if (!emailInput || !passwordInput) {
        console.error('Elementos do formulário não encontrados');
        return;
    }

    const email = emailInput.value;
    const password = passwordInput.value;
    
    if (!email || !password) {
        mostrarErro('Por favor, preencha todos os campos.');
        return;
    }

    if (!isValidEmail(email)) {
        mostrarErro('Por favor, insira um e-mail válido.');
        return;
    }

    try {
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
            
            // Atualizar elementos da UI se existirem
            const btnPerfil = document.getElementById('btnPerfil');
            const btnSair = document.getElementById('btnSair');
            const userName = document.getElementById('userName');
            
            if (btnPerfil) btnPerfil.style.display = 'inline-block';
            if (btnSair) btnSair.style.display = 'inline-block';
            
            // Verificar se é admin
            try {
                const adminResponse = await fetch(`${API_BASE_URL}/auth/check-admin`, {
                    headers: {
                        'Authorization': `Bearer ${data.token}`
                    }
                });

                if (adminResponse.ok) {
                    const adminButton = document.getElementById('admin-button');
                    if (adminButton) {
                        adminButton.style.display = 'inline-flex';
                        if (userName) userName.textContent = 'Admin';
                    }
                }
            } catch (adminError) {
                console.error('Erro ao verificar status de admin:', adminError);
            }

            // Fecha o modal e atualiza o status
            const modalAutenticacao = document.getElementById('modalAutenticacao');
            if (modalAutenticacao) modalAutenticacao.style.display = 'none';
            
            if (typeof checkAuthStatus === 'function') {
                await checkAuthStatus();
            }
            
            mostrarSucesso('Login realizado com sucesso!');
            
            // Limpar campos do formulário
            emailInput.value = '';
            passwordInput.value = '';
        } else {
            // Erro no login
            mostrarErro(data.message || 'Erro ao fazer login. Verifique suas credenciais.');
        }
    } catch (error) {
        console.error('Erro no login:', error);
        mostrarErro('Erro de conexão. Tente novamente.');
    }
}

// Lidar com registro
async function handleRegister(event) {
    event.preventDefault();
    
    const name = document.getElementById('nomeRegistrar').value;
    const email = document.getElementById('emailRegistrar').value;
    const birthDate = document.getElementById('nascimentoRegistrar').value;
    const password = document.getElementById('senhaRegistrar').value;
    
    if (!name || !email || !birthDate || !password) {
        mostrarErro('Por favor, preencha todos os campos.');
        return;
    }

    if (password.length < 8) {
        mostrarErro('A senha deve ter pelo menos 8 caracteres.');
        return;
    }

    if (!isValidEmail(email)) {
        mostrarErro('Por favor, insira um e-mail válido.');
        return;
    }

    // 🔹 Converter formato da data para DD/MM/YYYY (compatível com backend)
    let formattedDate = birthDate;
    if (birthDate.includes('-')) {
        const [ano, mes, dia] = birthDate.split('-');
        formattedDate = `${dia}/${mes}/${ano}`;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                nome: name,
                email: email,
                dataNascimento: formattedDate,
                senha: password
            })
        });

        const data = await response.json();

        if (response.ok) {
            // O backend retorna o id do usuário criado ou uma mensagem; o token pode ou não ser retornado.
            if (data.token) {
                localStorage.setItem('authToken', data.token);
                if (typeof checkAuthStatus === 'function') await checkAuthStatus();
            }
            fecharModalAutenticacao();
            limparFormularios();
            mostrarSucesso('Conta criada com sucesso!');
        } else {
            mostrarErro(data.message || 'Erro ao criar conta. Tente novamente.');
        }
    } catch (error) {
        console.error('Erro no registro:', error);
        mostrarErro('Erro de conexão. Tente novamente.');
    }
}

// Limpar formulários de autenticação
function limparFormularios() {
    const loginForm = document.getElementById('formularioEntrar');
    const registerForm = document.getElementById('formularioRegistrar');
    
    if (loginForm) loginForm.reset();
    if (registerForm) registerForm.reset();
}

// Validar e-mail
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Verificar se usuário está logado
function isLoggedIn() {
    return usuarioAtual !== null && localStorage.getItem('authToken') !== null;
}

// Obter token de autenticação
function getAuthToken() {
    return localStorage.getItem('authToken');
}

// Requerer autenticação
function requireAuth() {
    if (!isLoggedIn()) {
        mostrarErro('Você precisa estar logado para acessar esta funcionalidade.');
        alternarModalAutenticacao();
        return false;
    }
    return true;
}

// Funções de feedback para o usuário
function mostrarErro(mensagem) {
    alert(mensagem); // Podemos melhorar isso depois com um componente de toast ou notificação
}

function mostrarSucesso(mensagem) {
    alert(mensagem); // Podemos melhorar isso depois com um componente de toast ou notificação
}

// Funções de modal (usando as do main.js)
function alternarModalAutenticacao() {
    const modal = document.getElementById('modalAutenticacao');
    modal.style.display = modal.style.display === 'block' ? 'none' : 'block';
}

function fecharModalAutenticacao() {
    document.getElementById('modalAutenticacao').style.display = 'none';
}

function alternarAba(nomeAba) {
    const formularioEntrar = document.getElementById('formularioEntrar');
    const formularioRegistrar = document.getElementById('formularioRegistrar');
    const abas = document.querySelectorAll('.botao-aba');
    
    abas.forEach(aba => aba.classList.remove('ativo'));
    
    if (nomeAba === 'entrar') {
        formularioEntrar.classList.add('ativo');
        formularioRegistrar.classList.remove('ativo');
        abas[0].classList.add('ativo');
    } else {
        formularioRegistrar.classList.add('ativo');
        formularioEntrar.classList.remove('ativo');
        abas[1].classList.add('ativo');
    }
}

// Função de logout
function sair() {
    // Limpar token de autenticação
    localStorage.removeItem('authToken');
    
    // Redirecionar para a página inicial
    // Redirecionamento relativo robusto:
    // - se estivermos em uma página dentro de `pages/` (ex.: pages/usuario.html),
    //   precisamos subir um nível para voltar para `index.html` => '../index.html'
    // - caso contrário, usar 'index.html' (recarrega a página inicial relativa)
    const redirectTo = window.location.pathname.includes('/pages/') ? '../index.html' : 'index.html';
    window.location.href = redirectTo;
    const btnPerfil = document.getElementById('btnPerfil');
    const btnSair = document.getElementById('btnSair');
    const adminButton = document.getElementById('admin-button');
    const userName = document.getElementById('userName');
    
    if (btnPerfil) btnPerfil.style.display = 'none';
    if (btnSair) btnSair.style.display = 'none';
    if (adminButton) adminButton.style.display = 'none';
    if (userName) userName.textContent = 'Cliente';
    
    // Não forçar mais redirecionamentos adicionais aqui; já definimos um redirect relativo acima.
}