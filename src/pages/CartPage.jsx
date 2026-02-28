import { useNavigate } from 'react-router-dom'
import { ShoppingCart, Trash2, ArrowRight, ShoppingBag } from 'lucide-react'
import { useUser } from '../lib/UserContext'
import { PRODUCTS } from '../lib/products'
import { removeFromCart } from '../lib/store'

export default function CartPage() {
  const { user, cart, purchases, setCart } = useUser()
  const navigate = useNavigate()

  const cartProducts = PRODUCTS.filter(p => cart.includes(p.id))
  const total = cartProducts.reduce((sum, p) => sum + p.price, 0)

  const handleRemove = async (productId) => {
    if (!user) return
    const updated = await removeFromCart(user.uid, productId, cart)
    setCart(updated)
  }

  const handleCheckout = () => {
    if (cartProducts.length === 1) {
      navigate('/checkout', { state: { productId: cartProducts[0].id } })
    } else {
      navigate('/checkout', { state: { productIds: cartProducts.map(p => p.id) } })
    }
  }

  if (!user) {
    return (
      <main className="main">
        <div className="empty-state">
          <ShoppingCart size={48} color="var(--muted)" />
          <h2>Your cart is empty</h2>
          <p>Sign in and add products to your cart</p>
          <button className="btn btn-accent" onClick={() => navigate('/')}>Browse Store</button>
        </div>
      </main>
    )
  }

  if (cartProducts.length === 0) {
    return (
      <main className="main">
        <div className="empty-state">
          <ShoppingBag size={48} color="var(--muted)" />
          <h2>Your cart is empty</h2>
          <p>Add some templates to get started</p>
          <button className="btn btn-accent" onClick={() => navigate('/')}>Browse Store</button>
        </div>
      </main>
    )
  }

  return (
    <main className="main">
      <div className="s-label">Cart</div>
      <div className="s-title">Your Cart</div>
      <div className="s-sub">{cartProducts.length} item{cartProducts.length !== 1 ? 's' : ''} ready for checkout</div>

      <div className="cart-layout">
        <div className="cart-items">
          {cartProducts.map(prod => (
            <div key={prod.id} className="cart-item">
              <div className="cart-item-left">
                <div className="cart-item-color" style={{ background: prod.color }} />
                <div>
                  <div className="cart-item-name">{prod.name}</div>
                  <div className="cart-item-sub">{prod.subtitle}</div>
                  <div className="cart-item-license">
                    {prod.licenseType === 'unlimited' ? 'Unlimited Domains' : '1 Domain License'}
                  </div>
                </div>
              </div>
              <div className="cart-item-right">
                <div className="cart-item-price">{prod.priceDisplay}</div>
                <button className="icon-btn danger" onClick={() => handleRemove(prod.id)}>
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="cart-summary">
          <div className="summary-box">
            <div className="summary-title">Order Summary</div>
            {cartProducts.map(p => (
              <div key={p.id} className="summary-line">
                <span>{p.name} ({p.subtitle})</span>
                <span>{p.priceDisplay}</span>
              </div>
            ))}
            <div className="summary-divider" />
            <div className="summary-total">
              <span>Total</span>
              <span>${total}</span>
            </div>
            <button className="btn btn-accent" style={{ width: '100%', justifyContent: 'center', padding: '14px' }} onClick={handleCheckout}>
              Checkout <ArrowRight size={16} />
            </button>
            <div className="summary-note">
              🔒 Secure PayPal checkout
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
