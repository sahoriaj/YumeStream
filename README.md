# AnimeFlix Store

React + Firebase + PayPal store with wishlist, cart, checkout, and AES-encrypted downloads.
Deploy to Cloudflare Pages via GitHub.

---

## Quick Start

```bash
npm install
npm run dev
```

---

## Cloudflare Pages Deployment

1. Push this folder to a **GitHub repo**
2. Go to https://pages.cloudflare.com → Create project → Connect to Git
3. Select your repo
4. Build settings:
   - **Build command**: `npm run build`
   - **Output directory**: `dist`
5. **Environment Variables** (Settings → Environment Variables):

| Variable    | Value                                      | Notes                          |
|-------------|--------------------------------------------|---------------------------------|
| `VITE_EK`   | Any secret string (e.g. `my$3cr3tK3y!`)   | Encryption key for download URLs |
| `VITE_DL_1` | Your Mediafire / Drive download URL        | Never exposed in source code   |
| `VITE_PP_199` | Your PayPal Hosted Button ID for $199 plan | Set when you create it       |

6. Deploy ✅

---

## Firebase Setup

1. Firebase Console → Authentication → Sign-in method → Enable **Email/Password**
2. Firestore Database → Rules → Paste:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{uid} {
      allow read, write: if request.auth != null && request.auth.uid == uid;
    }
    match /orders/{orderId} {
      allow read, write: if request.auth != null;
    }
  }
}
```

---

## Adding the $199 PayPal Button

1. Create a new PayPal Hosted Button for $199 in your PayPal dashboard
2. Copy the button ID
3. Add it as `VITE_PP_199` environment variable in Cloudflare Pages

---

## Security Model

- **Download URLs** are AES-256 encrypted using the user's Firebase UID as part of the key
- Decryption only happens in memory when the user clicks "Access Download"
- **PayPal button IDs** are XOR-obfuscated so they don't appear in view-source
- **Contact info** (Telegram, email) is also obfuscated in the bundle
- **Sensitive URLs** come from Cloudflare environment variables — never in the source code

---

## Adding More Products

Edit `src/lib/products.js` — copy an existing entry and change the fields.
Then create a PayPal Hosted Button for it and add the ID to `src/lib/secrets.js`.
