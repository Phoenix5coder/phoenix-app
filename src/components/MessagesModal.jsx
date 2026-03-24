import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { formatDistanceToNow } from 'date-fns'
import { useAuth } from '../context/AuthContext'
import { useConversations, useMessages } from '../hooks/useMessages'
import styles from './MessagesModal.module.css'
import { createPortal } from 'react-dom'

const EMOJIS = ['❤️', '😂', '😮', '😢', '😡', '👍']

function Avatar({ profile, size = 36 }) {
  if (profile?.avatar_url) {
    return <img src={profile.avatar_url} alt="" className={styles.avatar} style={{ width: size, height: size }} />
  }
  return (
    <div className={styles.avatarPlaceholder} style={{ width: size, height: size }}>
      {profile?.display_name?.[0] || '?'}
    </div>
  )
}

function Message({ msg, isOwn, onReact }) {
  const [showEmojis, setShowEmojis] = useState(false)
  const hideTimeout = useRef(null)

  function handleMouseEnter() {
    clearTimeout(hideTimeout.current)
    setShowEmojis(true)
  }

  function handleMouseLeave() {
    hideTimeout.current = setTimeout(() => {
      setShowEmojis(false)
    }, 300)
  }

  return (
    <div className={`${styles.messageWrap} ${isOwn ? styles.own : ''}`}>
      {!isOwn && <Avatar profile={msg.sender} size={28} />}
      <div className={styles.messageBubbleWrap}>
        <div
          className={`${styles.bubble} ${isOwn ? styles.ownBubble : styles.otherBubble}`}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          {msg.image_url && (
            <img src={msg.image_url} alt="" className={styles.messageImage} />
          )}
          {msg.content && <p className={styles.messageText}>{msg.content}</p>}

          {showEmojis && (
            <div
              className={`${styles.emojiPicker} ${isOwn ? styles.emojiPickerLeft : styles.emojiPickerRight}`}
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
            >
              {EMOJIS.map(emoji => (
                <button
                  key={emoji}
                  className={styles.emojiBtn}
                  onClick={() => { onReact(msg.id, emoji); setShowEmojis(false) }}
                >
                  {emoji}
                </button>
              ))}
            </div>
          )}
        </div>

        {msg.reactions && Object.keys(msg.reactions).length > 0 && (
          <div className={styles.reactions}>
            {Object.entries(msg.reactions).map(([emoji, users]) =>
              users.length > 0 && (
                <button
                  key={emoji}
                  className={styles.reaction}
                  onClick={() => onReact(msg.id, emoji)}
                >
                  {emoji} <span>{users.length}</span>
                </button>
              )
            )}
          </div>
        )}

        <span className={styles.messageTime}>
          {formatDistanceToNow(new Date(msg.created_at), { addSuffix: true })}
        </span>
      </div>
    </div>
  )
}

function Chat({ otherUser, onBack }) {
  const { messages, loading, sendMessage, addReaction, uploadImage } = useMessages(otherUser.id)
  const { user } = useAuth()
  const [text, setText] = useState('')
  const [sending, setSending] = useState(false)
  const [imagePreview, setImagePreview] = useState(null)
  const [imageFile, setImageFile] = useState(null)
  const bottomRef = useRef()
  const fileRef = useRef()

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  function handleImage(e) {
    const file = e.target.files[0]
    if (!file) return
    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
  }

  async function handleSend() {
    if (!text.trim() && !imageFile) return
    setSending(true)

    let imageUrl = null
    if (imageFile) {
      const { url } = await uploadImage(imageFile)
      imageUrl = url
    }

    await sendMessage(text, imageUrl)
    setText('')
    setImageFile(null)
    setImagePreview(null)
    setSending(false)
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className={styles.chat}>
      <div className={styles.chatHeader}>
        <button className={styles.backBtn} onClick={onBack}>
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 5l-7 7 7 7" />
          </svg>
        </button>
        <Avatar profile={otherUser} size={32} />
        <div>
          <p className={styles.chatName}>{otherUser.display_name}</p>
          <p className={styles.chatUsername}>@{otherUser.username}</p>
        </div>
      </div>

      <div className={styles.messages}>
        {loading ? (
          <div className={styles.loadingChat}>Loading...</div>
        ) : messages.length === 0 ? (
          <div className={styles.emptyChat}>
            <Avatar profile={otherUser} size={56} />
            <p>{otherUser.display_name}</p>
            <span>@{otherUser.username}</span>
            <p className={styles.emptyChatHint}>Send a message to start the conversation</p>
          </div>
        ) : (
          messages.map(msg => (
            <Message
              key={msg.id}
              msg={msg}
              isOwn={msg.sender_id === user.id}
              onReact={addReaction}
            />
          ))
        )}
        <div ref={bottomRef} />
      </div>

      <div className={styles.composer}>
        {imagePreview && (
          <div className={styles.imagePreview}>
            <img src={imagePreview} alt="" />
            <button onClick={() => { setImagePreview(null); setImageFile(null) }} className={styles.removeImage}>✕</button>
          </div>
        )}
        <div className={styles.inputRow}>
          <button className={styles.attachBtn} onClick={() => fileRef.current?.click()}>
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" />
            </svg>
            <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleImage} />
          </button>
          <textarea
            className={styles.input}
            placeholder="Send a message..."
            value={text}
            onChange={e => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={1}
          />
          <button
            className={styles.sendBtn}
            onClick={handleSend}
            disabled={(!text.trim() && !imageFile) || sending}
          >
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}

export default function MessagesModal({ onClose, initialUser = null }) {
  const { conversations, loading } = useConversations()
  const [activeUser, setActiveUser] = useState(initialUser)

  return createPortal(
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>
            {activeUser ? 'Message' : 'Messages'}
          </h2>
          <button className={styles.closeBtn} onClick={onClose}>
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className={styles.body}>
          {activeUser ? (
            <Chat otherUser={activeUser} onBack={() => setActiveUser(null)} />
          ) : (
            <div className={styles.convList}>
              {loading ? (
                <div className={styles.loading}>Loading...</div>
              ) : conversations.length === 0 ? (
                <div className={styles.empty}>
                  <p>No messages yet</p>
                  <span>Visit someone's profile to send them a message</span>
                </div>
              ) : (
                conversations.map(({ profile, lastMessage }) => (
                  <button
                    key={profile.id}
                    className={styles.convoItem}
                    onClick={() => setActiveUser(profile)}
                  >
                    <Avatar profile={profile} size={44} />
                    <div className={styles.convoInfo}>
                      <p className={styles.convoName}>{profile.display_name}</p>
                      <p className={styles.convoLast}>
                        {lastMessage.content || '📷 Image'}
                      </p>
                    </div>
                  </button>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  )
}