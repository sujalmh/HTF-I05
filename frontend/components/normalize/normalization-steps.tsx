"use client"

import { useState } from "react"
import { ChevronDown, ChevronUp, Database, ArrowRight, Code } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"

interface NormalizationStep {
  id: string
  title: string
  description: string
  sql: string
  beforeData?: any[]
  afterData?: any[]
  beforeColumns?: { key: string; label: string }[]
  afterColumns?: { key: string; label: string }[]
}

interface NormalizationStepsProps {
  steps: NormalizationStep[]
}

export function NormalizationSteps({ steps }: NormalizationStepsProps) {
  const [openSteps, setOpenSteps] = useState<Record<string, boolean>>({})
  const [activeTab, setActiveTab] = useState<Record<string, "sql" | "data">>({})

  const toggleStep = (stepId: string) => {
    setOpenSteps((prev) => ({
      ...prev,
      [stepId]: !prev[stepId],
    }))
  }

  const setStepTab = (stepId: string, tab: "sql" | "data") => {
    setActiveTab((prev) => ({
      ...prev,
      [stepId]: tab,
    }))
  }

  return (
    <div className="space-y-4">
      <div className="relative">
        {steps.map((step, index) => (
          <div key={step.id} className="mb-4">
            <Collapsible
              open={openSteps[step.id]}
              onOpenChange={() => toggleStep(step.id)}
              className="border rounded-lg overflow-hidden"
            >
              <CollapsibleTrigger asChild>
                <Button variant="ghost" className="w-full flex items-start justify-between p-4 text-left">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-600 dark:text-blue-400">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium dark:text-white">{step.title}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{step.description}</p>
                    </div>
                  </div>
                  <div className="text-gray-400">
                    {openSteps[step.id] ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </div>
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="px-4 pb-4 pt-0 space-y-4">
                  <div className="flex space-x-2">
                    <Button
                      variant={activeTab[step.id] !== "data" ? "secondary" : "outline"}
                      size="sm"
                      onClick={() => setStepTab(step.id, "sql")}
                      className="gap-2"
                    >
                      <Code className="h-4 w-4" />
                      SQL Query
                    </Button>
                    <Button
                      variant={activeTab[step.id] === "data" ? "secondary" : "outline"}
                      size="sm"
                      onClick={() => setStepTab(step.id, "data")}
                      className="gap-2"
                    >
                      <Database className="h-4 w-4" />
                      Data Transformation
                    </Button>
                  </div>

                  {activeTab[step.id] !== "data" ? (
                    <div className="bg-gray-900 text-white p-4 rounded-lg font-mono text-sm overflow-x-auto">
                      <pre className="whitespace-pre-wrap">{step.sql}</pre>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {step.beforeData && step.afterData && step.beforeColumns && step.afterColumns && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <h4 className="text-sm font-medium dark:text-white">Before</h4>
                            <div className="border rounded-md overflow-hidden dark:border-gray-700">
                              <Table>
                                <TableHeader>
                                  <TableRow>
                                    {step.beforeColumns.map((column) => (
                                      <TableHead key={column.key}>{column.label}</TableHead>
                                    ))}
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {step.beforeData.slice(0, 5).map((row, rowIndex) => (
                                    <TableRow key={rowIndex}>
                                      {step.beforeColumns!.map((column) => (
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

                          <div className="space-y-2">
                            <div className="flex items-center">
                              <ArrowRight className="h-5 w-5 text-blue-500 mx-auto md:mx-0" />
                              <h4 className="text-sm font-medium ml-2 dark:text-white">After</h4>
                            </div>
                            <div className="border rounded-md overflow-hidden dark:border-gray-700">
                              <Table>
                                <TableHeader>
                                  <TableRow>
                                    {step.afterColumns.map((column) => (
                                      <TableHead key={column.key}>{column.label}</TableHead>
                                    ))}
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {step.afterData.slice(0, 5).map((row, rowIndex) => (
                                    <TableRow key={rowIndex}>
                                      {step.afterColumns!.map((column) => (
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
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </CollapsibleContent>
            </Collapsible>
            {index < steps.length - 1 && (
              <div className="absolute left-4 top-0 ml-4 h-full">
                <div className="h-full w-0.5 bg-gray-200 dark:bg-gray-700"></div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
