CREATE OR REPLACE FUNCTION public.calculate_session_score()
RETURNS TRIGGER AS $$
DECLARE
    score INTEGER;
    window_seconds NUMERIC;
BEGIN
    -- Get the button_press_timeout_seconds from session_config
    SELECT sc.button_press_timeout_seconds::numeric INTO window_seconds
    FROM session s
    JOIN session_config sc ON s.config_id = sc.id
    WHERE s.id = NEW.session_id;

    -- Calculate the maximum concurrent button presses within the sliding window
    WITH time_bounds AS (
        SELECT
            MIN(created_at) AS min_time,
            MAX(created_at) AS max_time
        FROM button_press
        WHERE session_id = NEW.session_id
    ),
    press_counts AS (
        SELECT
            bp1.created_at AS window_end,
            COUNT(*) AS press_count
        FROM button_press bp1
        JOIN time_bounds tb ON true
        JOIN button_press bp2 ON bp2.session_id = bp1.session_id
            AND bp2.created_at > bp1.created_at - window_seconds * INTERVAL '1 second'
            AND bp2.created_at <= bp1.created_at
        WHERE bp1.session_id = NEW.session_id
        GROUP BY bp1.created_at
    )
    SELECT COALESCE(MAX(press_count), 0) INTO score FROM press_counts;

    -- Update the current_score
    UPDATE session
    SET current_score = score
    WHERE id = NEW.session_id;

    -- Update final_score if current_score is higher
    UPDATE session
    SET final_score = GREATEST(COALESCE(final_score, 0), score)
    WHERE id = NEW.session_id;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger to call the function after inserting a new button press
CREATE TRIGGER calculate_session_score_trigger
AFTER INSERT ON public.button_press
FOR EACH ROW EXECUTE FUNCTION public.calculate_session_score();
