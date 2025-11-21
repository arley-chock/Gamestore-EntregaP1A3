# GameStore Digital - Frontend com Vite + React

Este projeto foi configurado com **Vite** e **React** para desenvolvimento moderno com JSX.

## 🚀 Instalação

As dependências já foram instaladas. Se precisar reinstalar:

```bash
npm install
```

## 📁 Estrutura do Projeto

```
frontend/
├── src/
│   ├── components/          # Componentes React
│   │   ├── Header.jsx       # Cabeçalho da aplicação
│   │   ├── GameCard.jsx     # Card de jogo individual
│   │   └── GameList.jsx     # Lista de jogos
│   ├── App.jsx              # Componente principal
│   ├── main.jsx             # Ponto de entrada
│   ├── App.css              # Estilos do App
│   └── index.css            # Estilos globais
├── index.html               # HTML principal (Vite)
├── vite.config.js           # Configuração do Vite
└── package.json             # Dependências do projeto
```

## 🎯 Scripts Disponíveis

### Desenvolvimento
```bash
npm run dev
```
Inicia o servidor de desenvolvimento na porta 5173 (configurável no `vite.config.js`).

### Build para Produção
```bash
npm run build
```
Gera os arquivos otimizados na pasta `dist/`.

### Preview do Build
```bash
npm run preview
```
Visualiza o build de produção localmente.

## 📝 Arquivos JSX Criados

### Componentes Principais

1. **App.jsx** - Componente raiz da aplicação
   - Gerencia o estado global
   - Renderiza Header e GameList

2. **Header.jsx** - Cabeçalho com navegação
   - Logo da loja
   - Menu de navegação

3. **GameCard.jsx** - Card de exibição de jogo
   - Imagem do jogo
   - Informações (nome, descrição, preço)
   - Botões de ação (carrinho, lista de desejos)

4. **GameList.jsx** - Lista de jogos
   - Busca jogos da API
   - Renderiza grid de GameCards
   - Tratamento de loading e erros

## 🔧 Configuração

### Porta do Servidor
A porta padrão é 5173. Para alterar, edite `vite.config.js`:

```javascript
server: {
  port: 3000,  // Sua porta desejada
  open: true
}
```

### API Backend
Os componentes fazem requisições para:
```
http://localhost:3000/api/v1/jogos
```

Certifique-se de que o backend está rodando antes de iniciar o frontend.

## 🎨 Estilos

Os estilos estão organizados por componente:
- `App.css` - Estilos do componente principal
- `Header.css` - Estilos do cabeçalho
- `GameCard.css` - Estilos dos cards de jogo
- `GameList.css` - Estilos da lista de jogos
- `index.css` - Reset e estilos globais

## 📦 Dependências

- **React** (^18.2.0) - Biblioteca de UI
- **React DOM** (^18.2.0) - Renderização React
- **Vite** (^5.0.8) - Build tool e dev server
- **@vitejs/plugin-react** (^4.2.1) - Plugin React para Vite

## 🆚 Diferenças entre Versões

Este projeto mantém duas versões do frontend:

1. **Versão Vanilla** (`index.vanilla.html`)
   - HTML/CSS/JavaScript puro
   - Funciona sem build
   - Arquivos em `js/`, `css/`, `pages/`

2. **Versão Vite + React** (`index.html`)
   - Componentes React com JSX
   - Hot Module Replacement (HMR)
   - Build otimizado para produção
   - Arquivos em `src/`

## 🚀 Próximos Passos

Para continuar desenvolvendo:

1. Adicione mais componentes em `src/components/`
2. Crie hooks customizados em `src/hooks/`
3. Adicione utilitários em `src/utils/`
4. Configure rotas com React Router (se necessário)
5. Adicione gerenciamento de estado (Context API, Redux, etc.)

## 📚 Recursos

- [Documentação do Vite](https://vitejs.dev/)
- [Documentação do React](https://react.dev/)
- [Guia de JSX](https://react.dev/learn/writing-markup-with-jsx)

---

**Desenvolvido para GameStore Digital** 🎮

