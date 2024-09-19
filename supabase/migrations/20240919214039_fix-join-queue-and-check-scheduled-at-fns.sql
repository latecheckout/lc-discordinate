set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.check_scheduled_at()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
    IF EXISTS (
        SELECT 1 FROM Session
        WHERE scheduled_at BETWEEN NEW.scheduled_at AND NEW.scheduled_at - interval '5 minutes'
        AND id != NEW.id
    ) THEN
        RAISE EXCEPTION 'Another session is already scheduled within 5 minutes of this time';
    END IF;
    RETURN NEW;
END;
$function$
;

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
BEGIN
    -- Check if the user is a community member
    IF NOT auth.is_community_member(p_community_id) THEN
        RAISE EXCEPTION 'User is not a member of the specified community';
    END IF;

    -- Get current time
    v_current_time := NOW();

    -- Round up to the next 5-minute interval
    v_rounded_time := DATE_TRUNC('hour', v_current_time) +
                    INTERVAL '5 min' * CEIL(DATE_PART('minute', v_current_time) / 5.0);

    -- Add 5 minutes to get the initial next slot
    v_next_slot := v_rounded_time + INTERVAL '5 minutes';

    -- Loop to find the next available slot
    WHILE EXISTS (
        SELECT 1
        FROM session
        WHERE scheduled_at = v_next_slot
    ) LOOP
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


