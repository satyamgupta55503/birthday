"use client"

import { useState, useEffect, useRef, useCallback, Suspense, lazy } from "react"
import { motion, useScroll, useTransform, useMotionValue, useSpring, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Slider } from "@/components/ui/slider"
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Send,
  Sparkles,
  Star,
  Heart,
  Gift,
  SkipForward,
  Eye,
  Cpu,
  ChevronLeft,
  ChevronRight,
  Calendar,
  Award,
  Palette,
  Rocket,
  Brain,
  MapPin,
  AlertCircle,
  Loader2,
} from "lucide-react"
import { Canvas } from "@react-three/fiber"
import { OrbitControls, Sphere, MeshDistortMaterial, Float } from "@react-three/drei"
import { LazyImage, LazyVideo } from "@/components/lazy-media"
import { useIntersectionObserver, useMediaQuery, useNetworkStatus } from "@/lib/hooks"
import ErrorBoundary from "@/components/error-boundary"
import { Section } from "@/components/seo-sections"

// Lazily loaded components for better initial loading
const ARCamera = lazy(() => import("@/components/ar-camera"))
const GuestBook = lazy(() => import("@/components/guest-book"))
const SocialShare = lazy(() => import("@/components/social-share"))
const NotificationManager = lazy(() => import("@/components/notification-manager"))

// Suspense fallback for lazy-loaded components
const SuspenseFallback = () => (
  <div className="w-12 h-12 flex items-center justify-center">
    <Loader2 className="h-5 w-5 text-cyan-400 animate-spin" />
  </div>
)

// 3D Planet Component
const Planet3D = () => {
  return (
    <Float speed={1.4} rotationIntensity={1} floatIntensity={2}>
      <Sphere args={[1, 100, 200]} scale={2.4}>
        <MeshDistortMaterial color="#8352fd" attach="material" distort={0.3} speed={1.5} roughness={0} />
      </Sphere>
    </Float>
  )
}

// Interactive Star Component
type InteractiveStarProps = {
  x: number
  y: number
  delay?: number
  onClick?: (id: number, x: number, y: number) => void
  id: number
}

const InteractiveStar = ({ x, y, delay = 0, onClick, id }: InteractiveStarProps) => {
  return (
    <motion.div
      className="absolute w-2 h-2 bg-white rounded-full cursor-pointer hover:scale-150 transition-transform"
      initial={{ opacity: 0.3, scale: 1 }}
      animate={{
        opacity: [0.3, 1, 0.3],
        scale: [1, 1.5, 1],
      }}
      transition={{
        duration: 2 + Math.random() * 3,
        repeat: Number.POSITIVE_INFINITY,
        delay: delay,
      }}
      style={{ left: x, top: y }}
      onClick={() => onClick && onClick(id, x, y)}
    />
  )
}

// Constellation Line Component
type StarPoint = { x: number; y: number; id?: number }

const ConstellationLine = ({ start, end }: { start: StarPoint; end: StarPoint }) => {
  const length = Math.sqrt(Math.pow(end.x - start.x, 2) + Math.pow(end.y - start.y, 2))
  const angle = (Math.atan2(end.y - start.y, end.x - start.x) * 180) / Math.PI

  return (
    <motion.div
      className="absolute bg-gradient-to-r from-cyan-400 to-purple-400 h-0.5 origin-left pointer-events-none"
      initial={{ width: 0, opacity: 0 }}
      animate={{ width: length, opacity: 0.8 }}
      transition={{ duration: 0.5 }}
      style={{
        left: start.x,
        top: start.y,
        transform: `rotate(${angle}deg)`,
        filter: "drop-shadow(0 0 4px rgba(0, 255, 255, 0.6))",
      }}
    />
  )
}

// Shooting Star Component
const ShootingStar = ({ delay = 0 }) => {
  return (
    <motion.div
      className="absolute w-2 h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent"
      initial={{
        x: -100,
        y: Math.random() * (typeof window !== "undefined" ? window.innerHeight : 800),
        opacity: 0,
      }}
      animate={{
        x: (typeof window !== "undefined" ? window.innerWidth : 1200) + 100,
        y: Math.random() * (typeof window !== "undefined" ? window.innerHeight : 800) + 200,
        opacity: [0, 1, 0],
      }}
      transition={{
        duration: 2,
        delay: delay,
        ease: "easeOut",
      }}
    />
  )
}

// Enhanced Particle Component
const Particle = ({ delay = 0 }) => {
  return (
    <motion.div
      className="absolute w-1 h-1 bg-gradient-to-r from-cyan-400 to-purple-500 rounded-full"
      initial={{
        x: Math.random() * (typeof window !== "undefined" ? window.innerWidth : 1200),
        y: Math.random() * (typeof window !== "undefined" ? window.innerHeight : 800),
        opacity: 0,
      }}
      animate={{
        x: Math.random() * (typeof window !== "undefined" ? window.innerWidth : 1200),
        y: Math.random() * (typeof window !== "undefined" ? window.innerHeight : 800),
        opacity: [0, 1, 0],
        scale: [0, 1, 0],
      }}
      transition={{
        duration: Math.random() * 10 + 5,
        repeat: Number.POSITIVE_INFINITY,
        delay: delay,
        ease: "linear",
      }}
    />
  )
}

// Video Intro Component with Error Handling
const VideoIntro = ({ onSkip }: { onSkip: () => void }) => {
  const [showSkip, setShowSkip] = useState(false)
  const [videoError, setVideoError] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const isOnline = useNetworkStatus()

  useEffect(() => {
    const timer = setTimeout(() => setShowSkip(true), 3000)
    return () => clearTimeout(timer)
  }, [])

  const handleVideoError = () => {
    console.log("Video failed to load, skipping intro")
    setVideoError(true)
    setTimeout(onSkip, 1000) // Auto-skip if video fails
  }

  const handleVideoLoad = () => {
    console.log("Video loaded successfully")
  }

  // If offline, show static intro
  if (!isOnline) {
    return (
      <motion.div
        initial={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black flex items-center justify-center"
      >
        <div className="text-center max-w-md px-4">
          <motion.h1
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent mb-4"
          >
            ARCHI TURNS 18
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="text-lg md:text-xl text-white mb-4"
          >
            Welcome to the Future
          </motion.p>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }}>
            <p className="text-yellow-400 mb-6">
              <AlertCircle className="inline w-4 h-4 mr-2" />
              You appear to be offline. Limited features available.
            </p>
            <Button
              onClick={onSkip}
              className="bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 text-white"
            >
              Enter Celebration
            </Button>
          </motion.div>
        </div>
      </motion.div>
    )
  }

  if (videoError) {
    return (
      <motion.div
        initial={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black flex items-center justify-center"
      >
        <div className="text-center">
          <motion.h1
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent mb-4"
          >
            ARCHI TURNS 18
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="text-lg md:text-xl text-white mb-8"
          >
            Welcome to the Future
          </motion.p>
          <Button
            onClick={onSkip}
            className="bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 text-white font-semibold py-3 px-8 rounded-xl"
          >
            Enter Celebration
          </Button>
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black flex items-center justify-center"
    >
      <LazyVideo
        src="/birthday-intro.mp4"
        poster="/placeholder.svg?height=600&width=1200"
        className="w-full h-full object-cover"
        autoPlay
        muted
        controls={false}
        onError={handleVideoError}
        onLoad={handleVideoLoad}
      />

      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/50" />

      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-center">
        <motion.h1
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
          className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent mb-4"
        >
          ARCHI TURNS 18
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.5 }}
          className="text-lg md:text-xl text-white mb-8"
        >
          Welcome to the Future
        </motion.p>
      </div>

      {showSkip && (
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={onSkip}
          aria-label="Skip intro"
          className="absolute top-4 md:top-8 right-4 md:right-8 bg-black/50 backdrop-blur-md border border-cyan-500/30 px-3 md:px-4 py-2 rounded-full text-cyan-300 hover:bg-cyan-500/20 transition-all text-sm md:text-base"
        >
          <SkipForward className="w-4 h-4 mr-2 inline" />
          Skip Intro
        </motion.button>
      )}
    </motion.div>
  )
}

// Interactive Quiz Component
const InteractiveQuiz = () => {
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [score, setScore] = useState(0)
  const [showResult, setShowResult] = useState(false)
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)

  const questions = [
    {
      question: "When is Archi's birthday?",
      options: ["June 4, 2007", "July 4, 2007", "June 4, 2006", "May 4, 2007"],
      correct: 0,
      icon: Calendar,
    },
    {
      question: "What age is Archi turning?",
      options: ["17", "18", "19", "20"],
      correct: 1,
      icon: Award,
    },
    {
      question: "What's Archi's favorite theme?",
      options: ["Retro", "Cyberpunk", "Minimalist", "Classic"],
      correct: 1,
      icon: Palette,
    },
    {
      question: "What does Archi love most?",
      options: ["Gaming", "Technology", "Adventures", "All of the above"],
      correct: 3,
      icon: Heart,
    },
    {
      question: "Archi's dream for 2080?",
      options: ["Space Travel", "AI Research", "Time Travel", "All possibilities"],
      correct: 3,
      icon: Rocket,
    },
  ]

  const handleAnswer = (answerIndex: number) => {
    setSelectedAnswer(answerIndex)
    setTimeout(() => {
      if (answerIndex === questions[currentQuestion].correct) {
        setScore(score + 1)
      }

      if (currentQuestion < questions.length - 1) {
        setCurrentQuestion(currentQuestion + 1)
        setSelectedAnswer(null)
      } else {
        setShowResult(true)
      }
    }, 1000)
  }

  const resetQuiz = () => {
    setCurrentQuestion(0)
    setScore(0)
    setShowResult(false)
    setSelectedAnswer(null)
  }

  if (showResult) {
    return (
      <div className="max-w-2xl mx-auto">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-black/20 backdrop-blur-md border border-cyan-500/30 rounded-3xl p-8 text-center"
        >
          <Brain className="w-16 h-16 text-cyan-400 mx-auto mb-6" />
          <h3 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent mb-4">
            Quiz Complete!
          </h3>
          <div className="text-6xl font-bold text-white mb-4" aria-live="polite">
            {score}/{questions.length}
          </div>
          <p className="text-xl text-gray-300 mb-6">
            {score === questions.length
              ? "Perfect! You know Archi amazingly well! 🎉"
              : score >= 3
                ? "Great job! You're a true friend! 👏"
                : "Good try! Spend more time with Archi! 😊"}
          </p>
          <Button
            onClick={resetQuiz}
            className="bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 text-white font-semibold py-3 px-8 rounded-xl"
          >
            Try Again
          </Button>
        </motion.div>
      </div>
    )
  }

  const CurrentIcon = questions[currentQuestion].icon

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-black/20 backdrop-blur-md border border-cyan-500/30 rounded-3xl p-6 md:p-8">
        <div className="flex items-center justify-between mb-6">
          <Badge className="bg-gradient-to-r from-cyan-500 to-purple-500 text-white">
            Question {currentQuestion + 1}/{questions.length}
          </Badge>
          <div className="text-cyan-300">Score: {score}</div>
        </div>

        <div className="text-center mb-8">
          <CurrentIcon className="w-12 h-12 text-purple-400 mx-auto mb-4" />
          <h3 className="text-xl md:text-2xl font-bold text-white mb-6">{questions[currentQuestion].question}</h3>
        </div>

        <div className="grid gap-3">
          {questions[currentQuestion].options.map((option, index) => (
            <motion.button
              key={index}
              onClick={() => handleAnswer(index)}
              disabled={selectedAnswer !== null}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`p-4 rounded-xl border text-left transition-all ${
                selectedAnswer === null
                  ? "border-purple-500/30 bg-black/30 hover:border-cyan-400/50 hover:bg-cyan-500/10"
                  : selectedAnswer === index
                    ? index === questions[currentQuestion].correct
                      ? "border-green-500 bg-green-500/20 text-green-300"
                      : "border-red-500 bg-red-500/20 text-red-300"
                    : index === questions[currentQuestion].correct
                      ? "border-green-500 bg-green-500/20 text-green-300"
                      : "border-gray-500/30 bg-gray-500/10 text-gray-400"
              }`}
              aria-pressed={selectedAnswer === index}
            >
              <span className="text-white font-medium">{option}</span>
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  )
}

// Timeline Component
const Timeline = () => {
  const timelineEvents = [
    {
      year: "2007",
      title: "Born",
      description: "Archi enters the world on June 4th",
      icon: Star,
      color: "from-pink-400 to-purple-600",
    },
    {
      year: "2010",
      title: "First Steps",
      description: "Beginning the journey of discovery",
      icon: MapPin,
      color: "from-cyan-400 to-blue-600",
    },
    {
      year: "2013",
      title: "School Begins",
      description: "Starting the educational adventure",
      icon: Calendar,
      color: "from-green-400 to-cyan-600",
    },
    {
      year: "2016",
      title: "Growing Mind",
      description: "Developing interests and passions",
      icon: Brain,
      color: "from-purple-400 to-pink-600",
    },
    {
      year: "2019",
      title: "Teen Years",
      description: "Exploring identity and friendships",
      icon: Heart,
      color: "from-yellow-400 to-orange-600",
    },
    {
      year: "2022",
      title: "High School",
      description: "Academic achievements and growth",
      icon: Award,
      color: "from-indigo-400 to-purple-600",
    },
    {
      year: "2024",
      title: "Pre-Adult",
      description: "Preparing for the next chapter",
      icon: Rocket,
      color: "from-teal-400 to-blue-600",
    },
    {
      year: "2025",
      title: "Turning 18!",
      description: "Welcome to adulthood, Archi!",
      icon: Gift,
      color: "from-cyan-400 to-purple-600",
    },
  ]

  return (
    <div className="max-w-4xl mx-auto">
      <div className="relative">
        {/* Timeline line */}
        <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-cyan-400 via-purple-400 to-pink-400 transform md:-translate-x-1/2" />

        {timelineEvents.map((event, index) => {
          const EventIcon = event.icon
          const isEven = index % 2 === 0

          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: isEven ? -50 : 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.2, duration: 0.6 }}
              viewport={{ once: true }}
              className={`relative flex items-center mb-8 md:mb-12 ${isEven ? "md:flex-row-reverse" : ""}`}
            >
              {/* Timeline dot */}
              <div className="absolute left-4 md:left-1/2 w-4 h-4 bg-gradient-to-r from-cyan-400 to-purple-400 rounded-full transform md:-translate-x-1/2 z-10 border-2 border-black" />

              {/* Content */}
              <div className={`ml-12 md:ml-0 md:w-5/12 ${isEven ? "md:mr-auto md:text-right" : "md:ml-auto"}`}>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="bg-black/20 backdrop-blur-md border border-cyan-500/30 rounded-2xl p-6 relative overflow-hidden group"
                >
                  <div
                    className={`absolute inset-0 bg-gradient-to-br ${event.color} opacity-0 group-hover:opacity-10 transition-opacity`}
                  />

                  <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-3">
                      <EventIcon className="w-6 h-6 text-cyan-400" />
                      <Badge className={`bg-gradient-to-r ${event.color} text-white`}>{event.year}</Badge>
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">{event.title}</h3>
                    <p className="text-gray-300">{event.description}</p>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}

// Enhanced Photo Gallery Component (12 photos)
const PhotoGallery3D = () => {
  const photos = [
    {
      src: "/babyarchi.png",
      year: "2007",
      caption: "Baby Archi",
      color: "from-pink-400 to-purple-600",
    },
    {
      src: "/placeholder-logo.png",
      year: "2009",
      caption: "Toddler Days",
      color: "from-cyan-400 to-blue-600",
    },
    {
      src: "/placeholder-user.jpg",
      year: "2011",
      caption: "Little Explorer",
      color: "from-green-400 to-cyan-600",
    },
{
  src: "/arch.JPG",
  year: "2024",
  caption: "Little Explorer",
  color: "from-green-400 to-cyan-600",
},
{
  src: "/archis.JPG",
   year: "2024",
  caption: "Little Explorer",
  color: "from-green-400 to-cyan-600",
},
{
  src: "/ar.jpg",
  year: "2024",
  caption: "Little Explorer",
  color: "from-green-400 to-cyan-600",
},
{
  src: "/holi.jpg",
   year: "2024",
  caption: "Little Explorer",
  color: "from-green-400 to-cyan-600",
}
  ]

  type Photo = {
    src: string
    year: string
    caption: string
    color: string
  }

  interface PhotoItemProps {
    photo: Photo
    index: number
  }

  const PhotoItem = ({ photo, index }: PhotoItemProps) => {
    const { ref, isVisible } = useIntersectionObserver({ threshold: 0.1, rootMargin: "0px" })

    return (
      <motion.div
        key={index}
        ref={ref}
        initial={{ opacity: 0, rotateY: 180, scale: 0.8 }}
        animate={isVisible ? { opacity: 1, rotateY: 0, scale: 1 } : {}}
        transition={{ delay: index * 0.1, duration: 0.8 }}
        whileHover={{ scale: 1.05, rotateY: 10 }}
        className="relative group perspective-1000"
      >
        <div className="relative w-full h-48 md:h-64 bg-black/20 backdrop-blur-md border border-cyan-500/30 rounded-2xl p-3 overflow-hidden transform-gpu">
          <div
            className={`absolute inset-0 bg-gradient-to-br ${photo.color} opacity-0 group-hover:opacity-20 transition-opacity duration-300`}
          />

          <LazyImage
            src={photo.src}
            alt={photo.caption}
            width={400}
            height={400}
            className="w-full h-32 md:h-40 object-cover rounded-xl mb-2"
            placeholderSrc="/placeholder.svg?height=400&width=400"
          />

          <div className="relative z-10">
            <Badge className={`bg-gradient-to-r ${photo.color} text-white text-xs mb-1`}>{photo.year}</Badge>
            <p className="text-white text-sm font-medium">{photo.caption}</p>
          </div>

          {/* 3D Floating particles around image */}
          <div className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
            {isVisible &&
              Array.from({ length: 5 }).map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-1 h-1 bg-cyan-400 rounded-full"
                  animate={{
                    x: [0, Math.random() * 50 - 25],
                    y: [0, Math.random() * 50 - 25],
                    scale: [0, 1, 0],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Number.POSITIVE_INFINITY,
                    delay: i * 0.2,
                  }}
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                  }}
                />
              ))}
          </div>
        </div>
      </motion.div>
    )
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 max-w-7xl mx-auto">
      {photos.map((photo, index) => (
        <PhotoItem key={index} photo={photo} index={index} />
      ))}
    </div>
  )
}

// Video Gallery Component with Error Handling
const VideoGallery = () => {
  const [currentVideo, setCurrentVideo] = useState(0)
  const [videoError, setVideoError] = useState({})

  const videos = [
    { src: "/archsa.mp4", title: "Birthday Wishes 2024", description: "Friends and family sending love" },
    { src: "/archsa.mp4", title: "Childhood Memories", description: "Growing up through the years" },
  ]

  const handleVideoError = (index: number) => {
    setVideoError((prev) => ({ ...prev, [index]: true }))
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Main Video Player */}
      <ErrorBoundary>
        <div className="mb-8">
          <motion.div
            key={currentVideo}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-black/20 backdrop-blur-md border border-cyan-500/30 rounded-3xl p-4 md:p-6 overflow-hidden"
          >
            <LazyVideo
              src={videos[currentVideo].src}
              poster="/placeholder.svg?height=400&width=600"
              className="w-full h-64 md:h-96 rounded-2xl"
              onError={() => handleVideoError(currentVideo)}
            />

            <div className="mt-4">
              <h3 className="text-xl md:text-2xl font-bold text-white mb-2">{videos[currentVideo].title}</h3>
              <p className="text-gray-300">{videos[currentVideo].description}</p>
            </div>
          </motion.div>
        </div>
      </ErrorBoundary>

      {/* Video Thumbnails */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {videos.map((video, index) => {
          const { ref, isVisible } = useIntersectionObserver()

          return (
            <motion.div
              key={index}
              ref={ref}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setCurrentVideo(index)}
              className={`cursor-pointer rounded-xl overflow-hidden border-2 transition-all ${
                currentVideo === index
                  ? "border-cyan-400 shadow-lg shadow-cyan-400/25"
                  : "border-purple-500/30 hover:border-cyan-400/50"
              }`}
            >
              <div className="relative bg-black/30 backdrop-blur-md">
                <LazyImage
                  src="/placeholder.svg?height=120&width=200"
                  alt={video.title}
                  width={200}
                  height={120}
                  className="w-full h-20 md:h-24 object-cover"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Play className="w-6 h-6 text-white opacity-80" />
                </div>
                <div className="p-2">
                  <p className="text-xs text-white font-medium truncate">{video.title}</p>
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}

// Digital Twin Section Component
const DigitalTwin = () => {
  const [prediction, setPrediction] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)

  const generatePrediction = () => {
    setIsGenerating(true)
    setTimeout(() => {
      const predictions = [
        "In 2080, Archi will be a renowned space architect, designing the first Mars colonies with sustainable bio-domes.",
        "Future Archi becomes a quantum AI researcher, pioneering consciousness transfer technology by age 30.",
        "By 2050, Archi leads the world's first time-travel research facility, unlocking the secrets of temporal mechanics.",
        "Archi will become the youngest CEO of a galactic transportation company, connecting Earth to distant star systems.",
        "In the future, Archi discovers a new form of clean energy that powers the entire solar system sustainably.",
      ]
      setPrediction(predictions[Math.floor(Math.random() * predictions.length)])
      setIsGenerating(false)
    }, 3000)
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-black/20 backdrop-blur-md border border-cyan-500/30 rounded-3xl p-6 md:p-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-purple-500/5" />

        <div className="relative z-10 text-center">
          <div className="mb-8">
            <Cpu className="w-12 md:w-16 h-12 md:h-16 text-cyan-400 mx-auto mb-4" />
            <h3 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent mb-2">
              AI Future Prediction
            </h3>
            <p className="text-gray-300">Where will Archi be in 2080?</p>
          </div>

          <div className="mb-8">
            <div className="w-32 md:w-48 h-32 md:h-48 mx-auto relative">
              <div className="w-full h-full bg-gradient-to-br from-cyan-400/20 to-purple-400/20 rounded-full flex items-center justify-center backdrop-blur-sm border border-cyan-500/30">
                {isGenerating ? (
                  <div className="flex space-x-1">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <motion.div
                        key={i}
                        className="w-2 md:w-3 h-2 md:h-3 bg-cyan-400 rounded-full"
                        animate={{ scale: [1, 1.5, 1] }}
                        transition={{
                          duration: 0.8,
                          repeat: Number.POSITIVE_INFINITY,
                          delay: i * 0.2,
                        }}
                      />
                    ))}
                  </div>
                ) : (
                  <LazyImage
                    src="/placeholder.svg?height=200&width=200"
                    alt="Future Archi"
                    width={200}
                    height={200}
                    className="w-20 md:w-32 h-20 md:h-32 rounded-full object-cover"
                  />
                )}
              </div>

              {/* Orbiting particles */}
              <motion.div
                className="absolute inset-0"
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
              >
                {Array.from({ length: 6 }).map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute w-1.5 md:w-2 h-1.5 md:h-2 bg-cyan-400 rounded-full"
                    style={{
                      left: "50%",
                      top: "10%",
                      transformOrigin: `0 ${typeof window !== "undefined" ? (window.innerWidth > 768 ? "100px" : "64px") : "100px"}`,
                      transform: `rotate(${i * 60}deg)`,
                    }}
                  />
                ))}
              </motion.div>
            </div>
          </div>

          {prediction && !isGenerating && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-black/30 rounded-2xl p-4 md:p-6 mb-6"
            >
              <p className="text-white text-base md:text-lg leading-relaxed">{prediction}</p>
            </motion.div>
          )}

          <Button
            onClick={generatePrediction}
            disabled={isGenerating}
            className="bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 text-white font-semibold py-3 px-6 md:px-8 rounded-xl"
          >
            {isGenerating ? (
              <>
                <Cpu className="w-4 h-4 mr-2 animate-spin" />
                Generating Future...
              </>
            ) : (
              <>
                <Eye className="w-4 h-4 mr-2" />
                Predict My Future
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}

// Wish Wall Component
const WishWall = () => {
  const [wishes, setWishes] = useState([
    { id: 1, name: "Sarah", message: "Happy Birthday Archi! 🎉", time: "2 min ago" },
    { id: 2, name: "Mike", message: "Hope your 18th is amazing! 🚀", time: "5 min ago" },
    { id: 3, name: "Emma", message: "Welcome to adulthood! 🎂", time: "8 min ago" },
  ])
  const [newWish, setNewWish] = useState("")
  const [userName, setUserName] = useState("")

  const addWish = () => {
    if (newWish.trim() && userName.trim()) {
      const wish = {
        id: Date.now(),
        name: userName,
        message: newWish,
        time: "Just now",
      }
      setWishes([wish, ...wishes])
      setNewWish("")
      setUserName("")
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-black/20 backdrop-blur-md border border-cyan-500/30 rounded-3xl p-4 md:p-6 mb-8">
        <div className="grid md:grid-cols-2 gap-4 mb-4">
          <Input
            placeholder="Your name..."
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            className="bg-black/30 border-purple-500/30 text-white placeholder-gray-400 focus:border-cyan-400"
            aria-label="Your name"
          />
          <Input
            placeholder="Write your birthday wish..."
            value={newWish}
            onChange={(e) => setNewWish(e.target.value)}
            className="bg-black/30 border-purple-500/30 text-white placeholder-gray-400 focus:border-cyan-400"
            onKeyPress={(e) => e.key === "Enter" && addWish()}
            aria-label="Your birthday wish"
          />
        </div>
        <Button
          onClick={addWish}
          className="w-full bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 text-white font-semibold py-3 rounded-xl"
        >
          <Send className="w-4 h-4 mr-2" />
          Send Wish
        </Button>
      </div>

      <div className="grid gap-4 max-h-96 overflow-y-auto custom-scrollbar">
        <AnimatePresence>
          {wishes.map((wish, index) => (
            <motion.div
              key={wish.id}
              initial={{ opacity: 0, x: -50, scale: 0.8 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 50, scale: 0.8 }}
              transition={{ delay: index * 0.1 }}
              className="bg-black/20 backdrop-blur-md border border-purple-500/30 rounded-2xl p-4 relative overflow-hidden group hover:border-cyan-400/50 transition-all duration-300"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-cyan-300 font-semibold">{wish.name}</span>
                  <span className="text-gray-400 text-sm">{wish.time}</span>
                </div>
                <p className="text-white">{wish.message}</p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  )
}

// Main Component
export default function ArchiBirthdayPage() {
  const [showIntro, setShowIntro] = useState(true)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(true)
  const [volume, setVolume] = useState(0.5)
  const [currentTrack, setCurrentTrack] = useState(0)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  type StarPoint = { id: number; x: number; y: number }
  type ConstellationLine = { start: StarPoint; end: StarPoint }
  const [constellationLines, setConstellationLines] = useState<ConstellationLine[]>([])
  const [stars, setStars] = useState<{ id: number; x: number; y: number }[]>([])
  const [selectedStars, setSelectedStars] = useState<StarPoint[]>([])
  const [easterEggMode, setEasterEggMode] = useState("")
  const [showEasterEgg, setShowEasterEgg] = useState(false)
  const [audioError, setAudioError] = useState(false)

  const audioRef = useRef<HTMLAudioElement>(null)
  const { scrollYProgress } = useScroll()
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "50%"])

  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)
  const smoothMouseX = useSpring(mouseX, { stiffness: 300, damping: 30 })
  const smoothMouseY = useSpring(mouseY, { stiffness: 300, damping: 30 })

  const isMobile = useMediaQuery("(max-width: 768px)")
  const isOnline = useNetworkStatus()

  // Real music tracks (10 minutes each) with fallback
  const musicTracks = [
    { src: "/archassong.mp3", title: "Cyberpunk Birthday Anthem", fallback: true },
    { src: "/archi-birthday-song-2.mp3", title: "Future Dreams Celebration", fallback: true },
    { src: "/lover.mp3", title: "Lover's Serenade", fallback: true }
  ]
// lover.mp3
  // Initialize stars
  useEffect(() => {
    if (typeof window !== "undefined") {
      const newStars = Array.from({ length: isMobile ? 50 : 100 }, (_, i) => ({
        id: i,
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
      }))
      setStars(newStars)
    }
  }, [isMobile])

  // Mouse tracking
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY })
      mouseX.set(e.clientX)
      mouseY.set(e.clientY)
    }

    if (typeof window !== "undefined") {
      window.addEventListener("mousemove", handleMouseMove)
      return () => window.removeEventListener("mousemove", handleMouseMove)
    }
  }, [mouseX, mouseY])

  // Easter egg keyboard listeners
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase()

      // Easter egg combinations
      if (e.ctrlKey && e.shiftKey && key === "a") {
        setEasterEggMode("rainbow")
        setShowEasterEgg(true)
        setTimeout(() => setShowEasterEgg(false), 5000)
      } else if (e.ctrlKey && e.shiftKey && key === "b") {
        setEasterEggMode("matrix")
        setShowEasterEgg(true)
        setTimeout(() => setShowEasterEgg(false), 5000)
      } else if (e.ctrlKey && e.shiftKey && key === "c") {
        setEasterEggMode("confetti")
        triggerMassiveConfetti()
      } else if (e.ctrlKey && e.shiftKey && key === "d") {
        setEasterEggMode("disco")
        setShowEasterEgg(true)
        setTimeout(() => setShowEasterEgg(false), 10000)
      }
    }

    if (typeof window !== "undefined") {
      window.addEventListener("keydown", handleKeyPress)
      return () => window.removeEventListener("keydown", handleKeyPress)
    }
  }, [])

  // Audio error handling
  const handleAudioError = () => {
    console.log("Audio failed to load")
    setAudioError(true)
    setIsPlaying(false)
  }

  const handleAudioLoad = () => {
    console.log("Audio loaded successfully")
    setAudioError(false)
  }

  // Constellation drawing
  const handleStarClick = useCallback(
    (starId: number, x: number, y: number) => {
      const newStar = { id: starId, x, y }

      if (selectedStars.length === 0) {
        setSelectedStars([newStar])
      } else {
        const lastStar = selectedStars[selectedStars.length - 1]
        const newLine = { start: lastStar, end: newStar }
        setConstellationLines((prev) => [...prev, newLine])
        setSelectedStars([...selectedStars, newStar])
      }
    },
    [selectedStars],
  )

  // Clear constellation
  const clearConstellation = () => {
    setConstellationLines([])
    setSelectedStars([])
  }

  // Enhanced countdown with more features
  const CountdownTimer = () => {
    const [timeLeft, setTimeLeft] = useState({
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
    })

    useEffect(() => {
      const targetDate = new Date("2025-06-04T00:00:00")

      const timer = setInterval(() => {
        const now = new Date().getTime()
        const distance = targetDate.getTime() - now

        if (distance > 0) {
          setTimeLeft({
            days: Math.floor(distance / (1000 * 60 * 60 * 24)),
            hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
            minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
            seconds: Math.floor((distance % (1000 * 60)) / 1000),
          })
        } else {
          triggerBirthdayCelebration()
        }
      }, 1000)

      return () => clearInterval(timer)
    }, [])

    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 max-w-4xl mx-auto">
        {Object.entries(timeLeft).map(([unit, value], index) => (
          <motion.div
            key={unit}
            initial={{ scale: 0, rotateY: 180 }}
            animate={{ scale: 1, rotateY: 0 }}
            transition={{ delay: index * 0.2, duration: 0.8 }}
            className="relative"
          >
            <div className="bg-black/30 backdrop-blur-md border border-cyan-500/30 rounded-2xl md:rounded-3xl p-4 md:p-6 text-center relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />

              <motion.div
                className="text-3xl md:text-4xl lg:text-6xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent relative z-10"
                animate={{
                  scale: value !== Number.parseInt(value.toString().padStart(2, "0")) ? [1, 1.2, 1] : 1,
                }}
                transition={{ duration: 0.3 }}
              >
                {value.toString().padStart(2, "0")}
              </motion.div>

              <div className="text-cyan-300 text-xs md:text-sm uppercase tracking-wider mt-2 relative z-10">{unit}</div>

              {/* Floating particles around numbers */}
              <div className="absolute inset-0 pointer-events-none">
                {Array.from({ length: 3 }).map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute w-1 h-1 bg-cyan-400 rounded-full"
                    animate={{
                      x: [0, Math.random() * 40 - 20],
                      y: [0, Math.random() * 40 - 20],
                      opacity: [0, 1, 0],
                    }}
                    transition={{
                      duration: 3,
                      repeat: Number.POSITIVE_INFINITY,
                      delay: i * 0.5,
                    }}
                    style={{
                      left: `${20 + Math.random() * 60}%`,
                      top: `${20 + Math.random() * 60}%`,
                    }}
                  />
                ))}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    )
  }

  const triggerBirthdayCelebration = () => {
    triggerMassiveConfetti()
  }

  const triggerMassiveConfetti = () => {
    const colors = ["#00ffff", "#ff00ff", "#ffff00", "#ff0080", "#80ff00"]
    for (let i = 0; i < 200; i++) {
      const confetti = document.createElement("div")
      confetti.className = "fixed w-3 h-3 pointer-events-none z-50"
      confetti.style.background = colors[Math.floor(Math.random() * colors.length)]
      confetti.style.left = Math.random() * 100 + "%"
      confetti.style.top = "-20px"
      confetti.style.borderRadius = Math.random() > 0.5 ? "50%" : "0"
      document.body.appendChild(confetti)

      const animation = confetti.animate(
        [
          { transform: "translateY(0) rotate(0deg) scale(1)", opacity: 1 },
          {
            transform: `translateY(${(typeof window !== "undefined" ? window.innerHeight : 800) + 100}px) rotate(${Math.random() * 720}deg) scale(0)`,
            opacity: 0,
          },
        ],
        {
          duration: Math.random() * 3000 + 2000,
          easing: "cubic-bezier(0.25, 0.46, 0.45, 0.94)",
        },
      )

      animation.onfinish = () => confetti.remove()
    }
  }

  const triggerConfetti = () => {
    const colors = ["#00ffff", "#ff00ff", "#ffff00", "#ff0080"]
    for (let i = 0; i < 50; i++) {
      const confetti = document.createElement("div")
      confetti.className = "fixed w-2 h-2 pointer-events-none z-50"
      confetti.style.background = colors[Math.floor(Math.random() * colors.length)]
      confetti.style.left = Math.random() * 100 + "%"
      confetti.style.top = "-10px"
      confetti.style.borderRadius = "50%"
      document.body.appendChild(confetti)

      const animation = confetti.animate(
        [
          { transform: "translateY(0) rotate(0deg)", opacity: 1 },
          {
            transform: `translateY(${(typeof window !== "undefined" ? window.innerHeight : 800) + 100}px) rotate(720deg)`,
            opacity: 0,
          },
        ],
        {
          duration: Math.random() * 2000 + 1000,
          easing: "cubic-bezier(0.25, 0.46, 0.45, 0.94)",
        },
      )

      animation.onfinish = () => confetti.remove()
    }
  }

  const nextTrack = () => {
    setCurrentTrack((prev) => (prev + 1) % musicTracks.length)
    setAudioError(false)
  }

  const prevTrack = () => {
    setCurrentTrack((prev) => (prev - 1 + musicTracks.length) % musicTracks.length)
    setAudioError(false)
  }

  const handlePlayPause = () => {
    if (audioRef.current && !audioError) {
      if (isPlaying) {
        audioRef.current.pause()
      } else {
        audioRef.current.play().catch(handleAudioError)
      }
      setIsPlaying(!isPlaying)
    }
  }

  if (showIntro) {
    return <VideoIntro onSkip={() => setShowIntro(false)} />
  }

  return (
    <div className="min-h-screen bg-black text-white overflow-x-hidden relative">
      {/* Easter Egg Effects */}
      {showEasterEgg && (
        <div className="fixed inset-0 pointer-events-none z-40">
          {easterEggMode === "rainbow" && (
            <motion.div
              className="absolute inset-0"
              animate={{
                background: [
                  "linear-gradient(45deg, #ff0000, #ff7f00, #ffff00, #00ff00, #0000ff, #4b0082, #9400d3)",
                  "linear-gradient(90deg, #ff0000, #ff7f00, #ffff00, #00ff00, #0000ff, #4b0082, #9400d3)",
                  "linear-gradient(135deg, #ff0000, #ff7f00, #ffff00, #00ff00, #0000ff, #4b0082, #9400d3)",
                ],
              }}
              transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
              style={{ opacity: 0.1 }}
            />
          )}

          {easterEggMode === "matrix" && (
            <div className="absolute inset-0">
              {Array.from({ length: 50 }).map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute text-green-400 font-mono text-sm"
                  initial={{ y: -50, x: Math.random() * (typeof window !== "undefined" ? window.innerWidth : 1200) }}
                  animate={{ y: (typeof window !== "undefined" ? window.innerHeight : 800) + 50 }}
                  transition={{ duration: 3, repeat: Number.POSITIVE_INFINITY, delay: Math.random() * 2 }}
                >
                  {Math.random().toString(36).substring(7)}
                </motion.div>
              ))}
            </div>
          )}

          {easterEggMode === "disco" && (
            <motion.div
              className="absolute inset-0"
              animate={{
                background: [
                  "radial-gradient(circle at 25% 25%, #ff00ff 0%, transparent 50%)",
                  "radial-gradient(circle at 75% 25%, #00ffff 0%, transparent 50%)",
                  "radial-gradient(circle at 75% 75%, #ffff00 0%, transparent 50%)",
                  "radial-gradient(circle at 25% 75%, #ff00ff 0%, transparent 50%)",
                ],
              }}
              transition={{ duration: 0.5, repeat: Number.POSITIVE_INFINITY }}
              style={{ opacity: 0.2 }}
            />
          )}
        </div>
      )}

      {/* Enhanced Interactive Galaxy Background */}
      <div className="fixed inset-0 pointer-events-none">
        {/* Dynamic background gradient */}
        <motion.div
          className="absolute inset-0"
          animate={{
            background: [
              "radial-gradient(circle at 20% 30%, rgba(139, 69, 255, 0.1) 0%, transparent 50%), radial-gradient(circle at 80% 70%, rgba(0, 255, 255, 0.1) 0%, transparent 50%)",
              "radial-gradient(circle at 60% 20%, rgba(255, 0, 128, 0.1) 0%, transparent 50%), radial-gradient(circle at 40% 80%, rgba(139, 69, 255, 0.1) 0%, transparent 50%)",
              "radial-gradient(circle at 20% 30%, rgba(139, 69, 255, 0.1) 0%, transparent 50%), radial-gradient(circle at 80% 70%, rgba(0, 255, 255, 0.1) 0%, transparent 50%)",
            ],
          }}
          transition={{ duration: 20, repeat: Number.POSITIVE_INFINITY }}
        />

        {/* Interactive Stars */}
        {stars.map((star, i) => (
          <InteractiveStar key={star.id} x={star.x} y={star.y} delay={i * 0.1} onClick={handleStarClick} id={star.id} />
        ))}

        {/* Constellation Lines */}
        {constellationLines.map((line, i) => (
          <ConstellationLine key={i} start={line.start} end={line.end} />
        ))}

        {/* Shooting Stars */}
        {Array.from({ length: 3 }).map((_, i) => (
          <ShootingStar key={i} delay={i * 5} />
        ))}

        {/* Enhanced Particles */}
        {Array.from({ length: isMobile ? 75 : 150 }).map((_, i) => (
          <Particle key={i} delay={i * 0.05} />
        ))}

        {/* Mouse-reactive grid lines */}
        <motion.div
          className="absolute inset-0 opacity-20"
          style={{
            background: `radial-gradient(circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(0, 255, 255, 0.1) 0%, transparent 200px)`,
          }}
        />
      </div>

      {/* Floating 3D Planet */}
      <ErrorBoundary>
        <div className="fixed top-16 md:top-20 right-4 md:right-20 w-24 md:w-32 h-24 md:h-32 z-30 pointer-events-none">
          <Canvas>
            <ambientLight intensity={0.5} />
            <pointLight position={[10, 10, 10]} />
            <Planet3D />
            <OrbitControls enablePan={false} enableZoom={false} />
          </Canvas>
        </div>
      </ErrorBoundary>

      {/* Floating Moon */}
      <motion.div
        className="fixed bottom-16 md:bottom-20 left-4 md:left-20 w-16 md:w-24 h-16 md:h-24 rounded-full bg-gradient-to-br from-gray-300 to-gray-600 shadow-2xl z-30 pointer-events-none"
        animate={{
          rotate: 360,
          scale: [1, 1.1, 1],
        }}
        transition={{
          rotate: { duration: 20, repeat: Number.POSITIVE_INFINITY, ease: "linear" },
          scale: { duration: 4, repeat: Number.POSITIVE_INFINITY },
        }}
        style={{
          boxShadow: "0 0 30px rgba(255, 255, 255, 0.3)",
        }}
      />

      {/* Audio Element with Error Handling */}
      <audio
        ref={audioRef}
        loop
        onEnded={() => setIsPlaying(false)}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onError={handleAudioError}
        onLoadedData={handleAudioLoad}
        key={currentTrack}
      >
        <source src={musicTracks[currentTrack].src} type="audio/mpeg" />
        Your browser does not support the audio element.
      </audio>

      {/* Enhanced Header with Music Controls */}
      <header className="fixed top-0 left-0 right-0 z-50 p-2 md:p-4">
        <div className="flex flex-col gap-2 md:gap-4">
          {/* Music Player */}
          <div className="bg-black/40 backdrop-blur-xl border border-cyan-500/30 rounded-xl md:rounded-2xl p-2 md:p-3 flex items-center gap-2 md:gap-3">
            <Button
              onClick={prevTrack}
              variant="ghost"
              size="icon"
              className="h-6 w-6 md:h-8 md:w-8 rounded-full bg-gradient-to-r from-purple-500/20 to-pink-500/20 hover:from-purple-500/30 hover:to-pink-500/30 text-purple-300"
              aria-label="Previous track"
            >
              <ChevronLeft className="h-3 w-3 md:h-4 md:w-4" />
            </Button>

            <Button
              onClick={handlePlayPause}
              variant="ghost"
              size="icon"
              disabled={audioError}
              className="h-6 w-6 md:h-8 md:w-8 rounded-full bg-gradient-to-r from-cyan-500/20 to-purple-500/20 hover:from-cyan-500/30 hover:to-purple-500/30 text-cyan-300 disabled:opacity-50"
              aria-label={isPlaying ? "Pause music" : "Play music"}
            >
              {audioError ? (
                <AlertCircle className="h-3 w-3 md:h-4 md:w-4" />
              ) : isPlaying ? (
                <Pause className="h-3 w-3 md:h-4 md:w-4" />
              ) : (
                <Play className="h-3 w-3 md:h-4 md:w-4" />
              )}
            </Button>

            <Button
              onClick={nextTrack}
              variant="ghost"
              size="icon"
              className="h-6 w-6 md:h-8 md:w-8 rounded-full bg-gradient-to-r from-pink-500/20 to-cyan-500/20 hover:from-pink-500/30 hover:to-cyan-500/30 text-pink-300"
              aria-label="Next track"
            >
              <ChevronRight className="h-3 w-3 md:h-4 md:w-4" />
            </Button>

            <div className="flex items-center gap-2">
              <Button
                onClick={() => {
                  if (audioRef.current && !audioError) {
                    if (isMuted) {
                      audioRef.current.volume = volume
                      audioRef.current.muted = false
                    } else {
                      audioRef.current.muted = true
                    }
                    setIsMuted(!isMuted)
                  }
                }}
                variant="ghost"
                size="icon"
                disabled={audioError}
                className="h-6 w-6 md:h-8 md:w-8 rounded-full bg-gradient-to-r from-purple-500/20 to-pink-500/20 hover:from-purple-500/30 hover:to-pink-500/30 text-purple-300 disabled:opacity-50"
                aria-label={isMuted ? "Unmute" : "Mute"}
              >
                {isMuted || audioError ? (
                  <VolumeX className="h-3 w-3 md:h-4 md:w-4" />
                ) : (
                  <Volume2 className="h-3 w-3 md:h-4 md:w-4" />
                )}
              </Button>

              <div className="w-16 md:w-32">
                <Slider
                  defaultValue={[volume]}
                  max={1}
                  step={0.01}
                  value={[isMuted || audioError ? 0 : volume]}
                  onValueChange={(vals) => {
                    setVolume(vals[0])
                    if (audioRef.current && !audioError) {
                      audioRef.current.volume = vals[0]
                      if (vals[0] === 0) {
                        setIsMuted(true)
                      } else if (isMuted) {
                        setIsMuted(false)
                      }
                    }
                  }}
                  disabled={audioError}
                  className={`${isMuted || audioError ? "opacity-50" : "opacity-100"}`}
                  aria-label="Volume control"
                />
              </div>
            </div>

            <div className="hidden md:block text-xs text-cyan-300/70 min-w-0 flex-1">
              <div className="truncate">
                {audioError ? "Audio unavailable" : isPlaying ? `♪ ${musicTracks[currentTrack].title}` : "Music Paused"}
              </div>
            </div>
          </div>

          {/* Constellation Controls */}
          <div className="bg-black/40 backdrop-blur-xl border border-purple-500/30 rounded-xl md:rounded-2xl p-2 md:p-3 flex items-center gap-2 md:gap-3">
            <Button
              onClick={clearConstellation}
              variant="ghost"
              size="sm"
              className="text-xs md:text-sm bg-gradient-to-r from-purple-500/20 to-pink-500/20 hover:from-purple-500/30 hover:to-pink-500/30 text-purple-300"
            >
              Clear Stars
            </Button>
            <span className="text-xs text-gray-400">Click stars to draw constellations</span>
          </div>

          {/* Offline indicator */}
          {!isOnline && (
            <div className="bg-yellow-500/20 border border-yellow-500/30 rounded-xl p-2 text-center">
              <span className="text-yellow-300 text-xs">
                <AlertCircle className="inline w-3 h-3 mr-1" />
                Offline mode - Limited features available
              </span>
            </div>
          )}
        </div>
      </header>

      {/* Floating Action Buttons */}
      <Suspense fallback={<SuspenseFallback />}>
        <ARCamera />
        <GuestBook />
        <SocialShare />
        <NotificationManager />
      </Suspense>

      {/* Enhanced Hero Section */}
      <section className="min-h-screen flex items-center justify-center relative px-4" id="hero">
        <motion.div style={{ y }} className="text-center z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="mb-8"
          >
            <motion.h1
              className="text-4xl md:text-6xl lg:text-8xl xl:text-9xl font-black mb-4"
              animate={{
                backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
              }}
              transition={{ duration: 3, repeat: Number.POSITIVE_INFINITY }}
              style={{
                background: "linear-gradient(45deg, #00ffff, #ff00ff, #ffff00, #00ff00, #0000ff, #4b0082, #9400d3)",
                backgroundSize: "300% 300%",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
                filter: "drop-shadow(0 0 20px rgba(0, 255, 255, 0.5))",
              }}
            >
              ARCHI
            </motion.h1>
            <motion.h2
              className="text-2xl md:text-4xl lg:text-6xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.8 }}
              style={{
                filter: "drop-shadow(0 0 15px rgba(255, 0, 255, 0.3))",
              }}
            >
              GUPTA
            </motion.h2>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1, duration: 0.8 }}
            className="mb-8"
          >
            <p className="text-lg md:text-xl lg:text-2xl text-cyan-300 mb-2">Born on June 4, 2007</p>
            <p className="text-2xl md:text-3xl lg:text-4xl font-bold text-white">Turning 18!</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1.5, duration: 0.8 }}
            onClick={triggerConfetti}
            className="cursor-pointer"
          >
            <div className="bg-black/20 backdrop-blur-md border border-cyan-500/30 rounded-2xl md:rounded-3xl p-6 md:p-8 inline-block hover:border-cyan-400/60 transition-all">
              <Sparkles className="w-8 md:w-12 h-8 md:h-12 text-yellow-400 mx-auto mb-4" />
              <p className="text-cyan-300 text-sm md:text-base">Tap for Celebration!</p>
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* Enhanced Countdown Section */}
      <Section
        id="countdown"
        title="Countdown to Birthday"
        subtitle="The future awaits..."
        titleGradient="from-cyan-400 to-purple-400"
      >
        <CountdownTimer />
      </Section>

      {/* Timeline Section */}
      <Section
        id="timeline"
        title="Life Timeline"
        subtitle="Journey through Archi's years"
        titleGradient="from-green-400 to-cyan-400"
      >
        <ErrorBoundary>
          <Timeline />
        </ErrorBoundary>
      </Section>

      {/* Enhanced 3D Photo Gallery (12 photos) */}
      <Section
        id="gallery"
        title="Memory Gallery"
        subtitle="12 precious moments through time"
        titleGradient="from-purple-400 to-pink-400"
      >
        <ErrorBoundary>
          <PhotoGallery3D />
        </ErrorBoundary>
      </Section>

      {/* Video Gallery Section */}
      <Section
        id="videos"
        title="Video Memories"
        subtitle="6 special video moments"
        titleGradient="from-red-400 to-orange-400"
      >
        <ErrorBoundary>
          <VideoGallery />
        </ErrorBoundary>
      </Section>

      {/* Interactive Quiz Section */}
      <Section
        id="quiz"
        title="How Well Do You Know Archi?"
        subtitle="Test your knowledge with this fun quiz!"
        titleGradient="from-yellow-400 to-red-400"
      >
        <ErrorBoundary>
          <InteractiveQuiz />
        </ErrorBoundary>
      </Section>

      {/* Wish Wall Section */}
      <Section
        id="wishes"
        title="Wish Wall"
        subtitle="Share your birthday wishes for Archi"
        titleGradient="from-pink-400 to-cyan-400"
      >
        <ErrorBoundary>
          <WishWall />
        </ErrorBoundary>
      </Section>

      {/* Digital Twin Section */}
      <Section
        id="future"
        title="Digital Twin Prediction"
        subtitle="AI-powered glimpse into Archi's future"
        titleGradient="from-green-400 to-cyan-400"
      >
        <ErrorBoundary>
          <DigitalTwin />
        </ErrorBoundary>
      </Section>

      {/* Future Vision Section */}
      <section className="py-12 md:py-20 px-4 relative" id="celebration">
        <div className="container mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1 }}
            viewport={{ once: true }}
            className="bg-black/20 backdrop-blur-md border border-cyan-500/30 rounded-2xl md:rounded-3xl p-8 md:p-12 max-w-4xl mx-auto relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-purple-500/10" />
            <div className="relative z-10">
              <Sparkles className="w-12 md:w-16 h-12 md:h-16 text-yellow-400 mx-auto mb-6" />
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent mb-6">
                Welcome to Adulthood, Archi!
              </h2>
              <p className="text-lg md:text-xl text-gray-300 mb-8">
                As you step into your 18th year, may your future be as bright as the stars and as limitless as the
                digital universe. Here's to new adventures, endless possibilities, and the amazing journey ahead!
              </p>
              <div className="flex justify-center gap-4">
                <Heart className="w-6 md:w-8 h-6 md:h-8 text-red-400" />
                <Star className="w-6 md:w-8 h-6 md:h-8 text-yellow-400" />
                <Gift className="w-6 md:w-8 h-6 md:h-8 text-green-400" />
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Easter Egg Instructions */}
      <section className="py-8 px-4 relative" id="easter-eggs">
        <div className="container mx-auto text-center">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="bg-black/10 backdrop-blur-md border border-purple-500/20 rounded-2xl p-4 md:p-6 max-w-2xl mx-auto"
          >
            <h3 className="text-lg md:text-xl font-bold text-purple-300 mb-4">🎮 Easter Egg Commands</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-400">
              <div>Ctrl+Shift+A: Rainbow Mode</div>
              <div>Ctrl+Shift+B: Matrix Mode</div>
              <div>Ctrl+Shift+C: Confetti Blast</div>
              <div>Ctrl+Shift+D: Disco Mode</div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Audio Visualization */}
      {isPlaying && !isMuted && !audioError && (
        <div className="fixed bottom-4 left-4 right-4 z-40 pointer-events-none">
          <div className="flex justify-center items-end h-8 md:h-12 gap-1">
            {Array.from({ length: 20 }).map((_, i) => (
              <motion.div
                key={i}
                className="w-1 bg-gradient-to-t from-cyan-500 to-purple-500 rounded-full"
                animate={{
                  height: [Math.random() * 20 + 10, Math.random() * 40 + 20, Math.random() * 20 + 10],
                }}
                transition={{
                  duration: 0.5 + Math.random() * 0.5,
                  repeat: Number.POSITIVE_INFINITY,
                  repeatType: "reverse",
                }}
              />
            ))}
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="py-6 md:py-8 px-4 relative" id="footer">
        <div className="container mx-auto text-center">
          <Badge className="bg-gradient-to-r from-cyan-500 to-purple-500 text-white text-base md:text-lg px-4 md:px-6 py-2 mb-4">
            Designed for 2080 Era
          </Badge>
          <p className="text-gray-400 text-sm md:text-base">Happy 18th Birthday, Archi! 🎉✨</p>
          <p className="text-gray-500 text-xs md:text-sm mt-2">
            Click stars to draw constellations • Use keyboard shortcuts for easter eggs
          </p>
        </div>
      </footer>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
          height: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.1);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: linear-gradient(45deg, #00ffff, #ff00ff);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(45deg, #00cccc, #cc00cc);
        }
        .perspective-1000 {
          perspective: 1000px;
        }
        
        @media (max-width: 768px) {
          .custom-scrollbar::-webkit-scrollbar {
            width: 4px;
            height: 4px;
          }
        }
      `}</style>
    </div>
  )
}
