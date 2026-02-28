import { useState } from 'react'
import { Routes, Route } from 'react-router-dom'
import { UserProvider } from './lib/UserContext'
import Header    from './components/Header'
import AuthModal from './components/AuthModal'
import { ToastContainer, useToast } from './components/Toast'

import StorePage    from './pages/StorePage'
import CartPage     from './pages/CartPage'
import WishlistPage from './pages/WishlistPage'
import CheckoutPage from './pages/CheckoutPage'
import ProfilePage  from './pages/ProfilePage'
import LoginPage    from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'

function AppInner() {
  // authModal is ONLY used when user clicks "Buy Now" while not logged in
  // Normal Sign In / Register go through dedicated /login and /register pages
  const [authModal, setAuthModal] = useState(false)
  const { toasts, show: toast }   = useToast()

  const openAuthModal = () => setAuthModal(true)

  return (
    <>
      <Header />

      <Routes>
        {/* Main pages */}
        <Route path="/"         element={<StorePage    onRequireAuth={openAuthModal} />} />
        <Route path="/cart"     element={<CartPage />} />
        <Route path="/wishlist" element={<WishlistPage />} />
        <Route path="/checkout" element={<CheckoutPage onToast={toast} />} />
        <Route path="/profile"  element={<ProfilePage  onToast={toast} />} />

        {/* Dedicated auth pages */}
        <Route path="/login"    element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Catch-all */}
        <Route path="*"         element={<StorePage    onRequireAuth={openAuthModal} />} />
      </Routes>

      {/* Auth modal — only shown on Buy Now click when not logged in */}
      {authModal && <AuthModal onClose={() => setAuthModal(false)} />}

      <ToastContainer toasts={toasts} onDismiss={() => {}} />
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
