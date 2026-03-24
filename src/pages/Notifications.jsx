import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { formatDistanceToNow } from 'date-fns'
import Layout from '../components/Layout'
import { useNotifications } from '../hooks/useNotifications'
import styles from './Notifications.module.css'

const typeConfig = {
  like: { icon: 'heart', color: '#f4212e', label: 'liked your post' },
  retweet: { icon: 'retweet', color: '#00ba7c', label: 'reposted your post' },
  reply: { icon: 'reply', color: '#1d9bf0', label: 'replied to your post' },
  follow: { icon: 'follow', color: '#1d9bf0', label: 'followed you' },
  mention: { icon: 'mention', color: '#1d9bf0', label: 'mentioned you' },
}

function NotifIcon({ type }) {
  const cfg = typeConfig[type] || typeConfig.like
  const icons = {
    heart: <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>,
    retweet: <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 014-4h14"/><polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 01-4 4H3"/></svg>,
    reply: <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2v10z"/></svg>,
    follow: <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
    mention: <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="4"/><path d="M16 8v5a3 3 0 006 0v-1a10 10 0 10-3.92 7.94"/></svg>,
  }
  return <span style={{ color: cfg.color }}>{icons[cfg.icon]}</span>
}

export default function Notifications() {
  const { notifications, loading, markAllRead } = useNotifications()

  useEffect(() => {
    markAllRead()
  }, [])

  return (
    <Layout>
      <div className={styles.header}>
        <h1 className={styles.title}>Notifications</h1>
      </div>

      {loading ? (
        <div className={styles.loading}>Loading...</div>
      ) : notifications.length === 0 ? (
        <div className={styles.empty}>
          <h3>Nothing to see here yet</h3>
          <p>When someone interacts with you, it will show up here.</p>
        </div>
      ) : (
        notifications.map(n => (
          <div key={n.id} className={`${styles.notif} ${!n.read ? styles.unread : ''}`}>
            <div className={styles.notifIcon}>
              <NotifIcon type={n.type} />
            </div>
            <div className={styles.notifContent}>
              <Link to={`/${n.actor?.username}`} className={styles.actor}>
                {n.actor?.display_name}
              </Link>
              {' '}
              <span className={styles.action}>{typeConfig[n.type]?.label || 'interacted with you'}</span>
              {n.tweet?.content && (
                <p className={styles.tweetPreview}>{n.tweet.content.slice(0, 80)}{n.tweet.content.length > 80 ? '...' : ''}</p>
              )}
              <span className={styles.time}>{formatDistanceToNow(new Date(n.created_at), { addSuffix: true })}</span>
            </div>
          </div>
        ))
      )}
    </Layout>
  )
}
