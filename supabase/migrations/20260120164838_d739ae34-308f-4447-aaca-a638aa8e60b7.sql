-- Enable the pg_trgm extension for fuzzy text search
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Create users table for leaderboard
CREATE TABLE public.users (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  username TEXT NOT NULL UNIQUE,
  rating INTEGER NOT NULL DEFAULT 1000 CHECK (rating >= 100 AND rating <= 5000),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create index on rating for fast ranking queries
CREATE INDEX idx_users_rating ON public.users (rating DESC);

-- Create index on username for fast search
CREATE INDEX idx_users_username ON public.users USING gin (username gin_trgm_ops);

-- Function to get user with global rank using DENSE_RANK (tie-aware)
CREATE OR REPLACE FUNCTION public.get_leaderboard(
  p_limit INTEGER DEFAULT 100,
  p_offset INTEGER DEFAULT 0
)
RETURNS TABLE (
  id UUID,
  username TEXT,
  rating INTEGER,
  global_rank BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    u.id,
    u.username,
    u.rating,
    DENSE_RANK() OVER (ORDER BY u.rating DESC) as global_rank
  FROM public.users u
  ORDER BY u.rating DESC, u.username ASC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Function to search users with global rank
CREATE OR REPLACE FUNCTION public.search_users(
  p_search_term TEXT,
  p_limit INTEGER DEFAULT 50
)
RETURNS TABLE (
  id UUID,
  username TEXT,
  rating INTEGER,
  global_rank BIGINT
) AS $$
BEGIN
  RETURN QUERY
  WITH ranked_users AS (
    SELECT 
      u.id,
      u.username,
      u.rating,
      DENSE_RANK() OVER (ORDER BY u.rating DESC) as global_rank
    FROM public.users u
  )
  SELECT ru.id, ru.username, ru.rating, ru.global_rank
  FROM ranked_users ru
  WHERE ru.username ILIKE '%' || p_search_term || '%'
  ORDER BY ru.global_rank ASC, ru.username ASC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Function to get total user count
CREATE OR REPLACE FUNCTION public.get_user_count()
RETURNS BIGINT AS $$
BEGIN
  RETURN (SELECT COUNT(*) FROM public.users);
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Enable Row Level Security (public read, no write from client)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Allow public read access
CREATE POLICY "Users are publicly readable" 
  ON public.users 
  FOR SELECT 
  USING (true);

-- Enable realtime for live updates
ALTER PUBLICATION supabase_realtime ADD TABLE public.users;