-- Corrigir função para buscar números por grupo
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

-- Função para analytics do grupo
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
  LEFT JOIN clicks c ON wn.id = c.number_id
  WHERE g.id = p_group_id;
END;
$$ LANGUAGE plpgsql;
