"use client"

import type React from "react"

import { useState } from "react"
import { Upload, X, FileText, Database, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { parseFile } from "@/lib/file-parser"

interface FileUploaderProps {
  onSchemaDetected: (schema: any, data: any) => void
  onError: (error: string) => void
}

export function FileUploader({ onSchemaDetected, onError }: FileUploaderProps) {
  const [file, setFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0]
      setFile(selectedFile)
      setError(null)
    }
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0]
      setFile(droppedFile)
      setError(null)
    }
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
  }

  const handleRemoveFile = () => {
    setFile(null)
    setError(null)
  }

  const handleUpload = async () => {
    if (!file) return

    setIsUploading(true)
    setUploadProgress(0)

    try {
      // Simulate progress
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return prev
          }
          return prev + 10
        })
      }, 200)

      // Parse the file
      const { schema, data } = await parseFile(file)

      clearInterval(progressInterval)
      setUploadProgress(100)

      // Notify parent component
      onSchemaDetected(schema, data)

      // Reset after successful upload
      setTimeout(() => {
        setIsUploading(false)
        setUploadProgress(0)
      }, 1000)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to parse file"
      setError(errorMessage)
      onError(errorMessage)
      setIsUploading(false)
      setUploadProgress(0)
    }
  }

  const isValidFileType =
    file && (file.name.endsWith(".csv") || file.name.endsWith(".json") || file.name.endsWith(".sql") || file.name.endsWith(".db"))

  return (
    <div className="w-full">
      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {!file ? (
        <div
          className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:bg-gray-50 transition-colors cursor-pointer"
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onClick={() => document.getElementById("file-upload")?.click()}
        >
          <Upload className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Upload your database file</h3>
          <p className="mt-1 text-xs text-gray-500">Drag and drop or click to upload a CSV, JSON, or SQL file</p>
          <input id="file-upload" type="file" className="hidden" accept=".db,.csv,.json,.sql" onChange={handleFileChange} />
        </div>
      ) : (
        <div className="border rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center">
              <div className="bg-blue-100 p-2 rounded-md mr-3">
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium">{file.name}</p>
                <p className="text-xs text-gray-500">{(file.size / 1024).toFixed(2)} KB</p>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={handleRemoveFile} disabled={isUploading}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          {isUploading ? (
            <div className="space-y-2">
              <Progress value={uploadProgress} className="h-2" />
              <p className="text-xs text-gray-500 text-center">
                {uploadProgress < 100 ? "Processing file..." : "Processing complete!"}
              </p>
            </div>
          ) : (
            <Button onClick={handleUpload} className="w-full" disabled={!isValidFileType}>
              <Database className="mr-2 h-4 w-4" />
              {isValidFileType ? "Process Database File" : "Invalid File Type"}
            </Button>
          )}
        </div>
      )}
    </div>
  )
}

