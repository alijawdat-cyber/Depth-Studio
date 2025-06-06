'use client'

import { useEffect, useRef } from 'react'
import { useAuth } from '@/store/auth-store'
import { onAuthStateChange } from '@/lib/auth'

export function AuthInitializer({ children }: { children: React.ReactNode }) {
  const { initialize, refreshUser } = useAuth()
  const initializeCalledRef = useRef(false)

  useEffect(() => {
    // Initialize auth state on app start - only once
    if (!initializeCalledRef.current) {
      console.log('🔥 AuthInitializer: Starting initialization...')
      initialize()
      initializeCalledRef.current = true
    }

    // Listen to Firebase auth state changes
    const unsubscribe = onAuthStateChange(async (firebaseUser) => {
      console.log('🔥 Firebase auth state changed:', firebaseUser?.uid || 'logged out')
      
      if (firebaseUser) {
        // User signed in - refresh their profile from Firestore
        console.log('⏳ Refreshing user profile after auth state change...')
        await refreshUser()
        console.log('✅ User profile refreshed')
      } else {
        // User signed out - handled by store
        console.log('👋 User signed out')
      }
    })

    // Cleanup subscription on unmount
    return unsubscribe
  }, [initialize, refreshUser])

  return <>{children}</>
} 