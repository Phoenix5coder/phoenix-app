import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Sidebar from './Sidebar'
import RightSidebar from './RightSidebar'
import styles from './Layout.module.css'

export default function Layout({ children, hideRightSidebar = false }) {
  const { user, loading } = useAuth()

  if (loading) return (
    <div className={styles.loadingScreen}>
      <img className={styles.logo}
          src="/logo.png" 
          alt="logo"  
        />
    </div>
  )

  if (!user) return <Navigate to="/login" replace />

  return (
    <div className={styles.app}>
      <Sidebar />
      <main className={styles.main}>
        {children}
      </main>
      {!hideRightSidebar && <RightSidebar />}
    </div>
  )
}
