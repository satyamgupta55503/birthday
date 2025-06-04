"use client"

import { useState, useEffect } from "react"

// Custom hook for media loading with error handling
export function useMediaLoader(src: string, type: "audio" | "video" | "image") {
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)
  const [mediaElement, setMediaElement] = useState<HTMLAudioElement | HTMLVideoElement | null>(null)

  useEffect(() => {
    if (!src) {
      setHasError(true)
      setIsLoading(false)
      return
    }

    // Reset states when src changes
    setIsLoading(true)
    setHasError(false)

    let element: HTMLAudioElement | HTMLVideoElement | HTMLImageElement

    if (type === "audio") {
      element = new Audio(src)
    } else if (type === "video") {
      element = document.createElement("video")
      element.src = src
    } else {
      element = new Image()
      element.src = src
      if (type === "image") {
        element.onload = () => {
          setIsLoading(false)
        }
        element.onerror = () => {
          setIsLoading(false)
          setHasError(true)
        }
        return
      }
    }

    if (type === "audio" || type === "video") {
      element.onloadeddata = () => {
        setIsLoading(false)
        setMediaElement(element as HTMLAudioElement | HTMLVideoElement)
      }

      element.onerror = () => {
        setIsLoading(false)
        setHasError(true)
      }
    }

    return () => {
      if (type === "audio" || type === "video") {
        const media = element as HTMLAudioElement | HTMLVideoElement
        media.pause()
        media.src = ""
        media.load()
      }
    }
  }, [src, type])

  return { isLoading, hasError, mediaElement }
}

// Intersection Observer hook for lazy loading
export function useIntersectionObserver(options = { threshold: 0.1, rootMargin: "0px" }) {
  const [ref, setRef] = useState<HTMLElement | null>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    if (!ref) return

    const observer = new IntersectionObserver(([entry]) => {
      setIsVisible(entry.isIntersecting)
    }, options)

    observer.observe(ref)

    return () => {
      if (ref) observer.unobserve(ref)
    }
  }, [ref, options])

  return { ref: setRef, isVisible }
}

// Media query hook for responsive design
export function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(false)

  useEffect(() => {
    if (typeof window !== "undefined") {
      const media = window.matchMedia(query)

      // Initial check
      setMatches(media.matches)

      // Add listener
      const listener = (e: MediaQueryListEvent) => setMatches(e.matches)
      media.addEventListener("change", listener)

      // Clean up
      return () => media.removeEventListener("change", listener)
    }
  }, [query])

  return matches
}

// Network status hook
export function useNetworkStatus() {
  const [isOnline, setIsOnline] = useState(typeof navigator !== "undefined" ? navigator.onLine : true)

  useEffect(() => {
    if (typeof window === "undefined") return

    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)

    return () => {
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
    }
  }, [])

  return isOnline
}
