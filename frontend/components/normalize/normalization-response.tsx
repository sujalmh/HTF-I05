"use client"

import { useState } from "react"
import { ChevronDown, ChevronUp, Copy } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"

interface NormalizationResponseProps {
  response: {
    summary: string
    details: string
    recommendations: string[]
  }
}

export function NormalizationResponse({ response }: NormalizationResponseProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const { toast } = useToast()

  const handleCopy = () => {
    const text = `
Summary: ${response.summary}

Details: ${response.details}

Recommendations:
${response.recommendations.map((rec) => `- ${rec}`).join("\n")}
    `.trim()

    navigator.clipboard.writeText(text)
    toast({
      title: "Copied to clipboard",
      description: "The AI response has been copied to your clipboard.",
    })
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-start">
        <div className="space-y-2">
          <h3 className="font-medium dark:text-white">Summary</h3>
          <p className="text-gray-700 dark:text-gray-300">{response.summary}</p>
        </div>
        <Button variant="outline" size="sm" onClick={handleCopy}>
          <Copy className="h-4 w-4 mr-2" />
          Copy
        </Button>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <h3 className="font-medium dark:text-white">Details</h3>
          <Button variant="ghost" size="sm" onClick={() => setIsExpanded(!isExpanded)}>
            {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            {isExpanded ? "Show Less" : "Show More"}
          </Button>
        </div>
        <div
          className={`text-gray-700 dark:text-gray-300 overflow-hidden transition-all duration-300 ${
            isExpanded ? "max-h-[1000px]" : "max-h-[100px]"
          }`}
        >
          <p>{response.details}</p>
        </div>
      </div>

      <div className="space-y-2">
        <h3 className="font-medium dark:text-white">Recommendations</h3>
        <ul className="list-disc list-inside space-y-1">
          {response.recommendations.map((recommendation, index) => (
            <li key={index} className="text-gray-700 dark:text-gray-300">
              {recommendation}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
