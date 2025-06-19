-- Execute esta função completa no Supabase
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

  -- Buscar próximo número disponível com round-robin
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

  -- Atualizar last_used_at do número selecionado
  UPDATE whatsapp_numbers 
  SET last_used_at = NOW() 
  WHERE id = selected_number.id;

  -- Retornar dados com hierarquia de mensagens
  RETURN QUERY
  SELECT 
    selected_number.id as number_id,
    selected_number.phone,
    COALESCE(
      NULLIF(selected_number.custom_message, ''),  -- 1º: Mensagem do número
      NULLIF(group_record.default_message, ''),    -- 2º: Mensagem do grupo  
      'Olá! Vim através do link.'                  -- 3º: Mensagem padrão
    ) as final_message;
END;
$$;
