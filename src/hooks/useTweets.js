import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'

export function useFeed(tab = 'for-you') {
  const [tweets, setTweets] = useState([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()

  useEffect(() => { if (user) fetchFeed() }, [user, tab])

  async function fetchFeed() {
    setLoading(true)

    const { data: follows } = await supabase
      .from('follows')
      .select('following_id')
      .eq('follower_id', user.id)

    const followingIds = follows?.map(f => f.following_id) || []

    if (tab === 'following') {
      if (followingIds.length === 0) {
        setTweets([])
        setLoading(false)
        return
      }

      const { data } = await supabase
        .from('tweets')
        .select('*, profiles(*), likes(user_id), bookmarks(user_id)')
        .in('user_id', followingIds)
        .is('reply_to', null)
        .order('created_at', { ascending: false })
        .limit(50)

      setTweets(data || [])
    } else {
      const { data } = await supabase
        .from('tweets')
        .select('*, profiles(*), likes(user_id), bookmarks(user_id)')
        .in('user_id', [user.id, ...followingIds])
        .is('reply_to', null)
        .order('created_at', { ascending: false })
        .limit(50)

      setTweets(data || [])
    }

    setLoading(false)
  }

  return { tweets, loading, refetch: fetchFeed, setTweets }
}

export function useExploreTweets() {
  const [tweets, setTweets] = useState([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()

  useEffect(() => { fetchExplore() }, [])

  async function fetchExplore() {
    setLoading(true)
    const { data } = await supabase
      .from('tweets')
      .select(`*, profiles(*), likes(user_id), bookmarks(user_id)`)
      .is('reply_to', null)
      .is('retweet_of', null)
      .order('created_at', { ascending: false })
      .limit(50)

    setTweets(data || [])
    setLoading(false)
  }

  return { tweets, loading, refetch: fetchExplore, setTweets }
}

export function useProfileTweets(username) {
  const [tweets, setTweets] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { if (username) fetchProfileTweets() }, [username])

  async function fetchProfileTweets() {
    setLoading(true)
    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('username', username)
      .single()

    if (!profile) { setLoading(false); return }

    const { data } = await supabase
      .from('tweets')
      .select(`*, profiles(*), likes(user_id), bookmarks(user_id)`)
      .eq('user_id', profile.id)
      .is('reply_to', null)
      .order('created_at', { ascending: false })

    setTweets(data || [])
    setLoading(false)
  }

  return { tweets, loading, refetch: fetchProfileTweets, setTweets }
}

export function useTweetReplies(tweetId) {
  const [replies, setReplies] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { if (tweetId) fetchReplies() }, [tweetId])

  async function fetchReplies() {
    setLoading(true)
    const { data } = await supabase
      .from('tweets')
      .select(`*, profiles(*), likes(user_id), bookmarks(user_id)`)
      .eq('reply_to', tweetId)
      .order('created_at', { ascending: false })

    setReplies(data || [])
    setLoading(false)
  }

  return { replies, loading, refetch: fetchReplies }
}

export async function createTweet({ content, userId, replyTo = null, retweetOf = null, imageUrl = null }) {
  const { data, error } = await supabase
    .from('tweets')
    .insert({ content, user_id: userId, reply_to: replyTo, retweet_of: retweetOf, image_url: imageUrl })
    .select(`*, profiles(*), likes(user_id), bookmarks(user_id)`)
    .single()
  return { data, error }
}

export async function deleteTweet(tweetId) {
  const { error } = await supabase.from('tweets').delete().eq('id', tweetId)
  return { error }
}

export async function toggleLike(tweetId, userId, isLiked) {
  if (isLiked) {
    return supabase.from('likes').delete().eq('tweet_id', tweetId).eq('user_id', userId)
  } else {
    return supabase.from('likes').insert({ tweet_id: tweetId, user_id: userId })
  }
}

export async function toggleBookmark(tweetId, userId, isBookmarked) {
  if (isBookmarked) {
    return supabase.from('bookmarks').delete().eq('tweet_id', tweetId).eq('user_id', userId)
  } else {
    return supabase.from('bookmarks').insert({ tweet_id: tweetId, user_id: userId })
  }
}

export async function retweetPost(tweetId, userId, content = '🔁') {
  return supabase.from('tweets').insert({
    content,
    user_id: userId,
    retweet_of: tweetId
  })
}

export function useBookmarks() {
  const [tweets, setTweets] = useState([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()

  useEffect(() => { if (user) fetchBookmarks() }, [user])

  async function fetchBookmarks() {
    setLoading(true)
    const { data } = await supabase
      .from('bookmarks')
      .select(`tweet_id, tweets(*, profiles(*), likes(user_id), bookmarks(user_id))`)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    setTweets(data?.map(b => b.tweets).filter(Boolean) || [])
    setLoading(false)
  }

  return { tweets, loading, refetch: fetchBookmarks }
}
