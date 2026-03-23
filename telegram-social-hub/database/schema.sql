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
    status text DEFAULT 'pending',
    created_at timestamp with time zone DEFAULT now(),
    PRIMARY KEY (id),
    UNIQUE(user_id, friend_id)
);

-- Create group_data table
CREATE TABLE public.group_data (
    id uuid NOT NULL DEFAULT extensions.uuid_generate_v4(),
    chat_id bigint UNIQUE NOT NULL,
    canvas_state jsonb DEFAULT '{}'::jsonb,
    canvas_mode text DEFAULT 'free',
    current_video_url text,
    video_timestamp numeric DEFAULT 0,
    video_state text DEFAULT 'paused',
    updated_at timestamp with time zone DEFAULT now(),
    PRIMARY KEY (id)
);

-- Create bot_groups table (groups where bot has been added)
CREATE TABLE public.bot_groups (
    chat_id bigint PRIMARY KEY,
    title text NOT NULL,
    username text,
    member_count int DEFAULT 0,
    added_at timestamp with time zone DEFAULT now()
);

-- Create user_activity table
CREATE TABLE public.user_activity (
    user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
    current_group_id bigint,
    last_seen timestamp with time zone DEFAULT now(),
    PRIMARY KEY (user_id)
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.friendships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bot_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_activity ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "anon_read_write_profiles" ON public.profiles FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "anon_read_write_friendships" ON public.friendships FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "anon_read_write_group_data" ON public.group_data FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "anon_read_write_bot_groups" ON public.bot_groups FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "anon_read_write_user_activity" ON public.user_activity FOR ALL USING (true) WITH CHECK (true);

-- Enable Realtime
begin;
  drop publication if exists supabase_realtime;
  create publication supabase_realtime;
commit;
alter publication supabase_realtime add table public.group_data;
alter publication supabase_realtime add table public.user_activity;
alter publication supabase_realtime add table public.bot_groups;
