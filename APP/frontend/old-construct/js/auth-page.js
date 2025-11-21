// Funcionalidades específicas para a página de autenticação
document.addEventListener('DOMContentLoaded', function() {
    initializeAuthPage();
});

// Inicializar página de autenticação
function initializeAuthPage() {
    setupAuthPageForms();
    setupPasswordStrength();
    setupFormValidation();
    setupPasswordToggle();
}

// Configurar formulários da página de auth
function setupAuthPageForms() {
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    
    if (loginForm) {
        loginForm.addEventListener('submit', handleAuthPageLogin);
    }
    
    if (registerForm) {
        registerForm.addEventListener('submit', handleAuthPageRegister);
    }
}

// Lidar com login na página de auth
async function handleAuthPageLogin(event) {
    event.preventDefault();
    
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    const rememberMe = document.getElementById('rememberMe').checked;
    
    // Validar campos
    if (!validateLoginForm(email, password)) {
        return;
    }
    
    try {
        setFormLoading('loginForm', true);
        
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
            if (rememberMe) {
                localStorage.setItem('rememberMe', 'true');
            }
            
            currentUser = data.usuario;
            
            showSuccess('Login realizado com sucesso!');
            
            // Redirecionar para página principal
            setTimeout(() => {
                window.location.href = '../index.html';
            }, 1500);
            
        } else {
            // Erro no login
            showFormError('loginForm', data.message || 'Erro ao fazer login. Verifique suas credenciais.');
        }
        
    } catch (error) {
        console.error('Erro no login:', error);
        showFormError('loginForm', 'Erro de conexão. Tente novamente.');
    } finally {
        setFormLoading('loginForm', false);
    }
}

// Lidar com registro na página de auth
async function handleAuthPageRegister(event) {
    event.preventDefault();
    
    const name = document.getElementById('registerName').value;
    const email = document.getElementById('registerEmail').value;
    const birthDate = document.getElementById('registerBirth').value;
    const password = document.getElementById('registerPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const agreeTerms = document.getElementById('agreeTerms').checked;
    
    // Validar campos
    if (!validateRegisterForm(name, email, birthDate, password, confirmPassword, agreeTerms)) {
        return;
    }
    
    try {
        setFormLoading('registerForm', true);
        
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
            
            showSuccess('Conta criada com sucesso!');
            
            // Redirecionar para página principal
            setTimeout(() => {
                window.location.href = '../index.html';
            }, 1500);
            
        } else {
            // Erro no registro
            showFormError('registerForm', data.message || 'Erro ao criar conta. Tente novamente.');
        }
        
    } catch (error) {
        console.error('Erro no registro:', error);
        showFormError('registerForm', 'Erro de conexão. Tente novamente.');
    } finally {
        setFormLoading('registerForm', false);
    }
}

// Validar formulário de login
function validateLoginForm(email, password) {
    let isValid = true;
    
    // Validar email
    if (!email) {
        showFieldError('loginEmail', 'E-mail é obrigatório');
        isValid = false;
    } else if (!isValidEmail(email)) {
        showFieldError('loginEmail', 'E-mail inválido');
        isValid = false;
    } else {
        clearFieldError('loginEmail');
    }
    
    // Validar senha
    if (!password) {
        showFieldError('loginPassword', 'Senha é obrigatória');
        isValid = false;
    } else {
        clearFieldError('loginPassword');
    }
    
    return isValid;
}

// Validar formulário de registro
function validateRegisterForm(name, email, birthDate, password, confirmPassword, agreeTerms) {
    let isValid = true;
    
    // Validar nome
    if (!name) {
        showFieldError('registerName', 'Nome é obrigatório');
        isValid = false;
    } else if (name.length < 2) {
        showFieldError('registerName', 'Nome deve ter pelo menos 2 caracteres');
        isValid = false;
    } else {
        clearFieldError('registerName');
    }
    
    // Validar email
    if (!email) {
        showFieldError('registerEmail', 'E-mail é obrigatório');
        isValid = false;
    } else if (!isValidEmail(email)) {
        showFieldError('registerEmail', 'E-mail inválido');
        isValid = false;
    } else {
        clearFieldError('registerEmail');
    }
    
    // Validar data de nascimento
if (!birthDate) {
    showFieldError('registerBirth', 'Data de nascimento é obrigatória');
    isValid = false;
} else {
    const birth = new Date(birthDate);

    if (isNaN(birth.getTime())) {
        showFieldError('registerBirth', 'Data de nascimento inválida');
        isValid = false;
    } else {
        const today = new Date();
        let age = today.getFullYear() - birth.getFullYear();
        const monthDiff = today.getMonth() - birth.getMonth();
        const dayDiff = today.getDate() - birth.getDate();
        
        if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
            age--; // ainda não fez aniversário este ano
        }

        if (age < 13) {
            showFieldError('registerBirth', 'Você deve ter pelo menos 13 anos');
            isValid = false;
        } else if (age > 120) {
            showFieldError('registerBirth', 'Data de nascimento inválida');
            isValid = false;
        } else {
            clearFieldError('registerBirth');
        }
    }
}

    
    // Validar senha
    if (!password) {
        showFieldError('registerPassword', 'Senha é obrigatória');
        isValid = false;
    } else if (password.length < 8) {
        showFieldError('registerPassword', 'Senha deve ter pelo menos 8 caracteres');
        isValid = false;
    } else {
        clearFieldError('registerPassword');
    }
    
    // Validar confirmação de senha
    if (!confirmPassword) {
        showFieldError('confirmPassword', 'Confirmação de senha é obrigatória');
        isValid = false;
    } else if (password !== confirmPassword) {
        showFieldError('confirmPassword', 'Senhas não coincidem');
        isValid = false;
    } else {
        clearFieldError('confirmPassword');
    }
    
    // Validar termos
    if (!agreeTerms) {
        showFieldError('agreeTerms', 'Você deve concordar com os termos');
        isValid = false;
    } else {
        clearFieldError('agreeTerms');
    }
    
    return isValid;
}

// Configurar validação de força da senha
function setupPasswordStrength() {
    const passwordInput = document.getElementById('registerPassword');
    if (!passwordInput) return;
    
    passwordInput.addEventListener('input', function() {
        const password = this.value;
        const strengthBar = document.getElementById('passwordStrength');
        
        if (!strengthBar) return;
        
        const strength = calculatePasswordStrength(password);
        
        // Remover classes anteriores
        strengthBar.classList.remove('weak', 'medium', 'strong');
        
        if (password.length === 0) {
            strengthBar.innerHTML = '';
            return;
        }
        
        // Adicionar barra de força
        strengthBar.innerHTML = '<div class="password-strength-bar"></div>';
        
        if (strength < 3) {
            strengthBar.classList.add('weak');
        } else if (strength < 5) {
            strengthBar.classList.add('medium');
        } else {
            strengthBar.classList.add('strong');
        }
    });
}

// Calcular força da senha
function calculatePasswordStrength(password) {
    let strength = 0;
    
    if (password.length >= 8) strength++;
    if (password.length >= 12) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    
    return strength;
}

// Configurar validação de formulário em tempo real
function setupFormValidation() {
    const inputs = document.querySelectorAll('.form-input');
    
    inputs.forEach(input => {
        input.addEventListener('blur', function() {
            validateField(this);
        });
        
        input.addEventListener('input', function() {
            if (this.classList.contains('error')) {
                validateField(this);
            }
        });
    });
}

// Validar campo individual
function validateField(field) {
    const fieldName = field.id;
    const value = field.value.trim();
    
    switch (fieldName) {
        case 'loginEmail':
        case 'registerEmail':
            if (value && !isValidEmail(value)) {
                showFieldError(fieldName, 'E-mail inválido');
            } else {
                clearFieldError(fieldName);
            }
            break;
            
        case 'registerPassword':
            if (value && value.length < 8) {
                showFieldError(fieldName, 'Senha deve ter pelo menos 8 caracteres');
            } else {
                clearFieldError(fieldName);
            }
            break;
            
        case 'confirmPassword':
            const password = document.getElementById('registerPassword').value;
            if (value && value !== password) {
                showFieldError(fieldName, 'Senhas não coincidem');
            } else {
                clearFieldError(fieldName);
            }
            break;
    }
}

// Configurar toggle de senha
function setupPasswordToggle() {
    const toggleButtons = document.querySelectorAll('.password-toggle');
    
    toggleButtons.forEach(button => {
        button.addEventListener('click', function() {
            const input = this.parentElement.querySelector('input');
            const icon = this.querySelector('.eye-icon');
            
            if (input.type === 'password') {
                input.type = 'text';
                icon.textContent = '🙈';
            } else {
                input.type = 'password';
                icon.textContent = '👁️';
            }
        });
    });
}

// Alternar senha
function togglePassword(inputId) {
    const input = document.getElementById(inputId);
    const icon = input.parentElement.querySelector('.eye-icon');
    
    if (input.type === 'password') {
        input.type = 'text';
        icon.textContent = '🙈';
    } else {
        input.type = 'password';
        icon.textContent = '👁️';
    }
}

// Alternar aba de autenticação
function switchAuthTab(tabName) {
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const tabs = document.querySelectorAll('.tab-btn');
    
    tabs.forEach(tab => tab.classList.remove('active'));
    
    if (tabName === 'login') {
        loginForm.classList.add('active');
        registerForm.classList.remove('active');
        tabs[0].classList.add('active');
    } else {
        registerForm.classList.add('active');
        loginForm.classList.remove('active');
        tabs[1].classList.add('active');
    }
    
    // Limpar erros
    clearAllErrors();
}

// Mostrar erro de campo
function showFieldError(fieldId, message) {
    const field = document.getElementById(fieldId);
    const errorElement = document.getElementById(fieldId + 'Error');
    
    if (field) {
        field.classList.add('error');
    }
    
    if (errorElement) {
        errorElement.textContent = message;
        errorElement.classList.add('show');
    }
}

// Limpar erro de campo
function clearFieldError(fieldId) {
    const field = document.getElementById(fieldId);
    const errorElement = document.getElementById(fieldId + 'Error');
    
    if (field) {
        field.classList.remove('error');
    }
    
    if (errorElement) {
        errorElement.classList.remove('show');
    }
}

// Mostrar erro de formulário
function showFormError(formId, message) {
    const form = document.getElementById(formId);
    const errorElement = form.querySelector('.form-error');
    
    if (errorElement) {
        errorElement.textContent = message;
        errorElement.classList.add('show');
    }
}

// Limpar todos os erros
function clearAllErrors() {
    const errorElements = document.querySelectorAll('.form-error');
    const errorFields = document.querySelectorAll('.form-input.error');
    
    errorElements.forEach(element => {
        element.classList.remove('show');
    });
    
    errorFields.forEach(field => {
        field.classList.remove('error');
    });
}

// Definir estado de loading do formulário
function setFormLoading(formId, isLoading) {
    const form = document.getElementById(formId);
    const submitBtn = form.querySelector('.btn-submit');
    const btnText = submitBtn.querySelector('.btn-text');
    const btnLoading = submitBtn.querySelector('.btn-loading');
    
    if (isLoading) {
        submitBtn.classList.add('loading');
        submitBtn.disabled = true;
        btnText.style.display = 'none';
        btnLoading.style.display = 'inline';
    } else {
        submitBtn.classList.remove('loading');
        submitBtn.disabled = false;
        btnText.style.display = 'inline';
        btnLoading.style.display = 'none';
    }
}

// Mostrar loading global
function showGlobalLoading() {
    const overlay = document.createElement('div');
    overlay.className = 'loading-overlay';
    overlay.innerHTML = '<div class="loading-spinner"></div>';
    document.body.appendChild(overlay);
}

// Esconder loading global
function hideGlobalLoading() {
    const overlay = document.querySelector('.loading-overlay');
    if (overlay) {
        overlay.remove();
    }
}

// Mostrar notificação de sucesso
function showSuccess(message) {
    // Implementar notificação de sucesso
    alert(message);
}

// Mostrar notificação de erro
function showError(message) {
    // Implementar notificação de erro
    alert(message);
}

// Exportar funções para uso global
window.switchAuthTab = switchAuthTab;
window.togglePassword = togglePassword;
