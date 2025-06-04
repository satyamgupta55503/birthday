"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Share2, Facebook, Twitter, Instagram, Linkedin, Copy, Check, X } from "lucide-react"

export default function SocialShare() {
  const [isOpen, setIsOpen] = useState(false)
  const [copied, setCopied] = useState(false)

  const shareUrl = typeof window !== "undefined" ? window.location.href : "https://archi-birthday-2080.vercel.app"
  const shareTitle = "Join Archi's 18th Birthday Celebration! 🎉"
  const shareText =
    "Check out this amazing futuristic birthday website for Archi's 18th birthday! Join the celebration in 2080 style!"

  const shareLinks = [
    {
      name: "Facebook",
      icon: Facebook,
      color: "from-blue-500 to-blue-700",
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(shareTitle)}`,
    },
    {
      name: "Twitter",
      icon: Twitter,
      color: "from-sky-400 to-blue-500",
      url: `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareTitle)}`,
    },
    {
      name: "LinkedIn",
      icon: Linkedin,
      color: "from-blue-600 to-blue-800",
      url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`,
    },
    {
      name: "Instagram",
      icon: Instagram,
      color: "from-pink-500 to-purple-600",
      url: `https://www.instagram.com/`,
      isApp: true,
    },
  ]

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleShare = (url: string, isApp: boolean = false) => {
    if (isApp) {
      // For apps like Instagram that don't have direct web share links
      if (navigator.share) {
        navigator.share({
          title: shareTitle,
          text: shareText,
          url: shareUrl,
        })
      } else {
        window.open(url, "_blank")
      }
    } else {
      window.open(url, "_blank", "width=600,height=400")
    }
    setIsOpen(false)
  }

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-52 right-4 md:right-8 z-40 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 rounded-full h-12 w-12 flex items-center justify-center shadow-lg shadow-blue-500/20"
      >
        <Share2 className="h-5 w-5" />
      </Button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
            onClick={() => setIsOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-md bg-black/40 backdrop-blur-md border border-cyan-500/30 rounded-3xl p-6 relative"
              onClick={(e) => e.stopPropagation()}
            >
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(false)}
                className="absolute top-2 right-2 h-8 w-8 rounded-full bg-black/50 text-white hover:bg-red-500/30"
              >
                <X className="h-4 w-4" />
              </Button>

              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                  Share This Celebration
                </h2>
                <p className="text-gray-300">Invite friends to Archi's birthday!</p>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                {shareLinks.map((link) => (
                  <Button
                    key={link.name}
                    onClick={() => handleShare(link.url, link.isApp)}
                    className={`bg-gradient-to-r ${link.color} hover:opacity-90 text-white font-medium py-6 rounded-xl flex flex-col items-center gap-2`}
                  >
                    <link.icon className="h-6 w-6" />
                    <span>{link.name}</span>
                  </Button>
                ))}
              </div>

              <div className="relative">
                <div className="flex items-center bg-black/30 border border-cyan-500/30 rounded-xl p-3 pr-12">
                  <input
                    type="text"
                    value={shareUrl}
                    readOnly
                    className="bg-transparent text-white text-sm w-full outline-none truncate"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={copyToClipboard}
                    className="absolute right-2 h-8 w-8 rounded-full bg-black/50 text-white hover:bg-cyan-500/30"
                  >
                    {copied ? <Check className="h-4 w-4 text-green-400" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
                {copied && (
                  <motion.p
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="text-xs text-green-400 mt-1 absolute"
                  >
                    Link copied to clipboard!
                  </motion.p>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
