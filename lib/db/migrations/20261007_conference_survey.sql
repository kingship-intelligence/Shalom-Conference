CREATE TABLE IF NOT EXISTS conference_survey_responses (
  id serial PRIMARY KEY,
  conference_year integer NOT NULL,
  rating integer NOT NULL CHECK (rating BETWEEN 1 AND 5),
  highlight text NOT NULL DEFAULT '',
  improvements text NOT NULL DEFAULT '',
  would_attend_again text NOT NULL CHECK (would_attend_again IN ('yes', 'no', 'maybe')),
  created_at timestamptz NOT NULL DEFAULT now()
);
