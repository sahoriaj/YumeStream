import { useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import {
  Shield, AlertCircle, MessageCircle, Mail,
  ChevronLeft, Lock, CheckCircle, Loader
} from 'lucide-react'
import { useUser } from '../lib/UserContext'
import { PRODUCTS } from '../lib/products'
import { recordPurchase } from '../lib/store'
import { getPaypalId29, getPaypalId199, getTelegram, getEmail } from '../lib/secrets'

// PayPal button rendered per product
function PayPalButton({ product, onSuccess, onError }) {
  const containerRef  = useRef(null)
  const rendered      = useRef(false)
  const [ppError, setPpError] = useState(false)

  useEffect(() => {
    if (rendered.current || !containerRef.current) return
    rendered.current = true

    const tryRender = (attempts = 0) => {
      if (!window.paypal) {
        if (attempts < 15) setTimeout(() => tryRender(attempts + 1), 400)
        else setPpError(true)
        return
      }
      // Resolve the correct PayPal hosted button ID at runtime
      const buttonId = product.paypalKey === '29' ? getPaypalId29() : getPaypalId199()
      if (!buttonId) { setPpError(true); return }

      try {
        window.paypal.HostedButtons({
          hostedButtonId: buttonId,
          onApprove: data => {
            onSuccess(data.orderID || 'ord_' + Date.now())
          },
          onError: () => setPpError(true),
        }).render(containerRef.current)
      } catch {
        setPpError(true)
      }
    }

    setTimeout(tryRender, 500)
  }, [product.paypalKey])

  if (ppError) return null

  return <div ref={containerRef} className="paypal-btn-wrap" />
}

export default function CheckoutPage({ onToast }) {
  const { user, purchases, setPurchases, setCart } = useUser()
  const location = useLocation()
  const navigate  = useNavigate()

  const productId  = location.state?.productId
  const product    = PRODUCTS.find(p => p.id === productId)

  const [ppFailed, setPpFailed]     = useState(false)
  const [processing, setProcessing] = useState(false)
  const [ppLoading, setPpLoading]   = useState(true)
  const [done, setDone]             = useState(false)

  // Redirect if not logged in or no product
  useEffect(() => {
    if (!user) { navigate('/'); return }
    if (!product) { navigate('/'); return }
    // PayPal takes a moment to load
    const t = setTimeout(() => setPpLoading(false), 2000)
    return () => clearTimeout(t)
  }, [user, product, navigate])

  // Already owns it?
  const alreadyOwned = purchases.some(p => p.productId === productId)

  const handleSuccess = async (orderId) => {
    setProcessing(true)
    try {
      const updated = await recordPurchase(
        user.uid, user.email, productId, orderId, product
      )
      setPurchases(updated)
      setCart([])
      setDone(true)
    } catch (e) {
      console.error(e)
      onToast('Payment received! Go to your profile to access downloads.', 'ok')
      navigate('/profile')
    } finally {
      setProcessing(false)
    }
  }

  // Get contact info at runtime (decoded from obfuscated strings)
  const telegramHandle = getTelegram()
  const emailAddr      = getEmail()

  if (!product || !user) return null

  // ── SUCCESS STATE ──
  if (done) {
    return (
      <main className="main checkout-success">
        <div className="success-card">
          <div className="success-icon">
            <CheckCircle size={48} color="var(--green)" />
          </div>
          <h2>Payment Successful!</h2>
          <p>Your purchase is confirmed. Your download is waiting in your profile.</p>
          <div className="success-details">
            <div className="success-detail-row">
              <span>Product</span>
              <span>{product.name} — {product.subtitle}</span>
            </div>
            <div className="success-detail-row">
              <span>Amount</span>
              <span>{product.priceDisplay}</span>
            </div>
            <div className="success-detail-row">
              <span>License</span>
              <span>{product.licenseNote}</span>
            </div>
          </div>
          <button
            className="btn btn-accent"
            style={{ justifyContent: 'center', padding: '14px 32px' }}
            onClick={() => navigate('/profile', { state: { newPurchase: true } })}
          >
            Go to My Downloads →
          </button>
        </div>
      </main>
    )
  }

  if (alreadyOwned) {
    return (
      <main className="main">
        <div className="empty-state">
          <CheckCircle size={48} color="var(--green)" />
          <h2>You already own this!</h2>
          <p>Go to your profile to download it.</p>
          <button className="btn btn-accent" onClick={() => navigate('/profile')}>My Downloads</button>
        </div>
      </main>
    )
  }

  return (
    <main className="main checkout-main">
      {/* Back */}
      <button className="back-btn" onClick={() => navigate(-1)}>
        <ChevronLeft size={16} /> Back
      </button>

      <div className="checkout-layout">
        {/* ── LEFT: Order summary ── */}
        <div className="checkout-summary">
          <div className="checkout-card">
            <div className="checkout-card-title">Order Summary</div>

            <div className="order-product">
              <div className="order-product-color" style={{ background: product.color }} />
              <div>
                <div className="order-product-name">{product.name}</div>
                <div className="order-product-sub">{product.subtitle}</div>
                <div className="order-product-license">{product.licenseNote}</div>
              </div>
            </div>

            <div className="order-features">
              {product.features.slice(0, 4).map(f => (
                <div key={f} className="order-feature">
                  <CheckCircle size={12} color="var(--green)" /> {f}
                </div>
              ))}
            </div>

            <div className="order-total-row">
              <span>Total</span>
              <span className="order-total-price" style={{ color: product.color }}>
                {product.priceDisplay}
              </span>
            </div>

            <div className="order-meta">
              <div><Lock size={12} /> Secure one-time payment</div>
              <div><Shield size={12} /> PayPal buyer protection</div>
            </div>

            {product.licenseType === 'unlimited' && (
              <div className="negotiate-note">
                <AlertCircle size={13} />
                Price is negotiable for bulk or custom deals. Contact us on Telegram.
              </div>
            )}
          </div>
        </div>

        {/* ── RIGHT: Payment ── */}
        <div className="checkout-payment">
          <div className="checkout-card">
            <div className="checkout-card-title">Payment</div>

            {processing ? (
              <div className="processing-state">
                <Loader size={32} className="spin" />
                <p>Processing your payment…</p>
              </div>
            ) : (
              <>
                {/* PayPal section */}
                <div className="payment-method">
                  <div className="payment-method-label">
                    <Lock size={12} /> Pay with PayPal
                  </div>

                  {ppLoading && (
                    <div className="pp-loading">
                      <Loader size={20} className="spin" color="var(--muted)" />
                      <span>Loading PayPal…</span>
                    </div>
                  )}

                  <PayPalButton
                    product={product}
                    onSuccess={handleSuccess}
                    onError={() => setPpFailed(true)}
                  />
                </div>

                {/* Divider */}
                <div className="or-divider">
                  <div className="or-line" />
                  <span>or if PayPal is unavailable</span>
                  <div className="or-line" />
                </div>

                {/* Telegram / Email fallback */}
                <div className="fallback-section">
                  <div className="fallback-title">
                    <MessageCircle size={15} /> Contact us directly
                  </div>
                  <p className="fallback-desc">
                    If PayPal doesn't work in your region, reach out and we'll arrange
                    an alternative payment method for you.
                  </p>
                  <div className="fallback-contacts">
                    <a
                      href={`https://t.me/${telegramHandle.replace('@', '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="contact-btn telegram"
                    >
                      <MessageCircle size={16} />
                      <div>
                        <div className="contact-btn-label">Telegram</div>
                        <div className="contact-btn-value">{telegramHandle}</div>
                      </div>
                    </a>
                    <a
                      href={`mailto:${emailAddr}?subject=Purchase: ${product.name}&body=Hi, I'd like to purchase ${product.name} (${product.subtitle}) for ${product.priceDisplay}. My account email is: ${user?.email}`}
                      className="contact-btn email"
                    >
                      <Mail size={16} />
                      <div>
                        <div className="contact-btn-label">Email</div>
                        <div className="contact-btn-value">{emailAddr}</div>
                      </div>
                    </a>
                  </div>
                  <div className="fallback-note">
                    Please include your registered email ({user?.email}) when contacting us.
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}
