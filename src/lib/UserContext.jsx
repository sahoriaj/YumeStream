import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from '../firebase'
import { getUserDoc } from '../lib/store'

const UserCtx = createContext(null)

export function UserProvider({ children }) {
  const [user, setUser]           = useState(undefined) // undefined = loading
  const [userDoc, setUserDoc]     = useState(null)
  const [purchases, setPurchases] = useState([])
  const [cart, setCart]           = useState([])
  const [wishlist, setWishlist]   = useState([])
  const [docLoading, setDocLoading] = useState(false)

  const refreshDoc = useCallback(async (uid) => {
    if (!uid) return
    setDocLoading(true)
    try {
      const d = await getUserDoc(uid)
      if (d) {
        setUserDoc(d)
        setPurchases(d.purchases || [])
        setCart(d.cart || [])
        setWishlist(d.wishlist || [])
      }
    } catch (e) {
      console.error(e)
    } finally {
      setDocLoading(false)
    }
  }, [])

  useEffect(() => {
    return onAuthStateChanged(auth, (u) => {
      setUser(u ?? null)
      if (u) refreshDoc(u.uid)
      else {
        setUserDoc(null)
        setPurchases([])
        setCart([])
        setWishlist([])
      }
    })
  }, [refreshDoc])

  return (
    <UserCtx.Provider value={{
      user, userDoc, purchases, cart, wishlist,
      setPurchases, setCart, setWishlist,
      refreshDoc, docLoading,
      loading: user === undefined,
    }}>
      {children}
    </UserCtx.Provider>
  )
}

export const useUser = () => useContext(UserCtx)
