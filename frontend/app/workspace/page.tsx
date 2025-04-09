"use client"

import { useEffect, useState } from "react"
import { Search, MoreVertical, Calendar, FileText, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import Sidebar from "@/components/sidebar"
import { useRouter } from "next/navigation"
import { format } from "date-fns"
import { v4 as uuidv4 } from 'uuid'

interface Chat {
  _id: string
  name: string
  description: string
  chat_id: string
  created_at: string
  database_uploaded: boolean
  database_details?: {
    status: string
  }
}

export default function WorkspacePage() {
  const [chats, setChats] = useState<Chat[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const router = useRouter()

  const userId = localStorage.getItem("user_id"); // 🔐 Retrieve user_id from sessionStorage

  useEffect(() => {
    async function loadChats() {
      try {
        const res = await fetch(`http://localhost:5000/api/project/get_projects?user_id=${userId}`)
        const data = await res.json()
        setChats(data.reverse()) // Reverse the order to show the latest chats first
        console.log("Fetched chats:", data)
      } catch (error) {
        console.error("Failed to load chats:", error)
      } finally {
        setIsLoading(false)
      }
    }

    if (userId) {
      loadChats()
    } else {
      console.error("User ID not found in sessionStorage")
    }
  }, [userId])

  const filteredChats = chats.filter(
    (chat) =>
      chat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      chat.description.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const handleChatClick = (chatId: string) => {
    router.push(`/chat/${chatId}`)
  }

  const handleNewChat = () => {
    const newSessionId = uuidv4()
    router.push(`/chat/${newSessionId}`)
  }

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-gray-900">
      {/* Sidebar */}
      <Sidebar activePage="workspace" />

      {/* Main Section */}
      <div className="flex-1 p-8 overflow-auto">
        <h1 className="text-3xl font-semibold text-purple-500 mb-6">{localStorage.getItem('user_name')}'s Workspace</h1>

        {/* Tabs */}
        <div className="flex gap-4 mb-6">
          <div className="bg-white dark:bg-gray-800 rounded-full px-4 py-2 flex items-center gap-2">
            <span className="dark:text-gray-300">Chats</span>
            <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
              {chats.length}
            </Badge>
          </div>
        </div>

        {/* Search + New */}
        <div className="flex justify-between mb-6">
          <div className="relative w-full max-w-md">
            <Input
              type="text"
              placeholder="Search chats"
              className="pl-4 pr-10 py-2 w-full bg-white dark:bg-gray-800"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Search className="absolute right-3 top-2.5 h-5 w-5 text-gray-400 dark:text-gray-500" />
          </div>
          <Button
            className="flex items-center gap-2 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 border dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
            onClick={handleNewChat}
          >
            <Plus className="h-4 w-4" />
            <span>New chat</span>
          </Button>
        </div>

        {/* Cards Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white dark:bg-gray-800 rounded-lg p-5 border dark:border-gray-700 animate-pulse">
                <div className="h-6 w-1/2 bg-gray-200 dark:bg-gray-700 mb-4 rounded" />
                <div className="h-4 w-full bg-gray-200 dark:bg-gray-700 mb-2 rounded" />
                <div className="h-4 w-3/4 bg-gray-200 dark:bg-gray-700 rounded" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredChats.map((chat) => (
              <div
                key={chat.chat_id}
                className="bg-white dark:bg-gray-800 rounded-lg p-5 border dark:border-gray-700 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => handleChatClick(chat.chat_id)}
              >
                <div className="flex justify-between mb-3">
                  <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                    {chat.database_details?.status || "Active"}
                  </Badge>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreVertical className="h-5 w-5" />
                  </Button>
                </div>
                <h3 className="font-medium text-lg mb-2 dark:text-white">{chat.name}</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">{chat.description}</p>
                <div className="flex items-center justify-between text-gray-500 dark:text-gray-400 text-sm">
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-2" />
                    <span>{format(new Date(chat.created_at), "dd MMM yyyy")}</span>
                  </div>
                  {chat.database_uploaded && (
                    <div className="relative">
                      <FileText className="h-5 w-5" />
                      <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-600 dark:bg-blue-500 rounded-full" />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
