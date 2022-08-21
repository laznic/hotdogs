import { useRef, useEffect } from 'react'

export default function useAnimationFrame (callback: () => void, deps: unknown) {
  // Use useRef for mutable variables that we want to persist
  // without triggering a re-render on their change
  const requestRef = useRef<number>()
  /**
   * The callback function is automatically passed a timestamp indicating
   * the precise time requestAnimationFrame() was called.
   */

  useEffect(() => {
    const animate = () => {
      callback()
      requestRef.current = requestAnimationFrame(animate)
    }
  
    requestRef.current = requestAnimationFrame(animate)
    return () => {
      cancelAnimationFrame(requestRef.current as number)
    }
  }, [deps]) // Make sure the effect runs only once
}