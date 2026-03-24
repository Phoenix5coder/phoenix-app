-- =============================================
-- X Clone - Supabase Schema
-- Run this in your Supabase SQL Editor
-- =============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- PROFILES TABLE
-- =============================================
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  display_name TEXT NOT NULL,
  bio TEXT DEFAULT '',
  avatar_url TEXT DEFAULT '',
  banner_url TEXT DEFAULT '',
  website TEXT DEFAULT '',
  location TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  followers_count INT DEFAULT 0,
  following_count INT DEFAULT 0,
  tweets_count INT DEFAULT 0
);

-- =============================================
-- TWEETS TABLE
-- =============================================
CREATE TABLE tweets (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL CHECK (char_length(content) <= 280),
  image_url TEXT DEFAULT NULL,
  reply_to UUID REFERENCES tweets(id) ON DELETE SET NULL DEFAULT NULL,
  retweet_of UUID REFERENCES tweets(id) ON DELETE SET NULL DEFAULT NULL,
  likes_count INT DEFAULT 0,
  replies_count INT DEFAULT 0,
  retweets_count INT DEFAULT 0,
  bookmarks_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- LIKES TABLE
-- =============================================
CREATE TABLE likes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  tweet_id UUID REFERENCES tweets(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, tweet_id)
);

-- =============================================
-- FOLLOWS TABLE
-- =============================================
CREATE TABLE follows (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  follower_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  following_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(follower_id, following_id),
  CHECK (follower_id != following_id)
);

-- =============================================
-- BOOKMARKS TABLE
-- =============================================
CREATE TABLE bookmarks (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  tweet_id UUID REFERENCES tweets(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, tweet_id)
);

-- =============================================
-- NOTIFICATIONS TABLE
-- =============================================
CREATE TABLE notifications (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  recipient_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  actor_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('like', 'retweet', 'reply', 'follow', 'mention')),
  tweet_id UUID REFERENCES tweets(id) ON DELETE CASCADE DEFAULT NULL,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- MESSAGES TABLE (DMs)
-- =============================================
CREATE TABLE messages (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  sender_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  recipient_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- FUNCTIONS & TRIGGERS
-- =============================================

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, username, display_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Update likes count
CREATE OR REPLACE FUNCTION update_likes_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE tweets SET likes_count = likes_count + 1 WHERE id = NEW.tweet_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE tweets SET likes_count = likes_count - 1 WHERE id = OLD.tweet_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_like_change
  AFTER INSERT OR DELETE ON likes
  FOR EACH ROW EXECUTE FUNCTION update_likes_count();

-- Update retweets count
CREATE OR REPLACE FUNCTION update_retweets_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' AND NEW.retweet_of IS NOT NULL THEN
    UPDATE tweets SET retweets_count = retweets_count + 1 WHERE id = NEW.retweet_of;
  ELSIF TG_OP = 'DELETE' AND OLD.retweet_of IS NOT NULL THEN
    UPDATE tweets SET retweets_count = retweets_count - 1 WHERE id = OLD.retweet_of;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_retweet_change
  AFTER INSERT OR DELETE ON tweets
  FOR EACH ROW EXECUTE FUNCTION update_retweets_count();

-- Update replies count
CREATE OR REPLACE FUNCTION update_replies_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' AND NEW.reply_to IS NOT NULL THEN
    UPDATE tweets SET replies_count = replies_count + 1 WHERE id = NEW.reply_to;
  ELSIF TG_OP = 'DELETE' AND OLD.reply_to IS NOT NULL THEN
    UPDATE tweets SET replies_count = replies_count - 1 WHERE id = OLD.reply_to;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_reply_change
  AFTER INSERT OR DELETE ON tweets
  FOR EACH ROW EXECUTE FUNCTION update_replies_count();

-- Update followers/following count
CREATE OR REPLACE FUNCTION update_follow_counts()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE profiles SET followers_count = followers_count + 1 WHERE id = NEW.following_id;
    UPDATE profiles SET following_count = following_count + 1 WHERE id = NEW.follower_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE profiles SET followers_count = followers_count - 1 WHERE id = OLD.following_id;
    UPDATE profiles SET following_count = following_count - 1 WHERE id = OLD.follower_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_follow_change
  AFTER INSERT OR DELETE ON follows
  FOR EACH ROW EXECUTE FUNCTION update_follow_counts();

-- Update tweet count on profile
CREATE OR REPLACE FUNCTION update_tweets_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE profiles SET tweets_count = tweets_count + 1 WHERE id = NEW.user_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE profiles SET tweets_count = tweets_count - 1 WHERE id = OLD.user_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_tweet_change
  AFTER INSERT OR DELETE ON tweets
  FOR EACH ROW EXECUTE FUNCTION update_tweets_count();

-- Update bookmarks count
CREATE OR REPLACE FUNCTION update_bookmarks_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE tweets SET bookmarks_count = bookmarks_count + 1 WHERE id = NEW.tweet_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE tweets SET bookmarks_count = bookmarks_count - 1 WHERE id = OLD.tweet_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_bookmark_change
  AFTER INSERT OR DELETE ON bookmarks
  FOR EACH ROW EXECUTE FUNCTION update_bookmarks_count();

-- =============================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE tweets ENABLE ROW LEVEL SECURITY;
ALTER TABLE likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Profiles: anyone can read, only owner can update
CREATE POLICY "Profiles are publicly readable" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Tweets: anyone can read, only author can delete
CREATE POLICY "Tweets are publicly readable" ON tweets FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create tweets" ON tweets FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Authors can delete own tweets" ON tweets FOR DELETE USING (auth.uid() = user_id);

-- Likes
CREATE POLICY "Likes are publicly readable" ON likes FOR SELECT USING (true);
CREATE POLICY "Authenticated users can like" ON likes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can unlike" ON likes FOR DELETE USING (auth.uid() = user_id);

-- Follows
CREATE POLICY "Follows are publicly readable" ON follows FOR SELECT USING (true);
CREATE POLICY "Authenticated users can follow" ON follows FOR INSERT WITH CHECK (auth.uid() = follower_id);
CREATE POLICY "Users can unfollow" ON follows FOR DELETE USING (auth.uid() = follower_id);

-- Bookmarks
CREATE POLICY "Users can see own bookmarks" ON bookmarks FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Authenticated users can bookmark" ON bookmarks FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can remove bookmarks" ON bookmarks FOR DELETE USING (auth.uid() = user_id);

-- Notifications
CREATE POLICY "Users can see own notifications" ON notifications FOR SELECT USING (auth.uid() = recipient_id);
CREATE POLICY "System can create notifications" ON notifications FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can mark own notifications read" ON notifications FOR UPDATE USING (auth.uid() = recipient_id);

-- Messages
CREATE POLICY "Users can see own messages" ON messages FOR SELECT USING (auth.uid() = sender_id OR auth.uid() = recipient_id);
CREATE POLICY "Authenticated users can send messages" ON messages FOR INSERT WITH CHECK (auth.uid() = sender_id);

-- =============================================
-- STORAGE BUCKETS
-- =============================================
-- Run these separately in Supabase Dashboard > Storage or via the API:
-- 1. Create bucket: "avatars" (public)
-- 2. Create bucket: "banners" (public)
-- 3. Create bucket: "tweet-images" (public)

-- Storage policies (run after creating buckets):
-- INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true);
-- INSERT INTO storage.buckets (id, name, public) VALUES ('banners', 'banners', true);
-- INSERT INTO storage.buckets (id, name, public) VALUES ('tweet-images', 'tweet-images', true);

-- =============================================
-- INDEXES
-- =============================================
CREATE INDEX idx_tweets_user_id ON tweets(user_id);
CREATE INDEX idx_tweets_created_at ON tweets(created_at DESC);
CREATE INDEX idx_tweets_reply_to ON tweets(reply_to);
CREATE INDEX idx_likes_tweet_id ON likes(tweet_id);
CREATE INDEX idx_likes_user_id ON likes(user_id);
CREATE INDEX idx_follows_follower ON follows(follower_id);
CREATE INDEX idx_follows_following ON follows(following_id);
CREATE INDEX idx_bookmarks_user_id ON bookmarks(user_id);
CREATE INDEX idx_notifications_recipient ON notifications(recipient_id);
CREATE INDEX idx_messages_sender ON messages(sender_id);
CREATE INDEX idx_messages_recipient ON messages(recipient_id);
