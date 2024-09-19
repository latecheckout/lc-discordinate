CREATE OR REPLACE FUNCTION public.calculate_session_score()
RETURNS TRIGGER AS $$
DECLARE
    score INTEGER;
    window_seconds INTEGER;
BEGIN
    -- Get the button_press_timeout_seconds from session_config
    SELECT sc.button_press_timeout_seconds INTO window_seconds
    FROM session s
    JOIN session_config sc ON s.config_id = sc.id
    WHERE s.id = NEW.session_id;

    -- Calculate the maximum concurrent button presses within the sliding window
    WITH time_series AS (
        SELECT generate_series(
            NEW.created_at - (window_seconds || ' seconds')::interval,
            NEW.created_at,
            '1 second'::interval
        ) AS window_start
    ),
    window_counts AS (
        SELECT ts.window_start, COUNT(*) AS press_count
        FROM time_series ts
        JOIN button_press bp ON bp.session_id = NEW.session_id
            AND bp.created_at >= ts.window_start
            AND bp.created_at < ts.window_start + (window_seconds || ' seconds')::interval
        GROUP BY ts.window_start
    )
    SELECT COALESCE(MAX(press_count), 0) INTO score FROM window_counts;

    -- Update the current_score
    UPDATE session
    SET current_score = score
    WHERE id = NEW.session_id;

    -- Update final_score if current_score is higher
    UPDATE session
    SET final_score = GREATEST(final_score, score)
    WHERE id = NEW.session_id;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger to call the function after inserting a new button press
CREATE TRIGGER calculate_session_score_trigger
AFTER INSERT ON public.button_press
FOR EACH ROW EXECUTE FUNCTION public.calculate_session_score();
