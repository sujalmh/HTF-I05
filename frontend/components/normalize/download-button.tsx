"use client"

import { useState } from "react"
import { Download, FileText, Database, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useToast } from "@/components/ui/use-toast"

interface DownloadButtonProps {
  normalizationResult: any
}

export function DownloadButton({ normalizationResult }: DownloadButtonProps) {
  const [isDownloading, setIsDownloading] = useState(false)
  const { toast } = useToast()

  const handleDownload = (format: string) => {
    setIsDownloading(true)

    // Simulate download delay
    setTimeout(() => {
      setIsDownloading(false)
      toast({
        title: "Download complete",
        description: `Normalized database has been downloaded as ${format.toUpperCase()}.`,
      })
    }, 1500)
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button disabled={isDownloading}>
          {isDownloading ? (
            <>
              <span className="animate-spin mr-2">⟳</span>
              Downloading...
            </>
          ) : (
            <>
              <Download className="mr-2 h-4 w-4" />
              Download
              <ChevronDown className="ml-2 h-4 w-4" />
            </>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => handleDownload("sql")}>
          <Database className="mr-2 h-4 w-4" />
          <span>SQL Script</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleDownload("csv")}>
          <FileText className="mr-2 h-4 w-4" />
          <span>CSV Files</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
