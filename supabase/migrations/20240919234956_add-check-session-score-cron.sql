-- Example: enable the "pg_cron" extension
create extension pg_cron with schema extensions;

grant usage on schema cron to postgres;
grant all privileges on all tables in schema cron to postgres;

select
  cron.schedule(
    'check_session_score_every_4_seconds',
    '4 seconds',
    $$
    select check_session_score()
    $$
  );