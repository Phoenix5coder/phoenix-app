# Phoenix 🔥

A full-stack social media platform with real-time features, built with React and Supabase. 

**Tech:** React 18 · React Router 6 · Supabase (PostgreSQL, Auth, Storage, Realtime) · Vite · CSS Modules

---

## What I Built

- **Real-time DMs** — Direct messaging with image sharing and emoji reactions, powered by Supabase Realtime channels
- **Social graph** — Follow/unfollow system with a Following feed that filters posts from people you actually follow
- **Image uploads** — Attach images to posts, stored in Supabase Storage with public CDN delivery
- **Search** — Full-text search across users and posts with live dropdown results
- **Notifications** — Real-time activity notifications for likes, replies, and follows
- **Auth** — Secure email/password authentication with auto-generated profiles via Postgres triggers
- **Mobile responsive** — Full bottom nav and layout rework for mobile

---

## Technical Decisions Worth Noting

**Postgres triggers for count consistency** — Likes, replies, followers, and bookmark counts are maintained by database triggers rather than the frontend. This prevents race conditions and keeps counts accurate across all clients.

**Row Level Security** — Every table has RLS policies enforced at the database level so unauthorized writes are rejected even if someone bypasses the UI.

**Optimistic UI** — Likes and bookmarks update instantly before the database confirms, with rollback on failure. Keeps interactions feeling snappy.

**Custom hooks for data fetching** — All Supabase queries live in dedicated hooks (`useFeed`, `useMessages`, `useNotifications`) keeping components focused purely on rendering.

---

## Author

**Madison Miles** · [GitHub](https://github.com/Phoenix5coder)
