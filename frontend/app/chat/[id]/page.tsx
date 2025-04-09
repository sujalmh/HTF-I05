"use client"

import { useState, useEffect } from "react"
import { v4 as uuidv4 } from "uuid"
import { ArrowRight } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Sidebar from "@/components/sidebar"
import { MessageInterface, type Message } from "@/components/chat/message-interface"
import { useSearchParams } from "next/navigation"
import { DatabaseProvider } from "@/contexts/database-context"
import { DatabaseUploadDialog } from "@/components/upload/database-upload-dialog"
import { DatabaseInfoPanel } from "@/components/chat/database-info-panel"

const API_BASE_URL = "http://localhost:5000/api"

interface Props {
  chatId: string
}

function NewChatContent({ chatId }: Props) {
  const [messages, setMessages] = useState<Message[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false)
  const [schema, setSchema] = useState<any>(null)
  const [isAlreadyUploaded, setIsAlreadyUploaded] = useState(false)
  const searchParams = useSearchParams()
  const initialQuery = searchParams.get("query")

  useEffect(() => {
    const fetchProjectInfo = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/project/${chatId}`)
        const data = await res.json()
  
        if (data.messages) {
          const parsedMessages = data.messages.map((msg: any) => ({
            ...msg,
            timestamp: new Date(msg.timestamp),
          }))
          setMessages(parsedMessages)
        }
  
        if (!data.database_uploaded) {
          setIsUploadDialogOpen(true)
        } else {
          setIsAlreadyUploaded(true)
        }
  
        if (data.schema) {
          setSchema(data.schema)
        }
      } catch (err) {
        console.error("Failed to fetch project info", err)
        setIsUploadDialogOpen(true)
      }
    }
  
    fetchProjectInfo()
  }, [chatId])
  
  useEffect(() => {
    if (initialQuery && schema) {
      handleSendMessage(initialQuery)
    }
  }, [initialQuery, schema])

  const fetchSchema = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/chat/schema`)
      const data = await response.json()
      if (!data.error) {
        setSchema(data)
      }
    } catch (error) {
      console.error("Error fetching schema:", error)
    }
  }

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
      const response = await fetch(`http://127.0.0.1:8000/query`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: content, chatId: chatId, graph: false }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()

      const assistantMessage: Message = {
        id: uuidv4(),
        role: "assistant",
        content: data.explanation || "Here is the result:",
        timestamp: new Date(),
        agentSteps: data.steps,
        explanation: data.explanation,
        currentStep: data.steps.length,
        followUpSuggestions: ["Show me the schema", "List all tables", "How many rows are in each table?"],
        sqlQuery: data.sql, 
        tableColumns: data.result.columns,
        tableData: data.result.data,
        visualization: data.visualization,
      }

      console.log(assistantMessage)

      setMessages((prev) => [...prev, assistantMessage])
      
    } catch (error) {
      console.error("Error processing query:", error)
      setMessages((prev) => [
        ...prev,
        {
          id: uuidv4(),
          role: "assistant",
          content: "Sorry, I encountered an error processing your request. Please try again.",
          timestamp: new Date(),
        },
      ])
    } finally {
      setIsProcessing(false)
    }
  }

  const handleUploadComplete = async (responseData: any) => {
    try {
      const schemaData = responseData.schema;
      setSchema(schemaData);
      await fetchSchema();

      const tableCount = Object.keys(schemaData).length;

      const agentSteps = [
        {
          id: uuidv4(),
          description: "Database file processed successfully",
          status: "done",
        },
        {
          id: uuidv4(),
          description: `Detected ${tableCount} tables`,
          status: "done",
        },
        ...Object.entries(schemaData).map(([tableName, columns]) => ({
          id: uuidv4(),
          description: `Table "${tableName}" with ${columns.length} columns`,
          status: "done",
        })),
        {
          id: uuidv4(),
          description: "Ready to answer questions about your data",
          status: "done",
        },
      ];
      console.log(typeof agentSteps);
      const newMessage = [
        {
          id: uuidv4(),
          role: "assistant",
          content: "Database uploaded successfully! You can now ask questions about your data.",
          timestamp: new Date(),
          agentSteps,
          currentStep: agentSteps.length,
          explanation: "I've analyzed your database and I'm ready to help you query it.",
          followUpSuggestions: ["Show me the schema", "List all tables", "How many rows are in each table?"],
        },
      ]
      setMessages(newMessage);

    } catch (error) {
      console.error("Error processing database upload:", error);
      setMessages([
        {
          id: uuidv4(),
          role: "assistant",
          content: "Error processing database upload.",
          timestamp: new Date(),
        },
      ]);
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-gray-900">
      <Sidebar activePage="home" />
      <div className="flex-1 flex flex-col h-full mt-5">
        

        {!isAlreadyUploaded && messages.length === 0 ? (
          <div className="flex-1 flex items-center justify-center p-8">
            <div className="max-w-2xl w-full">
              <h2 className="text-2xl font-semibold text-center mb-6">
                <span className="text-purple-500">Query </span>
                <span className="text-teal-500">your data</span>
              </h2>

              <div className="mb-8">
                <DatabaseInfoPanel 
                  onUploadClick={() => setIsUploadDialogOpen(true)} 
                  disabled={isAlreadyUploaded} 
                />
              </div>

              {schema && Object.keys(schema).length > 0 && (
                <>
                  <p className="text-gray-600 dark:text-gray-400 text-center mb-6">
                    Ask questions about your data in natural language
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                    <Card
                      className="hover:shadow-md cursor-pointer"
                      onClick={() => handleSendMessage(`Show me the schema of the ${schema[0].table_name} table`)} >
                      <CardContent className="p-4 flex items-center justify-between">
                        <p className="font-medium dark:text-white">Show me the schema</p>
                        <ArrowRight className="h-4 w-4" />
                      </CardContent>
                    </Card>
                    <Card
                      className="hover:shadow-md cursor-pointer"
                      onClick={() => handleSendMessage(`Show me the first 5 rows from the ${schema[0].table_name} table`)} >
                      <CardContent className="p-4 flex items-center justify-between">
                        <p className="font-medium dark:text-white">Show me the first 5 rows</p>
                        <ArrowRight className="h-4 w-4" />
                      </CardContent>
                    </Card>
                  </div>
                </>
              )}
            </div>
          </div>
        ) : (
          <MessageInterface 
            messages={messages} 
            chatId={chatId}
            onSendMessage={handleSendMessage} 
            isProcessing={isProcessing} 
            isAlreadyUploaded={isAlreadyUploaded}
          />
        )}
      </div>

      <DatabaseUploadDialog
        chatId={chatId}
        open={isUploadDialogOpen}
        onOpenChange={setIsUploadDialogOpen}
        onComplete={handleUploadComplete}
      />
    </div>
  )
}

export default function NewChatPage({ params }: { params: { id: string } }) {
  return (
    <DatabaseProvider>
      <NewChatContent chatId={params.id} />
    </DatabaseProvider>
  )
}