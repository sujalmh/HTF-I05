"use client"

import type React from "react"
import { useState } from "react"
import { ArrowRight, FileText, Database, Mic, Paperclip, Send } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { AgentReasoning } from "./agent-reasoning"
import { VoiceRecorder } from "@/components/voice/voice-recorder"
import type { AgentStep } from "./agent-thinking"
import { ReportDialog } from "@/components/report/report-dialog"


export interface Message {
  id?: string
  role: "user" | "assistant"
  content: string
  timestamp?: Date | string
  agentSteps?: AgentStep[]
  currentStep?: number
  sqlQuery?: string
  explanation?: string
  tableData?: any[]
  tableColumns?: { key: string; label: string }[]
  visualization?: string
  followUpSuggestions?: string[]
}

interface MessageInterfaceProps {
  messages: Message[]
  chatId: string
  onSendMessage: (message: string) => void
  isProcessing: boolean
}

export function MessageInterface({ messages, chatId, onSendMessage, isProcessing }: MessageInterfaceProps) {
  const [inputValue, setInputValue] = useState("")
  const [isReportDialogOpen, setIsReportDialogOpen] = useState(false)

  const [isVoiceRecorderOpen, setIsVoiceRecorderOpen] = useState(false)
  const [isAlreadyUploaded, setIsAlreadyUploaded] = useState(true)

  const handleSend = () => {
    if (inputValue.trim()) {
      onSendMessage(inputValue)
      setInputValue("")
    }
  }
  console.log("messages", messages)
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleVoiceTranscript = (text: string) => {
    setInputValue(text)
  }

  return (
    <div className="flex flex-col h-full">
      <ScrollArea className="flex-1 p-4">
        <div className="max-w-4xl mx-auto space-y-8">
          {messages.map((message) => (
            <div key={message.id} className="animate-in fade-in-50 duration-300">
              {message.role === "user" ? (
                <div className="flex items-start gap-3 mb-2">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold">
                    U
                  </div>
                  <div className="flex-1">
                    <p className="text-gray-800">{message.content}</p>
                  </div>
                </div>
              ) : (
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-600">
                    <Database className="h-4 w-4" />
                  </div>
                  <div className="flex-1">
                    {message && (
                      <AgentReasoning
                        reasoning={{
                          steps: message.agentSteps,
                          currentStep: message.currentStep,
                          sqlQuery: message.sqlQuery || "",
                          explanation: message.explanation || "",
                          tableData: message.tableData || [],
                          tableColumns: message.tableColumns || [],
                          visualization: message.visualization || "none",
                        }}
                      />
                    )}

                    {message.followUpSuggestions && message.followUpSuggestions.length > 0 && (
                      <div className="mt-4 flex flex-wrap gap-2">
                        {message.followUpSuggestions.map((suggestion, index) => (
                          <Button
                            key={index}
                            variant="outline"
                            size="sm"
                            className="text-xs"
                            onClick={() => onSendMessage(suggestion)}
                          >
                            {suggestion}
                            <ArrowRight className="ml-1 h-3 w-3" />
                          </Button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}

          {isProcessing && (
            <div className="flex items-start gap-3 animate-pulse">
              <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-600">
                <Database className="h-4 w-4" />
              </div>
              <div className="flex-1">
                <div className="bg-white p-4 rounded-lg border">
                  <div className="flex space-x-2">
                    <div
                      className="h-2 w-2 rounded-full bg-gray-300 animate-bounce"
                      style={{ animationDelay: "0ms" }}
                    ></div>
                    <div
                      className="h-2 w-2 rounded-full bg-gray-300 animate-bounce"
                      style={{ animationDelay: "300ms" }}
                    ></div>
                    <div
                      className="h-2 w-2 rounded-full bg-gray-300 animate-bounce"
                      style={{ animationDelay: "600ms" }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      <div className="p-2 border-t bg-white">
        <div className="relative max-w-4xl mx-auto">
          <Button
            variant="ghost"
            size="sm"
            className="h-6 text-xs flex items-center gap-1 hover:bg-gray-100 dark:hover:bg-gray-700"
            onClick={() => setIsReportDialogOpen(true)}
          >
            <FileText className="h-3 w-3" />
            Generate Report
          </Button>

          <Input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={isAlreadyUploaded ? "Ask a question about your data..." : "Upload a database to start querying..."}
            className="pl-4 pr-24 py-6 w-full bg-white text-base"
            disabled={isProcessing || !isAlreadyUploaded}
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex gap-2">
            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
              <Paperclip className="h-5 w-5 text-gray-400" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-full"
              onClick={() => setIsVoiceRecorderOpen(true)}
              disabled={isProcessing || !isAlreadyUploaded}
            >
              <Mic className="h-5 w-5 text-gray-400" />
            </Button>
            <Button
              size="icon"
              className="h-8 w-8 rounded-full bg-blue-600 hover:bg-blue-700"
              onClick={handleSend}
              disabled={isProcessing || !inputValue.trim() || !isAlreadyUploaded}
            >
              <Send className="h-4 w-4 text-white" />
            </Button>
          </div>
        </div>
      </div>

      {/* Voice Recorder Dialog */}
      <VoiceRecorder
        open={isVoiceRecorderOpen}
        onClose={() => setIsVoiceRecorderOpen(false)}
        onTranscript={handleVoiceTranscript}
      />

      {/* Report Generator Dialog */}
      <ReportDialog open={isReportDialogOpen} onOpenChange={setIsReportDialogOpen} databaseName={'shop'} chatId={chatId} />
    </div>
    
  )
}
