"use client"

import { useState } from "react"
import { ChevronLeft, ChevronRight, Database, Search } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"

interface DataPreviewProps {
  data: any[]
  schema: {
    tableName: string
    columns: Array<{
      name: string
      type: string
      nullable: boolean
    }>
  }
}

export function DataPreview({ data, schema }: DataPreviewProps) {
  const [currentPage, setCurrentPage] = useState(1)
  const [searchTerm, setSearchTerm] = useState("")
  const [sortColumn, setSortColumn] = useState<string | null>(null)
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc")

  const rowsPerPage = 10

  // Filter data based on search term
  const filteredData = data.filter((row) => {
    if (!searchTerm) return true

    return Object.values(row).some((value) => String(value).toLowerCase().includes(searchTerm.toLowerCase()))
  })

  // Sort data if a sort column is selected
  const sortedData = [...filteredData].sort((a, b) => {
    if (!sortColumn) return 0

    const aValue = a[sortColumn]
    const bValue = b[sortColumn]

    if (aValue === bValue) return 0

    // Handle different data types
    if (typeof aValue === "number" && typeof bValue === "number") {
      return sortDirection === "asc" ? aValue - bValue : bValue - aValue
    }

    // Default string comparison
    const aString = String(aValue || "")
    const bString = String(bValue || "")

    return sortDirection === "asc" ? aString.localeCompare(bString) : bString.localeCompare(aString)
  })

  // Paginate data
  const totalPages = Math.ceil(sortedData.length / rowsPerPage)
  const paginatedData = sortedData.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage)

  const handleSort = (columnName: string) => {
    if (sortColumn === columnName) {
      // Toggle direction if same column
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      // New column, default to ascending
      setSortColumn(columnName)
      setSortDirection("asc")
    }
  }

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1)
    }
  }

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1)
    }
  }

  return (
    <div className="border rounded-lg p-4 bg-white">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Database className="h-5 w-5 text-blue-600" />
          <h3 className="text-lg font-medium">Data Preview: {schema.tableName}</h3>
        </div>
        <div className="text-sm text-gray-500">{data.length} total rows</div>
      </div>

      <div className="relative mb-4">
        <Input
          type="text"
          placeholder="Search data..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value)
            setCurrentPage(1) // Reset to first page on search
          }}
          className="pl-9"
        />
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
      </div>

      <ScrollArea className="h-[400px] border rounded-md">
        <Table>
          <TableHeader className="sticky top-0 bg-white z-10">
            <TableRow>
              {schema.columns.map((column) => (
                <TableHead
                  key={column.name}
                  className="cursor-pointer hover:bg-gray-50"
                  onClick={() => handleSort(column.name)}
                >
                  <div className="flex items-center gap-1">
                    {column.name}
                    {sortColumn === column.name && (
                      <span className="text-xs">{sortDirection === "asc" ? "▲" : "▼"}</span>
                    )}
                  </div>
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedData.length > 0 ? (
              paginatedData.map((row, rowIndex) => (
                <TableRow key={rowIndex}>
                  {schema.columns.map((column) => (
                    <TableCell key={column.name}>
                      {row[column.name] !== null && row[column.name] !== undefined ? (
                        String(row[column.name])
                      ) : (
                        <span className="text-gray-400">null</span>
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={schema.columns.length} className="text-center py-8 text-gray-500">
                  {searchTerm ? "No matching data found" : "No data available"}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </ScrollArea>

      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <div className="text-sm text-gray-500">
            Page {currentPage} of {totalPages}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handlePrevPage} disabled={currentPage === 1}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={handleNextPage} disabled={currentPage === totalPages}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

