import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import {
  Download, User, Mail, Calendar, Package,
  ExternalLink, CheckCircle, ShoppingBag, Zap, Copy, Check
} from 'lucide-react'
import { signOut } from 'firebase/auth'
import { auth } from '../firebase'
import { useUser } from '../lib/UserContext'
import { PRODUCTS } from '../lib/products'
import { getDecryptedUrl } from '../lib/store'

function DownloadButton({ purchase, uid }) {
  const [url, setUrl]     = useState(null)
  const [copied, setCopied] = useState(false)
  const [revealed, setRevealed] = useState(false)

  const reveal = () => {
    // Decrypt on demand — URL never stored or shown until clicked
    const decrypted = getDecryptedUrl(purchase, uid)
    setUrl(decrypted)
    setRevealed(true)
  }

  const copy = () => {
    if (url) {
      navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  if (!purchase.encryptedUrl) {
    return <span className="download-unavailable">Contact support for download</span>
  }

  if (!revealed) {
    return (
      <button className="btn btn-accent download-reveal-btn" onClick={reveal}>
        <Download size={15} /> Access Download
      </button>
    )
  }

  if (!url) {
    return <span className="download-unavailable">Failed to decrypt — contact support</span>
  }

  return (
    <div className="download-row">
      <a href={url} target="_blank" rel="noopener noreferrer" className="btn btn-green">
        <Download size={15} /> Download File <ExternalLink size={13} />
      </a>
      <button className="icon-btn" onClick={copy} title="Copy link">
        {copied ? <Check size={15} color="var(--green)" /> : <Copy size={15} />}
      </button>
    </div>
  )
}

export default function ProfilePage({ onToast }) {
  const { user, purchases, loading } = useUser()
  const navigate  = useNavigate()
  const location  = useLocation()
  const newPurchase = location.state?.newPurchase

  useEffect(() => {
    if (!user && !loading) navigate('/')
  }, [user, loading, navigate])

  // Show success notification if redirected from checkout
  useEffect(() => {
    if (newPurchase && onToast) {
      onToast('🎉 Purchase complete! Your download is ready below.', 'ok')
    }
  }, [newPurchase])

  const handleLogout = async () => {
    await signOut(auth)
    navigate('/')
  }

  if (loading) {
    return (
      <main className="main">
        <div className="spinner-wrap"><div className="spinner" /></div>
      </main>
    )
  }

  if (!user) return null

  return (
    <main className="main">
      {/* ── PROFILE HEADER ── */}
      <div className="profile-header">
        <div className="profile-avatar">
          <User size={28} />
        </div>
        <div className="profile-info">
          <div className="profile-name">{user.email}</div>
          <div className="profile-meta">
            <span><Mail size={12} /> {user.email}</span>
            <span><Calendar size={12} /> Member since {new Date(user.metadata.creationTime).toLocaleDateString('en-US', { year: 'numeric', month: 'long' })}</span>
          </div>
        </div>
        <button className="btn btn-ghost" onClick={handleLogout}>Sign Out</button>
      </div>

      {/* ── STATS ── */}
      <div className="profile-stats">
        <div className="stat-card">
          <Package size={20} color="var(--accent)" />
          <div className="stat-value">{purchases.length}</div>
          <div className="stat-label">Purchases</div>
        </div>
        <div className="stat-card">
          <Zap size={20} color="var(--green)" />
          <div className="stat-value">∞</div>
          <div className="stat-label">Updates</div>
        </div>
        <div className="stat-card">
          <ShoppingBag size={20} color="var(--accent2)" />
          <div className="stat-value">
            ${purchases.reduce((sum, p) => {
              const prod = PRODUCTS.find(x => x.id === p.productId)
              return sum + (prod?.price || 0)
            }, 0)}
          </div>
          <div className="stat-label">Spent</div>
        </div>
      </div>

      <hr className="divider" />

      {/* ── MY DOWNLOADS ── */}
      <div className="s-label">Library</div>
      <div className="s-title">My Downloads</div>
      <div className="s-sub">Click "Access Download" to reveal your secure download link</div>

      {purchases.length === 0 ? (
        <div className="empty-state" style={{ margin: '32px 0' }}>
          <Package size={40} color="var(--muted)" />
          <h3 style={{ fontSize: 18 }}>No purchases yet</h3>
          <p>Head to the store to get started</p>
          <button className="btn btn-accent" onClick={() => navigate('/')}>Browse Store</button>
        </div>
      ) : (
        <div className="purchases-list">
          {purchases.map((purchase) => {
            const prod = PRODUCTS.find(p => p.id === purchase.productId)
            const date = purchase.purchasedAt
              ? new Date(purchase.purchasedAt).toLocaleDateString('en-US', {
                  year: 'numeric', month: 'long', day: 'numeric'
                })
              : 'Recently'

            return (
              <div key={purchase.productId} className="purchase-item">
                <div className="purchase-item-bar" style={{ background: prod?.color || 'var(--accent)' }} />
                <div className="purchase-item-body">
                  <div className="purchase-item-header">
                    <div>
                      <div className="purchase-item-name">
                        {prod?.name || purchase.productName}
                      </div>
                      <div className="purchase-item-sub">
                        {prod?.subtitle || purchase.licenseType}
                      </div>
                    </div>
                    <div className="purchase-item-badge">
                      <CheckCircle size={13} /> Owned
                    </div>
                  </div>
                  <div className="purchase-item-meta">
                    <span><Calendar size={11} /> Purchased {date}</span>
                    <span><Package size={11} /> {purchase.licenseType === 'unlimited' ? 'Unlimited Domains' : '1 Domain License'}</span>
                    {purchase.orderId && (
                      <span>Order #{purchase.orderId.slice(-8)}</span>
                    )}
                  </div>
                  <div className="purchase-item-footer">
                    <DownloadButton purchase={purchase} uid={user.uid} />
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </main>
  )
}
