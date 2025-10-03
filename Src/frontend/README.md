# GameStore Digital - Frontend

Frontend da loja de jogos digitais desenvolvido com HTML5, CSS3 e JavaScript vanilla.

## 🎮 Características

- **Design Retro-Gaming**: Interface inspirada nos jogos clássicos dos anos 80-90
- **Responsivo**: Adaptável a diferentes tamanhos de tela
- **Interativo**: Modais, filtros dinâmicos e validação em tempo real
- **Integração com API**: Conecta-se ao backend Node.js/Express

## 📁 Estrutura do Projeto

```
frontend/
├── css/
│   ├── style.css          # Estilos principais
│   ├── auth.css           # Estilos de autenticação
│   ├── classics.css       # Estilos para jogos clássicos
│   └── responsive.css     # Media queries
├── js/
│   ├── main.js           # Funcionalidades principais
│   ├── auth.js           # Gerenciamento de autenticação
│   ├── games.js          # Funcionalidades de jogos
│   ├── classics.js       # Funcionalidades específicas para clássicos
│   └── auth-page.js      # Funcionalidades da página de auth
├── images/               # Imagens e assets
├── pages/
│   ├── index.html        # Página principal
│   ├── classicos.html    # Página de jogos clássicos
│   ├── auth.html         # Página de login/registro
│   ├── noticias.html     # Página de notícias (a ser criada)
│   └── suporte.html      # Página de suporte (a ser criada)
└── README.md
```

## 🚀 Funcionalidades Implementadas

### ✅ Página Principal
- Header com navegação e logo animado
- Sidebar de filtros (categoria, preço)
- Seções de jogos (Lançamentos, Em Alta, Recomendações)
- Modais para detalhes do jogo e autenticação
- Footer com links importantes

### ✅ Autenticação
- Modal de login/registro na página principal
- Página dedicada de autenticação
- Validação em tempo real
- Indicador de força da senha
- Toggle para mostrar/ocultar senha
- Lembrar de mim

### ✅ Jogos Clássicos
- Página dedicada para jogos antigos
- Filtros por década (1980s, 1990s, 2000s, 2010s)
- Filtros por categoria específica
- Busca e ordenação
- Cards especiais com badge de década

### ✅ Sistema de Carrinho e Lista de Desejos
- Adicionar/remover jogos do carrinho
- Adicionar/remover da lista de desejos
- Contadores dinâmicos
- Persistência via API

## 🎨 Design System

### Cores
- **Marrom Escuro**: `#8B4513` (Header, Footer, Botões)
- **Marrom Claro**: `#D2B48C` (Background principal)
- **Cinza Claro**: `#F5F5F5` (Cards, Modais)
- **Vermelho**: `#DC143C` (Acentos, Botões de ação)
- **Azul**: `#4169E1` (Logo, Links)

### Tipografia
- **Fonte Principal**: Courier New (monospace)
- **Estilo**: Retro-gaming com letter-spacing
- **Hierarquia**: Títulos em maiúsculas com sombras

### Componentes
- **Cards de Jogo**: Hover effects, overlays, badges
- **Botões**: Gradientes, sombras, animações
- **Modais**: Backdrop blur, animações de entrada
- **Formulários**: Validação visual, estados de loading

## 🔧 Configuração

### Pré-requisitos
- Servidor web local (Live Server, XAMPP, etc.)
- Backend da API rodando na porta 3000

### Instalação
1. Clone o repositório
2. Abra o arquivo `index.html` em um servidor web start index.html
3. Certifique-se de que o backend está rodando npm start dento da pasta Src

### Configuração da API
Edite o arquivo `js/main.js` e ajuste a URL da API:

```javascript
const API_BASE_URL = 'http://localhost:3000/api/v1';
```

## 📱 Responsividade

O frontend é totalmente responsivo com breakpoints:
- **Desktop**: > 768px
- **Tablet**: 768px - 480px
- **Mobile**: < 480px

## 🎯 Funcionalidades Futuras

### 🔄 Em Desenvolvimento
- [ ] Página de notícias
- [ ] Página de suporte
- [ ] Sistema de avaliações
- [ ] Histórico de compras
- [ ] Perfil do usuário
- [ ] Checkout e pagamento

### 💡 Melhorias Planejadas
- [ ] PWA (Progressive Web App)
- [ ] Notificações push
- [ ] Modo escuro
- [ ] Internacionalização
- [ ] Acessibilidade (ARIA)
- [ ] Testes automatizados

## 🐛 Problemas Conhecidos

1. **Imagens**: Placeholder images não implementadas
2. **Notificações**: Sistema de toast não implementado
3. **Loading**: Estados de loading básicos
4. **Erros**: Tratamento de erro básico com alerts

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature
3. Commit suas mudanças
4. Push para a branch
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo LICENSE para mais detalhes.

## 👨‍💻 Desenvolvedor

Desenvolvido como parte do projeto de API de vendas de jogos digitais.

---

**GameStore Digital** - Sua loja de jogos digitais com estilo retro! 🎮✨
