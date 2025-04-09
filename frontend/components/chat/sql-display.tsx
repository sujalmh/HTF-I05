interface SqlDisplayProps {
  query: string
}

export function SqlDisplay({ query }: SqlDisplayProps) {
  return (
    <div className="bg-gray-900 text-white p-4 rounded-lg font-mono text-sm overflow-x-auto">
      <pre className="whitespace-pre-wrap">{query}</pre>
    </div>
  )
}

