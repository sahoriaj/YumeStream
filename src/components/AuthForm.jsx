import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  sendPasswordResetEmail,
} from 'firebase/auth'
import { Mail, Lock, LogIn, UserPlus, Zap, ArrowRight, RotateCcw, ChevronLeft } from 'lucide-react'
import { auth, googleProvider } from '../firebase'
import { createUserDoc, getUserDoc } from '../lib/store'

const ERRS = {
  'auth/email-already-in-use': 'Email already registered — try signing in.',
  'auth/wrong-password':        'Incorrect password.',
  'auth/user-not-found':        'No account with that email.',
  'auth/invalid-email':         'Invalid email address.',
  'auth/too-many-requests':     'Too many attempts. Try again later.',
  'auth/weak-password':         'Password must be at least 6 characters.',
  'auth/invalid-credential':    'Wrong email or password.',
  'auth/popup-closed-by-user':  'Sign-in popup was closed. Please try again.',
  'auth/popup-blocked':         'Popup blocked by browser. Please allow popups and try again.',
  'auth/cancelled-popup-request': 'Only one sign-in popup allowed at a time.',
}

// ── Google Icon SVG (official colors, no emoji) ──────────────────────────────
function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" style={{ flexShrink: 0 }}>
      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
      <path fill="none" d="M0 0h48v48H0z"/>
    </svg>
  )
}

/**
 * mode: 'login' | 'register'
 * view: 'form' | 'reset'  (internal state for forgot password)
 */
export default function AuthForm({ mode = 'login', onSuccess }) {
  const [email, setEmail]       = useState('')
  const [pass, setPass]         = useState('')
  const [error, setError]       = useState('')
  const [info, setInfo]         = useState('')       // success message
  const [loading, setLoading]   = useState(false)
  const [gLoading, setGLoading] = useState(false)
  const [view, setView]         = useState('form')   // 'form' | 'reset'
  const [resetEmail, setResetEmail] = useState('')

  const navigate = useNavigate()
  const location = useLocation()
  const from     = location.state?.from || '/'
  const isLogin  = mode === 'login'

  const done = () => {
    if (onSuccess) onSuccess()
    else navigate(from, { replace: true })
  }

  // ── Email / Password ────────────────────────────────────────────────────────
  const handleLogin = async () => {
    setError(''); setInfo('')
    if (!email || !pass) { setError('Please fill in all fields.'); return }
    try {
      setLoading(true)
      await signInWithEmailAndPassword(auth, email, pass)
      done()
    } catch (e) {
      setError(ERRS[e.code] || 'Something went wrong. Please try again.')
    } finally { setLoading(false) }
  }

  const handleRegister = async () => {
    setError(''); setInfo('')
    if (!email || !pass) { setError('Please fill in all fields.'); return }
    if (pass.length < 6) { setError('Password must be at least 6 characters.'); return }
    try {
      setLoading(true)
      const cred = await createUserWithEmailAndPassword(auth, email, pass)
      await createUserDoc(cred.user.uid, email)
      done()
    } catch (e) {
      setError(ERRS[e.code] || 'Something went wrong. Please try again.')
    } finally { setLoading(false) }
  }

  // ── Google ──────────────────────────────────────────────────────────────────
  const handleGoogle = async () => {
    setError(''); setInfo('')
    try {
      setGLoading(true)
      const result = await signInWithPopup(auth, googleProvider)
      const user   = result.user
      // Create Firestore doc only if it doesn't exist yet (new Google users)
      const existing = await getUserDoc(user.uid)
      if (!existing) {
        await createUserDoc(user.uid, user.email)
      }
      done()
    } catch (e) {
      setError(ERRS[e.code] || 'Google sign-in failed. Please try again.')
    } finally { setGLoading(false) }
  }

  // ── Reset Password ──────────────────────────────────────────────────────────
  const handleReset = async () => {
    setError(''); setInfo('')
    if (!resetEmail) { setError('Please enter your email address.'); return }
    try {
      setLoading(true)
      await sendPasswordResetEmail(auth, resetEmail)
      setInfo('Reset email sent! Check your inbox (and spam folder).')
      setError('')
    } catch (e) {
      setError(ERRS[e.code] || 'Could not send reset email. Check the address and try again.')
    } finally { setLoading(false) }
  }

  const onKey = e => {
    if (e.key === 'Enter') {
      if (view === 'reset') handleReset()
      else if (isLogin) handleLogin()
      else handleRegister()
    }
  }

  // ── RESET PASSWORD VIEW ─────────────────────────────────────────────────────
  if (view === 'reset') {
    return (
      <div className="auth-page">
        <div className="auth-card">
          <button className="auth-back-btn" onClick={() => { setView('form'); setError(''); setInfo('') }}>
            <ChevronLeft size={15} /> Back to Sign In
          </button>

          <div className="auth-page-logo">
            <div className="auth-page-logo-icon">
              <RotateCcw size={24} color="var(--accent)" />
            </div>
            <h1>Reset Password</h1>
            <p>Enter your email and we'll send you a reset link</p>
          </div>

          {error && <div className="auth-error">{error}</div>}
          {info  && <div className="auth-info">{info}</div>}

          <div className="field">
            <label><Mail size={12} /> Email</label>
            <input
              type="email"
              placeholder="you@example.com"
              value={resetEmail}
              onChange={e => setResetEmail(e.target.value)}
              onKeyDown={onKey}
              autoFocus
            />
          </div>

          <button
            className="btn btn-accent auth-submit-btn"
            onClick={handleReset}
            disabled={loading}
          >
            {loading ? 'Sending…' : <><Mail size={15} /> Send Reset Email</>}
          </button>
        </div>
      </div>
    )
  }

  // ── MAIN FORM VIEW ──────────────────────────────────────────────────────────
  return (
    <div className="auth-page">
      <div className="auth-card">

        {/* Logo */}
        <div className="auth-page-logo">
          <div className="auth-page-logo-icon">
            <Zap size={26} color="var(--accent)" />
          </div>
          <h1>Anime<span style={{ color: 'var(--accent)' }}>Flix</span></h1>
          <p>{isLogin ? 'Welcome back — sign in to your account' : 'Create your free account'}</p>
        </div>

        {/* Tab switcher */}
        <div className="auth-tabs">
          <Link to="/login"    state={{ from }} className={`auth-tab ${isLogin  ? 'active' : ''}`} replace>
            <LogIn size={13} /> Sign In
          </Link>
          <Link to="/register" state={{ from }} className={`auth-tab ${!isLogin ? 'active' : ''}`} replace>
            <UserPlus size={13} /> Register
          </Link>
        </div>

        {/* Google button */}
        <button
          className="btn-google"
          onClick={handleGoogle}
          disabled={gLoading || loading}
        >
          {gLoading
            ? <span className="btn-google-spinner" />
            : <GoogleIcon />
          }
          {gLoading ? 'Connecting…' : `Continue with Google`}
        </button>

        {/* Divider */}
        <div className="auth-divider">
          <div className="auth-divider-line" />
          <span>or continue with email</span>
          <div className="auth-divider-line" />
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

        {/* Forgot password (login only) */}
        {isLogin && (
          <button
            className="auth-forgot-btn"
            onClick={() => { setView('reset'); setResetEmail(email); setError('') }}
          >
            Forgot password?
          </button>
        )}

        {/* Submit */}
        <button
          className="btn btn-accent auth-submit-btn"
          onClick={isLogin ? handleLogin : handleRegister}
          disabled={loading || gLoading}
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
          {isLogin
            ? <>Don't have an account? <Link to="/register" state={{ from }}>Create one</Link></>
            : <>Already have an account? <Link to="/login"    state={{ from }}>Sign in</Link></>
          }
        </div>

      </div>
    </div>
  )
}
