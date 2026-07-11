-- =========================================================
-- ADMIN RPC FUNCTIONS FOR KEEP SHINING DASHBOARD
-- Architect: Senior Full-Stack Developer
-- =========================================================

-- Helper: Generate Unique Guest Token
CREATE OR REPLACE FUNCTION generate_unique_guest_token()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
    new_token TEXT;
    done BOOL;
BEGIN
    done := false;
    WHILE NOT done LOOP
        -- Generate random 8 character alphanumeric string
        new_token := substring(md5(random()::text) from 1 for 8);
        -- Check uniqueness in guests table
        IF NOT EXISTS (SELECT 1 FROM guests WHERE unique_token = new_token) THEN
            done := true;
        END IF;
    END LOOP;
    RETURN new_token;
END;
$$;

-- 1. Admin: Get all guests with filters, search, and pagination
CREATE OR REPLACE FUNCTION admin_get_guests(
    p_search TEXT DEFAULT NULL,
    p_rsvp_filter TEXT DEFAULT NULL, -- 'attending', 'declining', 'no_response', 'all'
    p_limit INT DEFAULT 50,
    p_offset INT DEFAULT 0
)
RETURNS TABLE (
    id UUID,
    title TEXT,
    full_name TEXT,
    unique_token TEXT,
    email TEXT,
    phone TEXT,
    rsvp_status BOOLEAN,
    attendance_count INT,
    notes TEXT,
    table_number TEXT,
    created_at TIMESTAMPTZ,
    total_count BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Verify admin
    IF (SELECT auth.uid()) != (SELECT id FROM auth.users WHERE email = 'admin@meinita.amanloka.com') THEN
        RAISE EXCEPTION 'Unauthorized';
    END IF;

    RETURN QUERY
    WITH filtered_guests AS (
        SELECT g.*
        FROM guests g
        WHERE 
            (
                p_rsvp_filter IS NULL 
                OR p_rsvp_filter = 'all'
                OR (p_rsvp_filter = 'attending' AND g.rsvp_status = true)
                OR (p_rsvp_filter = 'declining' AND g.rsvp_status = false)
                OR (p_rsvp_filter = 'no_response' AND g.rsvp_status IS NULL)
            )
            AND (
                p_search IS NULL OR p_search = ''
                OR g.full_name ILIKE '%' || p_search || '%'
                OR g.email ILIKE '%' || p_search || '%'
                OR g.phone ILIKE '%' || p_search || '%'
                OR g.table_number ILIKE '%' || p_search || '%'
            )
    ),
    total AS (
        SELECT COUNT(*) as cnt FROM filtered_guests
    )
    SELECT 
        fg.id, fg.title, fg.full_name, fg.unique_token, fg.email, fg.phone, 
        fg.rsvp_status, fg.attendance_count, fg.notes, fg.table_number, fg.created_at,
        t.cnt
    FROM filtered_guests fg, total t
    ORDER BY fg.created_at DESC
    LIMIT p_limit
    OFFSET p_offset;
END;
$$;

-- 2. Admin: Get RSVP statistics
CREATE OR REPLACE FUNCTION admin_get_stats()
RETURNS TABLE (
    total_guests INT,
    attending INT,
    declining INT,
    no_response INT,
    total_attendance_count INT,
    total_prayers INT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Verify admin
    IF (SELECT auth.uid()) != (SELECT id FROM auth.users WHERE email = 'admin@meinita.amanloka.com') THEN
        RAISE EXCEPTION 'Unauthorized';
    END IF;

    RETURN QUERY
    SELECT
        COUNT(*)::INT as total_guests,
        COUNT(CASE WHEN rsvp_status = true THEN 1 END)::INT as attending,
        COUNT(CASE WHEN rsvp_status = false THEN 1 END)::INT as declining,
        COUNT(CASE WHEN rsvp_status IS NULL THEN 1 END)::INT as no_response,
        COALESCE(SUM(CASE WHEN rsvp_status = true THEN attendance_count ELSE 0 END), 0)::INT as total_attendance_count,
        (SELECT COUNT(*)::INT FROM prayers_guestbook) as total_prayers
    FROM guests;
END;
$$;

-- 3. Admin: Create new guest with auto-generated token
CREATE OR REPLACE FUNCTION admin_create_guest(
    p_title TEXT,
    p_full_name TEXT,
    p_email TEXT,
    p_phone TEXT
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    new_id UUID;
    v_token TEXT;
BEGIN
    -- Verify admin
    IF (SELECT auth.uid()) != (SELECT id FROM auth.users WHERE email = 'admin@meinita.amanloka.com') THEN
        RAISE EXCEPTION 'Unauthorized';
    END IF;

    v_token := generate_unique_guest_token();

    INSERT INTO guests (title, full_name, email, phone, unique_token)
    VALUES (p_title, p_full_name, p_email, p_phone, v_token)
    RETURNING id INTO new_id;

    RETURN new_id;
END;
$$;

-- 4. Admin: Update guest
CREATE OR REPLACE FUNCTION admin_update_guest(
    p_id UUID,
    p_title TEXT,
    p_full_name TEXT,
    p_email TEXT,
    p_phone TEXT,
    p_table_number TEXT,
    p_rsvp_status BOOLEAN,
    p_attendance_count INT
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Verify admin
    IF (SELECT auth.uid()) != (SELECT id FROM auth.users WHERE email = 'admin@meinita.amanloka.com') THEN
        RAISE EXCEPTION 'Unauthorized';
    END IF;

    UPDATE guests
    SET 
        title = p_title,
        full_name = p_full_name,
        email = p_email,
        phone = p_phone,
        table_number = p_table_number,
        rsvp_status = p_rsvp_status,
        attendance_count = p_attendance_count,
        updated_at = NOW()
    WHERE id = p_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Guest not found';
    END IF;
END;
$$;

-- 5. Admin: Delete guest
CREATE OR REPLACE FUNCTION admin_delete_guest(p_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Verify admin
    IF (SELECT auth.uid()) != (SELECT id FROM auth.users WHERE email = 'admin@meinita.amanloka.com') THEN
        RAISE EXCEPTION 'Unauthorized';
    END IF;

    DELETE FROM guests WHERE id = p_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Guest not found';
    END IF;
END;
$$;

-- 6. Admin: Bulk create guests (for CSV import)
CREATE OR REPLACE FUNCTION admin_bulk_create_guests(p_guests JSONB)
RETURNS INT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    guest_record RECORD;
    v_token TEXT;
    insert_count INT := 0;
BEGIN
    -- Verify admin
    IF (SELECT auth.uid()) != (SELECT id FROM auth.users WHERE email = 'admin@meinita.amanloka.com') THEN
        RAISE EXCEPTION 'Unauthorized';
    END IF;

    FOR guest_record IN 
        SELECT * FROM jsonb_to_recordset(p_guests) 
        AS x(title TEXT, full_name TEXT, email TEXT, phone TEXT, table_number TEXT, unique_token TEXT)
    LOOP
        -- Generate token if missing or duplicate
        IF guest_record.unique_token IS NULL OR guest_record.unique_token = '' THEN
            v_token := generate_unique_guest_token();
        ELSE
            v_token := guest_record.unique_token;
            IF EXISTS (SELECT 1 FROM guests WHERE unique_token = v_token) THEN
                v_token := generate_unique_guest_token();
            END IF;
        END IF;

        INSERT INTO guests (title, full_name, email, phone, table_number, unique_token)
        VALUES (
            guest_record.title, 
            guest_record.full_name, 
            guest_record.email, 
            guest_record.phone, 
            guest_record.table_number, 
            v_token
        );
        insert_count := insert_count + 1;
    END LOOP;

    RETURN insert_count;
END;
$$;

-- 7. Admin: Get all prayers with guest info
CREATE OR REPLACE FUNCTION admin_get_prayers(
    p_limit INT DEFAULT 50,
    p_offset INT DEFAULT 0
)
RETURNS TABLE (
    id UUID,
    message TEXT,
    created_at TIMESTAMPTZ,
    guest_id UUID,
    guest_title TEXT,
    guest_full_name TEXT,
    guest_token TEXT,
    total_count BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Verify admin
    IF (SELECT auth.uid()) != (SELECT id FROM auth.users WHERE email = 'admin@meinita.amanloka.com') THEN
        RAISE EXCEPTION 'Unauthorized';
    END IF;

    RETURN QUERY
    WITH total AS (
        SELECT COUNT(*) as cnt FROM prayers_guestbook
    )
    SELECT 
        p.id, p.message, p.created_at, 
        g.id as guest_id, g.title as guest_title, g.full_name as guest_full_name, g.unique_token as guest_token,
        t.cnt
    FROM prayers_guestbook p
    LEFT JOIN guests g ON p.guest_id = g.id
    CROSS JOIN total t
    ORDER BY p.created_at DESC
    LIMIT p_limit
    OFFSET p_offset;
END;
$$;

-- 8. Admin: Delete prayer/guestbook message
CREATE OR REPLACE FUNCTION admin_delete_prayer(p_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Verify admin
    IF (SELECT auth.uid()) != (SELECT id FROM auth.users WHERE email = 'admin@meinita.amanloka.com') THEN
        RAISE EXCEPTION 'Unauthorized';
    END IF;

    DELETE FROM prayers_guestbook WHERE id = p_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Prayer not found';
    END IF;
END;
$$;

-- 9. Admin: Create/Update global configurations
CREATE OR REPLACE FUNCTION admin_update_event_config(p_key TEXT, p_value JSONB)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Verify admin
    IF (SELECT auth.uid()) != (SELECT id FROM auth.users WHERE email = 'admin@meinita.amanloka.com') THEN
        RAISE EXCEPTION 'Unauthorized';
    END IF;

    INSERT INTO event_config (key, value)
    VALUES (p_key, p_value)
    ON CONFLICT (key) DO UPDATE
    SET value = p_value, updated_at = NOW();
END;
$$;

-- =========================================================
-- GRANT EXECUTE PRIVILEGES TO ANON ROLE
-- (Required for frontend to execute RPC functions)
-- =========================================================
GRANT EXECUTE ON FUNCTION admin_get_guests(TEXT, TEXT, INT, INT) TO anon;
GRANT EXECUTE ON FUNCTION admin_get_stats() TO anon;
GRANT EXECUTE ON FUNCTION admin_create_guest(TEXT, TEXT, TEXT, TEXT) TO anon;
GRANT EXECUTE ON FUNCTION admin_update_guest(UUID, TEXT, TEXT, TEXT, TEXT, TEXT, BOOLEAN, INT) TO anon;
GRANT EXECUTE ON FUNCTION admin_delete_guest(UUID) TO anon;
GRANT EXECUTE ON FUNCTION admin_bulk_create_guests(JSONB) TO anon;
GRANT EXECUTE ON FUNCTION admin_get_prayers(INT, INT) TO anon;
GRANT EXECUTE ON FUNCTION admin_delete_prayer(UUID) TO anon;
GRANT EXECUTE ON FUNCTION admin_update_event_config(TEXT, JSONB) TO anon;
