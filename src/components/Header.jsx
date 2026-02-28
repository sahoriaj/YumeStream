import { Link, useNavigate, useLocation } from 'react-router-dom'
import { signOut } from 'firebase/auth'
import { ShoppingCart, Heart, User, LogOut, Menu, X, LogIn, UserPlus } from 'lucide-react'
import { useState } from 'react'
import { auth } from '../firebase'
import { useUser } from '../lib/UserContext'

export default function Header() {
  const { user, cart, wishlist } = useUser()
  const navigate  = useNavigate()
  const location  = useLocation()
  const [mobileOpen, setMobileOpen] = useState(false)

  const handleLogout = async () => {
    await signOut(auth)
    navigate('/')
  }

  const navLinks = [
    { to: '/', label: 'Store' },
    { to: '/wishlist', label: 'Wishlist' },
  ]

  // Pass current path so /login can redirect back after success
  const loginState = { from: location.pathname }

  return (
    <header className="header">
      <Link to="/" className="header-logo">
        Anime<em>Flix</em>
      </Link>

      {/* Desktop Nav */}
      <nav className="header-nav desktop-only">
        {navLinks.map(l => (
          <Link
            key={l.to}
            to={l.to}
            className={`nav-link ${location.pathname === l.to ? 'active' : ''}`}
          >
            {l.label}
          </Link>
        ))}
      </nav>

      <div className="header-right">

        {/* Wishlist */}
        <Link to="/wishlist" className="icon-btn desktop-only" title="Wishlist">
          <Heart size={18} />
          {wishlist.length > 0 && <span className="badge-count">{wishlist.length}</span>}
        </Link>

        {/* Cart */}
        <Link to="/cart" className="icon-btn" title="Cart">
          <ShoppingCart size={18} />
          {cart.length > 0 && <span className="badge-count">{cart.length}</span>}
        </Link>

        {user ? (
          <>
            <Link to="/profile" className="icon-btn desktop-only" title="My Profile">
              <User size={18} />
            </Link>
            <button className="icon-btn desktop-only" onClick={handleLogout} title="Sign Out">
              <LogOut size={18} />
            </button>
            <Link to="/profile" className="btn btn-outline mobile-only">
              <User size={14} /> Profile
            </Link>
          </>
        ) : (
          <div className="header-auth-btns desktop-only">
            <Link to="/login" state={loginState} className="btn btn-ghost">
              <LogIn size={14} /> Sign In
            </Link>
            <Link to="/register" state={loginState} className="btn btn-accent">
              <UserPlus size={14} /> Register
            </Link>
          </div>
        )}

        {/* Mobile menu toggle */}
        <button className="icon-btn mobile-only" onClick={() => setMobileOpen(o => !o)}>
          {mobileOpen ? <X size={18} /> : <Menu size={18} />}
        </button>
      </div>

      {/* Mobile dropdown */}
      {mobileOpen && (
        <div className="mobile-menu" onClick={() => setMobileOpen(false)}>
          {navLinks.map(l => (
            <Link key={l.to} to={l.to} className="mobile-menu-link">{l.label}</Link>
          ))}
          <Link to="/wishlist" className="mobile-menu-link">
            Wishlist {wishlist.length > 0 && `(${wishlist.length})`}
          </Link>
          {user ? (
            <button className="mobile-menu-link" onClick={handleLogout}>Sign Out</button>
          ) : (
            <>
              <Link to="/login"    state={loginState} className="mobile-menu-link"><LogIn size={13} /> Sign In</Link>
              <Link to="/register" state={loginState} className="mobile-menu-link"><UserPlus size={13} /> Register</Link>
            </>
          )}
        </div>
      )}
    </header>
  )
}
