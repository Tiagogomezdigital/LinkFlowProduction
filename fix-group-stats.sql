-- Criar função para obter estatísticas dos grupos
CREATE OR REPLACE FUNCTION get_group_stats()
RETURNS TABLE (
  group_id UUID,
  group_name VARCHAR(255),
  group_slug VARCHAR(255),
  total_numbers BIGINT,
  active_numbers BIGINT,
  total_clicks BIGINT,
  clicks_today BIGINT,
  clicks_this_week BIGINT,
  clicks_this_month BIGINT,
  last_click_at TIMESTAMPTZ
) 
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    g.id as group_id,
    g.name as group_name,
    g.slug as group_slug,
    COALESCE(numbers_stats.total_numbers, 0) as total_numbers,
    COALESCE(numbers_stats.active_numbers, 0) as active_numbers,
    COALESCE(click_stats.total_clicks, 0) as total_clicks,
    COALESCE(click_stats.clicks_today, 0) as clicks_today,
    COALESCE(click_stats.clicks_this_week, 0) as clicks_this_week,
    COALESCE(click_stats.clicks_this_month, 0) as clicks_this_month,
    click_stats.last_click_at
  FROM groups g
  LEFT JOIN (
    SELECT 
      wn.group_id,
      COUNT(*) as total_numbers,
      COUNT(*) FILTER (WHERE wn.is_active = true) as active_numbers
    FROM whatsapp_numbers wn
    GROUP BY wn.group_id
  ) numbers_stats ON g.id = numbers_stats.group_id
  LEFT JOIN (
    SELECT 
      c.group_id,
      COUNT(*) as total_clicks,
      COUNT(*) FILTER (WHERE c.created_at >= CURRENT_DATE) as clicks_today,
      COUNT(*) FILTER (WHERE c.created_at >= DATE_TRUNC('week', CURRENT_DATE)) as clicks_this_week,
      COUNT(*) FILTER (WHERE c.created_at >= DATE_TRUNC('month', CURRENT_DATE)) as clicks_this_month,
      MAX(c.created_at) as last_click_at
    FROM clicks c
    GROUP BY c.group_id
  ) click_stats ON g.id = click_stats.group_id
  WHERE g.is_active = true
  ORDER BY g.created_at DESC;
END;
$$;
