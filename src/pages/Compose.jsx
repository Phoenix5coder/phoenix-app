import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import TweetComposer from '../components/TweetComposer'
import styles from './Compose.module.css'

export default function Compose() {
  const navigate = useNavigate()
  const { user } = useAuth()

  function handleTweet(tweet) {
    navigate('/home')
  }

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <button className={styles.closeBtn} onClick={() => navigate(-1)}>
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
        <TweetComposer onTweet={handleTweet} placeholder="What is happening?!" />
      </div>
    </div>
  )
}
