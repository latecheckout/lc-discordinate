-- Create a function to insert into user_to_session
CREATE OR REPLACE FUNCTION public.insert_creator_to_user_to_session()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
    INSERT INTO public.user_to_session (user_id, session_id, community_id)
    VALUES (NEW.created_by, NEW.id, NEW.community_id);
    RETURN NEW;
END;
$function$;

-- Create a trigger to call the function after inserting a new session
CREATE TRIGGER insert_creator_to_user_to_session_trigger
AFTER INSERT ON public.session
FOR EACH ROW EXECUTE FUNCTION public.insert_creator_to_user_to_session();
