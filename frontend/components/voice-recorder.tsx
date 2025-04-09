"use client"

import { useState, useRef, useEffect } from "react"
import { Mic, Square, Play, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"

interface VoiceRecorderProps {
  onTranscript: (text: string) => void
  onClose: () => void
  open: boolean
}

export function VoiceRecorder({ onTranscript, onClose, open }: VoiceRecorderProps) {
  const [isRecording, setIsRecording] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [transcript, setTranscript] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  // Initialize audio element
  useEffect(() => {
    audioRef.current = new Audio()
    audioRef.current.onended = () => setIsPlaying(false)

    return () => {
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current = null
      }
    }
  }, [])

  // Clean up audio URL when component unmounts
  useEffect(() => {
    return () => {
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl)
      }
    }
  }, [audioUrl])

  // Reset state when dialog opens
  useEffect(() => {
    if (open) {
      setIsRecording(false)
      setRecordingTime(0)
      setAudioUrl(null)
      setIsPlaying(false)
      setTranscript("")
      setIsProcessing(false)
      audioChunksRef.current = []
    }
  }, [open])

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })

      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      audioChunksRef.current = []

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data)
        }
      }

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/wav" })
        const url = URL.createObjectURL(audioBlob)
        setAudioUrl(url)

        if (audioRef.current) {
          audioRef.current.src = url
        }

        // Simulate transcription
        simulateTranscription(audioBlob)
      }

      mediaRecorder.start()
      setIsRecording(true)

      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1)
      }, 1000)
    } catch (error) {
      console.error("Error accessing microphone:", error)
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)

      // Stop all tracks in the stream
      mediaRecorderRef.current.stream.getTracks().forEach((track) => track.stop())

      // Clear timer
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
    }
  }

  const playAudio = () => {
    if (audioRef.current && audioUrl) {
      audioRef.current.play()
      setIsPlaying(true)
    }
  }

  const pauseAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause()
      setIsPlaying(false)
    }
  }

  const deleteRecording = () => {
    if (audioRef.current) {
      audioRef.current.pause()
    }

    if (audioUrl) {
      URL.revokeObjectURL(audioUrl)
    }

    setAudioUrl(null)
    setIsPlaying(false)
    setTranscript("")
    audioChunksRef.current = []
  }

  const simulateTranscription = (audioBlob: Blob) => {
    setIsProcessing(true)

    // In a real app, you would send the audio to a speech-to-text service
    // For this demo, we'll simulate a response after a delay
    setTimeout(() => {
      // Sample transcripts based on recording length
      const sampleTranscripts = [
        "Show me the schema of the database",
        "What is the average value in the first column?",
        "Show me the top 5 rows sorted by the second column",
        "How many rows have null values in any column?",
        "Compare the distribution of values in column one and column two",
      ]

      // Select a transcript based on recording length
      const index = Math.min(Math.floor(recordingTime / 3), sampleTranscripts.length - 1)

      const generatedTranscript = sampleTranscripts[index]
      setTranscript(generatedTranscript)
      setIsProcessing(false)
    }, 1500)
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  const handleSubmit = () => {
    if (transcript) {
      onTranscript(transcript)
      onClose()
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] dark:bg-gray-800 dark:border-gray-700">
        <DialogHeader>
          <DialogTitle className="dark:text-white">Voice Input</DialogTitle>
        </DialogHeader>

        <div className="py-6">
          {/* Recording UI */}
          <div className="flex flex-col items-center justify-center gap-4">
            <div
              className={`w-24 h-24 rounded-full flex items-center justify-center ${
                isRecording
                  ? "bg-red-100 dark:bg-red-900 animate-pulse"
                  : audioUrl
                    ? "bg-blue-100 dark:bg-blue-900"
                    : "bg-gray-100 dark:bg-gray-700"
              }`}
            >
              <Mic
                className={`h-10 w-10 ${
                  isRecording
                    ? "text-red-500 dark:text-red-400"
                    : audioUrl
                      ? "text-blue-500 dark:text-blue-400"
                      : "text-gray-400 dark:text-gray-500"
                }`}
              />
            </div>

            {isRecording ? (
              <div className="text-center">
                <div className="text-xl font-semibold dark:text-white">{formatTime(recordingTime)}</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Recording...</div>
              </div>
            ) : audioUrl ? (
              <div className="text-center">
                <div className="text-xl font-semibold dark:text-white">Recording Complete</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">{formatTime(recordingTime)}</div>
              </div>
            ) : (
              <div className="text-center">
                <div className="text-xl font-semibold dark:text-white">Ready to Record</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Click the button below to start</div>
              </div>
            )}

            {/* Controls */}
            <div className="flex gap-3">
              {isRecording ? (
                <Button variant="destructive" size="icon" onClick={stopRecording}>
                  <Square className="h-4 w-4" />
                </Button>
              ) : !audioUrl ? (
                <Button variant="default" onClick={startRecording}>
                  Start Recording
                </Button>
              ) : (
                <>
                  <Button
                    variant={isPlaying ? "outline" : "default"}
                    size="icon"
                    onClick={isPlaying ? pauseAudio : playAudio}
                  >
                    {isPlaying ? <Square className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                  </Button>
                  <Button variant="outline" size="icon" onClick={deleteRecording}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                  <Button variant="default" onClick={startRecording}>
                    Record Again
                  </Button>
                </>
              )}
            </div>
          </div>

          {/* Transcription */}
          {(isProcessing || transcript) && (
            <div className="mt-6 border dark:border-gray-700 rounded-lg p-4">
              <h3 className="text-sm font-medium mb-2 dark:text-white">Transcription</h3>

              {isProcessing ? (
                <div className="space-y-2">
                  <Progress value={60} className="h-2" />
                  <p className="text-sm text-gray-500 dark:text-gray-400 text-center">Processing audio...</p>
                </div>
              ) : (
                <p className="text-gray-700 dark:text-gray-300">{transcript}</p>
              )}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!transcript || isProcessing}>
            Use This Text
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

