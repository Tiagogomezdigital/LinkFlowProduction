-- 1. Primeiro, vamos verificar se a função foi criada corretamente
SELECT routine_name, routine_type 
FROM information_schema.routines 
WHERE routine_name = 'get_next_number';

-- 2. Vamos recriar a função com logs para debug
CREATE OR REPLACE FUNCTION get_next_number(group_slug TEXT)
RETURNS TABLE (
  number_id UUID,
  phone VARCHAR(20),
  final_message TEXT
) 
LANGUAGE plpgsql
AS $$
DECLARE
  selected_number RECORD;
  group_record RECORD;
BEGIN
  -- Buscar informações do grupo
  SELECT id, default_message INTO group_record
  FROM groups 
  WHERE slug = group_slug AND is_active = true;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Grupo não encontrado ou inativo: %', group_slug;
  END IF;

  -- Debug: Log do grupo encontrado
  RAISE NOTICE 'Grupo encontrado: ID=%, default_message=%', group_record.id, group_record.default_message;

  -- Buscar próximo número disponível
  SELECT wn.id, wn.phone, wn.custom_message, wn.last_used_at
  INTO selected_number
  FROM whatsapp_numbers wn
  WHERE wn.group_id = group_record.id 
    AND wn.is_active = true
  ORDER BY 
    CASE WHEN wn.last_used_at IS NULL THEN 0 ELSE 1 END,
    wn.last_used_at ASC NULLS FIRST,
    wn.created_at ASC
  LIMIT 1;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Nenhum número ativo encontrado para o grupo: %', group_slug;
  END IF;

  -- Debug: Log do número encontrado
  RAISE NOTICE 'Número encontrado: ID=%, phone=%, custom_message=%', 
    selected_number.id, selected_number.phone, selected_number.custom_message;

  -- Atualizar last_used_at
  UPDATE whatsapp_numbers 
  SET last_used_at = NOW() 
  WHERE id = selected_number.id;

  -- Retornar com hierarquia de mensagens
  RETURN QUERY
  SELECT 
    selected_number.id as number_id,
    selected_number.phone,
    COALESCE(
      NULLIF(TRIM(selected_number.custom_message), ''),
      NULLIF(TRIM(group_record.default_message), ''),
      'Olá! Vim através do link.'
    ) as final_message;
    
  -- Debug: Log da mensagem final
  RAISE NOTICE 'Mensagem final: %', COALESCE(
    NULLIF(TRIM(selected_number.custom_message), ''),
    NULLIF(TRIM(group_record.default_message), ''),
    'Olá! Vim através do link.'
  );
END;
$$;

-- 3. Testar a função com o slug real
SELECT * FROM get_next_number('tgs-digital2');

-- 4. Verificar se o grupo TGS Digital tem mensagem padrão configurada
SELECT id, name, slug, default_message 
FROM groups 
WHERE slug = 'tgs-digital2';

-- 5. Verificar os números do grupo
SELECT wn.id, wn.phone, wn.name, wn.custom_message, wn.is_active, wn.group_id
FROM whatsapp_numbers wn
JOIN groups g ON g.id = wn.group_id
WHERE g.slug = 'tgs-digital2';

-- 6. Corrigir a função get_group_stats se ainda não foi criada
CREATE OR REPLACE FUNCTION get_group_stats()
RETURNS TABLE (
  group_id UUID,
  group_name VARCHAR(255),
  group_slug VARCHAR(255),
  total_numbers BIGINT,
  active_numbers BIGINT,
  total_clicks BIGINT,
  is_active BOOLEAN
) 
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    g.id as group_id,
    g.name as group_name,
    g.slug as group_slug,
    COALESCE(COUNT(wn.id), 0) as total_numbers,
    COALESCE(COUNT(wn.id) FILTER (WHERE wn.is_active = true), 0) as active_numbers,
    COALESCE(click_stats.total_clicks, 0) as total_clicks,
    g.is_active
  FROM groups g
  LEFT JOIN whatsapp_numbers wn ON g.id = wn.group_id
  LEFT JOIN (
    SELECT 
      g2.id as group_id,
      COUNT(c.id) as total_clicks
    FROM groups g2
    LEFT JOIN clicks c ON g2.id = c.group_id
    GROUP BY g2.id
  ) click_stats ON g.id = click_stats.group_id
  GROUP BY g.id, g.name, g.slug, g.is_active, click_stats.total_clicks
  ORDER BY g.created_at DESC;
END;
$$;

-- 7. Testar as estatísticas
SELECT * FROM get_group_stats();
