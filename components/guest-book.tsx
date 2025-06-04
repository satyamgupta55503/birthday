"use client"

import { useState, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BookOpen, Send, Trash2, Download, Eraser } from "lucide-react"

export default function GuestBook() {
  const [isOpen, setIsOpen] = useState(false)
  const [name, setName] = useState("")
  const [message, setMessage] = useState("")
  const [entries, setEntries] = useState([
    {
      id: 1,
      name: "Sarah",
      message: "Happy 18th Birthday Archi! You're amazing!",
      drawing: null,
      date: "June 1, 2025",
    },
    {
      id: 2,
      name: "Mike",
      message: "Wishing you all the best on your special day!",
      drawing: null,
      date: "June 2, 2025",
    },
  ])

  // Drawing canvas state
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [drawingColor, setDrawingColor] = useState("#00ffff")
  const [drawingSize, setDrawingSize] = useState(5)
  const [drawing, setDrawing] = useState<string | null>(null)

  const colors = ["#00ffff", "#ff00ff", "#ffff00", "#ff0080", "#80ff00", "#ffffff"]

  const handleSubmit = () => {
    if (name.trim()) {
      const newEntry = {
        id: Date.now(),
        name,
        message: message.trim(),
        drawing,
        date: new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }),
      }

      setEntries([newEntry, ...entries])
      setName("")
      setMessage("")
      setDrawing(null)
      clearCanvas()
    }
  }

  // Drawing functions
  const startDrawing = (e) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    setIsDrawing(true)

    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    ctx.beginPath()
    ctx.moveTo(x, y)
    ctx.lineWidth = drawingSize
    ctx.lineCap = "round"
    ctx.strokeStyle = drawingColor
  }

  const draw = (e) => {
    if (!isDrawing) return

    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    ctx.lineTo(x, y)
    ctx.stroke()
  }

  const stopDrawing = () => {
    setIsDrawing(false)

    const canvas = canvasRef.current
    if (!canvas) return

    // Save the drawing as data URL
    setDrawing(canvas.toDataURL("image/png"))
  }

  const clearCanvas = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    ctx.clearRect(0, 0, canvas.width, canvas.height)
    setDrawing(null)
  }

  const handleTouchStart = (e) => {
    e.preventDefault()
    const touch = e.touches[0]
    startDrawing({
      clientX: touch.clientX,
      clientY: touch.clientY,
    })
  }

  const handleTouchMove = (e) => {
    e.preventDefault()
    const touch = e.touches[0]
    draw({
      clientX: touch.clientX,
      clientY: touch.clientY,
    })
  }

  const downloadGuestBook = () => {
    let content = "ARCHI'S 18TH BIRTHDAY - GUEST BOOK\n\n"

    entries.forEach((entry) => {
      content += `${entry.date}\n`
      content += `Name: ${entry.name}\n`
      content += `Message: ${entry.message || "(No message)"}\n`
      content += `Drawing: ${entry.drawing ? "Yes" : "No"}\n\n`
    })

    const blob = new Blob([content], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = "archi-birthday-guestbook.txt"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-36 right-4 md:right-8 z-40 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 rounded-full h-12 w-12 flex items-center justify-center shadow-lg shadow-pink-500/20"
      >
        <BookOpen className="h-5 w-5" />
      </Button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4 overflow-y-auto"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-3xl bg-black/40 backdrop-blur-md border border-purple-500/30 rounded-3xl p-4 md:p-6 relative"
            >
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(false)}
                className="absolute top-2 right-2 h-8 w-8 rounded-full bg-black/50 text-white hover:bg-red-500/30"
              >
                <Trash2 className="h-4 w-4" />
              </Button>

              <div className="text-center mb-6">
                <h2 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                  Archi's Birthday Guest Book
                </h2>
                <p className="text-gray-300">Leave your wishes and drawings for Archi's 18th!</p>
              </div>

              <Tabs defaultValue="sign" className="w-full">
                <TabsList className="grid grid-cols-2 mb-6">
                  <TabsTrigger value="sign">Sign Guest Book</TabsTrigger>
                  <TabsTrigger value="view">View Entries</TabsTrigger>
                </TabsList>

                <TabsContent value="sign" className="space-y-4">
                  <div className="space-y-4">
                    <Input
                      placeholder="Your Name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="bg-black/30 border-purple-500/30 text-white placeholder-gray-400 focus:border-pink-400"
                    />

                    <Textarea
                      placeholder="Your Birthday Message (optional)"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      className="bg-black/30 border-purple-500/30 text-white placeholder-gray-400 focus:border-pink-400 min-h-[100px]"
                    />

                    <div className="border border-purple-500/30 rounded-xl p-4 bg-black/20">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-lg font-medium text-pink-300">Draw Something!</h3>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={clearCanvas}
                            className="h-8 w-8 rounded-full bg-black/50 text-white hover:bg-red-500/30"
                          >
                            <Eraser className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      <div className="flex gap-2 mb-3">
                        {colors.map((color) => (
                          <button
                            key={color}
                            onClick={() => setDrawingColor(color)}
                            className={`w-6 h-6 rounded-full ${drawingColor === color ? "ring-2 ring-white" : ""}`}
                            style={{ backgroundColor: color }}
                          />
                        ))}

                        <select
                          value={drawingSize}
                          onChange={(e) => setDrawingSize(Number(e.target.value))}
                          className="ml-auto bg-black/50 border border-purple-500/30 rounded text-white text-sm p-1"
                        >
                          <option value="3">Thin</option>
                          <option value="5">Medium</option>
                          <option value="10">Thick</option>
                        </select>
                      </div>

                      <div className="bg-black/50 rounded-lg border border-purple-500/20 overflow-hidden">
                        <canvas
                          ref={canvasRef}
                          width={500}
                          height={200}
                          onMouseDown={startDrawing}
                          onMouseMove={draw}
                          onMouseUp={stopDrawing}
                          onMouseLeave={stopDrawing}
                          onTouchStart={handleTouchStart}
                          onTouchMove={handleTouchMove}
                          onTouchEnd={stopDrawing}
                          className="w-full h-[200px] touch-none"
                        />
                      </div>
                    </div>

                    <Button
                      onClick={handleSubmit}
                      disabled={!name.trim()}
                      className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold py-3 rounded-xl"
                    >
                      <Send className="h-4 w-4 mr-2" />
                      Sign Guest Book
                    </Button>
                  </div>
                </TabsContent>

                <TabsContent value="view">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-medium text-purple-300">{entries.length} Entries</h3>
                    <Button
                      onClick={downloadGuestBook}
                      size="sm"
                      className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white rounded-lg"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                  </div>

                  <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                    <AnimatePresence>
                      {entries.map((entry) => (
                        <motion.div
                          key={entry.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -20 }}
                          className="bg-black/30 backdrop-blur-sm border border-purple-500/30 rounded-xl p-4 relative overflow-hidden group hover:border-pink-400/50 transition-all duration-300"
                        >
                          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />

                          <div className="relative z-10">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-pink-300 font-semibold">{entry.name}</span>
                              <span className="text-gray-400 text-sm">{entry.date}</span>
                            </div>

                            {entry.message && <p className="text-white mb-3">{entry.message}</p>}

                            {entry.drawing && (
                              <div className="mt-3 bg-black/20 rounded-lg p-2">
                                <img
                                  src={entry.drawing || "/placeholder.svg"}
                                  alt={`Drawing by ${entry.name}`}
                                  className="w-full rounded-lg"
                                />
                              </div>
                            )}
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                </TabsContent>
              </Tabs>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
