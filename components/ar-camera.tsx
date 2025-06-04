"use client"

import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Camera, Download, X, Sparkles, Crown, Star, Heart, Gift, Share2 } from "lucide-react"

export default function ARCamera() {
  const [isOpen, setIsOpen] = useState(false)
  const [currentFilter, setCurrentFilter] = useState(0)
  const [capturedImage, setCapturedImage] = useState<string | null>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)

  const filters = [
    { name: "Birthday Crown", icon: Crown, overlay: "/ar-filters/crown.png" },
    { name: "Star Sparkles", icon: Star, overlay: "/ar-filters/sparkles.png" },
    { name: "Birthday Hearts", icon: Heart, overlay: "/ar-filters/hearts.png" },
    { name: "Gift Box", icon: Gift, overlay: "/ar-filters/gift.png" },
  ]

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" },
        audio: false,
      })

      if (videoRef.current) {
        videoRef.current.srcObject = stream
        streamRef.current = stream
      }
    } catch (err) {
      console.error("Error accessing camera:", err)
      alert("Unable to access camera. Please ensure you've granted camera permissions.")
    }
  }

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop())
      streamRef.current = null
    }
  }

  useEffect(() => {
    if (isOpen) {
      startCamera()
    } else {
      stopCamera()
    }

    return () => {
      stopCamera()
    }
  }, [isOpen])

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current
      const canvas = canvasRef.current
      const context = canvas.getContext("2d")

      if (context) {
        // Set canvas dimensions to match video
        canvas.width = video.videoWidth
        canvas.height = video.videoHeight

        // Draw video frame to canvas
        context.drawImage(video, 0, 0, canvas.width, canvas.height)

        // Draw the current filter overlay
        const filterImg = new Image()
        filterImg.crossOrigin = "anonymous"
        filterImg.src = filters[currentFilter].overlay

        filterImg.onload = () => {
          // Position the filter appropriately (e.g., crown on head)
          const filterPositions = [
            { x: 0, y: 0, w: canvas.width, h: canvas.height * 0.5 }, // Crown at top
            { x: 0, y: 0, w: canvas.width, h: canvas.height }, // Sparkles all over
            { x: canvas.width * 0.2, y: canvas.height * 0.2, w: canvas.width * 0.6, h: canvas.height * 0.6 }, // Hearts in center
            { x: canvas.width * 0.3, y: canvas.height * 0.6, w: canvas.width * 0.4, h: canvas.height * 0.4 }, // Gift at bottom
          ]

          const pos = filterPositions[currentFilter]
          context.drawImage(filterImg, pos.x, pos.y, pos.w, pos.h)

          // Convert to data URL and set as captured image
          const imageDataURL = canvas.toDataURL("image/png")
          setCapturedImage(imageDataURL)
        }
      }
    }
  }

  const downloadImage = () => {
    if (capturedImage) {
      const link = document.createElement("a")
      link.href = capturedImage
      link.download = `archi-birthday-${Date.now()}.png`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }

  const shareImage = async () => {
    if (capturedImage && navigator.share) {
      try {
        // Convert data URL to blob
        const response = await fetch(capturedImage)
        const blob = await response.blob()
        const file = new File([blob], "archi-birthday.png", { type: "image/png" })

        await navigator.share({
          title: "Archi's 18th Birthday",
          text: "Check out my AR photo from Archi's 18th Birthday celebration!",
          files: [file],
        })
      } catch (error) {
        console.error("Error sharing:", error)
      }
    } else {
      alert("Web Share API not supported on this browser")
    }
  }

  const resetCamera = () => {
    setCapturedImage(null)
  }

  const nextFilter = () => {
    setCurrentFilter((prev) => (prev + 1) % filters.length)
  }

  const prevFilter = () => {
    setCurrentFilter((prev) => (prev - 1 + filters.length) % filters.length)
  }

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-20 right-4 md:right-8 z-40 bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 rounded-full h-12 w-12 flex items-center justify-center shadow-lg shadow-purple-500/20"
      >
        <Camera className="h-5 w-5" />
      </Button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/90 flex flex-col items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="relative w-full max-w-md mx-auto bg-black/40 backdrop-blur-md border border-cyan-500/30 rounded-3xl p-4 overflow-hidden"
            >
              <div className="absolute top-2 right-2 z-10">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsOpen(false)}
                  className="h-8 w-8 rounded-full bg-black/50 text-white hover:bg-red-500/30"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="text-center mb-4">
                <h3 className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                  AR Birthday Camera
                </h3>
                <p className="text-sm text-gray-300">Take a photo with birthday filters!</p>
              </div>

              <div className="relative aspect-[3/4] bg-black rounded-xl overflow-hidden mb-4">
                {!capturedImage ? (
                  <>
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <img
                        src={filters[currentFilter].overlay || "/placeholder.svg"}
                        alt="AR Filter"
                        className="w-full h-full object-contain pointer-events-none"
                      />
                    </div>
                  </>
                ) : (
                  <img
                    src={capturedImage || "/placeholder.svg"}
                    alt="Captured"
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                )}
                <canvas ref={canvasRef} className="hidden" />
              </div>

              <div className="flex justify-center gap-3 mb-4">
                {capturedImage ? (
                  <>
                    <Button
                      onClick={resetCamera}
                      className="bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white rounded-xl"
                    >
                      <Camera className="h-4 w-4 mr-2" />
                      New Photo
                    </Button>
                    <Button
                      onClick={downloadImage}
                      className="bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 text-white rounded-xl"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Save
                    </Button>
                    <Button
                      onClick={shareImage}
                      className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white rounded-xl"
                    >
                      <Share2 className="h-4 w-4 mr-2" />
                      Share
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      onClick={prevFilter}
                      className="bg-gradient-to-r from-purple-500/50 to-pink-500/50 hover:from-purple-600/50 hover:to-pink-600/50 text-white rounded-xl"
                    >
                      Previous
                    </Button>
                    <Button
                      onClick={capturePhoto}
                      className="bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 text-white rounded-xl"
                    >
                      <Sparkles className="h-4 w-4 mr-2" />
                      Capture
                    </Button>
                    <Button
                      onClick={nextFilter}
                      className="bg-gradient-to-r from-pink-500/50 to-purple-500/50 hover:from-pink-600/50 hover:to-purple-600/50 text-white rounded-xl"
                    >
                      Next
                    </Button>
                  </>
                )}
              </div>

              <div className="text-center text-sm text-cyan-300">
                {!capturedImage && `Filter: ${filters[currentFilter].name}`}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
