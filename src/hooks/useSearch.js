import { useState } from 'react'
import { supabase } from '../lib/supabase'

export function useSearch() {
  const [results, setResults] = useState({ users: [], tweets: [] })
  const [loading, setLoading] = useState(false)

  async function search(query) {
    if (!query.trim()) { setResults({ users: [], tweets: [] }); return }
    setLoading(true)

    const [usersRes, tweetsRes] = await Promise.all([
      supabase.from('profiles').select('*')
        .or(`username.ilike.%${query}%,display_name.ilike.%${query}%`)
        .limit(5),
      supabase.from('tweets').select(`*, profiles(*)`)
        .ilike('content', `%${query}%`)
        .order('created_at', { ascending: false })
        .limit(20)
    ])

    setResults({ users: usersRes.data || [], tweets: tweetsRes.data || [] })
    setLoading(false)
  }

  return { results, loading, search }
}
