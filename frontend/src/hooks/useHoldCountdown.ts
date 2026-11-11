import { useState, useEffect, useRef } from "react"

export interface CountdownResult {
  formatted: string
  isExpired: boolean
  isWarning: boolean
  totalSecondsRemaining: number
}

/**
 * Calculates remaining time against backend expiresAt.
 * Frontend does not modify hold state independently; it triggers a refetch from the backend when the timer elapses.
 */
export function useHoldCountdown(
  expiresAt: string | undefined,
  onExpire?: () => void
): CountdownResult {
  const calculateRemainingSeconds = () => {
    if (!expiresAt) return 0
    const expiryTime = new Date(expiresAt).getTime()
    if (isNaN(expiryTime)) return 0
    const now = Date.now()
    return Math.max(0, Math.floor((expiryTime - now) / 1000))
  }

  const [secondsRemaining, setSecondsRemaining] = useState<number>(calculateRemainingSeconds)
  const hasTriggeredExpire = useRef(false)

  useEffect(() => {
    hasTriggeredExpire.current = false
    setSecondsRemaining(calculateRemainingSeconds())
  }, [expiresAt])

  useEffect(() => {
    if (!expiresAt) return

    const intervalId = setInterval(() => {
      const remaining = calculateRemainingSeconds()
      setSecondsRemaining(remaining)

      if (remaining <= 0) {
        if (!hasTriggeredExpire.current) {
          hasTriggeredExpire.current = true
          onExpire?.()
        }
      }
    }, 1000)

    return () => clearInterval(intervalId)
  }, [expiresAt, onExpire])

  if (!expiresAt || isNaN(new Date(expiresAt).getTime())) {
    return {
      formatted: "--:--",
      isExpired: false,
      isWarning: false,
      totalSecondsRemaining: 0,
    }
  }

  const isExpired = secondsRemaining <= 0
  const isWarning = !isExpired && secondsRemaining < 60

  let formatted = "Checking hold status..."
  if (!isExpired) {
    const minutes = Math.floor(secondsRemaining / 60)
    const seconds = secondsRemaining % 60
    formatted = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`
  }

  return {
    formatted,
    isExpired,
    isWarning,
    totalSecondsRemaining: secondsRemaining,
  }
}
