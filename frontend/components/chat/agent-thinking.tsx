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
      <h3 className="text-sm font-medium">AI Planning Process</h3>
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
                  <Clock className="h-5 w-5 text-gray-400" />
                )}
              </div>
              <div className="flex-1">
                <p className={`text-sm ${step.status === "thinking" ? "text-blue-700 font-medium" : "text-gray-700"}`}>
                  {step.description}
                </p>
                {step.output && (
                  <div className="mt-2 text-xs bg-gray-50 p-2 rounded border text-gray-600 font-mono whitespace-pre-wrap">
                    {step.output}
                  </div>
                )}
              </div>
            </div>
            {index < steps.length - 1 && (
              <div className="absolute left-2.5 top-6 bottom-0 w-px bg-gray-200 h-[calc(100%-16px)]"></div>
            )}
          </li>
        ))}
      </ol>
    </div>
  )
}

