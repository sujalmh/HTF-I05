"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FileUploader } from "@/components/upload/file-uploader"
import { SchemaDisplay } from "@/components/upload/schema-display"
import { DataPreview } from "@/components/upload/data-preview"
import { useDatabase } from "@/contexts/database-context"

interface DatabaseUploadDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onComplete: () => void
}

export function DatabaseUploadDialog({ open, onOpenChange, onComplete }: DatabaseUploadDialogProps) {
  const { setDatabaseInfo } = useDatabase()
  const [uploadedSchema, setUploadedSchema] = useState<any>(null)
  const [uploadedData, setUploadedData] = useState<any[]>([])
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("upload")

  const handleSchemaDetected = (schema: any, data: any[]) => {
    setUploadedSchema(schema)
    setUploadedData(data)
    setError(null)
    setActiveTab("schema") // Switch to schema tab after successful upload
  }

  const handleError = (errorMessage: string) => {
    setError(errorMessage)
    setUploadedSchema(null)
    setUploadedData([])
  }

  const handleConfirm = () => {
    if (uploadedSchema && uploadedData.length > 0) {
      setDatabaseInfo(uploadedSchema, uploadedData)
      onComplete()
      onOpenChange(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Upload Database</DialogTitle>
          <DialogDescription>
            Upload your database file to start querying it with natural language. We support CSV, JSON, and SQL dump
            files.
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 overflow-hidden flex flex-col">
          <TabsList className="mb-4">
            <TabsTrigger value="upload">Upload</TabsTrigger>
            <TabsTrigger value="schema" disabled={!uploadedSchema}>
              Schema
            </TabsTrigger>
            <TabsTrigger value="preview" disabled={!uploadedSchema || uploadedData.length === 0}>
              Data Preview
            </TabsTrigger>
          </TabsList>

          <div className="flex-1 overflow-auto">
            <TabsContent value="upload" className="mt-0">
              <FileUploader onSchemaDetected={handleSchemaDetected} onError={handleError} />
            </TabsContent>

            <TabsContent value="schema" className="mt-0">
              {uploadedSchema && (
                <div>
                  <SchemaDisplay schema={uploadedSchema} />
                  <p className="text-sm text-gray-500 mt-4">{uploadedData.length} rows of data detected</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="preview" className="mt-0">
              {uploadedSchema && uploadedData.length > 0 && <DataPreview schema={uploadedSchema} data={uploadedData} />}
            </TabsContent>
          </div>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleConfirm} disabled={!uploadedSchema || uploadedData.length === 0}>
            Confirm & Start Querying
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

