import { Home, Radio, Zap, User, Plus, DatabaseBackup } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { v4 as uuidv4 } from 'uuid';
import { useRouter } from "next/navigation"

interface SidebarProps {
  activePage: "home" | "discover" | "workspace" | "profile"
}

export default function Sidebar({ activePage }: SidebarProps) {
  const router = useRouter()
  
  const handleNewChat = () => {
    const newSessionId = uuidv4();
    router.push(`/chat/${newSessionId}`);
  }
  return (
    <div className="w-[220px] bg-white dark:bg-gray-800 p-4 flex flex-col border-r dark:border-gray-700">
      <div className="flex items-center gap-2 mb-6">
        <div className="w-8 h-8 rounded-full border dark:border-gray-600 flex items-center justify-center">
          <div className="w-5 h-5 rounded-full border border-gray-500 dark:border-gray-400"></div>
        </div>
        <span className="font-medium text-gray-800 dark:text-gray-200">Numeronauts</span>
      </div>

      <Button variant="outline" className="flex items-center gap-2 mb-6 bg-gray-50 dark:bg-gray-700 justify-start" onClick={handleNewChat}>
        <Plus className="h-4 w-4" />
        <span>New chat</span>
      </Button>

      <nav className="space-y-1 flex-1">
        <Link href="/">
          <Button
            variant="ghost"
            className={`w-full justify-start ${
              activePage === "home"
                ? "bg-blue-50 text-blue-600 dark:bg-blue-900 dark:text-blue-300"
                : "dark:text-gray-300 dark:hover:bg-gray-700"
            }`}
          >
            <Home
              className={`mr-2 h-5 w-5 ${activePage === "home" ? "text-blue-600 dark:text-blue-300" : "text-gray-500 dark:text-gray-400"}`}
            />
            Home
          </Button>
        </Link>

        <Link href="/discover">
          <Button
            variant="ghost"
            className={`w-full justify-start ${
              activePage === "discover"
                ? "bg-blue-50 text-blue-600 dark:bg-blue-900 dark:text-blue-300"
                : "dark:text-gray-300 dark:hover:bg-gray-700"
            }`}
          >
            <Radio
              className={`mr-2 h-5 w-5 ${activePage === "discover" ? "text-blue-600 dark:text-blue-300" : "text-gray-500 dark:text-gray-400"}`}
            />
            Discover
          </Button>
        </Link>

        <Link href="/workspace">
          <Button
            variant="ghost"
            className={`w-full justify-start ${
              activePage === "workspace"
                ? "bg-blue-50 text-blue-600 dark:bg-blue-900 dark:text-blue-300"
                : "dark:text-gray-300 dark:hover:bg-gray-700"
            }`}
          >
            <Zap
              className={`mr-2 h-5 w-5 ${activePage === "workspace" ? "text-blue-600 dark:text-blue-300" : "text-gray-500 dark:text-gray-400"}`}
            />
            Workspace
          </Button>
        </Link>

        <Link href="/normalize">
          <Button
            variant="ghost"
            className={`w-full justify-start ${
              activePage === "workspace"
                ? "bg-blue-50 text-blue-600 dark:bg-blue-900 dark:text-blue-300"
                : "dark:text-gray-300 dark:hover:bg-gray-700"
            }`}
          >
            <DatabaseBackup
              className={`mr-2 h-5 w-5 ${activePage === "workspace" ? "text-blue-600 dark:text-blue-300" : "text-gray-500 dark:text-gray-400"}`}
            />
            Normalize
          </Button>
        </Link>

        <Link href="/profile">
          <Button
            variant="ghost"
            className={`w-full justify-start ${
              activePage === "profile"
                ? "bg-blue-50 text-blue-600 dark:bg-blue-900 dark:text-blue-300"
                : "dark:text-gray-300 dark:hover:bg-gray-700"
            }`}
          >
            <User
              className={`mr-2 h-5 w-5 ${activePage === "profile" ? "text-blue-600 dark:text-blue-300" : "text-gray-500 dark:text-gray-400"}`}
            />
            Profile
          </Button>
        </Link>
      </nav>
    </div>
  )
}

