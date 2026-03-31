import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useNotifications } from '../hooks/useNotifications'
import styles from './Sidebar.module.css'
import { useState } from 'react'
import MessagesModal from './MessagesModal'

const PhoenixLogo = () => (
  <img className={styles.logo}
    src="/logo.png" 
    alt="logo"  
  />
)

const HomeIcon = ({ filled }) => (
  <svg viewBox="0 0 24 24" width="26" height="26" fill={filled ? 'rgb(255, 0, 0)' : 'none'} stroke={filled ? 'none' : 'rgb(255, 0, 0)'} strokeWidth="2">
    <path d="M3 12L12 3l9 9v9a1 1 0 01-1 1h-5v-6H9v6H4a1 1 0 01-1-1v-9z" />
  </svg>
)

const SearchIcon = ({ filled }) => (
  <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="rgb(255, 0, 0)" strokeWidth="2">
    <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
  </svg>
)

const BellIcon = ({ filled }) => (
  <svg viewBox="0 0 24 24" width="26" height="26" fill={filled ? 'rgb(255, 0, 0)' : 'none'} stroke={filled ? 'none' : 'rgb(255, 0, 0)'} strokeWidth="2">
    <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0" />
  </svg>
)

const BookmarkIcon = ({ filled }) => (
  <svg viewBox="0 0 24 24" width="26" height="26" fill={filled ? 'rgb(255, 0, 0)' : 'none'} stroke={filled ? 'none' : 'rgb(255, 0, 0)'} strokeWidth="2">
    <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2v16z" />
  </svg>
)

const MessageIcon = ({ filled }) => (
  <svg viewBox="0 0 24 24" width="22" height="22" fill={filled ? 'rgb(255, 0, 0)' : 'none'} stroke={filled ? 'none' : 'rgb(255, 0, 0)'} strokeWidth="2">
    <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2v10z"/>
  </svg>
)

const UserIcon = ({ filled }) => (
  <svg viewBox="0 0 24 24" width="26" height="26" fill={filled ? 'rgb(255, 0, 0)' : 'none'} stroke={filled ? 'none' : 'rgb(255, 0, 0)'} strokeWidth="2">
    <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" /><circle cx="12" cy="7" r="4" />
  </svg>
)

const MoreIcon = () => (
  <svg viewBox="0 0 24 24" width="26" height="26" fill="rgb(255, 0, 0)">
    <circle cx="12" cy="5" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="12" cy="19" r="1.5"/>
  </svg>
)

export default function Sidebar() {
  const location = useLocation()
  const navigate = useNavigate()
  const { profile, signOut } = useAuth()
  const { unreadCount } = useNotifications()
  const path = location.pathname
  const [showMessages, setShowMessages] = useState(false)

  const navItems = [
    { to: '/home', label: 'Home', Icon: HomeIcon, active: path === '/home' },
    { to: '/explore', label: 'Explore', Icon: SearchIcon, active: path.startsWith('/explore') || path.startsWith('/search') },
    { to: '/notifications', label: 'Notifications', Icon: BellIcon, active: path === '/notifications', badge: unreadCount },
    { to: '/bookmarks', label: 'Bookmarks', Icon: BookmarkIcon, active: path === '/bookmarks' },
    { to: `/${profile?.username}`, label: 'Profile', Icon: UserIcon, active: path === `/${profile?.username}` },
    
  ]

  async function handleSignOut() {
    await signOut()
    navigate('/login')
  }

  return (
    <aside className={styles.sidebar}>
      <Link to="/home" className={styles.logo}>
        <PhoenixLogo />
      </Link>

      <nav className={styles.nav}>
        {navItems.map(({ to, label, Icon, active, badge }) => (
          <Link key={to} to={to} className={`${styles.navItem} ${active ? styles.active : ''}`}>
            <span className={styles.iconWrap}>
              <Icon filled={active} />
              {badge > 0 && <span className={styles.badge}>{badge > 99 ? '99+' : badge}</span>}
            </span>
            <span className={styles.label}>{label}</span>
          </Link>
        ))}
      </nav>

      <button className={styles.navItem} onClick={() => setShowMessages(true)}>
        <span className={styles.iconWrap}>
          <MessageIcon />
        </span>
        <span className={styles.label}>Messages</span>
      </button>

{showMessages && <MessagesModal onClose={() => setShowMessages(false)} />}

      <button className={styles.tweetBtn} onClick={() => navigate('/compose')}>
        <span className={styles.tweetBtnFull}>Post</span>
        <span className={styles.tweetBtnIcon}>
          <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
            <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
          </svg>
        </span>
      </button>

      {profile ? (
      <div className={styles.userCard}>
        <Link to={`/${profile.username}`} className={styles.userInfo}>
          {profile.avatar_url
            ? <img src={profile.avatar_url} alt={profile.display_name} className={styles.avatar} />
            : <div className={styles.avatarPlaceholder}>{profile.display_name[0]}</div>
          }
          <div className={styles.userText}>
            <span className={styles.displayName}>{profile.display_name}</span>
            <span className={styles.username}>@{profile.username}</span>
          </div>
        </Link>
        <button className={styles.moreBtn} onClick={handleSignOut} title="Sign out">
          <MoreIcon />
        </button>
      </div>
    ) : (
      <Link to="/login" className={styles.tweetBtn} style={{ textDecoration: 'none', textAlign: 'center' }}>
        Sign in
      </Link>
    )}
    </aside>
  )
}
