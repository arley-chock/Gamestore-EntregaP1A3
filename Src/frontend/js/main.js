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
            <div style="width: 100%; height: 200px; background: linear-gradient(135deg, #8B4513, #DC143C); display: flex; align-items: center; justify-content: center; color: white; font-size: 24px; font-weight: bold;">
                ${jogo.nome.charAt(0)}
            </div>
            <div class="sobreposicao-jogo">
                <div class="titulo-jogo">${jogo.nome.toUpperCase()}</div>
                <div class="subtitulo-jogo">${jogo.ano}</div>
            </div>
        </div>
    `;
    
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
    
    // Criar placeholder para imagem
    const placeholderDiv = document.createElement('div');
    placeholderDiv.style.cssText = 'width: 100%; height: 300px; background: linear-gradient(135deg, #8B4513, #DC143C); display: flex; align-items: center; justify-content: center; color: white; font-size: 48px; font-weight: bold;';
    placeholderDiv.textContent = jogo.nome.charAt(0);
    
    // Limpar e adicionar placeholder
    imagemJogo.innerHTML = '';
    imagemJogo.appendChild(placeholderDiv);
    
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
    if (!usuarioAtual) {
        mostrarErro('Você precisa estar logado para adicionar itens ao carrinho.');
        alternarModalAutenticacao();
        return;
    }
    
    try {
        const tituloJogo = document.getElementById('tituloJogo').textContent;
        const jogo = jogos.find(g => g.nome === tituloJogo);
        
        if (!jogo) return;
        
        const response = await fetch(`${URL_BASE_API}/carrinho`, {
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
            throw new Error('Erro ao adicionar ao carrinho');
        }
        
    } catch (error) {
        console.error('Erro ao adicionar ao carrinho:', error);
        mostrarErro('Erro ao adicionar ao carrinho. Tente novamente.');
    }
}

async function adicionarAListaDesejos(event) {
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
            throw new Error('Erro ao adicionar à lista de desejos');
        }
        
    } catch (error) {
        console.error('Erro ao adicionar à lista de desejos:', error);
        mostrarErro('Erro ao adicionar à lista de desejos. Tente novamente.');
    }
}

async function validarToken(token) {
    try {
        const response = await fetch(`${URL_BASE_API}/profile`, {
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
    const botaoEntrar = document.querySelector('.botao-entrar');
    if (usuarioAtual) {
        botaoEntrar.textContent = `${usuarioAtual.nome} (Sair)`;
        botaoEntrar.onclick = sair;
    } else {
        botaoEntrar.textContent = 'Entrar/Registrar';
        botaoEntrar.onclick = alternarModalAutenticacao;
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