# LinkFlow - Estrutura do Banco de Dados

## 📊 **Visão Geral**
Sistema de gerenciamento de links WhatsApp com rotação automática de números e analytics completo.

## 🗄️ **Tabelas Principais**

### **1. groups**
Tabela principal dos grupos de WhatsApp
\`\`\`sql
CREATE TABLE groups (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  description TEXT,
  default_message TEXT DEFAULT 'Olá! Vim através do link.',
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
\`\`\`

**Campos:**
- `id`: UUID único do grupo
- `name`: Nome do grupo (ex: "Suporte Técnico")
- `slug`: URL amigável (ex: "suporte")
- `description`: Descrição opcional
- `default_message`: Mensagem padrão quando não há personalizada
- `is_active`: Status ativo/inativo
- `created_at/updated_at`: Timestamps automáticos

### **2. whatsapp_numbers**
Números de WhatsApp associados aos grupos
\`\`\`sql
CREATE TABLE whatsapp_numbers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  group_id UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  phone VARCHAR(20) NOT NULL,
  name VARCHAR(255),
  custom_message TEXT,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  last_used_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
\`\`\`

**Campos:**
- `group_id`: Referência ao grupo (FK)
- `phone`: Número no formato +5511999999999
- `name`: Nome/apelido do número
- `custom_message`: Mensagem personalizada (sobrescreve default_message)
- `last_used_at`: Última vez que foi usado (para rotação)

### **3. clicks**
Registro de todos os cliques nos links
\`\`\`sql
CREATE TABLE clicks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  group_id UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  number_id UUID NOT NULL REFERENCES whatsapp_numbers(id) ON DELETE CASCADE,
  ip_address VARCHAR(50),
  user_agent TEXT,
  device_type VARCHAR(50),
  referrer TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
\`\`\`

**Campos:**
- `group_id`: Grupo que recebeu o clique
- `number_id`: Número específico usado
- `ip_address`: IP do visitante
- `user_agent`: Browser/device info
- `device_type`: mobile/desktop/tablet
- `referrer`: Site de origem

## 🔧 **Funções SQL Principais**

### **get_next_number(group_slug)**
Retorna o próximo número disponível para rotação
\`\`\`sql
SELECT * FROM get_next_number('suporte');
\`\`\`

### **register_click_v2()**
Registra um clique no sistema
\`\`\`sql
SELECT register_click_v2(
  'suporte',           -- slug do grupo
  '+5511999999999',    -- número usado
  '127.0.0.1',         -- IP
  'Mozilla/5.0...',    -- user agent
  'desktop',           -- tipo device
  'https://google.com' -- referrer
);
\`\`\`

### **get_group_stats()**
Estatísticas de todos os grupos
\`\`\`sql
SELECT * FROM get_group_stats();
\`\`\`

### **get_group_analytics(group_id)**
Analytics detalhado de um grupo específico
\`\`\`sql
SELECT * FROM get_group_analytics('uuid-do-grupo');
\`\`\`

### **get_dashboard_stats()**
Estatísticas gerais do sistema
\`\`\`sql
SELECT * FROM get_dashboard_stats();
\`\`\`

## 📈 **Índices para Performance**
\`\`\`sql
-- Grupos
CREATE INDEX idx_groups_slug ON groups (slug);
CREATE INDEX idx_groups_is_active ON groups (is_active);

-- Números
CREATE INDEX idx_whatsapp_numbers_group_id ON whatsapp_numbers (group_id);
CREATE INDEX idx_whatsapp_numbers_is_active ON whatsapp_numbers (is_active);
CREATE INDEX idx_whatsapp_numbers_last_used ON whatsapp_numbers (last_used_at);

-- Cliques
CREATE INDEX idx_clicks_group_id ON clicks (group_id);
CREATE INDEX idx_clicks_number_id ON clicks (number_id);
CREATE INDEX idx_clicks_created_at ON clicks (created_at);
\`\`\`

## 🔐 **Row Level Security (RLS)**
\`\`\`sql
-- Habilitar RLS
ALTER TABLE groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE whatsapp_numbers ENABLE ROW LEVEL SECURITY;
ALTER TABLE clicks ENABLE ROW LEVEL SECURITY;

-- Políticas de acesso
CREATE POLICY "Allow public read access on groups" ON groups FOR SELECT USING (true);
CREATE POLICY "Allow service role full access on groups" ON groups FOR ALL USING (auth.role() = 'service_role');
\`\`\`

## 🌐 **URLs Públicas**
- **Formato:** `https://dominio.com/l/{slug}`
- **Exemplo:** `https://dominio.com/l/suporte`
- **Fluxo:** URL → get_next_number → register_click → redirect WhatsApp

## 📊 **Queries Úteis**

### Verificar cliques por grupo:
\`\`\`sql
SELECT 
  g.name,
  COUNT(c.id) as total_cliques
FROM groups g
LEFT JOIN clicks c ON g.id = c.group_id
GROUP BY g.id, g.name;
\`\`\`

### Top números mais usados:
\`\`\`sql
SELECT 
  wn.phone,
  wn.name,
  COUNT(c.id) as cliques
FROM whatsapp_numbers wn
LEFT JOIN clicks c ON wn.id = c.number_id
GROUP BY wn.id, wn.phone, wn.name
ORDER BY cliques DESC;
\`\`\`

### Cliques por período:
\`\`\`sql
SELECT 
  DATE(c.created_at) as data,
  COUNT(c.id) as cliques
FROM clicks c
WHERE c.created_at >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY DATE(c.created_at)
ORDER BY data;
