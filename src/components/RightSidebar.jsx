import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useSearch } from '../hooks/useSearch'
import { useSuggestedUsers } from '../hooks/useProfile'
import { useIsFollowing } from '../hooks/useProfile'
import styles from './RightSidebar.module.css'

function SuggestedUser({ profile }) {
  const { isFollowing, toggleFollow } = useIsFollowing(profile.id)
  return (
    <div className={styles.suggestedUser}>
      <Link to={`/${profile.username}`} className={styles.suggestedInfo}>
        {profile.avatar_url
          ? <img src={profile.avatar_url} alt="" className={styles.avatar} />
          : <div className={styles.avatarPlaceholder}>{profile.display_name[0]}</div>
        }
        <div>
          <p className={styles.displayName}>{profile.display_name}</p>
          <p className={styles.username}>@{profile.username}</p>
        </div>
      </Link>
      <button
        className={`${styles.followBtn} ${isFollowing ? styles.following : ''}`}
        onClick={toggleFollow}
      >
        {isFollowing ? 'Following' : 'Follow'}
      </button>
    </div>
  )
}

export default function RightSidebar() {
  const [query, setQuery] = useState('')
  const { results, loading, search } = useSearch()
  const { users: suggested } = useSuggestedUsers()
  const navigate = useNavigate()

  function handleSearch(e) {
    const val = e.target.value
    setQuery(val)
    search(val)
  }

  function handleSearchSubmit(e) {
    if (e.key === 'Enter' && query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query)}`)
    }
  }

  return (
    <aside className={styles.aside}>
      <div className={styles.searchWrap}>
        <div className={styles.searchBox}>
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" className={styles.searchIcon}>
            <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
          </svg>
          <input
            className={styles.searchInput}
            type="text"
            placeholder="Search"
            value={query}
            onChange={handleSearch}
            onKeyDown={handleSearchSubmit}
          />
        </div>

        {query && results.users.length > 0 && (
          <div className={styles.searchDropdown}>
            {results.users.map(u => (
              <Link key={u.id} to={`/${u.username}`} className={styles.dropdownUser} onClick={() => setQuery('')}>
                {u.avatar_url
                  ? <img src={u.avatar_url} alt="" className={styles.dropdownAvatar} />
                  : <div className={styles.dropdownAvatarPlaceholder}>{u.display_name[0]}</div>
                }
                <div>
                  <p className={styles.dropdownName}>{u.display_name}</p>
                  <p className={styles.dropdownUsername}>@{u.username}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {suggested.length > 0 && (
        <div className={styles.card}>
          <h2 className={styles.cardTitle}>Who to follow</h2>
          {suggested.map(u => <SuggestedUser key={u.id} profile={u} />)}
          <Link to="/explore" className={styles.showMore}>Show more</Link>
        </div>
      )}

      <div className={styles.footer}>
        <p>© 2025 X Clone • Built with React & Supabase</p>
      </div>
    </aside>
  )
}
