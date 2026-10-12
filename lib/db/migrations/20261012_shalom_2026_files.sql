ALTER TABLE admin_users ADD COLUMN IF NOT EXISTS created_by text;

CREATE TABLE IF NOT EXISTS shalom_2026_files (
  id serial PRIMARY KEY,
  file_name text NOT NULL,
  object_path text NOT NULL,
  content_type text NOT NULL,
  size integer NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  uploaded_by text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
