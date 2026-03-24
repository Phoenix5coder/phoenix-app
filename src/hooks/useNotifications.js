import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'

export function useNotifications() {
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()

  useEffect(() => {
    if (!user) return
    fetchNotifications()
    const channel = supabase.channel('notifications')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notifications', filter: `recipient_id=eq.${user.id}` },
        payload => {
          setNotifications(prev => [payload.new, ...prev])
          setUnreadCount(c => c + 1)
        }
      ).subscribe()
    return () => supabase.removeChannel(channel)
  }, [user])

  async function fetchNotifications() {
    setLoading(true)
    const { data } = await supabase
      .from('notifications')
      .select(`*, actor:actor_id(username, display_name, avatar_url), tweet:tweet_id(content)`)
      .eq('recipient_id', user.id)
      .order('created_at', { ascending: false })
      .limit(50)
    setNotifications(data || [])
    setUnreadCount(data?.filter(n => !n.read).length || 0)
    setLoading(false)
  }

  async function markAllRead() {
    await supabase.from('notifications').update({ read: true }).eq('recipient_id', user.id).eq('read', false)
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
    setUnreadCount(0)
  }

  return { notifications, unreadCount, loading, markAllRead }
}
