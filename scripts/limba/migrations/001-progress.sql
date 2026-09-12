-- Additive migration. Never drops or resets learner records.
CREATE TABLE IF NOT EXISTS limba_events (
  user_id text NOT NULL CHECK (user_id IN ('amit', 'neta')),
  id uuid NOT NULL,
  event jsonb NOT NULL,
  recorded_at timestamptz NOT NULL DEFAULT clock_timestamp(),
  PRIMARY KEY (user_id, id)
);
CREATE INDEX IF NOT EXISTS limba_events_user_time ON limba_events (user_id, recorded_at, id);
CREATE TABLE IF NOT EXISTS limba_rate_limits (
  bucket text PRIMARY KEY,
  hits integer NOT NULL,
  expires_at timestamptz NOT NULL
);
