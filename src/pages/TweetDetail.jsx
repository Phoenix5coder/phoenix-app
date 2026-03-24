import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import Layout from '../components/Layout'
import TweetCard from '../components/TweetCard'
import TweetComposer from '../components/TweetComposer'
import { useTweetReplies } from '../hooks/useTweets'
import styles from './TweetDetail.module.css'

export default function TweetDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [tweet, setTweet] = useState(null)
  const [loading, setLoading] = useState(true)
  const { replies, loading: repliesLoading, refetch } = useTweetReplies(id)

  useEffect(() => { fetchTweet() }, [id])

  async function fetchTweet() {
    setLoading(true)
    const { data } = await supabase
      .from('tweets')
      .select('*, profiles(*), likes(user_id), bookmarks(user_id)')
      .eq('id', id)
      .single()
    setTweet(data)
    setLoading(false)
  }

  function handleReply(newReply) {
    refetch()
  }

  if (loading) return (
    <Layout>
      <div className={styles.loading}>Loading...</div>
    </Layout>
  )

  if (!tweet) return (
    <Layout>
      <div className={styles.notFound}>Post not found</div>
    </Layout>
  )

  return (
    <Layout>
      <div className={styles.header}>
        <button className={styles.backBtn} onClick={() => navigate(-1)}>
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 5l-7 7 7 7"/>
          </svg>
        </button>
        <h1 className={styles.title}>Post</h1>
      </div>

      <TweetCard tweet={tweet} onUpdate={fetchTweet} />

      <div className={styles.replyComposer}>
        <TweetComposer
          onTweet={handleReply}
          replyTo={id}
          placeholder="Post your reply"
        />
      </div>

      <div className={styles.replies}>
        {repliesLoading ? (
          <div className={styles.loading}>Loading replies...</div>
        ) : replies.length === 0 ? (
          <div className={styles.empty}>No replies yet. Be the first!</div>
        ) : (
          replies.map(reply => (
            <TweetCard key={reply.id} tweet={reply} onUpdate={refetch} />
          ))
        )}
      </div>
    </Layout>
  )
}
