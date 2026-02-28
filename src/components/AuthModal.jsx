import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth'
import { Mail, Lock, LogIn, UserPlus, Zap, ArrowRight } from 'lucide-react'
import { auth } from '../firebase'
import { createUserDoc } from '../lib/store'

const ERRS = {
  'auth/email-already-in-use': 'Email already registered — try signing in.',
  'auth/wrong-password':        'Incorrect password.',
  'auth/user-not-found':        'No account with that email.',
  'auth/invalid-email':         'Invalid email address.',
  'auth/too-many-requests':     'Too many attempts. Try again later.',
  'auth/weak-password':         'Password must be at least 6 characters.',
  'auth/invalid-credential':    'Wrong email or password.',
}

/**
 * mode: 'login' | 'register'
 * Used by both /login and /register pages.
 * Also used inside AuthModal (pass onSuccess to close modal).
 */
export default function AuthForm({ mode = 'login', onSuccess }) {
  const [email, setEmail]     = useState('')
  const [pass, setPass]       = useState('')
  const [error, setError]     = useState('')
  const [loading, setLoading] = useState(false)
  const navigate  = useNavigate()
  const location  = useLocation()

  // After login, redirect back to where they came from (or store)
  const from = location.state?.from || '/'

  const handleLogin = async () => {
    setError('')
    if (!email || !pass) { setError('Please fill in all fields.'); return }
    try {
      setLoading(true)
      await signInWithEmailAndPassword(auth, email, pass)
      if (onSuccess) onSuccess()
      else navigate(from, { replace: true })
    } catch (e) {
      setError(ERRS[e.code] || 'Something went wrong. Please try again.')
    } finally { setLoading(false) }
  }

  const handleRegister = async () => {
    setError('')
    if (!email || !pass) { setError('Please fill in all fields.'); return }
    if (pass.length < 6) { setError('Password must be at least 6 characters.'); return }
    try {
      setLoading(true)
      const cred = await createUserWithEmailAndPassword(auth, email, pass)
      await createUserDoc(cred.user.uid, email)
      if (onSuccess) onSuccess()
      else navigate(from, { replace: true })
    } catch (e) {
      setError(ERRS[e.code] || 'Something went wrong. Please try again.')
    } finally { setLoading(false) }
  }

  const onKey = e => {
    if (e.key === 'Enter') mode === 'login' ? handleLogin() : handleRegister()
  }

  const isLogin = mode === 'login'

  return (
    <div className="auth-page">
      <div className="auth-card">

        {/* Logo */}
        <div className="auth-page-logo">
          <div className="auth-page-logo-icon">
            <Zap size={26} color="var(--accent)" />
          </div>
          <h1>Anime<span style={{ color: 'var(--accent)' }}>Flix</span></h1>
          <p>{isLogin ? 'Welcome back — sign in to your account' : 'Create your account to get started'}</p>
        </div>

        {/* Tab switcher */}
        <div className="auth-tabs">
          <Link
            to="/login"
            state={{ from }}
            className={`auth-tab ${isLogin ? 'active' : ''}`}
            replace
          >
            <LogIn size={13} /> Sign In
          </Link>
          <Link
            to="/register"
            state={{ from }}
            className={`auth-tab ${!isLogin ? 'active' : ''}`}
            replace
          >
            <UserPlus size={13} /> Register
          </Link>
        </div>

        {/* Error */}
        {error && <div className="auth-error">{error}</div>}

        {/* Fields */}
        <div className="field">
          <label><Mail size={12} /> Email</label>
          <input
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={e => setEmail(e.target.value)}
            onKeyDown={onKey}
            autoFocus
          />
        </div>
        <div className="field">
          <label><Lock size={12} /> Password</label>
          <input
            type="password"
            placeholder={isLogin ? 'Your password' : 'Min 6 characters'}
            value={pass}
            onChange={e => setPass(e.target.value)}
            onKeyDown={onKey}
          />
        </div>

        {/* Submit */}
        <button
          className="btn btn-accent auth-submit-btn"
          onClick={isLogin ? handleLogin : handleRegister}
          disabled={loading}
        >
          {loading
            ? 'Please wait…'
            : isLogin
            ? <><LogIn size={15} /> Sign In <ArrowRight size={14} /></>
            : <><UserPlus size={15} /> Create Account <ArrowRight size={14} /></>
          }
        </button>

        {/* Switch link */}
        <div className="auth-switch">
          {isLogin ? (
            <>Don't have an account?{' '}
              <Link to="/register" state={{ from }}>Create one</Link>
            </>
          ) : (
            <>Already have an account?{' '}
              <Link to="/login" state={{ from }}>Sign in</Link>
            </>
          )}
        </div>

      </div>
    </div>
  )
}
