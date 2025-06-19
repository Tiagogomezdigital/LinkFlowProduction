-- Atualizar a função get_next_number para implementar hierarquia de mensagens
CREATE OR REPLACE FUNCTION get_next_number(group_slug text)
RETURNS TABLE (
    number_id uuid,
    phone varchar,
    custom_message text,
    group_default_message text,
    final_message text
) 
LANGUAGE plpgsql
AS $$
DECLARE
    selected_number RECORD;
    group_record RECORD;
BEGIN
    -- Buscar o grupo
    SELECT id, default_message INTO group_record
    FROM groups 
    WHERE slug = group_slug AND is_active = true;
    
    IF NOT FOUND THEN
        RETURN;
    END IF;
    
    -- Buscar próximo número disponível (round-robin)
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
        RETURN;
    END IF;
    
    -- Atualizar last_used_at
    UPDATE whatsapp_numbers 
    SET last_used_at = NOW() 
    WHERE id = selected_number.id;
    
    -- Retornar com hierarquia de mensagens
    RETURN QUERY SELECT 
        selected_number.id,
        selected_number.phone,
        selected_number.custom_message,
        group_record.default_message,
        COALESCE(
            NULLIF(selected_number.custom_message, ''),
            NULLIF(group_record.default_message, ''),
            'Olá! Vim através do link.'
        ) as final_message;
END;
$$;
