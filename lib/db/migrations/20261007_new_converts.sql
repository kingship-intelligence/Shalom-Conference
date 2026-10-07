CREATE TABLE IF NOT EXISTS new_converts (
  id serial PRIMARY KEY,
  name text NOT NULL,
  email text NOT NULL,
  phone text NOT NULL DEFAULT '',
  city text NOT NULL DEFAULT '',
  consent_to_contact boolean NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
