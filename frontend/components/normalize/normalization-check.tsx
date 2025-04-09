"use client"

import { CheckCircle, AlertCircle, HelpCircle } from "lucide-react"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import ReactMarkdown from "react-markdown"

interface NormalForms {
  firstNF: boolean
  secondNF: boolean
  thirdNF: boolean
}

interface NormalizationResult {
  normalForms: NormalForms
  normalizationSQL: string
}

interface NormalizationCheckProps {
  normalizationResult: NormalizationResult
}

export function NormalizationCheck({ normalizationResult }: NormalizationCheckProps) {
  const { normalForms, normalizationSQL } = normalizationResult

  const getNormalFormDescription = (form: string) => {
    switch (form) {
      case "firstNF":
        return "First Normal Form (1NF): Each cell contains a single, atomic value."
      case "secondNF":
        return "Second Normal Form (2NF): All non-key attributes are fully dependent on the primary key."
      case "thirdNF":
        return "Third Normal Form (3NF): There are no transitive dependencies."
      default:
        return ""
    }
  }

  const renderNormalFormCard = (label: string, achieved: boolean, tooltipKey: string) => (
    <div className="p-4 rounded-lg border bg-green-50 border-green-200">
      <div className="flex items-center justify-between">
        <h3 className="font-medium">{label}</h3>
        <Tooltip>
          <TooltipTrigger>
            <HelpCircle className="h-4 w-4 text-gray-400" />
          </TooltipTrigger>
          <TooltipContent>
            <p className="max-w-xs">{getNormalFormDescription(tooltipKey)}</p>
          </TooltipContent>
        </Tooltip>
      </div>
      <div className="flex items-center mt-2">
        {achieved ? (
          <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
        ) : (
          <AlertCircle className="h-5 w-5 text-gray-400 mr-2" />
        )}
        <span>{achieved ? "Achieved" : "Not Achieved"}</span>
      </div>
    </div>
  )

  return (
    <div className="space-y-6">
      {/* Display Normal Forms Result Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <TooltipProvider>
          {renderNormalFormCard("1NF", normalForms.firstNF, "firstNF")}
          {renderNormalFormCard("2NF", normalForms.secondNF, "secondNF")}
          {renderNormalFormCard("3NF", normalForms.thirdNF, "thirdNF")}
        </TooltipProvider>
      </div>

      {/* Display the API Output String */}
      <div>
        <h3 className="prose font-medium mb-2">Normalization Steps with Queries</h3>
        <pre className="p-4 rounded-lg text-sm overflow-auto">
            <ReactMarkdown>{normalizationSQL}</ReactMarkdown>
          
        </pre>
      </div>
    </div>
  )
}
