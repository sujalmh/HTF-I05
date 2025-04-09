"use client"

import { useState } from "react"
import { CheckCircle2, Circle, Loader2, AlertCircle, ChevronDown, ChevronUp, Eye, RefreshCw, Clock } from "lucide-react"
import type { ReportStep } from "./report-generator"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface AgentStepVisualizerProps {
  steps: ReportStep[]
}

export function AgentStepVisualizer({ steps }: AgentStepVisualizerProps) {
  const [openSteps, setOpenSteps] = useState<Record<string, boolean>>({})
  const [viewMode, setViewMode] = useState<"detailed" | "compact">("detailed")
  const [autoExpand, setAutoExpand] = useState(true)

  const toggleStep = (stepId: string) => {
    setOpenSteps((prev) => ({
      ...prev,
      [stepId]: !prev[stepId],
    }))
  }

  const expandAll = () => {
    const allExpanded: Record<string, boolean> = {}
    steps.forEach((step) => {
      allExpanded[step.id] = true
    })
    setOpenSteps(allExpanded)
  }

  const collapseAll = () => {
    setOpenSteps({})
  }

  const getStepIcon = (status: ReportStep["status"]) => {
    switch (status) {
      case "completed":
        return <CheckCircle2 className="h-5 w-5 text-green-500" />
      case "processing":
        return <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />
      case "error":
        return <AlertCircle className="h-5 w-5 text-red-500" />
      case "pending":
        return <Clock className="h-5 w-5 text-gray-300" />
      default:
        return <Circle className="h-5 w-5 text-gray-300" />
    }
  }

  // Auto-expand the currently processing step
  if (autoExpand) {
    const processingStep = steps.find((step) => step.status === "processing")
    if (processingStep && !openSteps[processingStep.id]) {
      toggleStep(processingStep.id)
    }
  }

  const completedSteps = steps.filter((step) => step.status === "completed").length
  const totalProgress = steps.length > 0 ? (completedSteps / steps.length) * 100 : 0

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center space-x-2">
          <Progress value={totalProgress} className="w-32 h-2" />
          <span className="text-sm text-gray-500">{Math.round(totalProgress)}% Complete</span>
        </div>

        <div className="flex items-center space-x-2">
          <Select value={viewMode} onValueChange={(value) => setViewMode(value as "detailed" | "compact")}>
            <SelectTrigger className="h-8 w-[130px]">
              <SelectValue placeholder="View mode" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="detailed">Detailed View</SelectItem>
              <SelectItem value="compact">Compact View</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="outline" size="sm" onClick={expandAll}>
            <ChevronDown className="h-3 w-3 mr-1" />
            Expand All
          </Button>

          <Button variant="outline" size="sm" onClick={collapseAll}>
            <ChevronUp className="h-3 w-3 mr-1" />
            Collapse All
          </Button>
        </div>
      </div>

      {viewMode === "compact" ? (
        <div className="space-y-2">
          {steps.map((step) => (
            <div
              key={step.id}
              className={`flex items-center p-2 rounded-md ${
                step.status === "processing"
                  ? "bg-blue-50 dark:bg-blue-900/20"
                  : step.status === "completed"
                    ? "bg-green-50 dark:bg-green-900/20"
                    : step.status === "error"
                      ? "bg-red-50 dark:bg-red-900/20"
                      : "bg-gray-50 dark:bg-gray-800"
              }`}
            >
              <div className="mr-3">{getStepIcon(step.status)}</div>
              <div className="flex-1">
                <p className="font-medium text-sm">{step.description}</p>
              </div>
              {(step.sql || step.result) && (
                <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => toggleStep(step.id)}>
                  <Eye className="h-3 w-3" />
                </Button>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {steps.map((step, index) => (
            <Collapsible
              key={step.id}
              open={openSteps[step.id]}
              onOpenChange={() => toggleStep(step.id)}
              className={`border rounded-md overflow-hidden ${
                step.status === "processing"
                  ? "border-blue-200 dark:border-blue-800"
                  : step.status === "completed"
                    ? "border-green-200 dark:border-green-800"
                    : step.status === "error"
                      ? "border-red-200 dark:border-red-800"
                      : ""
              }`}
            >
              <CollapsibleTrigger asChild>
                <Button
                  variant="ghost"
                  className={`w-full flex items-start justify-between p-4 text-left ${
                    step.status === "processing"
                      ? "bg-blue-50 dark:bg-blue-900/20"
                      : step.status === "completed"
                        ? "bg-green-50 dark:bg-green-900/20"
                        : step.status === "error"
                          ? "bg-red-50 dark:bg-red-900/20"
                          : ""
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5">{getStepIcon(step.status)}</div>
                    <div>
                      <p className="font-medium">{step.description}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {step.status === "completed"
                          ? "Completed"
                          : step.status === "processing"
                            ? "Processing..."
                            : step.status === "error"
                              ? "Error"
                              : "Pending"}
                      </p>
                    </div>
                  </div>
                  <div className="text-gray-400">
                    {openSteps[step.id] ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </div>
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="px-4 pb-4 pt-0 space-y-4">
                  {step.sql && (
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <p className="text-xs font-medium">SQL Query:</p>
                        <Button variant="ghost" size="sm" className="h-6 text-xs">
                          <RefreshCw className="h-3 w-3 mr-1" />
                          Re-run Query
                        </Button>
                      </div>
                      <pre className="text-xs bg-gray-50 dark:bg-gray-800 p-3 rounded-md overflow-x-auto">
                        {step.sql}
                      </pre>
                    </div>
                  )}

                  {step.result && step.columns && (
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <p className="text-xs font-medium">Query Result:</p>
                        <div className="text-xs text-gray-500">{step.result.length} rows returned</div>
                      </div>
                      <div className="border rounded-md overflow-hidden">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              {step.columns.map((column) => (
                                <TableHead key={column.key}>{column.label}</TableHead>
                              ))}
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {step.result.map((row, rowIndex) => (
                              <TableRow key={rowIndex}>
                                {step.columns!.map((column) => (
                                  <TableCell key={column.key}>
                                    {row[column.key] !== undefined ? String(row[column.key]) : ""}
                                  </TableCell>
                                ))}
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </div>
                  )}

                  <div className="flex justify-end">
                    <Button variant="ghost" size="sm" className="text-xs">
                      <Eye className="h-3 w-3 mr-1" />
                      View in Report
                    </Button>
                  </div>
                </div>
              </CollapsibleContent>
            </Collapsible>
          ))}
        </div>
      )}
    </div>
  )
}

