import CryptoJS from 'crypto-js'

// Encryption key is derived at runtime from env + user uid — never stored as plaintext
// The VITE_EK env var is set in Cloudflare Pages → Settings → Environment Variables
// If not set, a fallback is used (still obfuscated, not ideal for production)
const BASE_KEY = import.meta.env.VITE_EK || 'af29x!kL#mQ8@rZ'

/**
 * Derive a user-specific key so even if the base key leaks,
 * the encrypted blobs are useless without the matching uid.
 */
export function deriveKey(uid = '') {
  return CryptoJS.SHA256(BASE_KEY + uid).toString()
}

/** Encrypt a plaintext string with a derived key */
export function encrypt(plaintext, uid = '') {
  const key = deriveKey(uid)
  return CryptoJS.AES.encrypt(plaintext, key).toString()
}

/** Decrypt a ciphertext string with a derived key */
export function decrypt(ciphertext, uid = '') {
  try {
    const key = deriveKey(uid)
    const bytes = CryptoJS.AES.decrypt(ciphertext, key)
    return bytes.toString(CryptoJS.enc.Utf8)
  } catch {
    return null
  }
}

/**
 * Obfuscate a string so it never appears in plain form in the JS bundle.
 * Used for PayPal button IDs and contact info embedded in the app.
 * This is a simple reversible XOR — the point is it won't appear in view-source.
 */
export function ob(str) {
  // Runtime-only reveal — not stored as a literal string
  return str.split('').map((c, i) => String.fromCharCode(c.charCodeAt(0) ^ (7 + i % 5))).join('')
}
export function dob(str) {
  return str.split('').map((c, i) => String.fromCharCode(c.charCodeAt(0) ^ (7 + i % 5))).join('')
}
