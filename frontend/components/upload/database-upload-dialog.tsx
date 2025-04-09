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
  chatId: string
  open: boolean
  onOpenChange: (open: boolean) => void
  onComplete: (result: any) => void;
}

export function DatabaseUploadDialog({ chatId, open, onOpenChange, onComplete }: DatabaseUploadDialogProps) {
  const { setDatabaseInfo } = useDatabase()
  // console.log("data schema data info",setDatabaseInfo)
  const [uploadedSchema, setUploadedSchema] = useState<any>(null)
  const [uploadedData, setUploadedData] = useState<any[]>([])
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("upload")
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)

  const handleSchemaDetected = (schema: any, data: any) => {
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



  const handleConfirm = async () => {
    if (uploadedSchema && totalLength > 0 && uploadedFile) {
      try {
        const formData = new FormData();
        const userId = localStorage.getItem("user_id");
  
        formData.append("file", uploadedFile);
        if (userId) {
          formData.append("chat_id", chatId);
          formData.append("user_id", userId);
        }
  
        const res = await fetch(`http://localhost:5000/api/upload/start`, {
          method: "POST",
          body: formData,
        });
  
        const result = await res.json();
  
        if (!res.ok) {
          console.error("Upload failed:", result.error);
        } else {
          console.log("Upload success:", result);
          setDatabaseInfo(result.schema, result.data);
          onComplete(result); // ✅ Send the full response to NewChatContent
          onOpenChange(false);
        }
      } catch (err) {
        console.error("Error uploading file:", err);
      }
    }
  };
    

  const totalLength = Object.values(uploadedData).reduce((acc, arr) => acc + arr.length, 0);


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
              <FileUploader onSchemaDetected={handleSchemaDetected} onError={handleError} onFileUpload={setUploadedFile} />
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
              {uploadedSchema && totalLength > 0 && <DataPreview schema={uploadedSchema} data={uploadedData} />}
            </TabsContent>
          </div>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleConfirm}  disabled={!uploadedSchema || totalLength === 0}>
            Confirm & Start Querying
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

