import { useNavigate } from 'react-router-dom'
import { Heart, ShoppingCart, Trash2 } from 'lucide-react'
import { useUser } from '../lib/UserContext'
import { PRODUCTS } from '../lib/products'
import { toggleWishlist, addToCart } from '../lib/store'

export default function WishlistPage() {
  const { user, wishlist, cart, setWishlist, setCart } = useUser()
  const navigate = useNavigate()

  const wishlistProducts = PRODUCTS.filter(p => wishlist.includes(p.id))

  const handleRemove = async (productId) => {
    if (!user) return
    const updated = await toggleWishlist(user.uid, productId, wishlist)
    setWishlist(updated)
  }

  const handleAddToCart = async (productId) => {
    if (!user) return
    const updated = await addToCart(user.uid, productId, cart)
    setCart(updated)
  }

  if (!user || wishlistProducts.length === 0) {
    return (
      <main className="main">
        <div className="empty-state">
          <Heart size={48} color="var(--muted)" />
          <h2>Your wishlist is empty</h2>
          <p>Save templates you love for later</p>
          <button className="btn btn-accent" onClick={() => navigate('/')}>Browse Store</button>
        </div>
      </main>
    )
  }

  return (
    <main className="main">
      <div className="s-label">Wishlist</div>
      <div className="s-title">Saved Items</div>
      <div className="s-sub">{wishlistProducts.length} item{wishlistProducts.length !== 1 ? 's' : ''} saved</div>

      <div className="wishlist-grid">
        {wishlistProducts.map(prod => {
          const inCart = cart.includes(prod.id)
          return (
            <div key={prod.id} className="wishlist-card">
              <div className="wishlist-top" style={{ borderColor: prod.color }}>
                <div>
                  <div className="wishlist-name">{prod.name}</div>
                  <div className="wishlist-sub">{prod.subtitle}</div>
                </div>
                <div className="wishlist-price" style={{ color: prod.color }}>{prod.priceDisplay}</div>
              </div>
              <div className="wishlist-actions">
                <button
                  className={`btn btn-cart ${inCart ? 'in-cart' : ''}`}
                  onClick={() => handleAddToCart(prod.id)}
                  disabled={inCart}
                  style={{ flex: 1 }}
                >
                  <ShoppingCart size={14} /> {inCart ? 'In Cart' : 'Add to Cart'}
                </button>
                <button className="icon-btn danger" onClick={() => handleRemove(prod.id)}>
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </main>
  )
}
