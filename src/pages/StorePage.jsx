import { useNavigate } from 'react-router-dom'
import { Zap, Star, Shield, Download } from 'lucide-react'
import ProductCard from '../components/ProductCard'
import { PRODUCTS } from '../lib/products'
import { useUser } from '../lib/UserContext'

export default function StorePage({ onRequireAuth, onBuyNow }) {
  const { user, loading } = useUser()
  const navigate = useNavigate()

  const handleBuyNow = (product) => {
    if (!user) { onRequireAuth('buy', product.id); return }
    navigate('/checkout', { state: { productId: product.id } })
  }

  const handleRequireAuth = () => onRequireAuth()

  return (
    <main className="main">
      {/* ── HERO ── */}
      <section className="hero">
        <div className="hero-tag">
          <span className="hero-dot" />
          Premium Anime Templates
        </div>
        <h1>
          Launch your<br />
          <span className="grad">Anime Streaming</span><br />
          platform today
        </h1>
        <p className="hero-sub">
          Professional templates built for anime streaming sites.
          One-time payment. Lifetime access. Instant download after purchase.
        </p>
        <div className="hero-pills">
          <span className="pill"><Zap size={12} /> Instant Delivery</span>
          <span className="pill"><Shield size={12} /> Secure Checkout</span>
          <span className="pill"><Star size={12} /> Lifetime Updates</span>
          <span className="pill"><Download size={12} /> Source Code Included</span>
        </div>
      </section>

      {/* ── PRODUCTS ── */}
      <section className="section">
        <div className="s-label">Templates</div>
        <div className="s-title">Choose Your License</div>
        <div className="s-sub">
          Single domain for personal projects · Unlimited for agencies · Everything negotiable on Telegram
        </div>

        {loading ? (
          <div className="spinner-wrap"><div className="spinner" /></div>
        ) : (
          <div className="store-grid">
            {PRODUCTS.map((prod, i) => (
              <ProductCard
                key={prod.id}
                product={prod}
                onRequireAuth={handleRequireAuth}
                onBuyNow={handleBuyNow}
                delay={i * 0.1}
              />
            ))}
          </div>
        )}
      </section>

      {/* ── TRUST ── */}
      <section className="trust-section">
        <div className="trust-grid">
          <div className="trust-item">
            <Shield size={20} color="var(--green)" />
            <div>
              <div className="trust-title">Secure Payment</div>
              <div className="trust-sub">PayPal buyer protection on all orders</div>
            </div>
          </div>
          <div className="trust-item">
            <Download size={20} color="var(--accent)" />
            <div>
              <div className="trust-title">Instant Download</div>
              <div className="trust-sub">Access your files immediately after payment</div>
            </div>
          </div>
          <div className="trust-item">
            <Zap size={20} color="var(--accent2)" />
            <div>
              <div className="trust-title">Lifetime Updates</div>
              <div className="trust-sub">Free updates forever, no subscription</div>
            </div>
          </div>
          <div className="trust-item">
            <Star size={20} color="var(--yellow)" />
            <div>
              <div className="trust-title">Telegram Support</div>
              <div className="trust-sub">Direct support from the developer</div>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
