import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'

export function useProfile(username) {
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()

  useEffect(() => { if (username) fetchProfile() }, [username])

  async function fetchProfile() {
    setLoading(true)
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('username', username)
      .single()
    setProfile(data)
    setLoading(false)
  }

  return { profile, loading, refetch: fetchProfile }
}

export function useIsFollowing(targetUserId) {
  const [isFollowing, setIsFollowing] = useState(false)
  const { user } = useAuth()

  useEffect(() => {
    if (user && targetUserId) checkFollowing()
  }, [user, targetUserId])

  async function checkFollowing() {
    const { data } = await supabase
      .from('follows')
      .select('id')
      .eq('follower_id', user.id)
      .eq('following_id', targetUserId)
      .maybeSingle()
    setIsFollowing(!!data)
  }

  async function toggleFollow() {
    if (!user) return
    if (isFollowing) {
      await supabase.from('follows').delete()
        .eq('follower_id', user.id).eq('following_id', targetUserId)
      setIsFollowing(false)
    } else {
      await supabase.from('follows').insert({ follower_id: user.id, following_id: targetUserId })
      setIsFollowing(true)
    }
  }

  return { isFollowing, toggleFollow }
}

export function useSuggestedUsers() {
  const [users, setUsers] = useState([])
  const { user } = useAuth()

  useEffect(() => { if (user) fetchSuggestions() }, [user])

  async function fetchSuggestions() {
    const { data: follows } = await supabase
      .from('follows')
      .select('following_id')
      .eq('follower_id', user.id)

    const followingIds = [user.id, ...(follows?.map(f => f.following_id) || [])]

    const { data } = await supabase
      .from('profiles')
      .select('*')
      .not('id', 'in', `(${followingIds.join(',')})`)
      .order('followers_count', { ascending: false })
      .limit(3)

    setUsers(data || [])
  }

  return { users }
}

export async function uploadAvatar(file, userId) {
  const ext = file.name.split('.').pop()
  const path = `${userId}/avatar.${ext}`
  const { error } = await supabase.storage.from('avatars').upload(path, file, { upsert: true })
  if (error) return { error }
  const { data } = supabase.storage.from('avatars').getPublicUrl(path)
  return { url: data.publicUrl }
}

export async function uploadBanner(file, userId) {
  const ext = file.name.split('.').pop()
  const path = `${userId}/banner.${ext}`
  const { error } = await supabase.storage.from('banners').upload(path, file, { upsert: true })
  if (error) return { error }
  const { data } = supabase.storage.from('banners').getPublicUrl(path)
  return { url: data.publicUrl }
}
