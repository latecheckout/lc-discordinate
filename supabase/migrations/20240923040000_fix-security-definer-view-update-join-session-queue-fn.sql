set check_function_bodies = off;

create or replace view "public"."session_timestamps" as  SELECT s.id AS session_id,
    s.scheduled_at AS session_start,
    (s.scheduled_at + ((sc.countdown_seconds)::double precision * '00:00:01'::interval)) AS button_press_start,
    ((s.scheduled_at + ((sc.countdown_seconds)::double precision * '00:00:01'::interval)) + ((sc.button_press_seconds)::double precision * '00:00:01'::interval)) AS session_end
   FROM (session s
     JOIN session_config sc ON ((s.config_id = sc.id)));


CREATE OR REPLACE FUNCTION public.join_session_queue(p_community_id uuid)
 RETURNS timestamp with time zone
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
    v_current_time TIMESTAMP WITH TIME ZONE;
    v_rounded_time TIMESTAMP WITH TIME ZONE;
    v_next_slot TIMESTAMP WITH TIME ZONE;
    v_new_session_id UUID;
    v_future_session TIMESTAMP WITH TIME ZONE;
BEGIN
    -- Check if the user is a community member
    IF NOT auth.is_community_member(p_community_id) THEN
        RAISE EXCEPTION 'User is not a member of the specified community';
    END IF;

    -- Check if the community has any future sessions scheduled
    SELECT scheduled_at INTO v_future_session
    FROM session
    WHERE community_id = p_community_id AND scheduled_at > NOW()
    ORDER BY scheduled_at
    LIMIT 1;

    IF v_future_session IS NOT NULL THEN
        RAISE EXCEPTION 'The community already has a session scheduled for %', v_future_session;
    END IF;

    -- Get current time
    v_current_time := NOW();

    -- Round up to the next 5-minute interval
    v_rounded_time := DATE_TRUNC('hour', v_current_time) +
                    INTERVAL '5 min' * CEIL(DATE_PART('minute', v_current_time) / 5.0);

    -- Add 5 minutes to get the initial next slot
    v_next_slot := v_rounded_time + INTERVAL '5 minutes';

    -- Loop to find the next available slot
    LOOP
        -- Check if the slot conflicts with any existing session
        IF NOT EXISTS (
            SELECT 1
            FROM session_timestamps st
            WHERE (v_next_slot, v_next_slot) OVERLAPS (st.session_start, st.session_end)
        ) THEN
            -- If no conflict, we've found our slot
            EXIT;
        END IF;
        
        -- Move to the next 5-minute slot
        v_next_slot := v_next_slot + INTERVAL '5 minutes';
    END LOOP;

    -- Create a new session row
    INSERT INTO session (community_id, scheduled_at, created_by)
    VALUES (p_community_id, v_next_slot, auth.uid())
    RETURNING id INTO v_new_session_id;

    -- Log the creation of the new session
    RAISE WARNING 'New queue session created with ID: % for time: %', v_new_session_id, v_next_slot;

    RETURN v_next_slot;
END;
$function$
;


