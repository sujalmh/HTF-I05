import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Database } from "lucide-react"

interface SchemaDisplayProps {
  schema?: Record<string, Array<{ name: string; type: string; nullable: boolean }>>
}

export function SchemaDisplay({ schema = {} }: SchemaDisplayProps) {
  const tables = Object.entries(schema).map(([tableName, columns]) => ({
    tableName,
    columns,
  }))

  if (tables.length === 0) {
    return <p className="text-center text-gray-500">No schema data available.</p>
  }

  return (
    <div className="space-y-6">
      {tables.map((table) => (
        <div key={table.tableName} className="border rounded-lg p-4 bg-white">
          <div className="flex items-center gap-2 mb-4">
            <Database className="h-5 w-5 text-blue-600" />
            <h3 className="text-lg font-medium">Table: {table.tableName}</h3>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Column Name</TableHead>
                <TableHead>Data Type</TableHead>
                <TableHead>Constraints</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {table.columns.map((column) => (
                <TableRow key={column.name}>
                  <TableCell className="font-medium">{column.name}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="bg-blue-50 text-blue-700 hover:bg-blue-50">
                      {column.type}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {!column.nullable && (
                      <Badge variant="outline" className="bg-amber-50 text-amber-700 hover:bg-amber-50">
                        NOT NULL
                      </Badge>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ))}
    </div>
  )
}
