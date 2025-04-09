"use client"

import { useState, useEffect } from "react"
import { ChevronLeft, ChevronRight, Database, Search } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"

interface DataPreviewProps {
  data: Record<string, any>
  schema: Record<string, Array<{ name: string; type: string; nullable: boolean }>>
}

export function DataPreview({ data, schema }: DataPreviewProps) {
  console.log(schema)

  if (!data || Object.keys(data).length === 0) {
    return <div className="text-gray-500 text-center py-4">No data available</div>
  }

  const tableNames = Object.keys(data)
  const [selectedTable, setSelectedTable] = useState(tableNames[0] || "")
  const [currentPage, setCurrentPage] = useState(1)
  const [searchTerm, setSearchTerm] = useState("")
  const [sortColumn, setSortColumn] = useState<string | null>(null)
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc")

  useEffect(() => {
    setCurrentPage(1)
    setSearchTerm("")
    setSortColumn(null)
  }, [selectedTable])

  if (!selectedTable) {
    return <div className="text-gray-500 text-center py-4">No tables available</div>
  }

  const tableData = Array.isArray(data[selectedTable]) ? data[selectedTable] : []
  const columns = tableData.length > 0 ? Object.keys(tableData[0]) : []

  const filteredData = tableData.filter((row) => {
    return !searchTerm || Object.values(row).some((value) => String(value).toLowerCase().includes(searchTerm.toLowerCase()))
  })

  const sortedData = [...filteredData].sort((a, b) => {
    if (!sortColumn) return 0
    const aValue = a[sortColumn]
    const bValue = b[sortColumn]
    if (aValue === bValue) return 0
    return sortDirection === "asc" ? String(aValue).localeCompare(String(bValue)) : String(bValue).localeCompare(String(aValue))
  })

  const rowsPerPage = 10
  const totalPages = Math.ceil(sortedData.length / rowsPerPage)
  const paginatedData = sortedData.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage)

  return (
    <div className="border rounded-lg p-4 bg-white">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Database className="h-5 w-5 text-blue-600" />
          <h3 className="text-lg font-medium">Data Preview: {selectedTable}</h3>
        </div>
        <select
          className="border rounded p-2"
          value={selectedTable}
          onChange={(e) => setSelectedTable(e.target.value)}
        >
          {tableNames.map((table) => (
            <option key={table} value={table}>{table}</option>
          ))}
        </select>
      </div>

      <div className="relative mb-4">
        <Input
          type="text"
          placeholder="Search data..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value)
            setCurrentPage(1)
          }}
          className="pl-9"
        />
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
      </div>

      <ScrollArea className="max-h-[400px] overflow-auto border rounded-md">
        <Table>
          <TableHeader className="sticky top-0 bg-white z-10">
            <TableRow>
              {columns.map((column) => (
                <TableHead
                  key={column}
                  className="cursor-pointer hover:bg-gray-50"
                  onClick={() => {
                    setSortColumn(column)
                    setSortDirection(sortColumn === column && sortDirection === "asc" ? "desc" : "asc")
                  }}
                >
                  {column} {sortColumn === column ? (sortDirection === "asc" ? "▲" : "▼") : ""}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedData.length > 0 ? (
              paginatedData.map((row, index) => (
                <TableRow key={index}>
                  {columns.map((column) => (
                    <TableCell key={column}>{row[column] ?? <span className="text-gray-400">null</span>}</TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="text-center py-8 text-gray-500">
                  No matching data found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </ScrollArea>

      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <div className="text-sm text-gray-500">Page {currentPage} of {totalPages}</div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setCurrentPage(currentPage - 1)} disabled={currentPage === 1}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={() => setCurrentPage(currentPage + 1)} disabled={currentPage === totalPages}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
