import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { formatDistanceToNow } from 'date-fns'
import { useAuth } from '../context/AuthContext'
import { toggleLike, toggleBookmark, deleteTweet } from '../hooks/useTweets'
import styles from './TweetCard.module.css'
import ImageCarousel from './ImageCarousel'

function Avatar({ profile, size = 44 }) {
  if (profile?.avatar_url) {
    return <img src={profile.avatar_url} alt={profile.display_name} className={styles.avatar} style={{ width: size, height: size }} />
  }
  return (
    <div className={styles.avatarPlaceholder} style={{ width: size, height: size, fontSize: size * 0.4 }}>
      {profile?.display_name?.[0] || '?'}
    </div>
  )
}

export default function TweetCard({ tweet, onUpdate, compact = false }) {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [liked, setLiked] = useState(tweet.likes?.some(l => l.user_id === user?.id))
  const [bookmarked, setBookmarked] = useState(tweet.bookmarks?.some(b => b.user_id === user?.id))
  const [likeCount, setLikeCount] = useState(tweet.likes_count || 0)
  const [bookmarkCount, setBookmarkCount] = useState(tweet.bookmarks_count || 0)
  const [showMenu, setShowMenu] = useState(false)

  if (!tweet?.profiles) return null

  const isOwner = user?.id === tweet.user_id
  const timeAgo = formatDistanceToNow(new Date(tweet.created_at), { addSuffix: true })

  async function handleLike(e) {
    e.stopPropagation()
    if (!user) return navigate('/login')
    if (isOwner) return
    setLiked(!liked)
    setLikeCount(c => liked ? c - 1 : c + 1)
    await toggleLike(tweet.id, user.id, liked)
  }

  async function handleBookmark(e) {
    e.stopPropagation()
    if (!user) return navigate('/login')
    setBookmarked(!bookmarked)
    setBookmarkCount(c => bookmarked ? c - 1 : c + 1)
    await toggleBookmark(tweet.id, user.id, bookmarked)
  }

  async function handleDelete(e) {
    e.stopPropagation()
    if (!confirm('Delete this post?')) return
    setShowMenu(false)
    await deleteTweet(tweet.id)
    onUpdate?.()
  }

  function handleReply(e) {
    e.stopPropagation()
    if (!user) return navigate('/login')
    navigate(`/tweet/${tweet.id}`)
  }

  function handleShare(e) {
    e.stopPropagation()
    navigator.clipboard?.writeText(`${window.location.origin}/tweet/${tweet.id}`)
  }

  return (
    <article
      className={`${styles.tweet} ${compact ? styles.compact : ''}`}
      onClick={() => navigate(`/tweet/${tweet.id}`)}
    >
      <Link to={`/${tweet.profiles.username}`} onClick={e => e.stopPropagation()}>
        <Avatar profile={tweet.profiles} />
      </Link>

      <div className={styles.content}>
        <div className={styles.header}>
          <Link to={`/${tweet.profiles.username}`} className={styles.authorLink} onClick={e => e.stopPropagation()}>
            <span className={styles.displayName}>{tweet.profiles.display_name}</span>
            <span className={styles.username}>@{tweet.profiles.username}</span>
          </Link>
          <span className={styles.dot}>·</span>
          <span className={styles.time}>{timeAgo}</span>
          {isOwner && (
            <div className={styles.menuWrap}>
              <button
                className={styles.menuBtn}
                onClick={e => { e.stopPropagation(); setShowMenu(!showMenu) }}
              >
                <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                  <circle cx="5" cy="12" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="19" cy="12" r="1.5"/>
                </svg>
              </button>
              {showMenu && (
                <div className={styles.menu} onClick={e => e.stopPropagation()}>
                  <button className={`${styles.menuItem} ${styles.danger}`} onClick={handleDelete}>
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/>
                    </svg>
                    Delete
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {tweet.reply_to && (
          <p className={styles.replyingTo}>Replying to a post</p>
        )}

        <p className={styles.text}>{tweet.content}</p>

        {tweet.image_url && (
          <img src={tweet.image_url} alt="" className={styles.tweetImage} onClick={e => e.stopPropagation()} />
        )}

        <div className={styles.actions}>
          <button className={`${styles.action} ${styles.reply}`} onClick={handleReply}>
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2v10z"/>
            </svg>
            <span>{tweet.replies_count || 0}</span>
          </button>

          {/*<button className={`${styles.action} ${styles.retweet}`} onClick={e => e.stopPropagation()}>
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8">
              <polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 014-4h14"/><polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 01-4 4H3"/>
            </svg>
            <span>{tweet.retweets_count || 0}</span>
          </button>*/}

          <button
            className={`${styles.action} ${styles.like} ${liked ? styles.liked : ''}`}
            onClick={handleLike}
            disabled={isOwner}
            title={isOwner ? "You can't like your own post" : "Like"}
          >
            <svg viewBox="0 0 24 24" width="18" height="18" fill={liked ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.8">
              <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/>
            </svg>
            <span>{likeCount}</span>
          </button>

          <button
            className={`${styles.action} ${styles.bookmark} ${bookmarked ? styles.bookmarked : ''}`}
            onClick={handleBookmark}
          >
            <svg viewBox="0 0 24 24" width="18" height="18" fill={bookmarked ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.8">
              <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2v16z"/>
            </svg>
            <span>{bookmarkCount}</span>
          </button>

          {/*<button className={`${styles.action} ${styles.share}`} onClick={handleShare}>
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/>
            </svg>
          </button>*/}
        </div>
      </div>
    </article>
  )
}
