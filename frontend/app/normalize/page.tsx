"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Database } from "lucide-react"
import { Button } from "@/components/ui/button"
import Sidebar from "@/components/sidebar"
import { useDatabase } from "@/contexts/database-context"
import { DatabaseUploadDialog } from "@/components/upload/database-upload-dialog"
import { NormalizationResponse } from "@/components/normalize/normalization-response"
import { NormalizationCheck } from "@/components/normalize/normalization-check"
import { NormalizationSteps } from "@/components/normalize/normalization-steps"
import { DownloadButton } from "@/components/normalize/download-button"
import { simulateNormalization } from "@/lib/api"
import { useToast } from "@/components/ui/use-toast"
const API_BASE_URL = "http://localhost:5000/api"

export default function NormalizePage() {
  const { isLoaded, data, clearDatabase } = useDatabase()
  const [schema, setSchema] = useState<any>(null)
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false)
  const [isNormalizing, setIsNormalizing] = useState(false)
  const [normalizationResult, setNormalizationResult] = useState<any>(null)
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
      const fetchProjectInfo = async () => {
        try {
          const res = await fetch(`${API_BASE_URL}/project/${"d51e615a-ed85-430d-89c5-52db3ea5db0d"}`)
          const data = await res.json()

          if (data.schema) {
            setSchema(data.schema)
          }
        } catch (err) {
          console.error("Failed to fetch project info", err)
          setIsUploadDialogOpen(true)
        }
      }
    
      fetchProjectInfo()
    }, ["d51e615a-ed85-430d-89c5-52db3ea5db0d"])

  const handleUploadComplete = () => {
    toast({
      title: "Database uploaded",
      description: "Your database has been uploaded successfully. You can now normalize it.",
    })
  }

  const handleNormalize = async () => {
    if (!isLoaded || !schema || !data) {
      toast({
        title: "No database loaded",
        description: "Please upload a database before normalizing.",
        variant: "destructive",
      })
      return
    }

    setIsNormalizing(true)
    try {
        
      // In a real application, this would call an API endpoint
      const result = await fetch("http://localhost:5000/api/agent/normalize", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        }
      }).then((res) => res.json())
      
      const normResult = {
        normalForms: {
          firstNF: true,
          secondNF: false,
          thirdNF: false, // or hardcode true/false as needed
        },
        normalizationSQL: result.output, // assuming your API returns { sql: "..." }
      }
      
      setNormalizationResult(normResult)
      toast({
        title: "Normalization complete",
        description: "Your database has been normalized successfully.",
      })
    } catch (error) {
      console.error("Error normalizing database:", error)
      toast({
        title: "Normalization failed",
        description: "An error occurred while normalizing your database. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsNormalizing(false)
    }
  }

  const handleReset = () => {
    setNormalizationResult(null)
  }

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-gray-900">
      {/* Left Sidebar */}
      <Sidebar activePage="home" />

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-full">
        <div className="p-6 border-b dark:border-gray-700 bg-white dark:bg-gray-800">
          <h1 className="text-xl font-medium dark:text-white">Database Normalization</h1>
        </div>

        <div className="flex-1 overflow-auto p-6">
          <div className="max-w-6xl mx-auto space-y-6">
            {!isLoaded ? (
              <div className="bg-white dark:bg-gray-800 rounded-lg p-8 text-center border dark:border-gray-700">
                <Database className="h-12 w-12 mx-auto text-gray-400 dark:text-gray-500 mb-4" />
                <h2 className="text-xl font-medium mb-2 dark:text-white">No Database Loaded</h2>
                <p className="text-gray-500 dark:text-gray-400 mb-6">
                  Upload a database to start the normalization process
                </p>
                <Button onClick={() => setIsUploadDialogOpen(true)}>Upload Database</Button>
              </div>
            ) : normalizationResult ? (
              <div className="space-y-6">
                <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border dark:border-gray-700">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-medium dark:text-white">Normalization Results</h2>
                    <div className="flex space-x-2">
                      <Button variant="outline" onClick={handleReset}>
                        Reset
                      </Button>
                      <DownloadButton normalizationResult={normalizationResult} />
                    </div>
                  </div>

                  <NormalizationCheck normalizationResult={normalizationResult} />
                </div>              </div>
            ) : (
              <div className="space-y-6">
                <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border dark:border-gray-700">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-medium dark:text-white">Database Information</h2>
                    <Button variant="outline" onClick={() => setIsUploadDialogOpen(true)}>
                      Change Database
                    </Button>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <span className="font-medium mr-2 dark:text-white">Table:</span>
                      <span className="dark:text-gray-300">{schema[0].table_name}</span>
                    </div>
                    <div className="flex items-center">
                      <span className="font-medium mr-2 dark:text-white">Columns:</span>
                      <span className="dark:text-gray-300">{schema[0].columns.length}</span>
                    </div>
                    <div className="flex items-center">
                      <span className="font-medium mr-2 dark:text-white">Rows:</span>
                      <span className="dark:text-gray-300">{data?.length}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border dark:border-gray-700">
                  <h2 className="text-xl font-medium mb-4 dark:text-white">Normalization Options</h2>
                  <p className="text-gray-500 dark:text-gray-400 mb-6">
                    Normalize your database to reduce redundancy and improve data integrity. The AI will analyze your
                    database structure and suggest normalization steps to achieve up to Third Normal Form (3NF).
                  </p>
                  <Button onClick={handleNormalize} disabled={isNormalizing} className="w-full">
                    {isNormalizing ? (
                      <>
                        <span className="animate-spin mr-2">⟳</span>
                        Normalizing...
                      </>
                    ) : (
                      "Normalize Database"
                    )}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Database Upload Dialog */}
      <DatabaseUploadDialog
        chatId={"12314123123123123123"}
        open={isUploadDialogOpen}
        onOpenChange={setIsUploadDialogOpen}
        onComplete={handleUploadComplete}
      />
    </div>
  )
}
