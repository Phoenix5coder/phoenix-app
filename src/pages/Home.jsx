import { useState } from 'react'
import Layout from '../components/Layout'
import TweetComposer from '../components/TweetComposer'
import TweetCard from '../components/TweetCard'
import { useFeed } from '../hooks/useTweets'
import styles from './Home.module.css'

export default function Home() {
  const { tweets, loading, refetch, setTweets } = useFeed()
  const [tab, setTab] = useState('for-you')

  function handleNewTweet(tweet) {
    setTweets(prev => [tweet, ...prev])
  }

  return (
    <Layout>
      <div className={styles.header}>
        <h1 className={styles.title}>Home</h1>
        <div className={styles.tabs}>
          <button className={`${styles.tab} ${tab === 'for-you' ? styles.active : ''}`} onClick={() => setTab('for-you')}>
            For you
          </button>
          <button className={`${styles.tab} ${tab === 'following' ? styles.active : ''}`} onClick={() => setTab('following')}>
            Following
          </button>
        </div>
      </div>

      <TweetComposer onTweet={handleNewTweet} />

      {loading ? (
        <div className={styles.loading}>
          {[...Array(5)].map((_, i) => <TweetSkeleton key={i} />)}
        </div>
      ) : tweets.length === 0 ? (
        <div className={styles.empty}>
          <p>No posts yet.</p>
          <p>Follow some people to see their posts here.</p>
        </div>
      ) : (
        tweets.map(tweet => (
          <TweetCard
            key={tweet.id}
            tweet={tweet}
            onUpdate={refetch}
          />
        ))
      )}
    </Layout>
  )
}

function TweetSkeleton() {
  return (
    <div className={styles.skeleton}>
      <div className={styles.skeletonAvatar} />
      <div className={styles.skeletonContent}>
        <div className={styles.skeletonLine} style={{ width: '40%', height: 14 }} />
        <div className={styles.skeletonLine} style={{ width: '100%', height: 14 }} />
        <div className={styles.skeletonLine} style={{ width: '70%', height: 14 }} />
      </div>
    </div>
  )
}
