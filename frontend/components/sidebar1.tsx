import Link from "next/link"
import { Button } from "@/components/ui/button"
import { AuthStatus } from "@/components/auth-status"
import { Home, Search, PlusCircle, MessageSquare, LayoutDashboard, Settings } from "lucide-react"

export default function Sidebar() {
  return (
    <div className="flex h-screen w-64 flex-col border-r bg-background">
      <div className="flex h-14 items-center border-b px-4">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <LayoutDashboard className="h-6 w-6" />
          <span>NL to SQL</span>
        </Link>
      </div>
      <div className="flex-1 overflow-auto py-2">
        <nav className="grid items-start px-2 text-sm font-medium">
          <Link href="/" passHref>
            <Button variant="ghost" className="w-full justify-start gap-2">
              <Home className="h-4 w-4" />
              Home
            </Button>
          </Link>
          <Link href="/discover" passHref>
            <Button variant="ghost" className="w-full justify-start gap-2">
              <Search className="h-4 w-4" />
              Discover
            </Button>
          </Link>
          <Link href="/new-chat" passHref>
            <Button variant="ghost" className="w-full justify-start gap-2">
              <PlusCircle className="h-4 w-4" />
              New Chat
            </Button>
          </Link>
          <Link href="/workspace" passHref>
            <Button variant="ghost" className="w-full justify-start gap-2">
              <MessageSquare className="h-4 w-4" />
              Workspace
            </Button>
          </Link>
          <Link href="/profile" passHref>
            <Button variant="ghost" className="w-full justify-start gap-2">
              <Settings className="h-4 w-4" />
              Settings
            </Button>
          </Link>
        </nav>
      </div>
      <div className="mt-auto p-4">
        <AuthStatus />
      </div>
    </div>
  )
}

