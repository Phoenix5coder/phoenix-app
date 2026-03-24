import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import styles from './Auth.module.css'

export function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { signIn } = useAuth()
  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const { error } = await signIn(email, password)
    if (error) setError(error.message)
    else navigate('/home')
    setLoading(false)
  }

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.logo}>
          <img className={styles.logo}
              src="/logo.png" 
              alt="logo"  
            />
        </div>
        <h1 className={styles.title}>Sign in to Phoenix</h1>
        {error && <div className={styles.error}>{error}</div>}
        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.field}>
            <label className={styles.label}>Email</label>
            <input className={styles.input} type="email" value={email} onChange={e => setEmail(e.target.value)} required autoFocus />
          </div>
          <div className={styles.field}>
            <label className={styles.label}>Password</label>
            <input className={styles.input} type="password" value={password} onChange={e => setPassword(e.target.value)} required />
          </div>
          <button className={styles.btn} type="submit" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>
        <p className={styles.switch}>
          Do not have an account? <Link to="/signup" className={styles.link}>Sign up</Link>
        </p>
      </div>
    </div>
  )
}

export function SignupPage() {
  const [form, setForm] = useState({ email: '', password: '', username: '', displayName: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const { signUp } = useAuth()

  function handleChange(e) {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    if (form.username.length < 3) { setError('Username must be at least 3 characters'); return }
    if (!/^[a-zA-Z0-9_]+$/.test(form.username)) { setError('Username can only contain letters, numbers, and underscores'); return }
    setLoading(true)
    const { error } = await signUp(form.email, form.password, form.username, form.displayName)
    if (error) setError(error.message)
    else setSuccess(true)
    setLoading(false)
  }

  if (success) return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.logo} style={{ fontSize: '2rem' }}>checkmark</div>
        <h1 className={styles.title}>Check your email</h1>
        <p className={styles.subtitle}>We sent a confirmation link to <strong>{form.email}</strong>. Click it to activate your account.</p>
        <Link to="/login" className={styles.btn} style={{ display: 'block', textAlign: 'center', marginTop: 16 }}>Go to login</Link>
      </div>
    </div>
  )

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.logo}>
          <img className={styles.logo}
              src="/logo.png" 
              alt="logo"  
            />
        </div>
        <h1 className={styles.title}>Create your account</h1>
        {error && <div className={styles.error}>{error}</div>}
        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.field}>
            <label className={styles.label}>Name</label>
            <input className={styles.input} name="displayName" value={form.displayName} onChange={handleChange} required autoFocus />
          </div>
          <div className={styles.field}>
            <label className={styles.label}>Username</label>
            <div className={styles.inputWrap}>
              <span className={styles.inputPrefix}>@</span>
              <input className={styles.input} style={{ paddingLeft: 28 }} name="username" value={form.username} onChange={handleChange} required />
            </div>
          </div>
          <div className={styles.field}>
            <label className={styles.label}>Email</label>
            <input className={styles.input} type="email" name="email" value={form.email} onChange={handleChange} required />
          </div>
          <div className={styles.field}>
            <label className={styles.label}>Password</label>
            <input className={styles.input} type="password" name="password" value={form.password} onChange={handleChange} required minLength={6} />
          </div>
          <button className={styles.btn} type="submit" disabled={loading}>
            {loading ? 'Creating account...' : 'Sign up'}
          </button>
        </form>
        <p className={styles.switch}>
          Already have an account? <Link to="/login" className={styles.link}>Sign in</Link>
        </p>
      </div>
    </div>
  )
}
