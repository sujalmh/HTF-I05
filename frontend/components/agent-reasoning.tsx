"use client"

import { useState } from "react"
import { type AgentStep, AgentThinking } from "./agent-thinking"
import { SqlDisplay } from "./sql-display"
import { DataTable } from "./data-table"
import { DataVisualization } from "./data-visualization"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Button } from "@/components/ui/button"
import { Brain, Database, LineChart, Table2 } from "lucide-react"
import ReactMarkdown from "react-markdown"

export interface AgentReasoning {
  steps: AgentStep[]
  currentStep: number
  sqlQuery: string
  explanation: string
  tableData: any[]
  tableColumns: { key: string; label: string }[]
  visualization: string
}

interface AgentReasoningProps {
  reasoning: AgentReasoning
}

export function AgentReasoning({ reasoning }: AgentReasoningProps) {
  const [isThinkingOpen, setIsThinkingOpen] = useState(true)

  return (
    <div className="space-y-4">
      <Collapsible open={isThinkingOpen} onOpenChange={setIsThinkingOpen} className="w-full">
        <div className="flex items-center justify-between mb-2">
          <CollapsibleTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2">
              <Brain className="h-4 w-4" />
              AI Reasoning Process
              <span className="ml-1 text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-300 px-1.5 py-0.5 rounded-full">
                {reasoning.currentStep}/{reasoning.steps.length}
              </span>
            </Button>
          </CollapsibleTrigger>
        </div>
        <CollapsibleContent>
          <Card>
            <CardContent className="pt-4">
              <AgentThinking steps={reasoning.steps} currentStep={reasoning.currentStep} />
            </CardContent>
          </Card>
        </CollapsibleContent>
      </Collapsible>

      <Tabs defaultValue="explanation" className="w-full">
        <TabsList className="grid grid-cols-4 mb-4">
          <TabsTrigger value="explanation" className="flex items-center gap-2">
            <Database className="h-4 w-4" />
            <span className="hidden sm:inline">Explanation</span>
          </TabsTrigger>
          <TabsTrigger value="query" className="flex items-center gap-2">
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M4 18V14M4 14V10M4 14H12M12 14V10M12 14V18M20 14V10M20 14V18M20 14H12"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span className="hidden sm:inline">SQL Query</span>
          </TabsTrigger>
          <TabsTrigger value="results" className="flex items-center gap-2">
            <Table2 className="h-4 w-4" />
            <span className="hidden sm:inline">Results</span>
          </TabsTrigger>
          <TabsTrigger value="visualization" className="flex items-center gap-2">
            <LineChart className="h-4 w-4" />
            <span className="hidden sm:inline">Visualization</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent
          value="explanation"
          className="bg-white dark:bg-gray-800 p-4 rounded-lg border dark:border-gray-700"
        >
          <h3 className="font-medium mb-2 dark:text-white">Explanation</h3>
          <p className="prose text-gray-700 dark:text-gray-300"><ReactMarkdown>{reasoning.explanation}</ReactMarkdown></p>
        </TabsContent>

        <TabsContent value="query">
          <SqlDisplay query={reasoning.sqlQuery} />
        </TabsContent>

        <TabsContent value="results" className="bg-white dark:bg-gray-800 p-4 rounded-lg border dark:border-gray-700">
          <div className="overflow-auto max-h-[400px] max-w-full">
            <DataTable data={reasoning.tableData} columns={reasoning.tableColumns} />
          </div>
        </TabsContent>

        <TabsContent
          value="visualization"
          className="bg-white dark:bg-gray-800 p-4 rounded-lg border dark:border-gray-700"
        >
          {reasoning.visualization ? (
            <img
              src={reasoning.visualization}
              alt="Generated Visualization"
              className="w-full h-auto rounded-lg shadow"
            />
          ) : (
            <p className="text-gray-500 italic">No visualization available.</p>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

