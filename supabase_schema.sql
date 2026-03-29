-- Supabase Schema for AI Trip Planner (Secured with Auth)

-- 1. Create the `trips` table to store generated travel plans securely
CREATE TABLE IF NOT EXISTS trips (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    destination TEXT NOT NULL,
    plan_json TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Enable Row Level Security (RLS)
ALTER TABLE trips ENABLE ROW LEVEL SECURITY;

-- 3. Create RLS Policies so users can ONLY insert and read their OWN trips
CREATE POLICY "Users can insert their own trips"
ON trips FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own trips"
ON trips FOR SELECT
USING (auth.uid() = user_id);

-- Optional: If you ever allow users to delete their history
CREATE POLICY "Users can delete their own trips"
ON trips FOR DELETE
USING (auth.uid() = user_id);
