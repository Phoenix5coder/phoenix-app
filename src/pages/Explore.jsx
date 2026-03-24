import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import Layout from '../components/Layout'
import TweetCard from '../components/TweetCard'
import { useExploreTweets } from '../hooks/useTweets'
import { useSearch } from '../hooks/useSearch'
import { Link } from 'react-router-dom'
import styles from './Explore.module.css'

export default function Explore() {
  const [searchParams] = useSearchParams()
  const initialQ = searchParams.get('q') || ''
  const [query, setQuery] = useState(initialQ)
  const [submitted, setSubmitted] = useState(!!initialQ)
  const { tweets, loading } = useExploreTweets()
  const { results, loading: searchLoading, search } = useSearch()
  const navigate = useNavigate()

  function handleSearch(e) {
    const val = e.target.value
    setQuery(val)
    if (val.trim()) { search(val); setSubmitted(true) }
    else setSubmitted(false)
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query)}`)
    }
  }

  return (
    <Layout hideRightSidebar>
      <div className={styles.header}>
        <div className={styles.searchBox}>
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" className={styles.searchIcon}>
            <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
          </svg>
          <input
            className={styles.searchInput}
            type="text"
            placeholder="Search Phoenix"
            value={query}
            onChange={handleSearch}
            onKeyDown={handleKeyDown}
            autoFocus
          />
          {query && (
            <button onClick={() => { setQuery(''); setSubmitted(false) }} className={styles.clearBtn}>
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          )}
        </div>
      </div>

      {submitted ? (
        <div>
          {results.users.length > 0 && (
            <div className={styles.section}>
              <h2 className={styles.sectionTitle}>People</h2>
              {results.users.map(u => (
                <Link key={u.id} to={`/${u.username}`} className={styles.userResult}>
                  {u.avatar_url
                    ? <img src={u.avatar_url} alt="" className={styles.userAvatar} />
                    : <div className={styles.userAvatarPlaceholder}>{u.display_name[0]}</div>
                  }
                  <div>
                    <p className={styles.userDisplayName}>{u.display_name}</p>
                    <p className={styles.userUsername}>@{u.username}</p>
                    {u.bio && <p className={styles.userBio}>{u.bio}</p>}
                  </div>
                </Link>
              ))}
            </div>
          )}
          {results.tweets.length > 0 && (
            <div>
              <h2 className={styles.sectionTitle} style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)' }}>Posts</h2>
              {results.tweets.map(t => (
                <TweetCard key={t.id} tweet={t} />
              ))}
            </div>
          )}
          {!searchLoading && results.users.length === 0 && results.tweets.length === 0 && (
            <div className={styles.empty}>No results for "{query}"</div>
          )}
        </div>
      ) : (
        <div>
          <h2 className={styles.sectionTitle} style={{ padding: '16px', borderBottom: '1px solid var(--border)' }}>
            Latest posts
          </h2>
          {loading ? (
            <div className={styles.loading}>Loading...</div>
          ) : (
            tweets.map(tweet => <TweetCard key={tweet.id} tweet={tweet} />)
          )}
        </div>
      )}
    </Layout>
  )
}
