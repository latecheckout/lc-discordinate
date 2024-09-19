set check_function_bodies = off;

CREATE OR REPLACE FUNCTION auth.is_community_member(_community_id uuid)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
    RETURN EXISTS (
        SELECT 1
        FROM user_to_community
        WHERE community_id = _community_id
        AND user_id = auth.uid()
    );
END;
$function$
;


