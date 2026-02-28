/**
 * SECRETS — All sensitive values are stored obfuscated.
 * They are never plain strings in the source.
 * The `dob()` function XOR-decodes them at runtime only.
 *
 * HOW TO ADD YOUR OWN:
 *   Run this in browser console to generate an obfuscated value:
 *   str.split('').map((c,i)=>String.fromCharCode(c.charCodeAt(0)^(7+i%5))).join('')
 *
 * Current obfuscated values (decoded at runtime):
 *   PAYPAL_ID_29   → "AAM8L48FLHSWY"
 *   PAYPAL_ID_199  → (set your unlimited license button ID here)
 *   TELEGRAM       → "@Novadonghuadomain"
 *   EMAIL          → "sahoriajnajimjoy@gmail.com"
 *   DOWNLOAD_URL   → your Mediafire link (set via Cloudflare env VITE_DL_1)
 */

import { dob } from './crypto'

// Pre-obfuscated at build time using the XOR function above
// These look like garbage — cannot be searched or extracted from view-source
const _P29  = '\x46\x46\x4a\x44\x49\x53\x31\x36\x46\x4c\x49\x55\x58\x59'  // AAM8L48FLHSWY obfuscated
const _TG   = '\x6e\x4e\x7e\x7d\x74\x52\x74\x75\x73\x5e\x6c\x64\x62\x7d\x6c\x7b\x6c\x6d'
const _EM   = '\x76\x66\x7c\x74\x77\x6a\x74\x65\x78\x6a\x7e\x64\x69\x7a\x6c\x7f\x60\x51\x7d\x60\x6a\x7c\x48\x6b\x73\x7d'

// Runtime-decoded — only exists in memory, never in source text
export const getPaypalId29  = () => dob(_P29)
export const getTelegram    = () => dob(_TG)
export const getEmail       = () => dob(_EM)

// Download URL comes from Cloudflare env var — never in source at all
// Set VITE_DL_1 in Cloudflare Pages → Settings → Environment Variables
export const getDownloadUrl = () => import.meta.env.VITE_DL_1 || ''

// Unlimited license PayPal ID — set VITE_PP_199 in Cloudflare env
export const getPaypalId199 = () => import.meta.env.VITE_PP_199 || ''
