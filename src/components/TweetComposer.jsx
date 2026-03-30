import { useState, useRef } from 'react'
import { useAuth } from '../context/AuthContext'
import { createTweet } from '../hooks/useTweets'
import { supabase } from '../lib/supabase'
import styles from './TweetComposer.module.css'

export default function TweetComposer({ onTweet, replyTo = null, placeholder = "What's happening?" }) {
  const { user, profile } = useAuth()
  const [content, setContent] = useState('')
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [loading, setLoading] = useState(false)
  const fileRef = useRef()
  const MAX = 280

  function handleImage(e) {
    const file = e.target.files[0]
    if (!file) return
    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
    // store extra files for upload
    setExtraFiles(Array.from(e.target.files).slice(1))
}

  async function handleSubmit(e) {
    e.preventDefault()
    if (!content.trim() || loading) return
    setLoading(true)

    let imageUrl = null
    if (imageFile) {
      const ext = imageFile.name.split('.').pop()
      const path = `${user.id}/${Date.now()}.${ext}`
      await supabase.storage.from('post-images').upload(path, imageFile)
      const { data } = supabase.storage.from('post-images').getPublicUrl(path)
      imageUrl = data.publicUrl
    }

    const { data } = await createTweet({ content, userId: user.id, replyTo, imageUrl })
    if (data) {
      setContent('')
      setImageFile(null)
      setImagePreview(null)
      onTweet?.(data)
    }
    setLoading(false)
  }

  const remaining = MAX - content.length
  const overLimit = remaining < 0
  const nearLimit = remaining <= 20

  return (
    <div className={styles.composer}>
      <div className={styles.avatarCol}>
        {profile?.avatar_url
          ? <img src={profile.avatar_url} alt="" className={styles.avatar} />
          : <div className={styles.avatarPlaceholder}>{profile?.display_name?.[0] || '?'}</div>
        }
      </div>

      <form className={styles.form} onSubmit={handleSubmit}>
        <textarea
          className={styles.textarea}
          placeholder={placeholder}
          value={content}
          onChange={e => setContent(e.target.value)}
          rows={replyTo ? 2 : 3}
          maxLength={MAX + 50}
        />

        {imagePreview && (
          <div className={styles.imagePreview}>
            <img src={imagePreview} alt="preview" />
            <button type="button" className={styles.removeImage} onClick={() => { setImagePreview(null); setImageFile(null) }}>
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>
        )}

        <div className={styles.toolbar}>
          <div className={styles.toolbarLeft}>
            <button type="button" className={styles.toolBtn} onClick={() => fileRef.current?.click()} title="Add image">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8">
                <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>
              </svg>
              <input ref={fileRef} type="file" accept="image/*" multiple style={{ display: 'none' }} onChange={handleImage} />
            </button>
          </div>

          <div className={styles.toolbarRight}>
            {content.length > 0 && (
              <div className={styles.counter}>
                <svg viewBox="0 0 36 36" width="30" height="30">
                  <circle cx="18" cy="18" r="14" fill="none" stroke="var(--border)" strokeWidth="3"/>
                  <circle
                    cx="18" cy="18" r="14" fill="none"
                    stroke={overLimit ? 'var(--danger)' : nearLimit ? 'var(--orange)' : 'var(--accent)'}
                    strokeWidth="3"
                    strokeDasharray={`${Math.min(Math.max((content.length / MAX) * 87.96, 0), 87.96)} 87.96`}
                    strokeLinecap="round"
                    transform="rotate(-90 18 18)"
                  />
                </svg>
                {nearLimit && <span className={`${styles.remainText} ${overLimit ? styles.over : ''}`}>{remaining}</span>}
              </div>
            )}

            <button
              className={styles.submitBtn}
              type="submit"
              disabled={!content.trim() || overLimit || loading}
            >
              {loading ? 'Posting...' : 'Post'}
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}
