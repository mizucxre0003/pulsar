-- Create profiles table
CREATE TABLE public.profiles (
    id uuid NOT NULL DEFAULT extensions.uuid_generate_v4(),
    telegram_id bigint UNIQUE NOT NULL,
    username text,
    avatar_url text,
    theme_preference text DEFAULT 'dark',
    created_at timestamp with time zone DEFAULT now(),
    PRIMARY KEY (id)
);

-- Create friendships table
CREATE TABLE public.friendships (
    id uuid NOT NULL DEFAULT extensions.uuid_generate_v4(),
    user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
    friend_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
    status text DEFAULT 'pending', -- 'pending' or 'accepted'
    created_at timestamp with time zone DEFAULT now(),
    PRIMARY KEY (id),
    UNIQUE(user_id, friend_id)
);

-- Create group_data table
CREATE TABLE public.group_data (
    id uuid NOT NULL DEFAULT extensions.uuid_generate_v4(),
    chat_id bigint UNIQUE NOT NULL,
    canvas_state jsonb DEFAULT '{}'::jsonb,
    current_video_url text,
    video_timestamp numeric DEFAULT 0,
    video_state text DEFAULT 'paused', -- 'playing' or 'paused'
    updated_at timestamp with time zone DEFAULT now(),
    PRIMARY KEY (id)
);

-- Create user_activity table
CREATE TABLE public.user_activity (
    user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
    current_group_id bigint, -- References telegram chat_id
    last_seen timestamp with time zone DEFAULT now(),
    PRIMARY KEY (user_id)
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.friendships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_activity ENABLE ROW LEVEL SECURITY;

-- Create policies (Development mode: allowing anon access for TMA ease, typically you'd protect this by JWT)
CREATE POLICY "Allow anon read profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Allow anon insert profiles" ON public.profiles FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow anon update profiles" ON public.profiles FOR UPDATE USING (true);

CREATE POLICY "Allow anon read friendships" ON public.friendships FOR SELECT USING (true);
CREATE POLICY "Allow anon insert friendships" ON public.friendships FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow anon update friendships" ON public.friendships FOR UPDATE USING (true);

CREATE POLICY "Allow anon read group_data" ON public.group_data FOR SELECT USING (true);
CREATE POLICY "Allow anon insert group_data" ON public.group_data FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow anon update group_data" ON public.group_data FOR UPDATE USING (true);

CREATE POLICY "Allow anon read user_activity" ON public.user_activity FOR SELECT USING (true);
CREATE POLICY "Allow anon insert user_activity" ON public.user_activity FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow anon update user_activity" ON public.user_activity FOR UPDATE USING (true);

-- Enable Realtime
begin;
  drop publication if exists supabase_realtime;
  create publication supabase_realtime;
commit;
alter publication supabase_realtime add table public.group_data;
alter publication supabase_realtime add table public.user_activity;
