# GameStore Digital 🎮

Sistema completo de loja de jogos digitais com frontend em React e backend Node.js/Express, apresentando um design retro-gaming inspirado nos clássicos dos anos 80-90.

## 📋 Índice

- [Visão Geral](#visão-geral)
- [Tecnologias](#tecnologias)
- [Arquitetura](#arquitetura)
- [Instalação](#instalação)
- [Configuração](#configuração)
- [Funcionalidades](#funcionalidades)
- [Estrutura do Projeto](#estrutura-do-projeto)
- [API](#api)
- [Frontend](#frontend)
- [Design System](#design-system)
- [Segurança](#segurança)
- [Contribuição](#contribuição)
- [Licença](#licença)

## 🎯 Visão Geral

GameStore Digital é uma plataforma completa para venda de jogos digitais que combina:

- **Interface Retro-Gaming**: Design nostálgico inspirado nos jogos clássicos
- **Sistema de Autenticação**: Login/registro com JWT
- **Gestão de Produtos**: CRUD completo de jogos e empresas
- **Carrinho de Compras**: Sistema de compras com geração de chaves de ativação
- **Lista de Desejos**: Favoritar jogos para compra futura
- **Sistema de Avaliações**: Avaliar e comentar jogos (1-5 estrelas)
- **Painel Administrativo**: Gerenciamento completo para administradores
- **Catálogo de Clássicos**: Seção dedicada para jogos retro (10+ anos)

## 🚀 Tecnologias

### Backend
- **Node.js** (18+)
- **Express.js** (5.1.0) - Framework web
- **SQLite3** (5.1.7) - Banco de dados
- **JWT** (jsonwebtoken 9.0.2) - Autenticação
- **bcryptjs** (3.0.2) - Criptografia de senhas
- **CORS** - Habilitação de requisições cross-origin
- **dotenv** - Gerenciamento de variáveis de ambiente
- **Moment.js** (2.30.1) - Manipulação de datas

### Frontend
- **React** (18.2.0)
- **React Router DOM** (6.8.0) - Navegação
- **Vite** (4.4.5) - Build tool e dev server
- **CSS3** - Estilização com gradientes e animações
- **Fetch API** - Comunicação com backend

## 🏗️ Arquitetura

### Backend (MVC Pattern)

```
server/
├── config/          # Configurações (Database, CSV seed)
├── controllers/     # Lógica de negócio
├── daos/           # Data Access Objects
├── dtos/           # Data Transfer Objects
├── models/         # Modelos de dados
├── routes/         # Definição de rotas
├── services/       # Serviços (DatabaseService)
├── middleware/     # Middlewares (auth, admin)
└── util/           # Utilitários (criptografia)
```

### Frontend (Component-Based)

```
frontend/src/
├── components/     # Componentes reutilizáveis
├── pages/         # Componentes de página
├── hooks/         # Custom hooks (useAuth, useGames)
├── utils/         # Utilitários (API, imagens, notificações)
└── styles/        # CSS global
```

## 📦 Instalação

### Pré-requisitos
- Node.js 18+ instalado
- npm ou yarn

### Backend

```bash
cd APP/server
npm install
```

### Frontend

```bash
cd APP/frontend
npm install
```

## ⚙️ Configuração

### 1. Configurar Backend

Crie um arquivo `.env` em `APP/server/`:

```env
# Porta do servidor
APP_PORT=3000

# Nome do banco de dados
DB_NAME=vendas.db

# Secret para JWT (gerar com: npm run generate:jwt-secret)
JWT_SECRET=sua_chave_secreta_aqui
```

**Gerar JWT Secret:**
```bash
cd APP/server
npm run generate:jwt-secret
```

### 2. Configurar Frontend

Crie um arquivo `.env` em `APP/frontend/`:

```env
# URL do servidor backend
VITE_SERVER_URL=http://localhost:3000

# Base da API (opcional)
VITE_API_BASE_URL=http://localhost:3000/api/v1
```

### 3. Seed do Banco de Dados

O banco é criado e populado automaticamente ao iniciar o servidor pela primeira vez:
- **Perfis**: Administrador, Cliente
- **Categorias**: RPG, FPS, Aventura, etc.
- **Empresas**: Nintendo, Sony, Microsoft, etc.
- **Jogos**: Carregados de `config/jogos.csv`

**Usuários padrão criados:**
```
Admin:
  Email: admin@avjd.com
  Senha: admin123

Cliente:
  Email: cliente@avjd.com
  Senha: cliente123
```

## 🎮 Funcionalidades

### Para Usuários

#### Autenticação
- ✅ Registro com validação de senha
- ✅ Login com JWT
- ✅ Alteração de senha
- ✅ Perfil de usuário

#### Navegação
- ✅ Catálogo completo de jogos
- ✅ Seção de jogos clássicos (10+ anos)
- ✅ Busca e filtros (categoria, preço)
- ✅ Ordenação por preço, ano, nome

#### Compras
- ✅ Adicionar ao carrinho
- ✅ Lista de desejos
- ✅ Checkout e finalização
- ✅ Geração automática de chaves de ativação
- ✅ Histórico de compras
- ✅ Biblioteca de jogos adquiridos

#### Avaliações
- ✅ Avaliar jogos (1-5 estrelas)
- ✅ Comentários
- ✅ Visualizar média de avaliações

#### Suporte
- ✅ Abertura de chamados
- ✅ FAQ
- ✅ Histórico de atendimentos

### Para Administradores

#### Gestão de Jogos
- ✅ Criar, editar, excluir jogos
- ✅ Gerenciar categorias
- ✅ Visualizar estatísticas

#### Gestão de Empresas
- ✅ Adicionar/remover empresas desenvolvedoras
- ✅ Associar jogos a empresas

#### Relatórios
- ✅ Jogos mais vendidos
- ✅ Vendas por empresa
- ✅ Estatísticas gerais

## 📂 Estrutura do Projeto

### Backend

```
server/
├── config/
│   ├── Database.js              # Configuração SQLite + seed
│   └── jogos.csv                # Dados iniciais
├── controllers/
│   ├── AuthController.js        # Login/registro
│   ├── JogoController.js        # CRUD de jogos
│   ├── CarrinhoController.js    # Gestão do carrinho
│   ├── VendaController.js       # Checkout e vendas
│   ├── AvaliacaoController.js   # Sistema de avaliações
│   ├── ListaDesejoController.js # Lista de desejos
│   ├── UsuarioController.js     # Gestão de usuários
│   ├── EmpresaController.js     # Gestão de empresas
│   └── RelatorioController.js   # Relatórios e estatísticas
├── daos/                        # Acesso a dados
├── dtos/                        # Objetos de transferência
├── models/                      # Modelos de domínio
├── routes/
│   ├── v1.js                    # Agregador de rotas
│   ├── auth.js                  # Rotas de autenticação
│   ├── jogo.js                  # Rotas de jogos
│   ├── carrinho.js              # Rotas de carrinho
│   ├── venda.js                 # Rotas de vendas
│   ├── public.js                # Rotas públicas
│   └── ...
├── middleware/
│   ├── authMiddleware.js        # Validação JWT
│   └── adminMiddleware.js       # Verificação de admin
├── services/
│   └── DatabaseService.js       # Wrapper do SQLite
├── util/
│   └── cripto.js                # Hash/verificação de senhas
└── index.js                     # Ponto de entrada
```

### Frontend

```
frontend/src/
├── components/
│   ├── Header.jsx               # Navegação principal
│   ├── Footer.jsx               # Rodapé
│   ├── GameCard.jsx             # Card de jogo
│   ├── GameModal.jsx            # Modal de detalhes
│   ├── AuthModal.jsx            # Modal de login/registro
│   └── Sidebar.jsx              # Barra de filtros
├── pages/
│   ├── Home.jsx                 # Página principal
│   ├── Classicos.jsx            # Jogos clássicos
│   ├── Usuario.jsx              # Perfil do usuário
│   ├── Admin.jsx                # Painel administrativo
│   ├── Checkout.jsx             # Finalização de compra
│   └── Suporte.jsx              # Central de suporte
├── hooks/
│   ├── useAuth.jsx              # Autenticação global
│   └── useGames.js              # Gestão de jogos
├── utils/
│   ├── api.js                   # Cliente HTTP
│   ├── imageUtils.js            # Manipulação de imagens
│   └── notifications.js         # Sistema de toasts
├── App.jsx                      # Componente raiz
├── main.jsx                     # Ponto de entrada
├── index.css                    # Estilos globais
└── pages.css                    # Estilos de páginas
```

## 🔌 API

### Base URL
```
http://localhost:3000/api/v1
```

### Endpoints Principais

#### Autenticação
```
POST   /auth/register           # Registrar usuário
POST   /auth/login              # Login
PUT    /auth/change-password    # Alterar senha (requer auth)
```

#### Jogos
```
GET    /jogos                   # Listar todos (requer auth)
GET    /jogos/:id               # Detalhes (requer auth)
POST   /jogos                   # Criar (requer admin)
PUT    /jogos/:id               # Atualizar (requer admin)
DELETE /jogos/:id               # Excluir (requer admin)
GET    /public/jogos            # Listar (público)
```

#### Carrinho
```
GET    /carrinho/ativo          # Ver carrinho ativo
POST   /carrinho/add            # Adicionar item
DELETE /carrinho/:gameId        # Remover item
```

#### Vendas
```
POST   /vendas/checkout         # Finalizar compra
GET    /vendas                  # Histórico
```

#### Lista de Desejos
```
GET    /lista-desejo            # Ver lista
POST   /lista-desejo            # Adicionar jogo
DELETE /lista-desejo            # Remover jogo
```

#### Avaliações
```
POST   /avaliacoes              # Criar avaliação
PUT    /avaliacoes              # Atualizar avaliação
GET    /avaliacoes              # Listar minhas avaliações
GET    /avaliacoes/media/:jogoId # Média de avaliações
```

**Autenticação:** Enviar header `Authorization: Bearer <token>`

## 🎨 Design System

### Paleta de Cores

```css
--color-primary: #DC143C        /* Vermelho (CTAs) */
--color-primary-dark: #B22222   /* Vermelho escuro */
--color-secondary: #8B4513      /* Marrom (Header/Footer) */
--color-secondary-dark: #A0522D /* Marrom escuro */
--color-success: #4169E1        /* Azul (Logo/Links) */
--color-surface: rgba(255, 255, 255, 0.15) /* Cards */
--color-text-dark: #2F2F2F      /* Texto principal */
```

### Tipografia
- **Fonte Principal:** 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif
- **Estilo:** Maiúsculas para títulos, letter-spacing aumentado
- **Pesos:** 400 (normal), 600 (semi-bold), 700 (bold), 800 (extra-bold)

### Componentes

#### Botões
```css
.btn                    /* Base */
.btn-primary            /* Ação principal */
.btn-secondary          /* Ação secundária */
.btn-success            /* Sucesso */
.btn-outline            /* Contorno */
.btn-ghost              /* Transparente */
.btn-sm / btn-lg        /* Tamanhos */
.btn-block              /* Largura total */
.btn-pill               /* Arredondado */
```

#### Cards
- Hover: `translateY(-10px)` + shadow aumentado
- Overlay com gradiente no hover
- Transições suaves (0.3-0.4s)

### Responsividade

```css
/* Desktop: > 768px */
@media (max-width: 768px) { /* Tablet */ }
@media (max-width: 480px) { /* Mobile */ }
```

## 🔒 Segurança

### Backend
- ✅ Senhas com bcrypt (10 salt rounds)
- ✅ JWT para autenticação stateless
- ✅ Middleware de autenticação e autorização
- ✅ Validação de entrada em todos os endpoints
- ✅ CORS configurado
- ✅ Prepared statements (prevenção SQL injection)

### Frontend
- ✅ Token JWT armazenado em localStorage
- ✅ Validação de formulários
- ✅ Sanitização de URLs
- ✅ Proteção de rotas administrativas
- ✅ Timeout de sessão

## 🚀 Executando o Projeto

### Desenvolvimento

**Terminal 1 - Backend:**
```bash
cd APP/server
npm start
# Servidor em http://localhost:3000
```

**Terminal 2 - Frontend:**
```bash
cd APP/frontend
npm run dev
# Interface em http://localhost:5173
```

### Produção

**Backend:**
```bash
cd APP/server
npm start
```

**Frontend:**
```bash
cd APP/frontend
npm run build
npm run preview
```

## 📊 Banco de Dados

### Schema

```sql
- perfis (id, nome)
- usuarios (id, nome, email, senha, data_nascimento, fk_perfil)
- categorias (id, nome)
- empresas (id, nome)
- jogos (id, nome, ano, preco, desconto, descricao, fk_empresa, fk_categoria)
- carrinhos (id, fk_usuario, fk_venda, status)
- itens_carrinho (id, fk_jogo, fk_carrinho, chave_ativacao)
- vendas (id, fk_usuario, valor_total, quantidade, data)
- avaliacoes (id, fk_usuario, fk_jogo, nota, comentario, data)
- lista_desejos (id, fk_usuario, fk_jogo)
```

## 🧪 Testes

### Postman Collection
Importar: `APP/server/Digital Game Store API.postman_collection.json`

**Variáveis de ambiente:**
```json
{
  "baseUrl": "http://localhost:3000/api/v1",
  "token": "será_gerado_automaticamente_após_login"
}
```

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch: `git checkout -b feature/nova-funcionalidade`
3. Commit: `git commit -m 'Adiciona nova funcionalidade'`
4. Push: `git push origin feature/nova-funcionalidade`
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença ISC.

## 👨‍💻 Autor

**Adailton de Jesus Cerqueira Junior**

### Recursos Úteis
- [Documentação Express](https://expressjs.com/)
- [Documentação React](https://react.dev/)
- [SQLite Tutorial](https://www.sqlitetutorial.net/)
- [JWT.io](https://jwt.io/)

---

**GameStore Digital** - Sua loja de jogos digitais com estilo retro! 🎮✨
