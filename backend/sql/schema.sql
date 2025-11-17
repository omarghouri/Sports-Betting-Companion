

CREATE TABLE public.bets (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  user_id uuid NOT NULL,
  match_id bigint NOT NULL,
  bet_type text NOT NULL CHECK (bet_type = ANY (ARRAY['team_winner'::text, 'player_score'::text, 'other'::text])),
  bet_on text NOT NULL,
  odds numeric NOT NULL CHECK (odds > 0::numeric),
  amount numeric NOT NULL CHECK (amount > 0::numeric),
  result text NOT NULL DEFAULT 'pending'::text CHECK (result = ANY (ARRAY['pending'::text, 'won'::text, 'lost'::text, 'void'::text])),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT bets_pkey PRIMARY KEY (id),
  CONSTRAINT bets_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id),
  CONSTRAINT bets_match_id_fkey FOREIGN KEY (match_id) REFERENCES public.matches(id)
);
CREATE TABLE public.matches (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  team1_id bigint NOT NULL,
  team2_id bigint NOT NULL,
  match_date timestamp with time zone NOT NULL,
  score_team1 integer,
  score_team2 integer,
  status text NOT NULL DEFAULT 'upcoming'::text CHECK (status = ANY (ARRAY['upcoming'::text, 'live'::text, 'finished'::text])),
  stage text,
  venue text,
  api_ref text,
  CONSTRAINT matches_pkey PRIMARY KEY (id),
  CONSTRAINT matches_team1_id_fkey FOREIGN KEY (team1_id) REFERENCES public.teams(id),
  CONSTRAINT matches_team2_id_fkey FOREIGN KEY (team2_id) REFERENCES public.teams(id)
);
CREATE TABLE public.players (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  name text NOT NULL,
  team_id bigint NOT NULL,
  position text,
  CONSTRAINT players_pkey PRIMARY KEY (id),
  CONSTRAINT players_team_id_fkey FOREIGN KEY (team_id) REFERENCES public.teams(id)
);
CREATE TABLE public.teams (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  name text NOT NULL,
  country_code text CHECK (char_length(country_code) = ANY (ARRAY[2, 3])),
  group_name text,
  CONSTRAINT teams_pkey PRIMARY KEY (id)
);
CREATE TABLE public.users (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  username text NOT NULL UNIQUE,
  email text NOT NULL UNIQUE,
  password_hash text NOT NULL,
  balance numeric NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT users_pkey PRIMARY KEY (id)
);


