-- ============================================================================
-- LINKFLOW - SCHEMA SQL CORRIGIDO PARA COMPATIBILIDADE 100% COM FRONTEND
-- ============================================================================

-- Habilitar extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- TABELAS PRINCIPAIS
-- ============================================================================

-- Tabela de Grupos
CREATE TABLE IF NOT EXISTS groups (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    default_message TEXT DEFAULT 'Olá! Vim através do link.',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de Números WhatsApp (mantendo nome whatsapp_numbers como no frontend)
CREATE TABLE IF NOT EXISTS whatsapp_numbers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    group_id UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
    phone VARCHAR(20) NOT NULL,
    name VARCHAR(255), -- Campo name como usado no frontend
    custom_message TEXT, -- Campo custom_message usado no redirect
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    last_used_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de Cliques
CREATE TABLE IF NOT EXISTS clicks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    group_id UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
    number_id UUID NOT NULL REFERENCES whatsapp_numbers(id) ON DELETE CASCADE,
    ip_address VARCHAR(50),
    user_agent TEXT,
    device_type VARCHAR(50),
    referrer TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- ÍNDICES PARA PERFORMANCE
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_groups_slug ON groups (slug);
CREATE INDEX IF NOT EXISTS idx_groups_is_active ON groups (is_active);
CREATE INDEX IF NOT EXISTS idx_whatsapp_numbers_group_id ON whatsapp_numbers (group_id);
CREATE INDEX IF NOT EXISTS idx_whatsapp_numbers_is_active ON whatsapp_numbers (is_active);
CREATE INDEX IF NOT EXISTS idx_whatsapp_numbers_last_used ON whatsapp_numbers (last_used_at);
CREATE INDEX IF NOT EXISTS idx_clicks_group_id ON clicks (group_id);
CREATE INDEX IF NOT EXISTS idx_clicks_number_id ON clicks (number_id);
CREATE INDEX IF NOT EXISTS idx_clicks_created_at ON clicks (created_at);

-- ============================================================================
-- TRIGGERS PARA UPDATED_AT
-- ============================================================================

-- Função para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para atualizar updated_at automaticamente
DROP TRIGGER IF EXISTS update_groups_updated_at ON groups;
CREATE TRIGGER update_groups_updated_at 
    BEFORE UPDATE ON groups 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_whatsapp_numbers_updated_at ON whatsapp_numbers;
CREATE TRIGGER update_whatsapp_numbers_updated_at 
    BEFORE UPDATE ON whatsapp_numbers 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- FUNÇÕES USADAS PELO FRONTEND
-- ============================================================================

-- Função getNextNumber usada em lib/api/numbers.ts e app/l/[slug]/route.ts
CREATE OR REPLACE FUNCTION get_next_number(group_slug TEXT)
RETURNS TABLE (
    id UUID,
    group_id UUID,
    phone VARCHAR(20),
    name VARCHAR(255),
    custom_message TEXT,
    is_active BOOLEAN,
    last_used_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        wn.id,
        wn.group_id,
        wn.phone,
        wn.name,
        wn.custom_message,
        wn.is_active,
        wn.last_used_at
    FROM whatsapp_numbers wn
    INNER JOIN groups g ON g.id = wn.group_id
    WHERE g.slug = group_slug 
    AND g.is_active = TRUE 
    AND wn.is_active = TRUE
    ORDER BY wn.last_used_at ASC NULLS FIRST
    LIMIT 1;
END;
$$ LANGUAGE plpgsql;

-- Função registerClick usada em lib/api/groups.ts
CREATE OR REPLACE FUNCTION register_click(
    group_slug TEXT,
    number_phone TEXT,
    ip_address TEXT DEFAULT NULL,
    user_agent TEXT DEFAULT NULL,
    device_type TEXT DEFAULT NULL,
    referrer TEXT DEFAULT NULL
)
RETURNS VOID AS $$
DECLARE
    group_record RECORD;
    number_record RECORD;
BEGIN
    -- Buscar o grupo pelo slug
    SELECT id, name INTO group_record 
    FROM groups 
    WHERE slug = group_slug AND is_active = TRUE;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Grupo não encontrado ou inativo: %', group_slug;
    END IF;

    -- Buscar o número pelo telefone e grupo
    SELECT id INTO number_record 
    FROM whatsapp_numbers 
    WHERE group_id = group_record.id 
    AND phone = number_phone 
    AND is_active = TRUE;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Número não encontrado ou inativo: %', number_phone;
    END IF;

    -- Inserir o clique
    INSERT INTO clicks (
        group_id, 
        number_id, 
        ip_address, 
        user_agent, 
        device_type, 
        referrer
    ) VALUES (
        group_record.id,
        number_record.id,
        register_click.ip_address,
        register_click.user_agent,
        register_click.device_type,
        register_click.referrer
    );

    -- Atualizar last_used_at do número
    UPDATE whatsapp_numbers 
    SET last_used_at = NOW() 
    WHERE id = number_record.id;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- VIEWS PARA ESTATÍSTICAS (usadas no dashboard)
-- ============================================================================

-- View group_stats usada nos componentes de dashboard
CREATE OR REPLACE VIEW group_stats AS
SELECT
    g.id,
    g.name,
    g.slug,
    g.description,
    g.is_active,
    g.created_at,
    g.updated_at,
    COALESCE(stats.total_numbers, 0) AS total_numbers,
    COALESCE(stats.active_numbers, 0) AS active_numbers,
    COALESCE(stats.total_clicks, 0) AS total_clicks,
    COALESCE(stats.clicks_today, 0) AS clicks_today,
    COALESCE(stats.clicks_this_week, 0) AS clicks_this_week,
    COALESCE(stats.clicks_this_month, 0) AS clicks_this_month,
    stats.last_click_at
FROM groups g
LEFT JOIN (
    SELECT 
        g.id as group_id,
        COUNT(DISTINCT wn.id) AS total_numbers,
        COUNT(DISTINCT CASE WHEN wn.is_active THEN wn.id END) AS active_numbers,
        COUNT(DISTINCT c.id) AS total_clicks,
        COUNT(DISTINCT CASE WHEN c.created_at >= CURRENT_DATE THEN c.id END) AS clicks_today,
        COUNT(DISTINCT CASE WHEN c.created_at >= CURRENT_DATE - INTERVAL '7 days' THEN c.id END) AS clicks_this_week,
        COUNT(DISTINCT CASE WHEN c.created_at >= CURRENT_DATE - INTERVAL '30 days' THEN c.id END) AS clicks_this_month,
        MAX(c.created_at) AS last_click_at
    FROM groups g
    LEFT JOIN whatsapp_numbers wn ON wn.group_id = g.id
    LEFT JOIN clicks c ON c.group_id = g.id
    GROUP BY g.id
) stats ON stats.group_id = g.id;

-- ============================================================================
-- POLÍTICAS DE SEGURANÇA (RLS)
-- ============================================================================

-- Habilitar RLS
ALTER TABLE groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE whatsapp_numbers ENABLE ROW LEVEL SECURITY;
ALTER TABLE clicks ENABLE ROW LEVEL SECURITY;

-- Políticas para leitura pública (necessário para o frontend)
CREATE POLICY "Allow public read access on groups" ON groups
    FOR SELECT USING (true);

CREATE POLICY "Allow public read access on whatsapp_numbers" ON whatsapp_numbers
    FOR SELECT USING (true);

CREATE POLICY "Allow public read access on clicks" ON clicks
    FOR SELECT USING (true);

-- Políticas para escrita apenas com service role
CREATE POLICY "Allow service role full access on groups" ON groups
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Allow service role full access on whatsapp_numbers" ON whatsapp_numbers
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Allow service role full access on clicks" ON clicks
    FOR ALL USING (auth.role() = 'service_role');

-- ============================================================================
-- DADOS DE EXEMPLO PARA TESTE
-- ============================================================================

-- Inserir grupo de exemplo
INSERT INTO groups (name, slug, description, default_message, is_active) 
VALUES (
    'Suporte Técnico', 
    'suporte', 
    'Grupo para atendimento de suporte técnico',
    'Olá! Vim através do link de suporte. Como posso ajudar?',
    TRUE
) ON CONFLICT (slug) DO NOTHING;

-- Inserir números de exemplo
INSERT INTO whatsapp_numbers (group_id, phone, name, custom_message, is_active)
SELECT 
    (SELECT id FROM groups WHERE slug = 'suporte'),
    '+5511999999999',
    'Suporte Principal',
    'Olá! Sou do suporte técnico. Como posso ajudar?',
    TRUE
WHERE NOT EXISTS (
    SELECT 1 FROM whatsapp_numbers 
    WHERE phone = '+5511999999999'
);

INSERT INTO whatsapp_numbers (group_id, phone, name, custom_message, is_active)
SELECT 
    (SELECT id FROM groups WHERE slug = 'suporte'),
    '+5511888888888',
    'Suporte Secundário',
    'Oi! Sou da equipe de suporte. Em que posso ajudar?',
    TRUE
WHERE NOT EXISTS (
    SELECT 1 FROM whatsapp_numbers 
    WHERE phone = '+5511888888888'
);

-- ============================================================================
-- VERIFICAÇÕES FINAIS
-- ============================================================================

-- Verificar se as tabelas foram criadas
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'groups') THEN
        RAISE EXCEPTION 'Tabela groups não foi criada';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'whatsapp_numbers') THEN
        RAISE EXCEPTION 'Tabela whatsapp_numbers não foi criada';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'clicks') THEN
        RAISE EXCEPTION 'Tabela clicks não foi criada';
    END IF;
    
    RAISE NOTICE 'Schema criado com sucesso! Todas as tabelas, funções e views estão prontas.';
END $$;
