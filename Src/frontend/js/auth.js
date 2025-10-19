// Autenticação simplificada - usa funções do main.js
const API_BASE_URL = 'http://localhost:3000/api/v1';

document.addEventListener('DOMContentLoaded', function() {
    setupAuthForms();
});

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
    
    const email = document.getElementById('emailEntrar').value;
    const password = document.getElementById('senhaEntrar').value;
    
    if (!email || !password) {
        mostrarErro('Por favor, preencha todos os campos.');
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
            usuarioAtual = data.usuario;
            
            atualizarInterfaceUsuario();
            fecharModalAutenticacao();
            limparFormularios();
            mostrarSucesso('Login realizado com sucesso!');
            
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
            localStorage.setItem('authToken', data.token);
            usuarioAtual = data.usuario;
            atualizarInterfaceUsuario();
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
