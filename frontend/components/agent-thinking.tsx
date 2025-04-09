import { CheckCircle2, Circle, Clock, Loader2 } from "lucide-react"

export interface AgentStep {
  id: string
  description: string
  status: "thinking" | "done" | "error"
  output?: string
}

interface AgentThinkingProps {
  steps: AgentStep[]
  currentStep: number
}

export function AgentThinking({ steps, currentStep }: AgentThinkingProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-sm font-medium dark:text-gray-200">AI Planning Process</h3>
      <ol className="space-y-4">
        {steps.map((step, index) => (
          <li key={step.id} className="relative">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 mt-1">
                {step.status === "thinking" ? (
                  <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />
                ) : step.status === "done" ? (
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                ) : step.status === "error" ? (
                  <Circle className="h-5 w-5 text-red-500" />
                ) : (
                  <Clock className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                )}
              </div>
              <div className="flex-1">
                <p
                  className={`text-sm ${step.status === "thinking" ? "text-blue-700 dark:text-blue-400 font-medium" : "text-gray-700 dark:text-gray-300"}`}
                >
                  {step.description}
                </p>
                {step.output && (
                  <div className="mt-2 text-xs bg-gray-50 dark:bg-gray-800 p-2 rounded border dark:border-gray-700 text-gray-600 dark:text-gray-400 font-mono whitespace-pre-wrap">
                    {step.output}
                  </div>
                )}
              </div>
            </div>
            {index < steps.length - 1 && (
              <div className="absolute left-2.5 top-6 bottom-0 w-px bg-gray-200 dark:bg-gray-700 h-[calc(100%-16px)]"></div>
            )}
          </li>
        ))}
      </ol>
    </div>
  )
}

