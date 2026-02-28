import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import AuthForm from '../components/AuthForm'
import { useUser } from '../lib/UserContext'

export default function RegisterPage() {
  const { user, loading } = useUser()
  const navigate = useNavigate()

  // Already logged in → redirect to store
  useEffect(() => {
    if (!loading && user) navigate('/', { replace: true })
  }, [user, loading, navigate])

  if (loading) return null

  return <AuthForm mode="register" />
}
