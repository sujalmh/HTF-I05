"use client"

import { useState } from "react"
import { Download, Maximize2, Minimize2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

interface ReportPreviewProps {
  data: {
    format: string
    downloadUrl: string
    // Optionally, you could include a "choice" property if you wish to adjust the route type
    choice?: string
  }
}

export function ReportPreview({ data }: ReportPreviewProps) {
  const [isFullscreen, setIsFullscreen] = useState(false)

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen)
  }

  const handleDownload = () => {
    // Opens the file in a new tab so the user can download it.
    window.open(data.downloadUrl, "_blank")
  }

  return (
    <div className={`space-y-4 ${isFullscreen ? "fixed inset-0 z-50 bg-white dark:bg-gray-900 p-6" : ""}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="sm" onClick={toggleFullscreen}>
            {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </Button>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={handleDownload}>
            <Download className="h-4 w-4 mr-1" />
            Download
          </Button>
        </div>
      </div>

      <Card
        className={`border rounded-lg overflow-hidden ${data.format === "pdf" ? "aspect-[1.35]" : "aspect-[16/9]"} ${
          isFullscreen ? "h-[calc(100%-80px)]" : "h-[600px]"
        }`}
      >
        {data.format === "pdf" ? (
          <iframe
            src={data.downloadUrl}
            title="File Preview"
            className="w-full h-full"
            frameBorder="0"
          />
        ) : (
          // For non-PDF file types, show a message.
          <div className="flex items-center justify-center h-full bg-gray-100 dark:bg-gray-800">
            <p className="text-gray-500">
              Preview is not available for this file type. Please download to view the file.
            </p>
          </div>
        )}
      </Card>
    </div>
  )
}
