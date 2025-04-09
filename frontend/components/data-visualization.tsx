"use client"

import { useEffect, useRef, useState } from "react"
import { BarChart, LineChart, PieChart, ScatterChart } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card } from "@/components/ui/card"

interface DataVisualizationProps {
  data: any[]
  type: "bar" | "line" | "pie" | "scatter" | "none"
}

export function DataVisualization({ data, type }: DataVisualizationProps) {
  const [selectedColumns, setSelectedColumns] = useState<{ x: string; y: string }>({ x: "", y: "" })
  const [availableColumns, setAvailableColumns] = useState<string[]>([])
  const chartRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (data && data.length > 0) {
      // Get all columns from the first data item
      const columns = Object.keys(data[0])
      setAvailableColumns(columns)

      // Set default columns (prefer numeric columns for y-axis)
      const numericColumns = columns.filter((col) => typeof data[0][col] === "number" || !isNaN(Number(data[0][col])))

      const defaultY = numericColumns.length > 0 ? numericColumns[0] : columns[0]
      const defaultX = columns.find((col) => col !== defaultY) || columns[0]

      setSelectedColumns({ x: defaultX, y: defaultY })
    }
  }, [data])

  // In a real implementation, this would use a charting library like Chart.js, Recharts, etc.
  // For this example, we'll show a placeholder with improved UI

  const renderChart = () => {
    if (!data || data.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center h-64">
          <p className="text-gray-500 dark:text-gray-400">No data available for visualization</p>
        </div>
      )
    }

    // Get icon based on chart type
    const getIcon = () => {
      switch (type) {
        case "bar":
          return <BarChart className="h-40 w-40 text-blue-500" />
        case "line":
          return <LineChart className="h-40 w-40 text-green-500" />
        case "pie":
          return <PieChart className="h-40 w-40 text-purple-500" />
        case "scatter":
          return <ScatterChart className="h-40 w-40 text-orange-500" />
        default:
          return <BarChart className="h-40 w-40 text-blue-500" />
      }
    }

    return (
      <div className="flex flex-col items-center justify-center h-64">
        {getIcon()}
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-4">
          {type.charAt(0).toUpperCase() + type.slice(1)} chart visualization of {selectedColumns.x} vs{" "}
          {selectedColumns.y}
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="w-full sm:w-1/2">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">X-Axis</label>
          <Select
            value={selectedColumns.x}
            onValueChange={(value) => setSelectedColumns((prev) => ({ ...prev, x: value }))}
            disabled={availableColumns.length === 0}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select column" />
            </SelectTrigger>
            <SelectContent>
              {availableColumns.map((column) => (
                <SelectItem key={column} value={column}>
                  {column}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="w-full sm:w-1/2">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">Y-Axis</label>
          <Select
            value={selectedColumns.y}
            onValueChange={(value) => setSelectedColumns((prev) => ({ ...prev, y: value }))}
            disabled={availableColumns.length === 0}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select column" />
            </SelectTrigger>
            <SelectContent>
              {availableColumns.map((column) => (
                <SelectItem key={column} value={column}>
                  {column}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Card className="p-4 dark:bg-gray-800 dark:border-gray-700">
        <div ref={chartRef} className="w-full">
          {renderChart()}
        </div>
      </Card>

      <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
        Note: In a production environment, this would render an interactive chart using a library like Recharts or
        Chart.js
      </p>
    </div>
  )
}

