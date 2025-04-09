"use client"

import { useEffect, useState } from "react"
import { Bell, ChevronRight, Clock, Download, FileText, Settings, Shield, User, Moon, Sun, Monitor } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import Sidebar from "@/components/sidebar"
import { getUserProfile } from "@/lib/api"
import { format } from "date-fns"
import { useTheme } from "@/contexts/theme-context"

interface UserProfile {
  id: string
  name: string
  email: string
  avatar: string
  preferences: {
    notifications: boolean
    dataSharing: boolean
    theme: string
  }
  activity: Array<{
    id: string
    type: string
    title: string
    description: string
    timestamp: string
  }>
  savedQueries: Array<{
    id: string
    title: string
  }>
  subscription: {
    plan: string
    price: string
    billingCycle: string
    status: string
  }
}

export default function ProfilePage() {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [notifications, setNotifications] = useState(true)
  const [dataSharing, setDataSharing] = useState(false)
  const { theme, setTheme } = useTheme()

  useEffect(() => {
    async function loadUserProfile() {
      try {
        const profile = (await getUserProfile()) as UserProfile
        console.log(profile)
        setUserProfile(profile)
        setNotifications(profile.preferences.notifications)
        setDataSharing(profile.preferences.dataSharing)
      } catch (error) {
        console.error("Failed to load user profile:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadUserProfile()
  }, [])

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "query":
        return <Clock className="h-5 w-5 text-gray-400 dark:text-gray-500 mt-0.5" />
      case "report":
        return <FileText className="h-5 w-5 text-gray-400 dark:text-gray-500 mt-0.5" />
      case "download":
        return <Download className="h-5 w-5 text-gray-400 dark:text-gray-500 mt-0.5" />
      default:
        return <Clock className="h-5 w-5 text-gray-400 dark:text-gray-500 mt-0.5" />
    }
  }

  if (isLoading) {
    return (
      <div className="flex h-screen bg-slate-50 dark:bg-gray-900">
        <Sidebar activePage="profile" />
        <div className="flex-1 p-8 overflow-auto">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-4 mb-8 animate-pulse">
              <div className="h-20 w-20 rounded-full bg-gray-200 dark:bg-gray-700"></div>
              <div className="flex-1">
                <div className="h-6 w-48 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
              </div>
              <div className="h-9 w-28 bg-gray-200 dark:bg-gray-700 rounded"></div>
            </div>

            <div className="h-10 w-64 bg-gray-200 dark:bg-gray-700 rounded mb-6"></div>

            <div className="space-y-6">
              {[1, 2].map((i) => (
                <div key={i} className="h-64 bg-gray-200 dark:bg-gray-700 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!userProfile) {
    return (
      <div className="flex h-screen bg-slate-50 dark:bg-gray-900">
        <Sidebar activePage="profile" />
        <div className="flex-1 p-8 overflow-auto flex items-center justify-center">
          <p className="text-red-500">Failed to load profile data. Please try again later.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-gray-900">
      {/* Left Sidebar */}
      <Sidebar activePage="profile" />

      {/* Main Content */}
      <div className="flex-1 p-8 overflow-auto">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-4 mb-8">
            <Avatar className="h-20 w-20 border-4 border-white dark:border-gray-800 shadow-sm">
              <AvatarImage src={userProfile.avatar} />
              <AvatarFallback>
                {userProfile.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-2xl font-semibold dark:text-white">{localStorage.getItem('user_name')}</h1>
              <p className="text-gray-600 dark:text-gray-400">{localStorage.getItem('user_email')}</p>
            </div>
            <Button variant="outline" className="ml-auto">
              <Settings className="mr-2 h-4 w-4" />
              Edit Profile
            </Button>
          </div>

          <Tabs defaultValue="activity" className="mb-8">
            <TabsList>
              <TabsTrigger value="activity">Activity</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
              <TabsTrigger value="security">Security</TabsTrigger>
              <TabsTrigger value="billing">Billing</TabsTrigger>
            </TabsList>

            <TabsContent value="activity" className="mt-6 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                  <CardDescription>Your recent queries and interactions</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {userProfile.activity.map((activity) => (
                      <div key={activity.id} className="flex items-start gap-3 pb-4 border-b dark:border-gray-700">
                        {getActivityIcon(activity.type)}
                        <div>
                          <p className="font-medium dark:text-white">{activity.title}</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">{activity.description}</p>
                          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                            {format(new Date(activity.timestamp), "MMM d, yyyy, h:mm a")}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Saved Queries</CardTitle>
                  <CardDescription>Your bookmarked and frequently used queries</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {userProfile.savedQueries.map((query) => (
                      <Button key={query.id} variant="ghost" className="w-full justify-between">
                        <span>{query.title}</span>
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="settings" className="mt-6 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Preferences</CardTitle>
                  <CardDescription>Manage your app preferences and notifications</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="notifications">Notifications</Label>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Receive notifications about updates and activity
                      </p>
                    </div>
                    <Switch id="notifications" checked={notifications} onCheckedChange={setNotifications} />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="data-sharing">Data Sharing</Label>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Share anonymous usage data to improve the service
                      </p>
                    </div>
                    <Switch id="data-sharing" checked={dataSharing} onCheckedChange={setDataSharing} />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Display Settings</CardTitle>
                  <CardDescription>Customize your app appearance</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-2">
                    <Button
                      variant="outline"
                      className={`h-auto py-4 flex flex-col items-center justify-center ${
                        theme === "light" ? "bg-blue-50 border-blue-200 dark:bg-blue-900 dark:border-blue-800" : ""
                      }`}
                      onClick={() => setTheme("light")}
                    >
                      <Sun className="h-6 w-6 mb-2 text-amber-500" />
                      <span className="text-xs">Light</span>
                    </Button>

                    <Button
                      variant="outline"
                      className={`h-auto py-4 flex flex-col items-center justify-center ${
                        theme === "dark" ? "bg-blue-50 border-blue-200 dark:bg-blue-900 dark:border-blue-800" : ""
                      }`}
                      onClick={() => setTheme("dark")}
                    >
                      <Moon className="h-6 w-6 mb-2 text-indigo-500" />
                      <span className="text-xs">Dark</span>
                    </Button>

                    <Button
                      variant="outline"
                      className={`h-auto py-4 flex flex-col items-center justify-center ${
                        theme === "system" ? "bg-blue-50 border-blue-200 dark:bg-blue-900 dark:border-blue-800" : ""
                      }`}
                      onClick={() => setTheme("system")}
                    >
                      <Monitor className="h-6 w-6 mb-2 text-gray-500 dark:text-gray-400" />
                      <span className="text-xs">System</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="security" className="mt-6 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Security Settings</CardTitle>
                  <CardDescription>Manage your account security</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button variant="outline" className="w-full justify-between">
                    <div className="flex items-center">
                      <Shield className="mr-2 h-4 w-4" />
                      <span>Change Password</span>
                    </div>
                    <ChevronRight className="h-4 w-4" />
                  </Button>

                  <Button variant="outline" className="w-full justify-between">
                    <div className="flex items-center">
                      <Bell className="mr-2 h-4 w-4" />
                      <span>Two-Factor Authentication</span>
                    </div>
                    <ChevronRight className="h-4 w-4" />
                  </Button>

                  <Button variant="outline" className="w-full justify-between">
                    <div className="flex items-center">
                      <User className="mr-2 h-4 w-4" />
                      <span>Connected Accounts</span>
                    </div>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Data Privacy</CardTitle>
                  <CardDescription>Manage your data and privacy settings</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Button variant="outline" className="w-full justify-between">
                      <span>Download Your Data</span>
                      <Download className="h-4 w-4" />
                    </Button>

                    <Button
                      variant="outline"
                      className="w-full justify-between text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950 dark:hover:text-red-400"
                    >
                      <span>Delete Account</span>
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="billing" className="mt-6 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Subscription Plan</CardTitle>
                  <CardDescription>Manage your subscription and billing</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 mb-4 dark:bg-blue-950 dark:border-blue-900">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-medium text-blue-800 dark:text-blue-300">
                          {userProfile.subscription.plan} Plan
                        </p>
                        <p className="text-sm text-blue-600 dark:text-blue-400">
                          {userProfile.subscription.price}, billed {userProfile.subscription.billingCycle}
                        </p>
                      </div>
                      <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100 dark:bg-blue-900 dark:text-blue-300 dark:hover:bg-blue-900">
                        {userProfile.subscription.status.charAt(0).toUpperCase() +
                          userProfile.subscription.status.slice(1)}
                      </Badge>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Button variant="outline" className="w-full justify-between">
                      <span>Manage Subscription</span>
                      <ChevronRight className="h-4 w-4" />
                    </Button>

                    <Button variant="outline" className="w-full justify-between">
                      <span>Billing History</span>
                      <ChevronRight className="h-4 w-4" />
                    </Button>

                    <Button variant="outline" className="w-full justify-between">
                      <span>Payment Methods</span>
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Bottom User Bar */}
    </div>
  )
}

