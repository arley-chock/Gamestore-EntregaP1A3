GameStore Digital - Frontend (Vite + React)Frontend da loja de jogos digitais, desenvolvido com Vite e React, inspirado no design retro-gaming do projeto original em JavaScript vanilla.🎮 CaracterísticasDesign Retro-Gaming: Interface inspirada nos jogos clássicos dos anos 80-90.Arquitetura de Componentes: UI construída com componentes React reutilizáveis.Desenvolvimento Moderno: Ambiente de desenvolvimento rápido com Vite, incluindo Hot Module Replacement (HMR).Responsivo: Adaptável a diferentes tamanhos de tela (Mobile, Tablet, Desktop).Interativo: Validação de formulários, filtros dinâmicos e gerenciamento de estado com React.Integração com API: Conecta-se ao backend Node.js/Express para buscar dados e gerenciar autenticação.📁 Estrutura do Projeto (Recomendada)A estrutura de arquivos do Vite/React organiza o código por funcionalidade, convertendo as páginas HTML e arquivos JS do projeto vanilla em componentes e hooks.frontend/
├── src/
│   ├── components/         # Componentes Reutilizáveis
│   │   ├── Header/         # (Ex: Header.jsx, Header.css)
│   │   ├── Footer/
│   │   ├── GameCard/
│   │   ├── GameList/
│   │   ├── Modal/
│   │   └── form/           # (Ex: Input.jsx, Button.jsx)
│   │
│   ├── pages/              # Componentes de Página (Views)
│   │   ├── HomePage.jsx
│   │   ├── ClassicGamesPage.jsx
│   │   ├── AuthPage.jsx
│   │   ├── NewsPage.jsx
│   │   └── SupportPage.jsx
│   │
│   ├── hooks/              # Hooks Customizados (Lógica)
│   │   ├── useGames.js     # (Lógica de games.js)
│   │   ├── useAuth.js      # (Lógica de auth.js)
│   │
│   ├── context/            # Gerenciamento de Estado Global
│   │   ├── AuthContext.jsx
│   │   ├── CartContext.jsx
│   │
│   ├── services/           # Configuração da API
│   │   └── api.js
│   │
│   ├── styles/             # Estilos Globais
│   │   ├── index.css
│   │   └── variables.css
│   │
│   ├── App.jsx             # Componente raiz (Rotas)
│   └── main.jsx            # Ponto de entrada
│
├── index.html              # HTML principal (Vite)
├── vite.config.js          # Configuração do Vite
└── package.json
🔄 Migrando de Vanilla para ReactA principal mudança é a transição de arquivos .html separados para "componentes de página" em React, e de arquivos .js de manipulação do DOM para hooks e gerenciamento de estado.De Páginas HTML para Componentes pages/As páginas HTML distintas são agora componentes React, geralmente renderizados por um roteador (como o React Router).Arquivo Vanilla (pages/)Componente React (src/pages/)Responsabilidadeindex.htmlHomePage.jsxRenderiza o layout principal, incluindo GameList para "Lançamentos", "Em Alta", e o Sidebar de filtros.classicos.htmlClassicGamesPage.jsxPágina dedicada para jogos clássicos. Inclui filtros específicos (década, categoria) e renderiza GameList.auth.htmlAuthPage.jsxContém os formulários de Login e Registro. Gerencia a validação e o estado do formulário.noticias.htmlNewsPage.jsx(Futuro) Página para exibir notícias.suporte.htmlSupportPage.jsx(Futuro) Página com formulário de suporte.De Arquivos JS para Hooks e ContextoA lógica de negócios e a interação com a API, antes em arquivos .js separados, são movidas para hooks customizados e contextos.Arquivo Vanilla (js/)Lógica React (src/)Responsabilidademain.jsservices/api.jsConfigura a URL base da API (API_BASE_URL).games.jshooks/useGames.jsHook para buscar jogos, gerenciar estado de loading/erro e lógica de modais de detalhes.classics.jshooks/useGames.jsA lógica de filtro dos clássicos pode ser integrada ao useGames ou em um hook useClassics.auth.jscontext/AuthContext.jsxGerencia o estado global do usuário (token, dados do usuário) e expõe funções de login/logout.auth-page.jspages/AuthPage.jsxA lógica de validação de formulário (força da senha, toggle) é gerenciada internamente no componente com useState.De Arquivos CSS para Estilos Co-localizadosOs arquivos CSS globais são divididos para serem "co-localizados" (colocados juntos) com seus respectivos componentes, ou se tornam estilos globais.Arquivo Vanilla (css/)Estilo React (src/)Responsabilidadestyle.cssstyles/index.css / App.cssEstilos globais, reset e variáveis CSS.responsive.cssstyles/index.cssMedia queries globais, ou definidas dentro dos arquivos CSS de cada componente.auth.csspages/AuthPage.module.cssEstilos específicos para a página de autenticação (usando CSS Modules ou importação direta).classics.csspages/ClassicGamesPage.module.cssEstilos específicos para os cards e filtros da página de clássicos.🎯 Scripts DisponíveisDesenvolvimentoInicia o servidor de desenvolvimento (geralmente na porta 5173).Bashnpm run dev
Build para ProduçãoGera os arquivos otimizados na pasta dist/.Bashnpm run build
Preview do BuildVisualiza o build de produção localmente.Bashnpm run preview
🎨 Design SystemO Design System permanece o mesmo, mas agora aplicado via CSS (global ou por componente).CoresMarrom Escuro: #8B4513 (Header, Footer, Botões)Marrom Claro: #D2B48C (Background principal)Cinza Claro: #F5F5F5 (Cards, Modais)Vermelho: #DC143C (Acentos, Botões de ação)Azul: #4169E1 (Logo, Links)TipografiaFonte Principal: Courier New (monospace)Estilo: Retro-gaming com letter-spacing