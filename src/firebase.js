import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: "AIzaSyDgqpr976h-uGvfOCROX0V6cMaiWP1hOlc",
  authDomain: "login-signup-7cb63.firebaseapp.com",
  projectId: "login-signup-7cb63",
  storageBucket: "login-signup-7cb63.firebasestorage.app",
  messagingSenderId: "428131759010",
  appId: "1:428131759010:web:9c77651fecf816a85b78fb",
  measurementId: "G-3T6FV8QGGE"
}

const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
export const db = getFirestore(app)
