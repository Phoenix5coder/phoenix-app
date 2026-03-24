import Layout from '../components/Layout'
import TweetCard from '../components/TweetCard'
import { useBookmarks } from '../hooks/useTweets'
import { useAuth } from '../context/AuthContext'
import styles from './Bookmarks.module.css'

export default function Bookmarks() {
  const { tweets, loading, refetch } = useBookmarks()
  const { profile } = useAuth()

  return (
    <Layout>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Bookmarks</h1>
          {profile && <p className={styles.subtitle}>@{profile.username}</p>}
        </div>
      </div>

      {loading ? (
        <div className={styles.loading}>Loading...</div>
      ) : tweets.length === 0 ? (
        <div className={styles.empty}>
          <h3>Save posts for later</h3>
          <p>Bookmark posts to easily find them again in the future.</p>
        </div>
      ) : (
        tweets.map(tweet => (
          <TweetCard key={tweet.id} tweet={tweet} onUpdate={refetch} />
        ))
      )}
    </Layout>
  )
}
