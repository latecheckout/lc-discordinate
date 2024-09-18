drop function if exists "auth"."has_recent_button_press"(_user_id uuid, _session_id uuid);

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION auth.has_recent_button_press(_user_id uuid, _session_id uuid, _time timestamp with time zone)
 RETURNS boolean
 LANGUAGE plpgsql
AS $function$ 
DECLARE 
    _button_press_timeout_seconds INT; 
BEGIN 
    SELECT sc.button_press_timeout_seconds 
    INTO _button_press_timeout_seconds 
    FROM session s 
    JOIN session_config sc ON s.config_id = sc.id 
    WHERE s.id = _session_id; 

    RETURN EXISTS ( 
        SELECT 1 FROM button_press 
        WHERE user_id = _user_id 
        AND session_id = _session_id 
        AND created_at >= _time - (_button_press_timeout_seconds || ' seconds')::interval
    ); 
END; 
$function$
;

CREATE OR REPLACE FUNCTION auth.validate_button_press()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
    IF NOT auth.is_participating_in_session(NEW.session_id) THEN
        RAISE EXCEPTION 'User is not participating in the session';
    END IF;

    IF auth.has_recent_button_press(NEW.user_id, NEW.session_id, New.created_at) THEN
        RAISE EXCEPTION 'User has pressed the button in the last 2 seconds';
    END IF;

    IF NOT auth.is_session_button_pressing_active(NEW.session_id, NEW.created_at) THEN
        RAISE EXCEPTION 'Session button pressing not active';
    END IF;

    RETURN NEW;
END;
$function$
;


