"use client"

import { Database, Table2, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { SchemaDisplay } from "@/components/upload/schema-display"
import { useDatabase } from "@/contexts/database-context"

interface DatabaseInfoPanelProps {
  onUploadClick: () => void
  disabled?: boolean
}

export function DatabaseInfoPanel({ onUploadClick, disabled }: DatabaseInfoPanelProps) {
  const { schema, data, isLoaded, clearDatabase } = useDatabase()

  if (!isLoaded) {
    return (
      <div className="border rounded-lg p-6 bg-gray-50 text-center">
        <Database className="h-12 w-12 text-gray-400 mx-auto mb-3" />
        <h3 className="text-lg font-medium mb-2">No Database Loaded</h3>
        <p className="text-sm text-gray-500 mb-4">Upload a database file to start querying with natural language</p>
        <Button onClick={onUploadClick} disabled={disabled}>Upload Database</Button>
      </div>
    )
  }

  return (
    <div className="border rounded-lg p-4 bg-white">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <Database className="h-5 w-5 text-blue-600" />
          <h3 className="text-lg font-medium">Database Loaded</h3>
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
          <Table2 className="h-4 w-4 text-gray-500" />
          <span>
            Table: <strong>{schema?.tableName}</strong>
          </span>
        </div>
        <div className="flex items-center gap-1">
          <FileText className="h-4 w-4 text-gray-500" />
          <span>
            Rows: <strong>{data?.length}</strong>
          </span>
        </div>
      </div>

      <div className="max-h-[300px] overflow-y-auto">
        <SchemaDisplay schema={schema!} />
      </div>
    </div>
  )
}

