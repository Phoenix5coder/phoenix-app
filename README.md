# X Clone — Full Stack React + Supabase

A full-featured X (Twitter) clone built with React and Supabase.

## Features

- **Auth** — Sign up / sign in with email & password (Supabase Auth)
- **Feed** — Home timeline showing posts from people you follow
- **Post** — Create posts up to 280 characters, attach images
- **Replies** — Threaded replies on any post
- **Likes & Bookmarks** — Like and bookmark posts with real-time counts
- **Retweets** — Repost any tweet
- **Profiles** — View & edit profile, upload avatar & banner
- **Follow system** — Follow/unfollow users with follower/following counts
- **Explore** — Browse all latest posts, full-text search for users & posts
- **Notifications** — Real-time notifications for likes, replies, follows, mentions
- **Responsive** — Works on desktop, tablet, and mobile

---

## Tech Stack

| Layer | Tech |
|-------|------|
| Frontend | React 18, React Router 6, CSS Modules |
| Backend | Supabase (Postgres, Auth, Storage, Realtime) |
| Build | Vite |
| Date formatting | date-fns |

---

## Setup

### 1. Create a Supabase project

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Wait for the project to be provisioned

### 2. Run the database schema

1. In your Supabase dashboard, go to **SQL Editor**
2. Paste the entire contents of `supabase_schema.sql` and run it
3. This creates all tables, triggers, functions, RLS policies, and indexes

### 3. Create storage buckets

In your Supabase dashboard, go to **Storage** and create these 3 public buckets:
- `avatars`
- `banners`
- `tweet-images`

For each bucket, set the following storage policy (in the bucket's Policies tab):

```sql
-- Allow public reads
CREATE POLICY "Public read" ON storage.objects FOR SELECT USING (bucket_id = 'avatars');

-- Allow authenticated uploads
CREATE POLICY "Auth upload" ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'avatars' AND auth.role() = 'authenticated');

-- Allow users to update their own files
CREATE POLICY "Owner update" ON storage.objects FOR UPDATE
  USING (auth.uid()::text = (storage.foldername(name))[1]);
```

Repeat for `banners` and `tweet-images`.

### 4. Configure environment variables

```bash
cp .env.example .env
```

Fill in your values from Supabase project settings → API:

```env
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-public-key
```

### 5. Install & run

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

---

## Project Structure

```
src/
├── components/
│   ├── Layout.jsx          # App shell with sidebar
│   ├── Sidebar.jsx         # Left navigation
│   ├── RightSidebar.jsx    # Search + who to follow
│   ├── TweetCard.jsx       # Individual tweet display
│   └── TweetComposer.jsx   # Tweet creation form
├── context/
│   └── AuthContext.jsx     # Auth state + helpers
├── hooks/
│   ├── useTweets.js        # Feed, create, like, bookmark hooks
│   ├── useProfile.js       # Profile, follow, suggestions hooks
│   ├── useSearch.js        # Search hook
│   └── useNotifications.js # Notifications + realtime hook
├── lib/
│   └── supabase.js         # Supabase client
└── pages/
    ├── Auth.jsx             # Login + Signup pages
    ├── Home.jsx             # Home feed
    ├── Explore.jsx          # Explore / Search results
    ├── Notifications.jsx    # Notifications list
    ├── Bookmarks.jsx        # Saved bookmarks
    ├── Profile.jsx          # User profile + edit
    ├── TweetDetail.jsx      # Single tweet + replies
    └── Compose.jsx          # Mobile compose modal
```

---

## Database Schema

```
profiles         — user profiles (extends auth.users)
tweets           — posts, replies, retweets
likes            — many-to-many users ↔ tweets
follows          — many-to-many users ↔ users
bookmarks        — many-to-many users ↔ tweets
notifications    — activity notifications
messages         — direct messages (schema ready)
```

All tables have RLS policies. Counts (likes, followers, etc.) are maintained automatically via Postgres triggers.

---

## Deployment

### Vercel (recommended)

```bash
npm run build
# Deploy the dist/ folder, or connect your repo to Vercel
```

Set the same environment variables (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`) in your Vercel project settings.

### Netlify

Same as Vercel — connect repo, set env vars, build command `npm run build`, publish directory `dist`.

---

## Extending

Some ideas for further development:
- **Direct messages** — schema already included, build the UI
- **Lists** — curated feeds of specific users
- **Trending topics** — aggregate hashtag counts
- **Push notifications** — via Supabase Realtime + Web Push API
- **Infinite scroll** — paginate feeds with cursor-based pagination
- **Tweet scheduling** — store `publish_at` and process with a cron edge function
