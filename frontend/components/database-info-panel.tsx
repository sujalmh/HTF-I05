"use client"

import { Database, Table2, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { SchemaDisplay } from "@/components/upload/schema-display"
import { useDatabase } from "@/contexts/database-context"

interface DatabaseInfoPanelProps {
  onUploadClick: () => void
}

export function DatabaseInfoPanel({ onUploadClick }: DatabaseInfoPanelProps) {
  const { schema, data, isLoaded, clearDatabase } = useDatabase()

  if (!isLoaded) {
    return (
      <div className="border rounded-lg p-6 bg-gray-50 dark:bg-gray-800 dark:border-gray-700 text-center">
        <Database className="h-12 w-12 text-gray-400 dark:text-gray-500 mx-auto mb-3" />
        <h3 className="text-lg font-medium mb-2 dark:text-white">No Database Loaded</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          Upload a database file to start querying with natural language
        </p>
        <Button onClick={onUploadClick}>Upload Database</Button>
      </div>
    )
  }

  return (
    <div className="border rounded-lg p-4 bg-white dark:bg-gray-800 dark:border-gray-700">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <Database className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          <h3 className="text-lg font-medium dark:text-white">Database Loaded</h3>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={clearDatabase}>
            Clear
          </Button>
          <Button variant="outline" size="sm" onClick={onUploadClick}>
            Change
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-4 mb-4 text-sm">
        <div className="flex items-center gap-1">
          <Table2 className="h-4 w-4 text-gray-500 dark:text-gray-400" />
          <span className="dark:text-gray-300">
            Table: <strong className="dark:text-white">{schema?.tableName}</strong>
          </span>
        </div>
        <div className="flex items-center gap-1">
          <FileText className="h-4 w-4 text-gray-500 dark:text-gray-400" />
          <span className="dark:text-gray-300">
            Rows: <strong className="dark:text-white">{data?.length}</strong>
          </span>
        </div>
      </div>

      <div className="max-h-[300px] overflow-y-auto">
        <SchemaDisplay schema={schema!} />
      </div>
    </div>
  )
}

