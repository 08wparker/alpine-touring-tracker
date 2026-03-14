'use client'

import { useSession, signIn, signOut } from 'next-auth/react'
import { useState } from 'react'

export default function StravaAuth() {
  const { data: session, status } = useSession()
  const [isLoading, setIsLoading] = useState(false)

  const handleSignIn = async (provider: 'strava' | 'google') => {
    setIsLoading(true)
    try {
      await signIn(provider)
    } catch (error) {
      console.error('Sign in error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSignOut = async () => {
    setIsLoading(true)
    try {
      await signOut()
    } catch (error) {
      console.error('Sign out error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (status === 'loading') {
    return (
      <div className="flex items-center space-x-2">
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
        <span>Loading...</span>
      </div>
    )
  }

  if (session) {
    return (
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          {session.user?.image && (
            <img
              src={session.user.image}
              alt="Profile"
              className="w-8 h-8 rounded-full"
            />
          )}
          <span className="text-sm">
            Welcome, {session.user?.name}!
          </span>
        </div>
        <button
          onClick={handleSignOut}
          disabled={isLoading}
          className="px-3 py-1 text-sm bg-alpine-green-dark hover:bg-alpine-green rounded transition-colors disabled:opacity-50"
        >
          {isLoading ? 'Signing out...' : 'Sign out'}
        </button>
      </div>
    )
  }

  return (
    <div className="flex items-center space-x-2">
      <button
        onClick={() => handleSignIn('strava')}
        disabled={isLoading}
        className="flex items-center space-x-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors disabled:opacity-50"
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path d="M15.387 17.944l-2.089-4.116h-3.065L15.387 24l5.15-10.172h-3.066m-7.008-5.599l2.836 5.599h4.172L10.463 0l-7.74 15.173h4.172"/>
        </svg>
        <span>{isLoading ? 'Connecting...' : 'Strava'}</span>
      </button>
      <button
        onClick={() => handleSignIn('google')}
        disabled={isLoading}
        className="flex items-center space-x-2 px-4 py-2 bg-white hover:bg-gray-100 text-gray-700 border border-gray-300 rounded-lg transition-colors disabled:opacity-50"
      >
        <svg width="20" height="20" viewBox="0 0 24 24">
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
        </svg>
        <span>{isLoading ? 'Connecting...' : 'Google'}</span>
      </button>
    </div>
  )
}
