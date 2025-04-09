"use client"

import { useState, useEffect } from "react"
import { v4 as uuidv4 } from "uuid"
import Sidebar from "@/components/sidebar"
import { MessageInterface, type Message } from "@/components/chat/message-interface"
import { DatabaseProvider } from "@/contexts/database-context"

const API_BASE_URL = "http://localhost:5000/api/chat"

interface Props {
  chatId: string
}

export default function ExistingChatPage({ params }: { params: { id: string } }) {
  const chatId = params.id
  const [messages, setMessages] = useState<Message[]>([])
  const [isProcessing, setIsProcessing] = useState(false)

  useEffect(() => {
    // fetch existing messages from your backend
    fetch(`${API_BASE_URL}/${chatId}/history`)
      .then((res) => res.json())
      .then((data) => setMessages(data.messages))
      .catch(console.error)
  }, [chatId])

  const handleSendMessage = async (content: string) => {
    const userMessage: Message = {
      id: uuidv4(),
      role: "user",
      content,
      timestamp: new Date(),
    }
    setMessages((prev) => [...prev, userMessage])
    setIsProcessing(true)

    try {
      const res = await fetch(`${API_BASE_URL}/${chatId}/query`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: content }),
      })
      const data = await res.json()
      const assistantMessage: Message = {
        id: uuidv4(),
        role: "assistant",
        content: data.explanation || "Here is the result:",
        timestamp: new Date(),
        agentSteps: data.agentSteps,
        currentStep: data.currentStep,
        sqlQuery: data.query,
        explanation: data.explanation,
        tableData: data.result,
        tableColumns: data.columns,
        visualizationType: data.visualizationType,
        followUpSuggestions: data.followUpSuggestions,
      }
      setMessages((prev) => [...prev, assistantMessage])
    } catch (error) {
      console.error(error)
      setMessages((prev) => [
        ...prev,
        {
          id: uuidv4(),
          role: "assistant",
          content: "Sorry, something went wrong. Try again.",
          timestamp: new Date(),
        },
      ])
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <DatabaseProvider>
      <div className="flex h-screen bg-slate-50 dark:bg-gray-900">
        <Sidebar activePage="workspace" />
        <div className="flex-1 flex flex-col h-full">
          <div className="p-6 border-b dark:border-gray-700 bg-white dark:bg-gray-800">
            <h1 className="text-xl font-medium dark:text-white">Chat History</h1>
          </div>
          <MessageInterface
            messages={messages}
            onSendMessage={handleSendMessage}
            isProcessing={isProcessing}
          />
        </div>
      </div>
    </DatabaseProvider>
  )
}