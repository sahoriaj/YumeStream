import { Heart, ShoppingCart, CheckCircle, Download, Shield, Globe, Infinity } from 'lucide-react'
import { useUser } from '../lib/UserContext'
import { toggleWishlist, addToCart } from '../lib/store'

export default function ProductCard({ product, onRequireAuth, onBuyNow, delay = 0 }) {
  const { user, purchases, cart, wishlist, setWishlist, setCart } = useUser()

  const owned      = purchases.some(p => p.productId === product.id)
  const inWishlist = wishlist.includes(product.id)
  const inCart     = cart.includes(product.id)

  const handleWishlist = async () => {
    if (!user) { onRequireAuth(); return }
    const updated = await toggleWishlist(user.uid, product.id, wishlist)
    setWishlist(updated)
  }

  const handleAddToCart = async () => {
    if (!user) { onRequireAuth(); return }
    if (inCart || owned) return
    const updated = await addToCart(user.uid, product.id, cart)
    setCart(updated)
  }

  const accent = product.color || 'var(--accent)'

  return (
    <div
      className="product-card"
      style={{ animationDelay: `${delay}s`, '--card-accent': accent }}
    >
      {/* Top accent bar */}
      <div className="card-top-bar" style={{ background: `linear-gradient(90deg, ${accent}, var(--accent2))` }} />

      {/* Badge + wishlist row */}
      <div className="card-header-row">
        {product.badge && <div className="card-badge">{product.badge}</div>}
        <button
          className={`wish-btn ${inWishlist ? 'active' : ''}`}
          onClick={handleWishlist}
          title={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          <Heart size={16} fill={inWishlist ? 'currentColor' : 'none'} />
        </button>
      </div>

      {/* Product info */}
      <div className="card-name">{product.name}</div>
      <div className="card-subtitle">{product.subtitle}</div>
      <p className="card-desc">{product.description}</p>

      {/* License note */}
      <div className="card-license">
        {product.licenseType === 'unlimited'
          ? <><Infinity size={13} /> {product.licenseNote}</>
          : <><Globe size={13} /> {product.licenseNote}</>
        }
      </div>

      {/* Features */}
      <ul className="card-features">
        {product.features.map(f => (
          <li key={f}><CheckCircle size={12} color="var(--green)" /> {f}</li>
        ))}
      </ul>

      {/* Price */}
      <div className="card-price-row">
        <div className="card-price" style={{ color: accent }}>
          {product.priceDisplay}
        </div>
        <div className="card-price-note">one-time</div>
      </div>

      {/* Actions */}
      {owned ? (
        <div className="owned-badge">
          <CheckCircle size={15} />
          Owned — go to <a href="/profile">My Downloads</a>
        </div>
      ) : (
        <div className="card-actions">
          <button
            className={`btn btn-cart ${inCart ? 'in-cart' : ''}`}
            onClick={handleAddToCart}
            disabled={inCart}
          >
            <ShoppingCart size={15} />
            {inCart ? 'In Cart' : 'Add to Cart'}
          </button>
          <button
            className="btn btn-buy"
            style={{ background: `linear-gradient(135deg, ${accent}, var(--accent2))` }}
            onClick={() => onBuyNow(product)}
          >
            Buy Now
          </button>
        </div>
      )}

      {/* Negotiation hint for unlimited */}
      {product.licenseType === 'unlimited' && !owned && (
        <div className="card-note">
          <Shield size={11} /> Price negotiable — contact us on Telegram
        </div>
      )}
    </div>
  )
}
