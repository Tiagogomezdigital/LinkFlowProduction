-- ============================================================================
-- LINKFLOW - MELHORIAS E FUNCIONALIDADES FALTANTES NO BANCO DE DADOS
-- ============================================================================

-- Habilitar extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- 1. FUNÇÃO PARA VERIFICAR DISPONIBILIDADE DE SLUG
-- ============================================================================

-- Função checkSlugAvailability usada em components/group-form.tsx
CREATE OR REPLACE FUNCTION check_slug_availability(
    slug_to_check TEXT,
    exclude_group_id UUID DEFAULT NULL
)
RETURNS BOOLEAN AS $$
BEGIN
    -- Verifica se o slug já existe, excluindo o grupo especificado (para edição)
    IF exclude_group_id IS NOT NULL THEN
        RETURN NOT EXISTS (
            SELECT 1 FROM groups 
            WHERE slug = slug_to_check 
            AND id != exclude_group_id
        );
    ELSE
        RETURN NOT EXISTS (
            SELECT 1 FROM groups 
            WHERE slug = slug_to_check
        );
    END IF;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 2. TABELA DE CONFIGURAÇÕES DO SISTEMA
-- ============================================================================

-- Tabela para armazenar configurações gerais do sistema
CREATE TABLE IF NOT EXISTS system_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    key VARCHAR(255) UNIQUE NOT NULL,
    value TEXT,
    description TEXT,
    category VARCHAR(100) DEFAULT 'general',
    is_public BOOLEAN DEFAULT FALSE, -- Se pode ser acessado pelo frontend
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Inserir configurações padrão
INSERT INTO system_settings (key, value, description, category, is_public) VALUES
('site_name', 'LinkFlow', 'Nome do site', 'general', true),
('site_url', 'https://linkflow.app', 'URL base do site', 'general', true),
('default_whatsapp_message', 'Olá! Vim através do link.', 'Mensagem padrão do WhatsApp', 'whatsapp', false),
('max_numbers_per_group', '50', 'Máximo de números por grupo', 'limits', false),
('enable_analytics', 'true', 'Habilitar analytics', 'features', false),
('enable_webhooks', 'false', 'Habilitar webhooks', 'features', false),
('webhook_url', '', 'URL do webhook', 'webhooks', false),
('webhook_secret', '', 'Secret do webhook', 'webhooks', false),
('backup_enabled', 'false', 'Backup automático habilitado', 'backup', false),
('backup_frequency', 'daily', 'Frequência do backup', 'backup', false)
ON CONFLICT (key) DO NOTHING;

-- ============================================================================
-- 3. TABELA DE WEBHOOKS E NOTIFICAÇÕES
-- ============================================================================

-- Tabela para logs de webhooks
CREATE TABLE IF NOT EXISTS webhook_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_type VARCHAR(100) NOT NULL, -- 'click', 'group_created', 'number_added', etc.
    payload JSONB NOT NULL,
    webhook_url TEXT NOT NULL,
    status_code INTEGER,
    response_body TEXT,
    error_message TEXT,
    attempts INTEGER DEFAULT 1,
    success BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela para notificações do sistema
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) DEFAULT 'info', -- 'info', 'warning', 'error', 'success'
    is_read BOOLEAN DEFAULT FALSE,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- 4. TABELA DE BACKUP E AUDITORIA
-- ============================================================================

-- Tabela para logs de backup
CREATE TABLE IF NOT EXISTS backup_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    backup_type VARCHAR(50) NOT NULL, -- 'manual', 'automatic'
    file_path TEXT,
    file_size BIGINT,
    status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'success', 'failed'
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE
);

-- Tabela para auditoria de ações
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    action VARCHAR(100) NOT NULL, -- 'create', 'update', 'delete'
    table_name VARCHAR(100) NOT NULL,
    record_id UUID,
    old_values JSONB,
    new_values JSONB,
    ip_address VARCHAR(50),
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- 5. MELHORIAS NA TABELA DE CLIQUES
-- ============================================================================

-- Adicionar campos para melhor analytics
ALTER TABLE clicks ADD COLUMN IF NOT EXISTS country VARCHAR(2);
ALTER TABLE clicks ADD COLUMN IF NOT EXISTS city VARCHAR(100);
ALTER TABLE clicks ADD COLUMN IF NOT EXISTS browser VARCHAR(50);
ALTER TABLE clicks ADD COLUMN IF NOT EXISTS os VARCHAR(50);
ALTER TABLE clicks ADD COLUMN IF NOT EXISTS utm_source VARCHAR(100);
ALTER TABLE clicks ADD COLUMN IF NOT EXISTS utm_medium VARCHAR(100);
ALTER TABLE clicks ADD COLUMN IF NOT EXISTS utm_campaign VARCHAR(100);

-- ============================================================================
-- 6. ÍNDICES PARA PERFORMANCE
-- ============================================================================

-- Índices para system_settings
CREATE INDEX IF NOT EXISTS idx_system_settings_key ON system_settings (key);
CREATE INDEX IF NOT EXISTS idx_system_settings_category ON system_settings (category);

-- Índices para webhook_logs
CREATE INDEX IF NOT EXISTS idx_webhook_logs_event_type ON webhook_logs (event_type);
CREATE INDEX IF NOT EXISTS idx_webhook_logs_created_at ON webhook_logs (created_at);
CREATE INDEX IF NOT EXISTS idx_webhook_logs_success ON webhook_logs (success);

-- Índices para notifications
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications (is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications (type);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications (created_at);

-- Índices para backup_logs
CREATE INDEX IF NOT EXISTS idx_backup_logs_status ON backup_logs (status);
CREATE INDEX IF NOT EXISTS idx_backup_logs_created_at ON backup_logs (created_at);

-- Índices para audit_logs
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs (action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_table_name ON audit_logs (table_name);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs (created_at);

-- Índices adicionais para clicks
CREATE INDEX IF NOT EXISTS idx_clicks_country ON clicks (country);
CREATE INDEX IF NOT EXISTS idx_clicks_browser ON clicks (browser);
CREATE INDEX IF NOT EXISTS idx_clicks_os ON clicks (os);

-- ============================================================================
-- 7. TRIGGERS PARA UPDATED_AT
-- ============================================================================

-- Trigger para system_settings
DROP TRIGGER IF EXISTS update_system_settings_updated_at ON system_settings;
CREATE TRIGGER update_system_settings_updated_at 
    BEFORE UPDATE ON system_settings 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 8. FUNÇÕES PARA ESTATÍSTICAS AVANÇADAS
-- ============================================================================

-- Função para obter estatísticas de dispositivos
CREATE OR REPLACE FUNCTION get_device_stats(
    start_date DATE DEFAULT CURRENT_DATE - INTERVAL '30 days',
    end_date DATE DEFAULT CURRENT_DATE
)
RETURNS TABLE (
    device_type VARCHAR(50),
    count BIGINT,
    percentage DECIMAL(5,2)
) AS $$
BEGIN
    RETURN QUERY
    WITH device_counts AS (
        SELECT 
            COALESCE(c.device_type, 'Unknown') as device,
            COUNT(*) as device_count
        FROM clicks c
        WHERE c.created_at >= start_date AND c.created_at <= end_date + INTERVAL '1 day'
        GROUP BY c.device_type
    ),
    total_count AS (
        SELECT SUM(device_count) as total FROM device_counts
    )
    SELECT 
        dc.device,
        dc.device_count,
        ROUND((dc.device_count * 100.0 / tc.total), 2) as percentage
    FROM device_counts dc, total_count tc
    ORDER BY dc.device_count DESC;
END;
$$ LANGUAGE plpgsql;

-- Função para obter estatísticas diárias
CREATE OR REPLACE FUNCTION get_daily_stats(
    start_date DATE DEFAULT CURRENT_DATE - INTERVAL '30 days',
    end_date DATE DEFAULT CURRENT_DATE
)
RETURNS TABLE (
    date DATE,
    clicks BIGINT,
    unique_groups BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        c.created_at::DATE as stat_date,
        COUNT(*) as click_count,
        COUNT(DISTINCT c.group_id) as unique_group_count
    FROM clicks c
    WHERE c.created_at >= start_date AND c.created_at <= end_date + INTERVAL '1 day'
    GROUP BY c.created_at::DATE
    ORDER BY stat_date;
END;
$$ LANGUAGE plpgsql;

-- Função para obter top grupos por cliques
CREATE OR REPLACE FUNCTION get_top_groups_by_clicks(
    limit_count INTEGER DEFAULT 10,
    start_date DATE DEFAULT CURRENT_DATE - INTERVAL '30 days',
    end_date DATE DEFAULT CURRENT_DATE
)
RETURNS TABLE (
    group_id UUID,
    group_name VARCHAR(255),
    group_slug VARCHAR(255),
    clicks BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        g.id,
        g.name,
        g.slug,
        COUNT(c.id) as click_count
    FROM groups g
    LEFT JOIN clicks c ON c.group_id = g.id 
        AND c.created_at >= start_date 
        AND c.created_at <= end_date + INTERVAL '1 day'
    GROUP BY g.id, g.name, g.slug
    ORDER BY click_count DESC
    LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 9. FUNÇÃO PARA BACKUP DE DADOS
-- ============================================================================

-- Função para criar backup dos dados principais
CREATE OR REPLACE FUNCTION create_data_backup()
RETURNS JSONB AS $$
DECLARE
    backup_data JSONB;
    backup_id UUID;
BEGIN
    -- Gerar ID do backup
    backup_id := uuid_generate_v4();
    
    -- Criar estrutura do backup
    SELECT jsonb_build_object(
        'backup_id', backup_id,
        'created_at', NOW(),
        'version', '1.0',
        'groups', (
            SELECT jsonb_agg(
                jsonb_build_object(
                    'id', id,
                    'name', name,
                    'slug', slug,
                    'description', description,
                    'default_message', default_message,
                    'is_active', is_active,
                    'created_at', created_at,
                    'updated_at', updated_at
                )
            ) FROM groups
        ),
        'whatsapp_numbers', (
            SELECT jsonb_agg(
                jsonb_build_object(
                    'id', id,
                    'group_id', group_id,
                    'phone', phone,
                    'name', name,
                    'custom_message', custom_message,
                    'is_active', is_active,
                    'last_used_at', last_used_at,
                    'created_at', created_at,
                    'updated_at', updated_at
                )
            ) FROM whatsapp_numbers
        ),
        'system_settings', (
            SELECT jsonb_agg(
                jsonb_build_object(
                    'key', key,
                    'value', value,
                    'description', description,
                    'category', category,
                    'is_public', is_public
                )
            ) FROM system_settings
        )
    ) INTO backup_data;
    
    -- Registrar o backup
    INSERT INTO backup_logs (id, backup_type, status, created_at)
    VALUES (backup_id, 'manual', 'success', NOW());
    
    RETURN backup_data;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 10. FUNÇÃO PARA WEBHOOK
-- ============================================================================

-- Função para registrar evento de webhook
CREATE OR REPLACE FUNCTION register_webhook_event(
    event_type_param VARCHAR(100),
    payload_param JSONB
)
RETURNS UUID AS $$
DECLARE
    webhook_url_setting TEXT;
    webhook_enabled BOOLEAN;
    log_id UUID;
BEGIN
    -- Verificar se webhooks estão habilitados
    SELECT value INTO webhook_enabled 
    FROM system_settings 
    WHERE key = 'enable_webhooks';
    
    IF webhook_enabled IS NULL OR webhook_enabled::BOOLEAN = FALSE THEN
        RETURN NULL;
    END IF;
    
    -- Obter URL do webhook
    SELECT value INTO webhook_url_setting 
    FROM system_settings 
    WHERE key = 'webhook_url';
    
    IF webhook_url_setting IS NULL OR webhook_url_setting = '' THEN
        RETURN NULL;
    END IF;
    
    -- Inserir log do webhook
    INSERT INTO webhook_logs (event_type, payload, webhook_url)
    VALUES (event_type_param, payload_param, webhook_url_setting)
    RETURNING id INTO log_id;
    
    RETURN log_id;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 11. ATUALIZAR FUNÇÃO register_click PARA INCLUIR WEBHOOK
-- ============================================================================

CREATE OR REPLACE FUNCTION register_click(
    group_slug TEXT,
    number_phone TEXT,
    ip_address TEXT DEFAULT NULL,
    user_agent TEXT DEFAULT NULL,
    device_type TEXT DEFAULT NULL,
    referrer TEXT DEFAULT NULL,
    country TEXT DEFAULT NULL,
    city TEXT DEFAULT NULL,
    browser TEXT DEFAULT NULL,
    os TEXT DEFAULT NULL,
    utm_source TEXT DEFAULT NULL,
    utm_medium TEXT DEFAULT NULL,
    utm_campaign TEXT DEFAULT NULL
)
RETURNS VOID AS $$
DECLARE
    group_record RECORD;
    number_record RECORD;
    click_id UUID;
BEGIN
    -- Buscar o grupo pelo slug
    SELECT id, name INTO group_record 
    FROM groups 
    WHERE slug = group_slug AND is_active = TRUE;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Grupo não encontrado ou inativo: %', group_slug;
    END IF;

    -- Buscar o número pelo telefone e grupo
    SELECT id, name INTO number_record 
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
        referrer,
        country,
        city,
        browser,
        os,
        utm_source,
        utm_medium,
        utm_campaign
    ) VALUES (
        group_record.id,
        number_record.id,
        register_click.ip_address,
        register_click.user_agent,
        register_click.device_type,
        register_click.referrer,
        register_click.country,
        register_click.city,
        register_click.browser,
        register_click.os,
        register_click.utm_source,
        register_click.utm_medium,
        register_click.utm_campaign
    ) RETURNING id INTO click_id;

    -- Atualizar last_used_at do número
    UPDATE whatsapp_numbers 
    SET last_used_at = NOW() 
    WHERE id = number_record.id;
    
    -- Registrar evento de webhook
    PERFORM register_webhook_event(
        'click',
        jsonb_build_object(
            'click_id', click_id,
            'group_id', group_record.id,
            'group_name', group_record.name,
            'group_slug', group_slug,
            'number_id', number_record.id,
            'number_name', number_record.name,
            'phone', number_phone,
            'ip_address', register_click.ip_address,
            'user_agent', register_click.user_agent,
            'device_type', register_click.device_type,
            'country', register_click.country,
            'city', register_click.city,
            'browser', register_click.browser,
            'os', register_click.os,
            'utm_source', register_click.utm_source,
            'utm_medium', register_click.utm_medium,
            'utm_campaign', register_click.utm_campaign,
            'timestamp', NOW()
        )
    );
    
    -- Registrar auditoria
    INSERT INTO audit_logs (action, table_name, record_id, new_values, ip_address, user_agent)
    VALUES (
        'create',
        'clicks',
        click_id,
        jsonb_build_object(
            'group_id', group_record.id,
            'number_id', number_record.id,
            'ip_address', register_click.ip_address
        ),
        register_click.ip_address,
        register_click.user_agent
    );
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 12. POLÍTICAS DE SEGURANÇA PARA NOVAS TABELAS
-- ============================================================================

-- Habilitar RLS para novas tabelas
ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhook_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE backup_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Políticas para leitura pública apenas para configurações públicas
CREATE POLICY "Allow public read access on public settings" ON system_settings
    FOR SELECT USING (is_public = true);

-- Políticas para service role em todas as tabelas
CREATE POLICY "Allow service role full access on system_settings" ON system_settings
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Allow service role full access on webhook_logs" ON webhook_logs
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Allow service role full access on notifications" ON notifications
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Allow service role full access on backup_logs" ON backup_logs
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Allow service role full access on audit_logs" ON audit_logs
    FOR ALL USING (auth.role() = 'service_role');

-- ============================================================================
-- 13. VERIFICAÇÕES FINAIS
-- ============================================================================

-- Verificar se todas as novas tabelas foram criadas
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'system_settings') THEN
        RAISE EXCEPTION 'Tabela system_settings não foi criada';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'webhook_logs') THEN
        RAISE EXCEPTION 'Tabela webhook_logs não foi criada';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'notifications') THEN
        RAISE EXCEPTION 'Tabela notifications não foi criada';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'backup_logs') THEN
        RAISE EXCEPTION 'Tabela backup_logs não foi criada';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'audit_logs') THEN
        RAISE EXCEPTION 'Tabela audit_logs não foi criada';
    END IF;
    
    RAISE NOTICE 'Todas as melhorias foram implementadas com sucesso!';
    RAISE NOTICE 'Novas funcionalidades disponíveis:';
    RAISE NOTICE '- Verificação de disponibilidade de slug';
    RAISE NOTICE '- Sistema de configurações';
    RAISE NOTICE '- Webhooks e notificações';
    RAISE NOTICE '- Backup e auditoria';
    RAISE NOTICE '- Analytics avançados';
    RAISE NOTICE '- Estatísticas de dispositivos e localização';
END $$;
