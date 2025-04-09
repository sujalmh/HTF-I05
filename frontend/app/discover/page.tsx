"use client"

import { useEffect, useState } from "react"
import { Search, Filter, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Sidebar from "@/components/sidebar"
import { getDatasets } from "@/lib/api"
import { useRouter } from "next/navigation"

interface Dataset {
  id: string
  title: string
  description: string
  details: string
  category: string
}

interface Example {
  id: string
  title: string
  query: string
  sql: string
}

interface Template {
  id: string
  title: string
  description: string
  details: string
}

export default function DiscoverPage() {
  const [datasets, setDatasets] = useState<Dataset[]>([])
  const [examples, setExamples] = useState<Example[]>([])
  const [templates, setTemplates] = useState<Template[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const router = useRouter()

  useEffect(() => {
    async function loadData() {
      try {
        const data = await getDatasets()
        setDatasets(data.datasets)
        setExamples(data.examples)
        setTemplates(data.templates)
      } catch (error) {
        console.error("Failed to load datasets:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [])

  const filteredDatasets = datasets.filter(
    (dataset) =>
      dataset.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dataset.description.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const filteredExamples = examples.filter(
    (example) =>
      example.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      example.query.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const filteredTemplates = templates.filter(
    (template) =>
      template.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.description.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const handleTryQuery = (query: string) => {
    router.push(`/new-chat?query=${encodeURIComponent(query)}`)
  }

  const handleExploreDataset = (datasetId: string) => {
    // In a real app, this would navigate to a dataset detail page
    console.log(`Exploring dataset: ${datasetId}`)
  }

  const handleUseTemplate = (templateId: string) => {
    // In a real app, this would apply the template
    console.log(`Using template: ${templateId}`)
  }

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-gray-900">
      {/* Left Sidebar */}
      <Sidebar activePage="discover" />

      {/* Main Content */}
      <div className="flex-1 p-8 overflow-auto">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-semibold mb-2 dark:text-white">Discover</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">Explore datasets, example queries, and templates</p>

          {/* Search */}
          <div className="flex gap-2 mb-8">
            <div className="relative flex-1">
              <Input
                type="text"
                placeholder="Search datasets and examples"
                className="pl-4 pr-10 py-2 w-full bg-white dark:bg-gray-800"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Search className="absolute right-3 top-2.5 h-5 w-5 text-gray-400 dark:text-gray-500" />
            </div>
            <Button variant="outline" className="bg-white dark:bg-gray-800">
              <Filter className="mr-2 h-4 w-4" />
              Filters
            </Button>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="datasets" className="mb-8">
            <TabsList>
              <TabsTrigger value="datasets">Datasets</TabsTrigger>
              <TabsTrigger value="examples">Example Queries</TabsTrigger>
              <TabsTrigger value="templates">Templates</TabsTrigger>
            </TabsList>

            <TabsContent value="datasets" className="mt-6">
              {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[1, 2, 3].map((i) => (
                    <Card key={i} className="animate-pulse dark:bg-gray-800 dark:border-gray-700">
                      <CardHeader>
                        <div className="h-6 w-3/4 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                        <div className="h-4 w-1/2 bg-gray-200 dark:bg-gray-700 rounded"></div>
                      </CardHeader>
                      <CardContent>
                        <div className="h-4 w-full bg-gray-200 dark:bg-gray-700 rounded"></div>
                      </CardContent>
                      <CardFooter>
                        <div className="h-9 w-full bg-gray-200 dark:bg-gray-700 rounded"></div>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredDatasets.map((dataset) => (
                    <Card key={dataset.id} className="dark:bg-gray-800 dark:border-gray-700">
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <CardTitle className="dark:text-white">{dataset.title}</CardTitle>
                          <Badge
                            className={
                              dataset.category === "GDP"
                                ? "bg-green-100 text-green-800 hover:bg-green-100 dark:bg-green-900 dark:text-green-300 dark:hover:bg-green-900"
                                : dataset.category === "Finance"
                                  ? "bg-blue-100 text-blue-800 hover:bg-blue-100 dark:bg-blue-900 dark:text-blue-300 dark:hover:bg-blue-900"
                                  : "bg-emerald-100 text-emerald-800 hover:bg-emerald-100 dark:bg-emerald-900 dark:text-emerald-300 dark:hover:bg-emerald-900"
                            }
                          >
                            {dataset.category}
                          </Badge>
                        </div>
                        <CardDescription className="dark:text-gray-400">{dataset.description}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{dataset.details}</p>
                      </CardContent>
                      <CardFooter>
                        <Button variant="outline" className="w-full" onClick={() => handleExploreDataset(dataset.id)}>
                          Explore Dataset
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="examples" className="mt-6">
              {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {[1, 2].map((i) => (
                    <Card key={i} className="animate-pulse dark:bg-gray-800 dark:border-gray-700">
                      <CardHeader>
                        <div className="h-6 w-3/4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                      </CardHeader>
                      <CardContent>
                        <div className="h-4 w-full bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
                        <div className="h-24 w-full bg-gray-200 dark:bg-gray-700 rounded"></div>
                      </CardContent>
                      <CardFooter>
                        <div className="h-9 w-full bg-gray-200 dark:bg-gray-700 rounded"></div>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {filteredExamples.map((example) => (
                    <Card key={example.id} className="dark:bg-gray-800 dark:border-gray-700">
                      <CardHeader>
                        <CardTitle className="text-lg dark:text-white">{example.title}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-gray-700 dark:text-gray-300 mb-4">"{example.query}"</p>
                        <div className="bg-gray-50 dark:bg-gray-900 p-3 rounded-md text-xs font-mono text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                          {example.sql}
                        </div>
                      </CardContent>
                      <CardFooter>
                        <Button variant="outline" className="w-full" onClick={() => handleTryQuery(example.query)}>
                          Try This Query
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="templates" className="mt-6">
              {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[1, 2, 3].map((i) => (
                    <Card key={i} className="animate-pulse dark:bg-gray-800 dark:border-gray-700">
                      <CardHeader>
                        <div className="h-6 w-3/4 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                        <div className="h-4 w-1/2 bg-gray-200 dark:bg-gray-700 rounded"></div>
                      </CardHeader>
                      <CardContent>
                        <div className="h-4 w-full bg-gray-200 dark:bg-gray-700 rounded"></div>
                      </CardContent>
                      <CardFooter>
                        <div className="h-9 w-full bg-gray-200 dark:bg-gray-700 rounded"></div>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredTemplates.map((template) => (
                    <Card key={template.id} className="dark:bg-gray-800 dark:border-gray-700">
                      <CardHeader>
                        <CardTitle className="dark:text-white">{template.title}</CardTitle>
                        <CardDescription className="dark:text-gray-400">{template.description}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{template.details}</p>
                      </CardContent>
                      <CardFooter>
                        <Button variant="outline" className="w-full" onClick={() => handleUseTemplate(template.id)}>
                          Use Template
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>

          {/* Popular Queries */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4 dark:text-white">Popular Queries</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button
                variant="outline"
                className="justify-start h-auto py-3 px-4 bg-white dark:bg-gray-800"
                onClick={() => handleTryQuery("GDP growth forecast for next year")}
              >
                <div className="text-left">
                  <p className="font-medium dark:text-white">GDP growth forecast for next year</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Predictive analysis of economic growth
                  </p>
                </div>
                <ArrowRight className="ml-auto h-4 w-4" />
              </Button>

              <Button
                variant="outline"
                className="justify-start h-auto py-3 px-4 bg-white dark:bg-gray-800"
                onClick={() => handleTryQuery("Impact of interest rates on housing market")}
              >
                <div className="text-left">
                  <p className="font-medium dark:text-white">Impact of interest rates on housing market</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Correlation analysis with visualization
                  </p>
                </div>
                <ArrowRight className="ml-auto h-4 w-4" />
              </Button>

              <Button
                variant="outline"
                className="justify-start h-auto py-3 px-4 bg-white dark:bg-gray-800"
                onClick={() => handleTryQuery("Sector-wise contribution to GDP")}
              >
                <div className="text-left">
                  <p className="font-medium dark:text-white">Sector-wise contribution to GDP</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Breakdown of economic sectors</p>
                </div>
                <ArrowRight className="ml-auto h-4 w-4" />
              </Button>

              <Button
                variant="outline"
                className="justify-start h-auto py-3 px-4 bg-white dark:bg-gray-800"
                onClick={() => handleTryQuery("Foreign direct investment trends")}
              >
                <div className="text-left">
                  <p className="font-medium dark:text-white">Foreign direct investment trends</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Analysis of FDI flows by country and sector
                  </p>
                </div>
                <ArrowRight className="ml-auto h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

