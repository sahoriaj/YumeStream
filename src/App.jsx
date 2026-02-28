import { useState, useEffect } from 'react'
import { Routes, Route, useNavigate } from 'react-router-dom'
import { UserProvider } from './lib/UserContext'
import Header    from './components/Header'
import AuthModal from './components/AuthModal'
import { ToastContainer, useToast } from './components/Toast'

import StorePage    from './pages/StorePage'
import CartPage     from './pages/CartPage'
import WishlistPage from './pages/WishlistPage'
import CheckoutPage from './pages/CheckoutPage'
import ProfilePage  from './pages/ProfilePage'

function AppInner() {
  const [authOpen, setAuthOpen]   = useState(false)
  const { toasts, show: toast }   = useToast()
  const navigate = useNavigate()

  const dismissToast = (id) => {}

  const openAuth = (reason, productId) => {
    setAuthOpen(true)
  }

  return (
    <>
      <Header onSignIn={() => setAuthOpen(true)} />

      <Routes>
        <Route path="/"        element={<StorePage    onRequireAuth={openAuth} />} />
        <Route path="/cart"    element={<CartPage />} />
        <Route path="/wishlist" element={<WishlistPage />} />
        <Route path="/checkout" element={<CheckoutPage onToast={toast} />} />
        <Route path="/profile" element={<ProfilePage onToast={toast} />} />
        <Route path="*"        element={<StorePage    onRequireAuth={openAuth} />} />
      </Routes>

      {authOpen && <AuthModal onClose={() => setAuthOpen(false)} />}

      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </>
  )
}

export default function App() {
  return (
    <UserProvider>
      <AppInner />
    </UserProvider>
  )
}
