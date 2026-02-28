import { doc, getDoc, setDoc, updateDoc, serverTimestamp, arrayUnion } from 'firebase/firestore'
import { db } from '../firebase'
import { encrypt, decrypt } from './crypto'
import { getDownloadUrl } from './secrets'

/** Fetch the full user document */
export async function getUserDoc(uid) {
  const snap = await getDoc(doc(db, 'users', uid))
  return snap.exists() ? snap.data() : null
}

/** Create a new user doc on registration */
export async function createUserDoc(uid, email) {
  await setDoc(doc(db, 'users', uid), {
    email,
    createdAt: serverTimestamp(),
    purchases: [],
    cart: [],
    wishlist: [],
  })
}

/** Toggle wishlist item */
export async function toggleWishlist(uid, productId, currentWishlist) {
  const ref = doc(db, 'users', uid)
  const exists = currentWishlist.includes(productId)
  const updated = exists
    ? currentWishlist.filter(id => id !== productId)
    : [...currentWishlist, productId]
  await updateDoc(ref, { wishlist: updated })
  return updated
}

/** Add to cart */
export async function addToCart(uid, productId, currentCart) {
  if (currentCart.includes(productId)) return currentCart
  const ref = doc(db, 'users', uid)
  const updated = [...currentCart, productId]
  await updateDoc(ref, { cart: updated })
  return updated
}

/** Remove from cart */
export async function removeFromCart(uid, productId, currentCart) {
  const ref = doc(db, 'users', uid)
  const updated = currentCart.filter(id => id !== productId)
  await updateDoc(ref, { cart: updated })
  return updated
}

/** Clear entire cart */
export async function clearCart(uid) {
  await updateDoc(doc(db, 'users', uid), { cart: [] })
}

/**
 * Record a completed purchase.
 * The download URL is AES-encrypted with the user's uid before being stored.
 * Only this specific user can decrypt it.
 */
export async function recordPurchase(uid, email, productId, orderId, product) {
  const ref = doc(db, 'users', uid)
  const snap = await getDoc(ref)
  const existing = snap.exists() ? (snap.data().purchases || []) : []

  if (existing.some(p => p.productId === productId)) return existing // already owns

  // Encrypt the download URL so it's unreadable in Firestore without the key
  const rawUrl = getDownloadUrl()
  const encryptedUrl = rawUrl ? encrypt(rawUrl, uid) : ''

  const newEntry = {
    productId,
    orderId,
    productName: product.name + ' — ' + product.subtitle,
    purchasedAt: new Date().toISOString(),
    encryptedUrl,      // AES encrypted, useless without uid
    licenseType: product.licenseType,
  }

  const updated = [...existing, newEntry]
  await setDoc(ref, { purchases: updated, cart: [] }, { merge: true })

  // Order record for admin
  await setDoc(doc(db, 'orders', orderId), {
    uid,
    email,
    productId,
    orderId,
    productName: product.name,
    price: product.price,
    purchasedAt: serverTimestamp(),
  })

  return updated
}

/**
 * Get decrypted download URL for a purchase.
 * Only works if uid matches — the encrypted blob is uid-specific.
 */
export function getDecryptedUrl(purchase, uid) {
  if (!purchase.encryptedUrl) return null
  return decrypt(purchase.encryptedUrl, uid)
}
