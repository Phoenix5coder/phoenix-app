import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { LoginPage, SignupPage } from './pages/Auth'
import Home from './pages/Home'
import Explore from './pages/Explore'
import Notifications from './pages/Notifications'
import Bookmarks from './pages/Bookmarks'
import Profile from './pages/Profile'
import TweetDetail from './pages/TweetDetail'
import Compose from './pages/Compose'

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Auth */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />

          {/* App */}
          <Route path="/home" element={<Home />} />
          <Route path="/explore" element={<Explore />} />
          <Route path="/search" element={<Explore />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/bookmarks" element={<Bookmarks />} />
          <Route path="/compose" element={<Compose />} />
          <Route path="/tweet/:id" element={<TweetDetail />} />
          <Route path="/:username" element={<Profile />} />

          {/* Default */}
          <Route path="/" element={<Navigate to="/home" replace />} />
          <Route path="*" element={<Navigate to="/home" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
