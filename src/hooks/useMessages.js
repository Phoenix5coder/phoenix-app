import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'

export function useConversations() {
  const [conversations, setConversations] = useState([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()

  useEffect(() => { if (user) fetchConversations() }, [user])

  async function fetchConversations() {
    setLoading(true)

    const { data } = await supabase
      .from('messages')
      .select(`*, sender:sender_id(id, username, display_name, avatar_url), recipient:recipient_id(id, username, display_name, avatar_url)`)
      .or(`sender_id.eq.${user.id},recipient_id.eq.${user.id}`)
      .order('created_at', { ascending: false })

    // Group into unique conversations
    const seen = new Set()
    const convos = []
    for (const msg of data || []) {
      const otherId = msg.sender_id === user.id ? msg.recipient_id : msg.sender_id
      if (!seen.has(otherId)) {
        seen.add(otherId)
        const otherProfile = msg.sender_id === user.id ? msg.recipient : msg.sender
        convos.push({ profile: otherProfile, lastMessage: msg })
      }
    }

    setConversations(convos)
    setLoading(false)
  }

  return { conversations, loading, refetch: fetchConversations }
}

export function useMessages(otherUserId) {
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()

  useEffect(() => {
    if (!user || !otherUserId) return
    fetchMessages()

    const channel = supabase.channel(`messages-${otherUserId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `recipient_id=eq.${user.id}`
      }, payload => {
        if (payload.new.sender_id === otherUserId) {
          fetchMessages()
        }
      }).subscribe()

    return () => supabase.removeChannel(channel)
  }, [user, otherUserId])

  async function fetchMessages() {
    setLoading(true)
    const { data } = await supabase
      .from('messages')
      .select(`*, sender:sender_id(id, username, display_name, avatar_url)`)
      .or(`and(sender_id.eq.${user.id},recipient_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},recipient_id.eq.${user.id})`)
      .order('created_at', { ascending: true })

    setMessages(data || [])
    setLoading(false)
  }

  async function sendMessage(content, imageUrl = null) {
    const { data, error } = await supabase
      .from('messages')
      .insert({
        sender_id: user.id,
        recipient_id: otherUserId,
        content,
        image_url: imageUrl
      })
      .select(`*, sender:sender_id(id, username, display_name, avatar_url)`)
      .single()

    if (!error) setMessages(prev => [...prev, data])
    return { data, error }
  }

  async function addReaction(messageId, emoji) {
    const msg = messages.find(m => m.id === messageId)
    if (!msg) return

    const reactions = msg.reactions || {}
    const users = reactions[emoji] || []
    const alreadyReacted = users.includes(user.id)

    const updatedReactions = {
      ...reactions,
      [emoji]: alreadyReacted
        ? users.filter(id => id !== user.id)
        : [...users, user.id]
    }

    const { error } = await supabase
      .from('messages')
      .update({ reactions: updatedReactions })
      .eq('id', messageId)

    if (!error) {
      setMessages(prev => prev.map(m =>
        m.id === messageId ? { ...m, reactions: updatedReactions } : m
      ))
    }
  }

  async function uploadImage(file) {
    const ext = file.name.split('.').pop()
    const path = `${user.id}/${Date.now()}.${ext}`
    const { error } = await supabase.storage.from('message-images').upload(path, file)
    if (error) return { error }
    const { data } = supabase.storage.from('message-images').getPublicUrl(path)
    return { url: data.publicUrl }
  }

  return { messages, loading, sendMessage, addReaction, uploadImage }
}