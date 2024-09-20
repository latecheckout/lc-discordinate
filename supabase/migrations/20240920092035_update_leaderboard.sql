CREATE OR REPLACE FUNCTION public.update_leaderboard()
RETURNS TRIGGER AS $$
DECLARE
    community_id_var UUID;
    old_rank INT;
    new_rank INT;
    current_high_score INT;
    max_affected_rank INT;
BEGIN
    -- Ignore updates when final_score is 0
    IF NEW.final_score = 0 THEN
        RETURN NEW;
    END IF;

    -- Get the community_id for the updated session
    SELECT community_id INTO community_id_var
    FROM session
    WHERE id = NEW.id;

    -- Calculate the new rank
    SELECT COUNT(*) + 1 INTO new_rank
    FROM leaderboard
    WHERE all_time_high_score > NEW.final_score OR (all_time_high_score = NEW.final_score AND updated_at < NOW());

    -- Check if the community has a row in the leaderboard table
    IF NOT EXISTS (SELECT 1 FROM leaderboard WHERE community_id = community_id_var) THEN
        -- If not, create a new row with the current session's score and calculated rank
        INSERT INTO leaderboard (community_id, all_time_high_score, rank, updated_at)
        VALUES (community_id_var, NEW.final_score, new_rank, NOW());

        old_rank := new_rank;
    ELSE
        -- If it exists, get the current high score and rank
        SELECT all_time_high_score, rank INTO current_high_score, old_rank
        FROM leaderboard
        WHERE community_id = community_id_var;

        IF NEW.final_score <= current_high_score THEN
            -- If the score didn't improve, no need to update rankings
            RETURN NEW;
        END IF;

        -- Update the all-time high score
        UPDATE leaderboard
        SET all_time_high_score = NEW.final_score, updated_at = NOW()
        WHERE community_id = community_id_var;
    END IF;

    -- Determine the maximum rank that needs to be updated
    SELECT COALESCE(MAX(rank), 0) INTO max_affected_rank FROM leaderboard;

    -- Update ranks only for affected rows
    IF new_rank < old_rank THEN
        WITH ranked_scores AS (
            SELECT
                community_id,
                all_time_high_score,
                ROW_NUMBER() OVER (
                    ORDER BY all_time_high_score DESC, updated_at ASC
                ) AS calculated_rank
            FROM leaderboard
            WHERE rank >= new_rank OR community_id = community_id_var
        )
        UPDATE leaderboard l
        SET rank = r.calculated_rank
        FROM ranked_scores r
        WHERE l.community_id = r.community_id
          AND (l.rank != r.calculated_rank OR l.community_id = community_id_var);
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger to call the function after updating a session's final_score
CREATE TRIGGER update_leaderboard_trigger
AFTER UPDATE OF final_score ON public.session
FOR EACH ROW
WHEN (OLD.final_score IS DISTINCT FROM NEW.final_score)
EXECUTE FUNCTION public.update_leaderboard();
