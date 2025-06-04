"use client"

import { useState, useEffect, useRef } from "react"
import { useIntersectionObserver } from "@/lib/hooks"
import { Loader2, AlertCircle } from "lucide-react"
import Image from "next/image"

interface LazyImageProps {
  src: string
  alt: string
  width: number
  height: number
  placeholderSrc?: string
  className?: string
  priority?: boolean
}

export function LazyImage({
  src,
  alt,
  width,
  height,
  placeholderSrc = "/placeholder.svg",
  className = "",
  priority = false,
}: LazyImageProps) {
  const [imgSrc, setImgSrc] = useState(priority ? src : placeholderSrc)
  const [isLoaded, setIsLoaded] = useState(false)
  const [hasError, setHasError] = useState(false)
  const { ref, isVisible } = useIntersectionObserver()

  useEffect(() => {
    // If priority is true, we already set the src, so no need to update
    if (priority) {
      setIsLoaded(true)
      return
    }

    // If element is visible and we haven't loaded the image yet
    if (isVisible && imgSrc === placeholderSrc) {
      const img = typeof window !== "undefined" ? new window.Image(0, 0) : null
      if (img) {
        img.src = src
        img.onload = () => {
          setImgSrc(src)
          setIsLoaded(true)
        }
        img.onerror = () => {
          setHasError(true)
          setIsLoaded(true)
        }
      }
    }
  }, [isVisible, src, imgSrc, placeholderSrc, priority])

  return (
    <div ref={ref} className={`relative overflow-hidden ${className}`} style={{ width, height }}>
      {!isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/20">
          <Loader2 className="h-6 w-6 text-cyan-400 animate-spin" />
        </div>
      )}

      {hasError && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/20 text-center p-2">
          <AlertCircle className="h-6 w-6 text-red-400 mb-1" />
          <span className="text-xs text-gray-400">Image not available</span>
        </div>
      )}

      <Image
        src={hasError ? placeholderSrc : imgSrc}
        alt={alt}
        width={width}
        height={height}
        className={`transition-opacity duration-300 ${isLoaded ? "opacity-100" : "opacity-0"}`}
        onLoad={() => setIsLoaded(true)}
        onError={() => {
          setHasError(true)
          setIsLoaded(true)
        }}
        priority={priority}
        loading={priority ? "eager" : "lazy"}
      />
    </div>
  )
}

interface LazyVideoProps {
  src: string
  poster?: string
  className?: string
  controls?: boolean
  autoPlay?: boolean
  muted?: boolean
  loop?: boolean
  onError?: () => void
  onLoad?: () => void
}

export function LazyVideo({
  src,
  poster = "/placeholder.svg?height=400&width=600",
  className = "",
  controls = true,
  autoPlay = false,
  muted = true,
  loop = false,
  onError,
  onLoad,
}: LazyVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const { ref, isVisible } = useIntersectionObserver()
  const [isLoaded, setIsLoaded] = useState(false)
  const [hasError, setHasError] = useState(false)

  useEffect(() => {
    if (!isVisible || !videoRef.current) return

    const video = videoRef.current

    if (!video.src) {
      video.src = src
    }

    if (autoPlay && isVisible) {
      video.play().catch((err) => {
        console.error("Video play failed:", err)
        setHasError(true)
        if (onError) onError()
      })
    }
  }, [isVisible, src, autoPlay, onError])

  const handleError = () => {
    console.error("Video failed to load:", src)
    setHasError(true)
    if (onError) onError()
  }

  const handleLoad = () => {
    setIsLoaded(true)
    if (onLoad) onLoad()
  }

  return (
    <div ref={ref} className={`relative ${className}`}>
      {!isLoaded && !hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
          <Loader2 className="h-8 w-8 text-cyan-400 animate-spin" />
        </div>
      )}

      {hasError && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 text-center">
          <AlertCircle className="h-10 w-10 text-red-400 mb-2" />
          <p className="text-gray-400">Video not available</p>
          <p className="text-sm text-gray-500 mt-1">Placeholder content for demo</p>
        </div>
      )}

      <video
        ref={videoRef}
        className={`w-full h-full object-cover rounded-xl ${hasError ? "opacity-30" : ""}`}
        controls={controls && !hasError}
        autoPlay={autoPlay && !hasError}
        muted={muted}
        loop={loop}
        poster={poster}
        onError={handleError}
        onLoadedData={handleLoad}
        playsInline
      >
        <source src={isVisible ? src : ""} type="video/mp4" />
        Your browser does not support the video tag.
      </video>
    </div>
  )
}

interface LazyAudioProps {
  src: string
  className?: string
  controls?: boolean
  autoPlay?: boolean
  loop?: boolean
  onPlay?: () => void
  onPause?: () => void
  onError?: () => void
}

export function LazyAudio({
  src,
  className = "",
  controls = true,
  autoPlay = false,
  loop = false,
  onPlay,
  onPause,
  onError,
}: LazyAudioProps) {
  const audioRef = useRef<HTMLAudioElement>(null)
  const { ref, isVisible } = useIntersectionObserver()
  const [isLoaded, setIsLoaded] = useState(false)
  const [hasError, setHasError] = useState(false)

  useEffect(() => {
    if (!isVisible || !audioRef.current) return

    const audio = audioRef.current

    if (!audio.src) {
      audio.src = src
    }

    if (autoPlay && isVisible) {
      audio.play().catch((err) => {
        console.error("Audio play failed:", err)
        setHasError(true)
        if (onError) onError()
      })
    }

    return () => {
      if (audio) {
        audio.pause()
      }
    }
  }, [isVisible, src, autoPlay, onError])

  const handleError = () => {
    console.error("Audio failed to load:", src)
    setHasError(true)
    if (onError) onError()
  }

  const handlePlay = () => {
    if (onPlay) onPlay()
  }

  const handlePause = () => {
    if (onPause) onPause()
  }

  return (
    <div ref={ref} className={`relative ${className}`}>
      {!isLoaded && !hasError && (
        <div className="px-2 py-1 bg-black/30 rounded-full text-xs text-cyan-400 inline-flex items-center">
          <Loader2 className="h-3 w-3 mr-1 animate-spin" />
          Loading audio...
        </div>
      )}

      {hasError && (
        <div className="px-2 py-1 bg-black/30 rounded-full text-xs text-red-400 inline-flex items-center">
          <AlertCircle className="h-3 w-3 mr-1" />
          Audio unavailable
        </div>
      )}

      <audio
        ref={audioRef}
        className={className}
        controls={controls && !hasError}
        autoPlay={autoPlay && !hasError}
        loop={loop}
        onError={handleError}
        onLoadedData={() => setIsLoaded(true)}
        onPlay={handlePlay}
        onPause={handlePause}
        preload="metadata"
      >
        <source src={isVisible ? src : ""} type="audio/mpeg" />
        Your browser does not support the audio element.
      </audio>
    </div>
  )
}
