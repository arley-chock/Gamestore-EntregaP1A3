const URL_BASE_API = 'http://localhost:3000/api/v1';

let usuarioAtual = null;
let jogos = [];
let jogosFiltrados = [];

document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM carregado, iniciando aplicação...');
    inicializarAplicacao();
    carregarJogos();
    configurarEventListeners();
});

function inicializarAplicacao() {
    console.log('Inicializando aplicação...');
    const token = localStorage.getItem('authToken');
    if (token) {
        console.log('Token encontrado, validando...');
        validarToken(token);
    } else {
        console.log('Nenhum token encontrado');
    }
    
    console.log('Configurando filtros...');
    configurarFiltros();
    console.log('Aplicação inicializada');
}

async function carregarJogos() {
    try {
        console.log('Iniciando carregamento de jogos...');
        mostrarCarregamento();
        
        console.log('Fazendo requisição para:', `${URL_BASE_API}/jogos`);
        const response = await fetch(`${URL_BASE_API}/jogos`);
        
        console.log('Resposta recebida:', response.status, response.statusText);
        
        if (!response.ok) {
            throw new Error(`Erro HTTP: ${response.status} - ${response.statusText}`);
        }
        
        const dadosJogos = await response.json();
        console.log('Dados dos jogos recebidos:', dadosJogos);
        
        jogos = dadosJogos;
        jogosFiltrados = [...jogos];
        
        console.log('Total de jogos carregados:', jogos.length);
        
        renderizarJogos();
        esconderCarregamento();
        
    } catch (error) {
        console.error('Erro ao carregar jogos:', error);
        mostrarErro(`Erro ao carregar jogos: ${error.message}`);
        esconderCarregamento();
    }
}

function renderizarJogos() {
    console.log('Iniciando renderização dos jogos...');
    console.log('Jogos disponíveis:', jogos.length);
    
    const lancamentos = obterLancamentos();
    const emAlta = obterJogosEmAlta();
    const recomendacoes = obterJogosRecomendados();
    
    console.log('Lançamentos:', lancamentos.length);
    console.log('Em alta:', emAlta.length);
    console.log('Recomendações:', recomendacoes.length);
    
    renderizarSecaoJogos('lancamentos', lancamentos);
    renderizarSecaoJogos('em-alta', emAlta);
    renderizarSecaoJogos('recomendacoes', recomendacoes);
}

function renderizarSecaoJogos(idSecao, listaJogos) {
    console.log(`Renderizando seção ${idSecao} com ${listaJogos.length} jogos`);
    
    const secao = document.getElementById(idSecao);
    if (!secao) {
        console.error(`Seção ${idSecao} não encontrada!`);
        return;
    }
    
    secao.innerHTML = '';
    
    if (listaJogos.length === 0) {
        console.log(`Nenhum jogo encontrado para a seção ${idSecao}`);
        secao.innerHTML = '<p>Nenhum jogo encontrado.</p>';
        return;
    }
    
    listaJogos.forEach((jogo, index) => {
        console.log(`Criando cartão ${index + 1} para ${jogo.nome}`);
        const cartaoJogo = criarCartaoJogo(jogo);
        secao.appendChild(cartaoJogo);
    });
    
    console.log(`Seção ${idSecao} renderizada com sucesso`);
}

function criarCartaoJogo(jogo) {
    const cartao = document.createElement('div');
    cartao.className = 'cartao-jogo';
    cartao.onclick = () => mostrarDetalhesJogo(jogo);
    
    cartao.innerHTML = `
        <div class="imagem-jogo">
            <img class="imagem-jogo-src" alt="${jogo.nome}">
            <div class="sobreposicao-jogo">
                <div class="titulo-jogo">${jogo.nome.toUpperCase()}</div>
                <div class="subtitulo-jogo">${jogo.ano}</div>
            </div>
        </div>
    `;
    
    const imgEl = cartao.querySelector('.imagem-jogo-src');
    if (imgEl) {
        setImageWithFallback(imgEl, jogo.nome, { height: 200 });
    }
    
    return cartao;
}

function obterLancamentos() {
    const anoAtual = new Date().getFullYear();
    return jogos
        .filter(jogo => jogo.ano >= anoAtual - 1)
        .sort((a, b) => b.ano - a.ano)
        .slice(0, 3);
}

function obterJogosEmAlta() {
    return jogos
        .sort((a, b) => b.preco - a.preco)
        .slice(0, 3);
}

function obterJogosRecomendados() {
    return jogos
        .filter(jogo => jogo.preco < 50)
        .sort((a, b) => Math.random() - 0.5)
        .slice(0, 3);
}

function mostrarDetalhesJogo(jogo) {
    const modal = document.getElementById('modalJogo');
    const imagemJogo = document.getElementById('imagemJogo');
    const tituloJogo = document.getElementById('tituloJogo');
    const descricaoJogo = document.getElementById('descricaoJogo');
    const categoriaJogo = document.getElementById('categoriaJogo');
    const precoJogo = document.getElementById('precoJogo');
    const anoJogo = document.getElementById('anoJogo');

if (jogo.foto) {
    imagemJogo.src = jogo.foto;
    imagemJogo.alt = jogo.nome;
} else {
    // Reaproveita o mesmo sistema de fallback dos cards
    setImageWithFallback(imagemJogo, jogo.nome, { height: 250 });
}


    tituloJogo.textContent = jogo.nome;
    descricaoJogo.textContent = jogo.descricao;
    categoriaJogo.textContent = `Categoria: ${jogo.fkCategoria}`;
    precoJogo.textContent = `R$ ${jogo.preco.toFixed(2)}`;
    anoJogo.textContent = `Ano: ${jogo.ano}`;

    modal.style.display = 'block';
}

function fecharModalJogo() {
    document.getElementById('modalJogo').style.display = 'none';
}

// Helpers de imagem para jogos
function slugifyGameName(name) {
    if (!name) return '';
    return name
        .toString()
        .normalize('NFD').replace(/\p{Diacritic}+/gu, '') // remove acentos
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
}

function getLocalImageCandidates(name) {
    const slug = slugifyGameName(name);
    const exts = ['png', 'jpg', 'jpeg', 'webp'];
    return exts.map(ext => `images/${slug}.${ext}`);
}

function createGradientPlaceholder(letter, width, height) {
    const placeholderDiv = document.createElement('div');
    placeholderDiv.style.cssText = `width: 100%; height: ${height || 200}px; background: linear-gradient(135deg, #8B4513, #DC143C); display: flex; align-items: center; justify-content: center; color: white; font-size: ${height ? Math.floor(height/6) : 24}px; font-weight: bold;`;
    placeholderDiv.textContent = (letter || '?').toString().charAt(0);
    return placeholderDiv;
}

function setImageWithFallback(imgEl, gameName, options = {}) {
    const { height } = options;
    const candidates = getLocalImageCandidates(gameName);
    let index = 0;

    function tryNext() {
        if (index < candidates.length) {
            imgEl.onerror = () => {
                index += 1;
                tryNext();
            };
            imgEl.src = candidates[index];
            imgEl.alt = gameName || '';
            if (height) {
                imgEl.style.height = `${height}px`;
                imgEl.style.objectFit = 'cover';
                imgEl.style.width = '100%';
            }
        } else {
            // Fallback visual: substitui IMG por placeholder gradiente
            const container = imgEl.parentElement;
            if (container) {
                const ph = createGradientPlaceholder(gameName, container.clientWidth, height || 200);
                container.replaceChild(ph, imgEl);
            }
        }
    }

    tryNext();
}

// Expor helpers globalmente para uso em outras páginas (ex.: clássicos)
window.setImageWithFallback = setImageWithFallback;

function configurarFiltros() {
    const botoesFiltro = document.querySelectorAll('.botao-filtro');
    const sliderPreco = document.querySelector('.slider-preco');
    
    botoesFiltro.forEach(btn => {
        btn.addEventListener('click', function() {
            botoesFiltro.forEach(b => b.classList.remove('ativo'));
            this.classList.add('ativo');
            aplicarFiltros();
        });
    });
    
    if (sliderPreco) {
        sliderPreco.addEventListener('input', function() {
            aplicarFiltros();
        });
    }
}

function aplicarFiltros() {
    const filtroAtivo = document.querySelector('.botao-filtro.ativo');
    const sliderPreco = document.querySelector('.slider-preco');
    
    let filtrados = [...jogos];
    
    if (filtroAtivo) {
        const categoria = filtroAtivo.dataset.category;
        if (categoria) {
            filtrados = filtrados.filter(jogo => 
                jogo.fkCategoria.toString().toLowerCase().includes(categoria.toLowerCase())
            );
        }
    }
    
    if (sliderPreco) {
        const precoMaximo = parseFloat(sliderPreco.value);
        filtrados = filtrados.filter(jogo => jogo.preco <= precoMaximo);
    }
    
    jogosFiltrados = filtrados;
    renderizarJogos();
}

function configurarEventListeners() {
    window.addEventListener('click', function(event) {
        const modalAutenticacao = document.getElementById('modalAutenticacao');
        const modalJogo = document.getElementById('modalJogo');
        
        if (event.target === modalAutenticacao) {
            fecharModalAutenticacao();
        }
        if (event.target === modalJogo) {
            fecharModalJogo();
        }
    });
    
    document.addEventListener('click', function(event) {
        if (event.target.classList.contains('botao-adicionar-carrinho')) {
            adicionarAoCarrinho(event);
        }
        if (event.target.classList.contains('botao-adicionar-lista-desejos')) {
            adicionarAListaDesejos(event);
        }
    });
}

async function adicionarAoCarrinho(event) {
    if (event && typeof event.preventDefault === 'function') event.preventDefault();
    if (!usuarioAtual) {
        mostrarErro('Você precisa estar logado para adicionar itens ao carrinho.');
        alternarModalAutenticacao();
        return;
    }
    
    try {
        const tituloJogo = document.getElementById('tituloJogo').textContent;
        const jogo = jogos.find(g => g.nome === tituloJogo);
        
        if (!jogo) return;
        
            const response = await fetch(`${URL_BASE_API}/carrinho/add`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('authToken')}`
            },
            body: JSON.stringify({
                jogoId: jogo.id,
                quantidade: 1
            })
        });
        
        if (response.ok) {
            mostrarSucesso('Jogo adicionado ao carrinho!');
        } else {
                // try to read error message from server
                let msg = 'Erro ao adicionar ao carrinho';
                try { const data = await response.json(); if (data && data.message) msg = data.message; } catch (e) {}
                throw new Error(msg);
        }
        
    } catch (error) {
        console.error('Erro ao adicionar ao carrinho:', error);
        mostrarErro(error.message || 'Erro ao adicionar ao carrinho. Tente novamente.');
    }
}

async function adicionarAListaDesejos(event) {
    if (event && typeof event.preventDefault === 'function') event.preventDefault();
    if (!usuarioAtual) {
        mostrarErro('Você precisa estar logado para adicionar à lista de desejos.');
        alternarModalAutenticacao();
        return;
    }
    
    try {
        const tituloJogo = document.getElementById('tituloJogo').textContent;
        const jogo = jogos.find(g => g.nome === tituloJogo);
        
        if (!jogo) return;
        
        const response = await fetch(`${URL_BASE_API}/lista-desejo`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('authToken')}`
            },
            body: JSON.stringify({
                jogoId: jogo.id
            })
        });
        
        if (response.ok) {
            mostrarSucesso('Jogo adicionado à lista de desejos!');
        } else {
            let msg = 'Erro ao adicionar à lista de desejos';
            try { const data = await response.json(); if (data && data.message) msg = data.message; } catch(e){}
            throw new Error(msg);
        }
        
    } catch (error) {
        console.error('Erro ao adicionar à lista de desejos:', error);
        mostrarErro(error.message || 'Erro ao adicionar à lista de desejos. Tente novamente.');
    }
}

async function validarToken(token) {
    try {
        const response = await fetch(`${URL_BASE_API}/perfil`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (response.ok) {
            usuarioAtual = await response.json();
            atualizarInterfaceUsuario();
        } else {
            localStorage.removeItem('authToken');
        }
    } catch (error) {
        console.error('Erro ao validar token:', error);
        localStorage.removeItem('authToken');
    }
}

function atualizarInterfaceUsuario() {
    const userNameSpan = document.getElementById('userName');
    const btnPerfil = document.getElementById('btnPerfil');
    const btnSair = document.getElementById('btnSair');
    const userGreeting = document.getElementById('userGreeting');

    if (usuarioAtual && usuarioAtual.nome) {
        if (userNameSpan) userNameSpan.textContent = usuarioAtual.nome;
        if (btnPerfil) btnPerfil.style.display = 'inline-block';
        if (btnSair) btnSair.style.display = 'inline-block';
        if (userGreeting) userGreeting.style.display = 'inline-block';
    } else {
        if (userNameSpan) userNameSpan.textContent = 'Cliente';
        if (btnPerfil) btnPerfil.style.display = 'none';
        if (btnSair) btnSair.style.display = 'none';
        if (userGreeting) userGreeting.style.display = 'inline-block';
    }
}

function sair() {
    localStorage.removeItem('authToken');
    usuarioAtual = null;
    atualizarInterfaceUsuario();
    mostrarSucesso('Logout realizado com sucesso!');
}

function mostrarCarregamento() {
    console.log('Carregando...');
}

function esconderCarregamento() {
    console.log('Carregamento concluído');
}

function mostrarErro(mensagem) {
    console.error('ERRO:', mensagem);
    
    // Criar elemento de erro visível
    const erroDiv = document.createElement('div');
    erroDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #ff4444;
        color: white;
        padding: 15px;
        border-radius: 5px;
        z-index: 10000;
        max-width: 300px;
        box-shadow: 0 4px 15px rgba(0,0,0,0.3);
    `;
    erroDiv.textContent = mensagem;
    
    document.body.appendChild(erroDiv);
    
    // Remover após 5 segundos
    setTimeout(() => {
        if (erroDiv.parentNode) {
            erroDiv.parentNode.removeChild(erroDiv);
        }
    }, 5000);
}

function mostrarSucesso(mensagem) {
    console.log('SUCESSO:', mensagem);
    
    // Criar elemento de sucesso visível
    const sucessoDiv = document.createElement('div');
    sucessoDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #44ff44;
        color: white;
        padding: 15px;
        border-radius: 5px;
        z-index: 10000;
        max-width: 300px;
        box-shadow: 0 4px 15px rgba(0,0,0,0.3);
    `;
    sucessoDiv.textContent = mensagem;
    
    document.body.appendChild(sucessoDiv);
    
    // Remover após 3 segundos
    setTimeout(() => {
        if (sucessoDiv.parentNode) {
            sucessoDiv.parentNode.removeChild(sucessoDiv);
        }
    }, 3000);
}

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

window.checkAuthStatus = async function() {
    const token = localStorage.getItem('authToken');
    if (token) {
        try {
            const response = await fetch('http://localhost:3000/api/v1/perfil', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (response.ok) {
                const userData = await response.json();
                // Persist the authenticated user in the global variable so other modules (games.js, etc.)
                // can check login state using the shared `usuarioAtual` variable.
                try { usuarioAtual = userData; } catch (e) { window.usuarioAtual = userData; }
                updateUIForLoggedUser(userData);
            } else {
                // If token is invalid/expired, clear local state
                try { usuarioAtual = null; } catch (e) { window.usuarioAtual = null; }
                updateUIForGuest();
            }
        } catch (error) {
            try { usuarioAtual = null; } catch (e) { window.usuarioAtual = null; }
            updateUIForGuest();
        }
    } else {
        try { usuarioAtual = null; } catch (e) { window.usuarioAtual = null; }
        updateUIForGuest();
    }
}

function updateUIForLoggedUser(userData) {
    const userActions = document.getElementById('userActions');
    if (userActions) {
        userActions.innerHTML = `
            <span class="user-greeting">Olá, ${userData.nome}</span>
            <a href="pages/usuario.html" class="botao-entrar">Meu Perfil</a>
            <button class="botao-entrar" onclick="handleLogout()">Sair</button>
        `;
    }
}

function updateUIForGuest() {
    const userActions = document.getElementById('userActions');
    if (userActions) {
        userActions.innerHTML = `
            <button class="botao-entrar" onclick="alternarModalAutenticacao()">Entrar/Registrar</button>
        `;
    }
}

function handleLogout() {
    localStorage.removeItem('authToken');
    window.location.reload();
}

document.addEventListener('DOMContentLoaded', function() {
    window.checkAuthStatus();
});