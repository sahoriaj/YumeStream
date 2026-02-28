import { useState } from 'react'
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth'
import { X, Mail, Lock, UserPlus, LogIn } from 'lucide-react'
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

export default function AuthModal({ onClose, initialTab = 'login' }) {
  const [tab, setTab]       = useState(initialTab)
  const [email, setEmail]   = useState('')
  const [pass, setPass]     = useState('')
  const [error, setError]   = useState('')
  const [loading, setLoading] = useState(false)

  const reset = t => { setTab(t); setError(''); }

  const handleLogin = async () => {
    setError('')
    if (!email || !pass) { setError('Please fill in all fields.'); return }
    try {
      setLoading(true)
      await signInWithEmailAndPassword(auth, email, pass)
      onClose()
    } catch (e) { setError(ERRS[e.code] || 'Something went wrong.') }
    finally    { setLoading(false) }
  }

  const handleRegister = async () => {
    setError('')
    if (!email || !pass) { setError('Please fill in all fields.'); return }
    if (pass.length < 6) { setError('Password must be at least 6 characters.'); return }
    try {
      setLoading(true)
      const cred = await createUserWithEmailAndPassword(auth, email, pass)
      await createUserDoc(cred.user.uid, email)
      onClose()
    } catch (e) { setError(ERRS[e.code] || 'Something went wrong.') }
    finally    { setLoading(false) }
  }

  const onKey = e => { if (e.key === 'Enter') tab === 'login' ? handleLogin() : handleRegister() }

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-box">
        <button className="modal-close" onClick={onClose}><X size={16} /></button>

        <div className="modal-logo">
          <div className="modal-logo-icon"><Zap size={22} color="var(--accent)" /></div>
          <h3>Anime<span style={{ color: 'var(--accent)' }}>Flix</span></h3>
          <p>Sign in to purchase and access your downloads</p>
        </div>

        <div className="auth-tabs">
          <button className={`auth-tab ${tab === 'login' ? 'active' : ''}`} onClick={() => reset('login')}>
            <LogIn size={13} /> Sign In
          </button>
          <button className={`auth-tab ${tab === 'register' ? 'active' : ''}`} onClick={() => reset('register')}>
            <UserPlus size={13} /> Register
          </button>
        </div>

        {error && <div className="auth-error">{error}</div>}

        <div className="field">
          <label><Mail size={12} /> Email</label>
          <input type="email" placeholder="you@example.com" value={email}
            onChange={e => setEmail(e.target.value)} onKeyDown={onKey} autoFocus />
        </div>
        <div className="field">
          <label><Lock size={12} /> Password</label>
          <input type="password" placeholder={tab === 'register' ? 'Min 6 characters' : 'Your password'}
            value={pass} onChange={e => setPass(e.target.value)} onKeyDown={onKey} />
        </div>

        <button
          className="btn btn-accent"
          style={{ width: '100%', padding: '13px', borderRadius: '10px', marginTop: '4px', justifyContent: 'center' }}
          onClick={tab === 'login' ? handleLogin : handleRegister}
          disabled={loading}
        >
          {loading
            ? 'Please wait…'
            : tab === 'login'
            ? 'Sign In & Continue'
            : 'Create Account & Continue'}
        </button>
      </div>
    </div>
  )
}
