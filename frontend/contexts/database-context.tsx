"use client"

import { createContext, useContext, useState, type ReactNode } from "react"

interface DatabaseSchema {
  schema?: Record<string, Array<{ name: string; type: string; nullable: boolean }>>
}

interface DatabaseContextType {
  schema: DatabaseSchema | null
  data: any[] | null
  isLoaded: boolean
  setDatabaseInfo: (schema: DatabaseSchema, data: any[]) => void
  clearDatabase: () => void
}

const DatabaseContext = createContext<DatabaseContextType | undefined>(undefined)

export function DatabaseProvider({ children }: { children: ReactNode }) {
  const [schema, setSchema] = useState<DatabaseSchema | null>(null)
  const [data, setData] = useState<any[] | null>(null)
  const [isLoaded, setIsLoaded] = useState(false)

  const setDatabaseInfo = (schema: DatabaseSchema, data: any[]) => {
    setSchema(schema)
    setData(data)
    setIsLoaded(true)
  }

  const clearDatabase = () => {
    setSchema(null)
    setData(null)
    setIsLoaded(false)
  }

  return (
    <DatabaseContext.Provider value={{ schema, data, isLoaded, setDatabaseInfo, clearDatabase }}>
      {children}
    </DatabaseContext.Provider>
  )
}

export function useDatabase() {
  const context = useContext(DatabaseContext)
  if (context === undefined) {
    throw new Error("useDatabase must be used within a DatabaseProvider")
  }
  return context
}

