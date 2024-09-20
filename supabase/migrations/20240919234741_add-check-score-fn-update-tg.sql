drop trigger if exists "calculate_session_score_trigger" on "public"."button_press";

drop function if exists "public"."calculate_session_score"();

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.button_press_after_insert()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
    -- Call the calculate_session_score function with the new button press data
    PERFORM calculate_session_score(NEW.session_id, NEW.created_at);
    
    RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.calculate_session_score(p_session_id uuid, p_timestamp timestamp with time zone)
 RETURNS void
 LANGUAGE plpgsql
AS $function$
DECLARE
    v_score INTEGER;
    v_window_seconds NUMERIC;
    v_final_score INTEGER;
BEGIN

    -- Get the score_window_seconds from session_config
    SELECT sc.score_window_seconds::numeric INTO v_window_seconds
    FROM session s
    JOIN session_config sc ON s.config_id = sc.id
    WHERE s.id = p_session_id;
    

    -- Count the number of button presses within the window before the given timestamp
    SELECT COUNT(*) INTO v_score
    FROM button_press
    WHERE session_id = p_session_id
      AND created_at > p_timestamp - v_window_seconds * INTERVAL '1 second'
      AND created_at <= p_timestamp;
    

    -- Get the current final_score
    SELECT final_score INTO v_final_score
    FROM session
    WHERE id = p_session_id;
    

    -- Update the session with new scores
    UPDATE session
    SET current_score = v_score,
        final_score = GREATEST(COALESCE(v_final_score, 0), v_score)
    WHERE id = p_session_id;
    

    -- Function returns nothing (VOID)
END;
$function$
;

CREATE OR REPLACE FUNCTION public.check_session_score()
 RETURNS void
 LANGUAGE plpgsql
AS $function$
DECLARE
    v_session_id UUID;
    v_now TIMESTAMP WITH TIME ZONE;
BEGIN
    -- Get the current timestamp
    v_now := NOW();

    -- Find a session that meets the criteria
    SELECT id INTO v_session_id
    FROM session
    WHERE scheduled_at <= v_now
      AND scheduled_at > (v_now - INTERVAL '5 minutes')
    LIMIT 1;

    -- If a session is found, call calculate_session_score
    IF v_session_id IS NOT NULL THEN
        PERFORM public.calculate_session_score(v_session_id, v_now);
    END IF;
END;
$function$
;

CREATE TRIGGER button_press_after_insert_trigger AFTER INSERT ON public.button_press FOR EACH ROW EXECUTE FUNCTION button_press_after_insert();



