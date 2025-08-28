'use client'

import { useState, useEffect } from 'react'

export function useUser() {
  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => {
    // Get or create user ID (simplified - no real auth)
    let id = localStorage.getItem('user_id')
    if (!id) {
      id = `user_${Math.random().toString(36).substr(2, 9)}_${Date.now()}`
      localStorage.setItem('user_id', id)
    }
    setUserId(id)
  }, [])

  return { userId }
}