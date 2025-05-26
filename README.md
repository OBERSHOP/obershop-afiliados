- Next 15.3.1
- React 19.0.0
- Node 22.14.0
- Zustand 5.0.3
- Zod 3.24.3
- Lucide 0.503.0
- react-hot-toast 2.5.2
- tanstack/react-query 5.74.4
- ShadCn
- Axios 1.8.4




Arquitetura:

/public          # Imagens para serem importadas se necessário
|
/src
├── /app                    # App Router (Next.js 15+)
│   ├── /(public)             # Páginas públicas (sem autenticação)
│   │   ├── landing/page.tsx         # Página inicial
│   │   ├── login/page.tsx           # Página de login
│   │   ├── esqueceu-a-senha/page.tsx # Esqueceu a senha
│   │   ├── cadastro/page.tsx        # Cadastro de afiliado
│   │   └── nova-senha/page.tsx  # Redefinir senha via token
│   │
│   ├── /afiliado          # Painel do afiliado (rotas privadas)
│   │   │   ├── page.tsx            # Painel inicial do afiliado
│   │   │   ├── /pagamentos           # Página de pagamentos
│   │   │   ├── /home           # Página home
│   │   │   ├── /config           # Página de configurações
│   │   │   ├── /suporte            # Página de suporte
│   │   │   ├── /equipe              # Página de usuários
│   │   │   └── /vendas              # Página de vendas
│   │   │   ├── layout.tsx
│   │   
│   │
│   ├── /admin             # Painel administrativo (rotas privadas)
│   │   │   ├── page.tsx
│   │   │   ├── /home
│   │   │   ├── /config
│   │   │   ├── /suporte
│   │   │   ├── /pagamentos
│   │   │   ├── /usuarios
│   │   │   ├── /vendas
│   │   │   ├── layout.tsx
|   |  
│   │__ layout.tsx
│   │__ page.tsx
│
├── /components
│   ├── /common             # Componentes reutilizáveis em toda a aplicação (Button, Modal, Card, etc)
│   ├── /auth               # Componentes específicos de autenticação (LoginForm, RegisterForm)
│   └── /ui                 # Wrappers ou customizações do Shadcn UI (Dialog, Toast, Select)
│
├── /contexts
│   ├── AuthContext.tsx     # Contexto global para autenticação (armazenar dados do usuário, token, role)
│   └── AdminContext.tsx    # (opcional) contexto para dados globais do admin
│
├── /hooks
│   ├── useAuth.ts          # Hook para acessar dados de autenticação de forma centralizada
│   ├── useUserRole.ts      # Hook para retornar se usuário é afiliado ou admin
│   └── useAffiliateData.ts # Hook para dados do afiliado com React Query
│
├── /lib
│   ├── ApiHandler.ts       # Configuração do Axios (interceptors, baseURL, headers)
│   └── authGuard.ts        # Middleware opcional para redirecionar usuários não logados (client-side)
│
├── /schema                 # possíveis schemas se necessário
│
├── /store
│   └── authStore.ts        # Zustand: armazena token, sessionId, role, dados persistentes do usuário
|
├── /styles                 # Css global
│
├── /services
│   ├── authService.ts      # Login, logout, recuperação de senha, cadastro
│   ├── userService.ts      # Get usuário atual, update profile
│   ├── affiliateService.ts # Vendas, pagamentos, etc. do afiliado
│   └── adminService.ts     # Funções do admin (gerenciar equipe, ajuda, etc.)
│
├── /types
│   ├── user.ts             # Tipos como User, Role, Permissions
│   ├── auth.ts             # Tipos como LoginPayload, RegisterPayload
│   └── affiliate.ts        # Tipos específicos do afiliado: Sale, Payment, etc.
│
└── /utils
    ├── formatters.ts       # Funções utilitárias para formatar valores (data, moeda, etc.)
    ├── validators.ts       # Schemas do Zod e validações personalizadas
    └── guards.ts           # Funções para verificar permissões, roles, etc.