import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useProfile, useIsFollowing, uploadAvatar, uploadBanner } from '../hooks/useProfile'
import { useProfileTweets } from '../hooks/useTweets'
import Layout from '../components/Layout'
import TweetCard from '../components/TweetCard'
import styles from './Profile.module.css'
import MessagesModal from '../components/MessagesModal'

export default function Profile() {
  const { username } = useParams()
  const { user, profile: myProfile, updateProfile } = useAuth()
  const { profile, loading: profileLoading, refetch: refetchProfile } = useProfile(username)
  const { tweets, loading: tweetsLoading, refetch: refetchTweets } = useProfileTweets(username)
  const { isFollowing, toggleFollow } = useIsFollowing(profile?.id)
  const navigate = useNavigate()
  const [editMode, setEditMode] = useState(false)
  const [editForm, setEditForm] = useState({})
  const [saving, setSaving] = useState(false)
  const [showMessages, setShowMessages] = useState(false)

  const isOwn = user?.id === profile?.id

  function startEdit() {
    setEditForm({
      display_name: profile.display_name,
      bio: profile.bio || '',
      website: profile.website || '',
      location: profile.location || '',
    })
    setEditMode(true)
  }

  async function saveEdit() {
    setSaving(true)
    await updateProfile(editForm)
    await refetchProfile()
    setEditMode(false)
    setSaving(false)
  }

  async function handleAvatarChange(e) {
    const file = e.target.files[0]
    if (!file || !user) return
    const { url, error } = await uploadAvatar(file, user.id)
    if (!error && url) {
      await updateProfile({ avatar_url: url })
      refetchProfile()
    }
  }

  async function handleBannerChange(e) {
    const file = e.target.files[0]
    if (!file || !user) return
    const { url, error } = await uploadBanner(file, user.id)
    if (!error && url) {
      await updateProfile({ banner_url: url })
      refetchProfile()
    }
  }

  if (profileLoading) return (
    <Layout>
      <div className={styles.loading}>Loading...</div>
    </Layout>
  )

  if (!profile) return (
    <Layout>
      <div className={styles.notFound}>
        <h2>This account does not exist</h2>
        <button onClick={() => navigate(-1)}>Go back</button>
      </div>
    </Layout>
  )

  return (
    <Layout>
      <div className={styles.header}>
        <button className={styles.backBtn} onClick={() => navigate(-1)}>
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 5l-7 7 7 7"/>
          </svg>
        </button>
        <div>
          <h1 className={styles.headerName}>{profile.display_name}</h1>
          <p className={styles.headerTweets}>{profile.tweets_count} posts</p>
        </div>
      </div>

      <div className={styles.banner}>
        {profile.banner_url
          ? <img src={profile.banner_url} alt="" className={styles.bannerImg} />
          : <div className={styles.bannerPlaceholder} />
        }
        {isOwn && editMode && (
          <label className={styles.bannerUpload}>
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="white" strokeWidth="2">
              <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2v11z"/>
              <circle cx="12" cy="13" r="4"/>
            </svg>
            <input type="file" accept="image/*" onChange={handleBannerChange} style={{ display: 'none' }} />
          </label>
        )}
      </div>

      <div className={styles.profileInfo}>
        <div className={styles.avatarRow}>
          <div className={styles.avatarWrap}>
            {profile.avatar_url
              ? <img src={profile.avatar_url} alt="" className={styles.avatar} />
              : <div className={styles.avatarPlaceholder}>{profile.display_name[0]}</div>
            }
            {isOwn && editMode && (
              <label className={styles.avatarUpload}>
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="white" strokeWidth="2">
                  <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2v11z"/>
                  <circle cx="12" cy="13" r="4"/>
                </svg>
                <input type="file" accept="image/*" onChange={handleAvatarChange} style={{ display: 'none' }} />
              </label>
            )}
          </div>

          {isOwn ? (
            editMode ? (
              <div className={styles.editActions}>
                <button className={styles.cancelBtn} onClick={() => setEditMode(false)}>Cancel</button>
                <button className={styles.saveBtn} onClick={saveEdit} disabled={saving}>
                  {saving ? 'Saving...' : 'Save'}
                </button>
              </div>
            ) : (
              <button className={styles.editBtn} onClick={startEdit}>Edit profile</button>
            )
          ) : (
            <div style={{ display: 'flex', gap: '8px' }}>
              <button className={styles.messageBtn} onClick={() => setShowMessages(true)}>
                Message
              </button>
              <button
                className={`${styles.followBtn} ${isFollowing ? styles.following : ''}`}
                onClick={toggleFollow}
              >
                {isFollowing ? 'Following' : 'Follow'}
              </button>
            </div>
          )}
        </div>

        {editMode ? (
          <div className={styles.editForm}>
            <div className={styles.editField}>
              <label>Name</label>
              <input value={editForm.display_name} onChange={e => setEditForm(f => ({ ...f, display_name: e.target.value }))} maxLength={50} />
            </div>
            <div className={styles.editField}>
              <label>Bio</label>
              <textarea value={editForm.bio} onChange={e => setEditForm(f => ({ ...f, bio: e.target.value }))} maxLength={160} rows={3} />
            </div>
            <div className={styles.editField}>
              <label>Website</label>
              <input value={editForm.website} onChange={e => setEditForm(f => ({ ...f, website: e.target.value }))} placeholder="https://..." />
            </div>
            <div className={styles.editField}>
              <label>Location</label>
              <input value={editForm.location} onChange={e => setEditForm(f => ({ ...f, location: e.target.value }))} />
            </div>
          </div>
        ) : (
          <>
            <div className={styles.names}>
              <h2 className={styles.displayName}>{profile.display_name}</h2>
              <p className={styles.username}>@{profile.username}</p>
            </div>
            {profile.bio && <p className={styles.bio}>{profile.bio}</p>}
            <div className={styles.meta}>
              {profile.location && (
                <span className={styles.metaItem}>
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/>
                  </svg>
                  {profile.location}
                </span>
              )}
              {profile.website && (
                <a href={profile.website} target="_blank" rel="noreferrer" className={styles.metaLink}>
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/>
                  </svg>
                  {profile.website.replace(/^https?:\/\//, '')}
                </a>
              )}
            </div>
            <div className={styles.stats}>
              <span><strong>{profile.following_count}</strong> Following</span>
              <span><strong>{profile.followers_count}</strong> Followers</span>
            </div>
          </>
        )}
      </div>

      <div className={styles.tweetsSection}>
        {tweetsLoading ? (
          <div className={styles.loading}>Loading posts...</div>
        ) : tweets.length === 0 ? (
          <div className={styles.empty}>
            <p>No posts yet</p>
          </div>
        ) : (
          tweets.map(tweet => (
            <TweetCard key={tweet.id} tweet={tweet} onUpdate={refetchTweets} />
          ))
        )}
      </div>

      {showMessages && (
        <MessagesModal
          onClose={() => setShowMessages(false)}
          initialUser={profile}
        />
      )}
    </Layout>
  )
}
