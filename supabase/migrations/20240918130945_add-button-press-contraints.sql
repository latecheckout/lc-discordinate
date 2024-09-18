set check_function_bodies = off;

CREATE OR REPLACE FUNCTION auth.has_recent_button_press(_user_id uuid, _session_id uuid)
 RETURNS boolean
 LANGUAGE plpgsql
AS $function$
BEGIN
    RETURN EXISTS (
        SELECT 1
        FROM button_press
        WHERE user_id = _user_id
        AND session_id = _session_id
        AND created_at >= NOW() - INTERVAL '2 seconds'
    );
END;
$function$
;

CREATE OR REPLACE FUNCTION auth.is_participating_in_session(_session_id uuid)
 RETURNS boolean
 LANGUAGE plpgsql
AS $function$
BEGIN
    RETURN EXISTS (
        SELECT 1
        FROM user_to_session
        WHERE session_id = _session_id
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

    IF auth.has_recent_button_press(NEW.user_id, NEW.session_id) THEN
        RAISE EXCEPTION 'User has pressed the button in the last 2 seconds';
    END IF;

    RETURN NEW;
END;
$function$
;


CREATE TRIGGER check_button_press BEFORE INSERT ON public.button_press FOR EACH ROW EXECUTE FUNCTION auth.validate_button_press();


