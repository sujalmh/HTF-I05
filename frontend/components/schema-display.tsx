import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Database } from "lucide-react"

interface SchemaDisplayProps {
  schema: {
    tableName: string
    columns: Array<{
      name: string
      type: string
      nullable: boolean
    }>
  }
}

export function SchemaDisplay({ schema }: SchemaDisplayProps) {
  return (
    <div className="border rounded-lg p-4 bg-white dark:bg-gray-800 dark:border-gray-700">
      <div className="flex items-center gap-2 mb-4">
        <Database className="h-5 w-5 text-blue-600 dark:text-blue-400" />
        <h3 className="text-lg font-medium dark:text-white">Table: {schema.tableName}</h3>
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
          {schema.columns.map((column) => (
            <TableRow key={column.name}>
              <TableCell className="font-medium dark:text-white">{column.name}</TableCell>
              <TableCell>
                <Badge
                  variant="outline"
                  className="bg-blue-50 text-blue-700 hover:bg-blue-50 dark:bg-blue-900 dark:text-blue-300 dark:hover:bg-blue-900"
                >
                  {column.type}
                </Badge>
              </TableCell>
              <TableCell>
                {!column.nullable && (
                  <Badge
                    variant="outline"
                    className="bg-amber-50 text-amber-700 hover:bg-amber-50 dark:bg-amber-900 dark:text-amber-300 dark:hover:bg-amber-900"
                  >
                    NOT NULL
                  </Badge>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

