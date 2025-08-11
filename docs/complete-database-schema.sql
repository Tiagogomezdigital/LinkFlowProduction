-- ============================================================================
-- LINKFLOW - SCHEMA COMPLETO E ATUALIZADO
-- ============================================================================
-- Versão: Final
-- Data: 2024
-- Descrição: Schema completo com todas as correções aplicadas

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

-- Tabela de Números WhatsApp
CREATE TABLE IF NOT EXISTS whatsapp_numbers (
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
-- FUNÇÕES PRINCIPAIS DO SISTEMA
-- ============================================================================

-- Função para buscar próximo número (rotação)
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

-- Função para registrar clique (CORRIGIDA)
CREATE OR REPLACE FUNCTION register_click_v2(
  p_group_slug VARCHAR,
  p_number_phone VARCHAR,
  p_ip_address VARCHAR DEFAULT NULL,
  p_user_agent VARCHAR DEFAULT NULL,
  p_device_type VARCHAR DEFAULT NULL,
  p_referrer VARCHAR DEFAULT NULL
) RETURNS VOID AS $$
DECLARE
  v_group_id UUID;
  v_number_id UUID;
BEGIN
  -- Buscar grupo pelo slug
  SELECT id INTO v_group_id 
  FROM groups 
  WHERE slug = p_group_slug AND is_active = true;
  
  IF v_group_id IS NULL THEN
    RAISE EXCEPTION 'Grupo não encontrado ou inativo: %', p_group_slug;
  END IF;
  
  -- Buscar número
  SELECT id INTO v_number_id 
  FROM whatsapp_numbers 
  WHERE phone = p_number_phone AND group_id = v_group_id;
  
  IF v_number_id IS NULL THEN
    RAISE EXCEPTION 'Número não encontrado: %', p_number_phone;
  END IF;
  
  -- Inserir clique
  INSERT INTO clicks (
    group_id, 
    number_id, 
    ip_address, 
    user_agent, 
    device_type, 
    referrer,
    created_at
  ) VALUES (
    v_group_id,
    v_number_id,
    p_ip_address,
    p_user_agent,
    p_device_type,
    p_referrer,
    NOW()
  );
  
  -- Atualizar last_used_at do número
  UPDATE whatsapp_numbers 
  SET last_used_at = NOW() 
  WHERE id = v_number_id;
  
  RAISE NOTICE 'Clique registrado com sucesso para grupo % e número %', p_group_slug, p_number_phone;
END;
$$ LANGUAGE plpgsql;

-- Função para buscar números por grupo
CREATE OR REPLACE FUNCTION get_numbers_by_group_id(p_group_id UUID)
RETURNS TABLE (
  id UUID,
  phone VARCHAR,
  name VARCHAR,
  is_active BOOLEAN,
  custom_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    wn.id, 
    wn.phone, 
    wn.name, 
    wn.is_active, 
    wn.custom_message,
    wn.created_at
  FROM whatsapp_numbers wn
  WHERE wn.group_id = p_group_id
  ORDER BY wn.created_at DESC;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- FUNÇÕES DE ESTATÍSTICAS (CORRIGIDAS)
-- ============================================================================

-- Estatísticas dos grupos (CORRIGIDA)
CREATE OR REPLACE FUNCTION get_group_stats()
RETURNS TABLE (
  group_id UUID,
  group_name VARCHAR,
  group_slug VARCHAR,
  total_numbers BIGINT,
  active_numbers BIGINT,
  total_clicks BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    g.id as group_id,
    g.name as group_name,
    g.slug as group_slug,
    COALESCE(COUNT(DISTINCT wn.id), 0) as total_numbers,
    COALESCE(COUNT(DISTINCT wn.id) FILTER (WHERE wn.is_active = true), 0) as active_numbers,
    COALESCE(COUNT(c.id), 0) as total_clicks
  FROM groups g
  LEFT JOIN whatsapp_numbers wn ON g.id = wn.group_id
  LEFT JOIN clicks c ON g.id = c.group_id
  WHERE g.is_active = true
  GROUP BY g.id, g.name, g.slug
  ORDER BY g.name;
END;
$$ LANGUAGE plpgsql;

-- Analytics de grupo específico
CREATE OR REPLACE FUNCTION get_group_analytics(p_group_id UUID)
RETURNS TABLE (
  total_clicks BIGINT,
  active_numbers BIGINT,
  total_numbers BIGINT,
  clicks_today BIGINT,
  clicks_this_week BIGINT,
  clicks_this_month BIGINT,
  avg_clicks_per_number NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COALESCE(COUNT(c.id), 0) as total_clicks,
    COALESCE(COUNT(DISTINCT wn.id) FILTER (WHERE wn.is_active = true), 0) as active_numbers,
    COALESCE(COUNT(DISTINCT wn.id), 0) as total_numbers,
    COALESCE(COUNT(c.id) FILTER (WHERE c.created_at >= CURRENT_DATE), 0) as clicks_today,
    COALESCE(COUNT(c.id) FILTER (WHERE c.created_at >= CURRENT_DATE - INTERVAL '7 days'), 0) as clicks_this_week,
    COALESCE(COUNT(c.id) FILTER (WHERE c.created_at >= CURRENT_DATE - INTERVAL '30 days'), 0) as clicks_this_month,
    CASE 
      WHEN COUNT(DISTINCT wn.id) > 0 THEN 
        ROUND(COUNT(c.id)::NUMERIC / COUNT(DISTINCT wn.id), 2)
      ELSE 0 
    END as avg_clicks_per_number
  FROM groups g
  LEFT JOIN whatsapp_numbers wn ON g.id = wn.group_id
  LEFT JOIN clicks c ON g.id = c.group_id
  WHERE g.id = p_group_id;
END;
$$ LANGUAGE plpgsql;

-- Estatísticas do dashboard
CREATE OR REPLACE FUNCTION get_dashboard_stats()
RETURNS TABLE (
  total_groups BIGINT,
  total_numbers BIGINT,
  active_numbers BIGINT,
  total_clicks BIGINT,
  clicks_today BIGINT,
  clicks_this_week BIGINT,
  clicks_this_month BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COALESCE(COUNT(DISTINCT g.id), 0) as total_groups,
    COALESCE(COUNT(DISTINCT wn.id), 0) as total_numbers,
    COALESCE(COUNT(DISTINCT wn.id) FILTER (WHERE wn.is_active = true), 0) as active_numbers,
    COALESCE(COUNT(c.id), 0) as total_clicks,
    COALESCE(COUNT(c.id) FILTER (WHERE c.created_at >= CURRENT_DATE), 0) as clicks_today,
    COALESCE(COUNT(c.id) FILTER (WHERE c.created_at >= CURRENT_DATE - INTERVAL '7 days'), 0) as clicks_this_week,
    COALESCE(COUNT(c.id) FILTER (WHERE c.created_at >= CURRENT_DATE - INTERVAL '30 days'), 0) as clicks_this_month
  FROM groups g
  LEFT JOIN whatsapp_numbers wn ON g.id = wn.group_id
  LEFT JOIN clicks c ON g.id = c.group_id
  WHERE g.is_active = true;
END;
$$ LANGUAGE plpgsql;

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

-- Políticas para escrita (CORRIGIDAS)
DROP POLICY IF EXISTS "Allow service role full access on groups" ON groups;
CREATE POLICY "Allow authenticated users to manage groups" ON groups
    FOR ALL USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Allow service role full access on whatsapp_numbers" ON whatsapp_numbers;
CREATE POLICY "Allow authenticated users to manage numbers" ON whatsapp_numbers
    FOR ALL USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Allow service role full access on clicks" ON clicks;
CREATE POLICY "Allow public insert on clicks" ON clicks
    FOR INSERT WITH CHECK (true);

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
-- QUERIES ÚTEIS PARA MANUTENÇÃO
-- ============================================================================

-- Verificar cliques por grupo
/*
SELECT 
  g.name as grupo,
  COUNT(c.id) as total_cliques,
  COUNT(DISTINCT c.created_at::date) as dias_com_cliques
FROM groups g
LEFT JOIN clicks c ON g.id = c.group_id
GROUP BY g.id, g.name
ORDER BY total_cliques DESC;
*/

-- Top números mais usados
/*
SELECT 
  wn.phone,
  wn.name,
  g.name as grupo,
  COUNT(c.id) as cliques,
  MAX(c.created_at) as ultimo_clique
FROM whatsapp_numbers wn
LEFT JOIN clicks c ON wn.id = c.number_id
LEFT JOIN groups g ON wn.group_id = g.id
GROUP BY wn.id, wn.phone, wn.name, g.name
ORDER BY cliques DESC;
*/

-- Cliques por período
/*
SELECT 
  DATE(c.created_at) as data,
  COUNT(c.id) as cliques,
  COUNT(DISTINCT c.group_id) as grupos_ativos
FROM clicks c
WHERE c.created_at >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY DATE(c.created_at)
ORDER BY data DESC;
*/

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
    
    RAISE NOTICE 'Schema LinkFlow criado com sucesso! Todas as tabelas, funções e views estão prontas.';
END $$;
