# LinkFlow - Contexto do Projeto

## 🎯 **Objetivo**
Sistema de gerenciamento de links WhatsApp com rotação automática de números, analytics avançado e interface administrativa completa.

## 🏗️ **Arquitetura**

### **Frontend**
- **Framework:** Next.js 14 (App Router)
- **Styling:** Tailwind CSS + Design System customizado
- **UI Components:** shadcn/ui
- **Icons:** Lucide React
- **State:** React hooks + Context API

### **Backend**
- **Database:** Supabase (PostgreSQL)
- **Auth:** Supabase Auth
- **API:** Next.js API Routes + Supabase RPC
- **Deploy:** Netlify

### **Design System**
- **Cores:** bg-black, bg-slate-800, lime-400, green-500
- **Tipografia:** Hierárquica com font-mono para números
- **Layout:** Responsivo mobile-first
- **Componentes:** Cards, tabelas, modais padronizados

## 📁 **Estrutura de Arquivos**

### **Páginas Principais**
\`\`\`
app/
├── admin/
│   ├── dashboard/          # Dashboard principal
│   ├── grupos/            # Gestão de grupos
│   ├── numeros/           # Gestão de números
│   ├── relatorios/        # Analytics e relatórios
│   └── configuracoes/     # Configurações sistema
├── l/[slug]/              # URLs públicas de redirecionamento
├── redirect/              # Página intermediária com timer
└── login/                 # Autenticação
\`\`\`

### **Componentes**
\`\`\`
components/
├── ui/                    # shadcn/ui components
├── app-sidebar.tsx        # Navegação lateral
├── groups-table.tsx       # Tabela de grupos
├── groups-cards.tsx       # Cards de grupos
├── stats-cards.tsx        # Cards de métricas
├── add-number-dialog.tsx  # Modal adicionar número
└── breadcrumb.tsx         # Navegação breadcrumb
\`\`\`

### **API e Utilitários**
\`\`\`
lib/
├── api/
│   ├── groups.ts          # CRUD grupos
│   ├── numbers.ts         # CRUD números
│   ├── stats.ts           # Estatísticas
│   └── analytics.ts       # Analytics avançado
├── supabase.ts            # Cliente Supabase
├── types.ts               # TypeScript types
└── utils.ts               # Utilitários gerais
\`\`\`

## 🔄 **Fluxo Principal**

### **1. Criação de Grupo**
1. Admin cria grupo com nome e slug
2. Sistema gera URL pública: `/l/{slug}`
3. Admin adiciona números WhatsApp ao grupo

### **2. Clique do Usuário**
1. Usuário acessa `/l/{slug}`
2. Sistema busca próximo número (rotação)
3. Registra clique no analytics
4. Mostra página de "verificação de vagas"
5. Redireciona para WhatsApp após 3s

### **3. Analytics**
1. Todos os cliques são registrados
2. Dashboard mostra métricas em tempo real
3. Relatórios por grupo, período, device
4. Exportação de dados

## 🎨 **Design System**

### **Paleta de Cores**
\`\`\`css
/* Backgrounds */
--bg-primary: #000000;      /* bg-black */
--bg-secondary: #1e293b;    /* bg-slate-800 */
--bg-tertiary: #0f172a;     /* bg-slate-900 */

/* Accent Colors */
--accent-primary: #a3e635;  /* lime-400 */
--accent-success: #22c55e;  /* green-500 */
--accent-danger: #ef4444;   /* red-500 */

/* Text Colors */
--text-primary: #ffffff;    /* text-white */
--text-secondary: #94a3b8;  /* text-slate-400 */
--text-tertiary: #64748b;   /* text-slate-500 */
\`\`\`

### **Componentes Padrão**
\`\`\`css
/* Cards */
.ds-card {
  @apply bg-slate-800 border border-slate-700 rounded-xl p-6 shadow-lg;
}

/* Botões */
.ds-button-primary {
  @apply bg-lime-400 text-black px-6 py-3 rounded-lg font-semibold hover:bg-lime-500;
}

/* Inputs */
.ds-input {
  @apply bg-slate-800 border border-slate-600 text-white rounded-lg px-4 py-3;
}
\`\`\`

## 🔧 **Configurações Importantes**

### **Variáveis de Ambiente**
\`\`\`env
NEXT_PUBLIC_SUPABASE_URL=sua-url-supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-anonima
SUPABASE_SERVICE_ROLE_KEY=sua-chave-service-role
NEXT_PUBLIC_SITE_URL=https://seu-dominio.com
NEXT_PUBLIC_LINK_BASE_URL=https://seu-dominio.com/l
\`\`\`

### **Supabase Setup**
1. Criar projeto no Supabase
2. Executar schema SQL completo
3. Configurar RLS policies
4. Adicionar variáveis de ambiente

### **Deploy Netlify**
1. Conectar repositório GitHub
2. Build command: `npm run build`
3. Publish directory: `.next`
4. Adicionar environment variables

## 🚀 **Funcionalidades Implementadas**

### ✅ **Core Features**
- [x] Sistema de grupos e números
- [x] Rotação automática de números
- [x] URLs públicas funcionais
- [x] Registro de cliques
- [x] Dashboard com métricas
- [x] Interface administrativa completa

### ✅ **UI/UX**
- [x] Design system consistente
- [x] Responsividade mobile
- [x] Página de redirecionamento branded
- [x] Loading states e animations
- [x] Modais e dialogs

### ✅ **Analytics**
- [x] Métricas por grupo
- [x] Estatísticas temporais
- [x] Device tracking
- [x] Página de analytics detalhado

## 🔮 **Próximos Passos**

### **Melhorias Sugeridas**
- [ ] Exportação de relatórios (CSV/PDF)
- [ ] Webhooks para integrações
- [ ] API pública para desenvolvedores
- [ ] Temas customizáveis
- [ ] Multi-tenancy (múltiplas empresas)

### **Otimizações**
- [ ] Cache Redis para performance
- [ ] CDN para assets estáticos
- [ ] Compressão de imagens
- [ ] Service Workers para offline

## 📞 **Suporte**
Para dúvidas sobre implementação, consulte:
1. Documentação do banco (`database-structure.md`)
2. Código fonte comentado
3. Logs do console para debug
4. Supabase dashboard para queries

## 🎯 **Casos de Uso**
- **Escolas/Cursos:** Links para matrículas
- **E-commerce:** Atendimento por produto
- **Imobiliárias:** Contato por imóvel
- **Consultoria:** Agendamento de calls
- **Marketing:** Campanhas segmentadas
