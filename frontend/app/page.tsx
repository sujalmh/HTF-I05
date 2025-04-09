"use client"

import { useEffect, useState } from "react"
import { Search, Upload, FileText, PresentationIcon, Mic, Paperclip, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import Sidebar from "@/components/sidebar"
import { useRouter } from "next/navigation"
import { getUserProfile } from "@/lib/api"
import { v4 as uuidv4 } from 'uuid';

export default function HomePage() {
  const router = useRouter()
  const [userName, setUserName] = useState("User")
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function loadUserProfile() {
      try {
        const profile = await getUserProfile()
        if (profile && profile.name) {
          setUserName(localStorage.getItem('user_name')) // Get first name
        }
      } catch (error) {
        console.error("Failed to load user profile:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadUserProfile()
  }, [])

  const handleNewChat = () => {
    const newSessionId = uuidv4();
    router.push(`/chat/${newSessionId}`);
    // router.push("/new-chat")
  }

  const handleQueryClick = (query: string) => {
    router.push(`/new-chat?query=${encodeURIComponent(query)}`)
  }

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-gray-900">
      {/* Left Sidebar */}
      <Sidebar activePage="home" />

      {/* Main Content */}
      <div className="flex-1 p-8 overflow-auto">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-semibold mb-2 text-center">
            <span className="text-purple-500">Hello </span>
            {isLoading ? (
              <span className="inline-block w-24 h-10 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></span>
            ) : (
              <span className="text-teal-500">{userName}</span>
            )}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-center mb-10">How can I help you today?</p>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-16">
            <div
              className="bg-white dark:bg-gray-800 rounded-lg p-5 border dark:border-gray-700 hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => handleQueryClick("Show me info on the Indian GDP")}
            >
              <p className="text-gray-700 dark:text-gray-300 mb-4">Show me info on the Indian GDP</p>
              <Badge className="bg-green-100 text-green-800 hover:bg-green-100 dark:bg-green-900 dark:text-green-300 dark:hover:bg-green-900">
                GDP
              </Badge>
            </div>

            <div
              className="bg-white dark:bg-gray-800 rounded-lg p-5 border dark:border-gray-700 hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => handleQueryClick("Show me info on the Indian CPI")}
            >
              <p className="text-gray-700 dark:text-gray-300 mb-4">Show me info on the Indian CPI</p>
              <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100 dark:bg-blue-900 dark:text-blue-300 dark:hover:bg-blue-900">
                CPI
              </Badge>
            </div>

            <div
              className="bg-white dark:bg-gray-800 rounded-lg p-5 border dark:border-gray-700 hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => handleQueryClick("Show me info on the Indian IP")}
            >
              <p className="text-gray-700 dark:text-gray-300 mb-4">Show me info on the Indian IP</p>
              <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-100 dark:bg-purple-900 dark:text-purple-300 dark:hover:bg-purple-900">
                IP
              </Badge>
            </div>
          </div>

          {/* AI Input */}
          <div className="relative mb-6" onClick={handleNewChat}>
            <Input
              type="text"
              placeholder="Ask AI anything"
              className="pl-4 pr-24 py-6 w-full bg-white dark:bg-gray-800 text-base cursor-pointer"
              readOnly
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex gap-2">
              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                <Paperclip className="h-5 w-5 text-gray-400 dark:text-gray-500" />
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full bg-gray-100 dark:bg-gray-700">
                <Mic className="h-5 w-5 text-gray-600 dark:text-gray-400" />
              </Button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3 justify-center mb-10">
            <Button variant="outline" className="bg-white dark:bg-gray-800">
              <span>Default</span>
              <ChevronDown className="ml-2 h-4 w-4" />
            </Button>

            <Button variant="outline" className="bg-white dark:bg-gray-800">
              <Search className="mr-2 h-4 w-4" />
              <span>Web search</span>
            </Button>

            <Button variant="outline" className="bg-white dark:bg-gray-800">
              <Upload className="mr-2 h-4 w-4" />
              <span>Upload & analyse report</span>
            </Button>

            <Button variant="outline" className="bg-white dark:bg-gray-800">
              <FileText className="mr-2 h-4 w-4" />
              <span>Create report</span>
            </Button>

            <Button variant="outline" className="bg-white dark:bg-gray-800">
              <PresentationIcon className="mr-2 h-4 w-4" />
              <span>Make presentation</span>
            </Button>
          </div>

          {/* Ethical Note */}
          <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
            Ethical considerations: You are now the custodian of highly important data. Please use for good
          </p>
        </div>
      </div>
    </div>
  )
}

