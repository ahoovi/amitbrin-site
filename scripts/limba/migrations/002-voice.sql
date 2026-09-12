CREATE TABLE IF NOT EXISTS limba_voice_sessions (
 id uuid PRIMARY KEY,
 user_id text NOT NULL CHECK (user_id IN ('amit','neta')),
 topic text NOT NULL,
 provider_id text,
 created_at timestamptz NOT NULL DEFAULT now(),
 ended_at timestamptz,
 client_seconds numeric,
 client_finalized boolean
);
CREATE INDEX IF NOT EXISTS limba_voice_user_idx ON limba_voice_sessions(user_id,created_at);
CREATE TABLE IF NOT EXISTS limba_voice_quota (
 user_id text NOT NULL CHECK (user_id IN ('amit','neta')),
 day date NOT NULL,
 starts integer NOT NULL,
 PRIMARY KEY(user_id,day)
);
