// Import JSON data statically
import economicIndicatorsData from "./data/economic-indicators"
import chatsData from "./data/chats"
import datasetsData from "./data/datasets"
import userData from "./data/user"
import type { AgentStep } from "@/components/chat/agent-thinking"
import { v4 as uuidv4 } from "uuid"

// Add artificial delay to simulate network request
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

// Generic fetch function with artificial delay
async function fetchData<T>(dataSource: T, delayMs = 800): Promise<T> {
  await delay(delayMs)
  return dataSource
}

// Specific API functions
export async function getEconomicIndicators() {
  return fetchData(economicIndicatorsData)
}

export async function getChats() {
  const data = await fetchData<{ chats: any[] }>(chatsData)
  return data.chats
}

export async function getDatasets() {
  return fetchData(datasetsData)
}

export async function getUserProfile() {
  return fetchData(userData)
}

// Function to simulate a chat response with agentic reasoning
export async function simulateChatResponse(query: string, schema?: any, data?: any[]) {
  // Initial delay to simulate AI processing
  await delay(500)

  // Create initial agent steps
  const agentSteps: AgentStep[] = [
    {
      id: uuidv4(),
      description: "Analyzing the natural language query",
      status: "thinking",
    },
    {
      id: uuidv4(),
      description: "Identifying relevant database tables and columns",
      status: "thinking",
    },
    {
      id: uuidv4(),
      description: "Formulating SQL query",
      status: "thinking",
    },
    {
      id: uuidv4(),
      description: "Executing query against database",
      status: "thinking",
    },
    {
      id: uuidv4(),
      description: "Processing results and generating visualization",
      status: "thinking",
    },
  ]

  // Use the imported data directly
  const economicData = economicIndicatorsData

  // Simulate step-by-step agent reasoning with delays
  const simulateAgentReasoning = async () => {
    // Step 1: Analyzing query
    await delay(800)
    agentSteps[0].status = "done"
    agentSteps[0].output = `Query: "${query}"\nIdentified intent: Data retrieval and analysis`

    // Step 2: Identifying tables and columns
    await delay(1000)
    agentSteps[1].status = "done"

    if (schema && data) {
      agentSteps[1].output = `Found table: ${schema.tableName}\nColumns: ${schema.columns.map((c) => c.name).join(", ")}`
    } else {
      agentSteps[1].output = "Using economic indicators database\nRelevant tables: gdp, cpi, sectors"
    }

    // Step 3: Formulating SQL query
    await delay(1200)
    agentSteps[2].status = "done"

    let sqlQuery = ""
    let tableData: any[] = []
    let tableColumns: { key: string; label: string }[] = []
    let visualizationType: "bar" | "line" | "pie" | "scatter" | "none" = "none"
    let explanation = ""

    // Simple pattern matching for demo purposes
    // In a real app, this would be handled by an AI model
    if (query.toLowerCase().includes("gdp") && query.toLowerCase().includes("india")) {
      sqlQuery = `SELECT 
  year, 
  growth_rate 
FROM 
  economic_indicators 
WHERE 
  indicator_type = 'GDP' 
  AND country = 'India' 
  AND year BETWEEN 2020 AND 2024 
ORDER BY 
  year ASC;`

      agentSteps[2].output = sqlQuery

      // Step 4: Executing query
      await delay(1000)
      agentSteps[3].status = "done"

      tableData = economicData.gdp.india.annual
      tableColumns = [
        { key: "year", label: "Year" },
        { key: "value", label: "GDP (Trillion USD)" },
        { key: "growth_rate", label: "Growth Rate (%)" },
      ]

      agentSteps[3].output = `Query executed successfully\nReturned ${tableData.length} rows`

      // Step 5: Processing results
      await delay(800)
      agentSteps[4].status = "done"

      visualizationType = "bar"
      explanation =
        "I'm retrieving the GDP data for India over the recent years. This information comes from our economic indicators database where we can filter by indicator type and country."

      agentSteps[4].output = "Generated bar chart visualization\nPrepared natural language explanation"
    } else if (query.toLowerCase().includes("quarterly") && query.toLowerCase().includes("gdp")) {
      sqlQuery = `SELECT 
  year, 
  quarter,
  value,
  growth_rate 
FROM 
  quarterly_economic_indicators 
WHERE 
  indicator_type = 'GDP' 
  AND country = 'India' 
  AND year BETWEEN 2023 AND 2024 
ORDER BY 
  year ASC, 
  quarter ASC;`

      agentSteps[2].output = sqlQuery

      // Step 4: Executing query
      await delay(1000)
      agentSteps[3].status = "done"

      tableData = economicData.gdp.india.quarterly
      tableColumns = [
        { key: "year", label: "Year" },
        { key: "quarter", label: "Quarter" },
        { key: "value", label: "GDP (Trillion USD)" },
        { key: "growth_rate", label: "Growth Rate (%)" },
      ]

      agentSteps[3].output = `Query executed successfully\nReturned ${tableData.length} rows`

      // Step 5: Processing results
      await delay(800)
      agentSteps[4].status = "done"

      visualizationType = "line"
      explanation =
        "I'm showing the quarterly GDP data for India for the most recent years (2023-2024). This provides a more detailed view of economic performance throughout the year."

      agentSteps[4].output = "Generated line chart visualization\nPrepared natural language explanation"
    } else if (schema && data) {
      // Handle custom database queries
      const tableName = schema.tableName
      const columns = schema.columns.map((c) => c.name).join(", ")

      sqlQuery = `SELECT ${columns} FROM ${tableName} LIMIT 10;`

      if (query.toLowerCase().includes("average") || query.toLowerCase().includes("mean")) {
        // Find numeric columns
        const numericColumns = schema.columns
          .filter((c) => ["INTEGER", "REAL", "FLOAT", "DOUBLE", "NUMBER"].includes(c.type.toUpperCase()))
          .map((c) => c.name)

        if (numericColumns.length > 0) {
          const targetColumn = numericColumns[0]
          sqlQuery = `SELECT AVG(${targetColumn}) as average_${targetColumn} FROM ${tableName};`

          // Calculate average
          const sum = data.reduce((acc, row) => acc + (Number.parseFloat(row[targetColumn]) || 0), 0)
          const avg = sum / data.length

          tableData = [{ [`average_${targetColumn}`]: avg.toFixed(2) }]
          tableColumns = [{ key: `average_${targetColumn}`, label: `Average ${targetColumn}` }]
          visualizationType = "bar"
        }
      } else if (query.toLowerCase().includes("count")) {
        sqlQuery = `SELECT COUNT(*) as row_count FROM ${tableName};`
        tableData = [{ row_count: data.length }]
        tableColumns = [{ key: "row_count", label: "Row Count" }]
        visualizationType = "bar"
      } else {
        // Default to showing data
        tableData = data.slice(0, 10)
        tableColumns = schema.columns.map((c) => ({ key: c.name, label: c.name }))
        visualizationType = "table"
      }

      agentSteps[2].output = sqlQuery

      // Step 4: Executing query
      await delay(1000)
      agentSteps[3].status = "done"
      agentSteps[3].output = `Query executed successfully\nReturned ${tableData.length} rows`

      // Step 5: Processing results
      await delay(800)
      agentSteps[4].status = "done"
      explanation = `I've analyzed your query about "${query}" and executed it against your ${tableName} table.`
      agentSteps[4].output = "Generated appropriate visualization\nPrepared natural language explanation"
    } else {
      // Default response for other queries
      sqlQuery = `SELECT * FROM sample_data WHERE query LIKE '%${query}%' LIMIT 10;`

      agentSteps[2].output = sqlQuery

      // Step 4: Executing query
      await delay(1000)
      agentSteps[3].status = "done"

      tableData = [
        { id: 1, metric: "Sample data 1", value: 42.5 },
        { id: 2, metric: "Sample data 2", value: 37.8 },
        { id: 3, metric: "Sample data 3", value: 51.2 },
      ]

      tableColumns = [
        { key: "id", label: "ID" },
        { key: "metric", label: "Metric" },
        { key: "value", label: "Value" },
      ]

      agentSteps[3].output = `Query executed successfully\nReturned ${tableData.length} rows`

      // Step 5: Processing results
      await delay(800)
      agentSteps[4].status = "done"

      visualizationType = "bar"
      explanation = `I've processed your query about "${query}". Here are the results based on the available data.`

      agentSteps[4].output = "Generated bar chart visualization\nPrepared natural language explanation"
    }

    return {
      agentSteps,
      currentStep: agentSteps.length,
      sqlQuery,
      tableData,
      tableColumns,
      visualizationType,
      explanation,
      followUpSuggestions: ["Show more details", "Explain the methodology", "Compare with historical data"],
    }
  }

  // Return the initial response immediately, then update with progress
  const initialResponse = {
    agentSteps,
    currentStep: 0,
    sqlQuery: "",
    explanation: "Processing your query...",
    tableData: [],
    tableColumns: [],
    visualizationType: "none" as const,
    followUpSuggestions: [],
  }

  // Start the simulation in the background
  const fullResponse = simulateAgentReasoning()

  // Return the promise that will resolve to the full response
  return fullResponse
}

// Add this function to the existing lib/api.ts file

export async function simulateNormalization(schema: any, data: any[]) {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 2000));

  const normalizationSQL = `
-- Normalize to 1NF: Ensure atomic values and a primary key
CREATE TABLE orders (
  order_id INT PRIMARY KEY,
  customer_id INT,
  product_id INT,
  order_date DATE
);

-- Normalize to 2NF: Move customer and product data to separate tables
CREATE TABLE customers (
  customer_id INT PRIMARY KEY,
  customer_name VARCHAR(100),
  customer_email VARCHAR(100)
);

CREATE TABLE products (
  product_id INT PRIMARY KEY,
  product_name VARCHAR(100),
  category_id INT,
  product_price DECIMAL(10, 2)
);

-- Normalize to 3NF: Remove transitive dependencies by adding category table
CREATE TABLE categories (
  category_id INT PRIMARY KEY,
  category_name VARCHAR(50),
  category_description TEXT
);

ALTER TABLE products
ADD FOREIGN KEY (category_id) REFERENCES categories(category_id);

ALTER TABLE orders
ADD FOREIGN KEY (customer_id) REFERENCES customers(customer_id),
ADD FOREIGN KEY (product_id) REFERENCES products(product_id);
`;

  const result = {
    normalForms: {
      firstNF: true,
      secondNF: true,
      thirdNF: schema[0].tableName !== "sales", // Example logic
    },
    normalizationSQL,
    aiResponse: {
      summary:
        "The database has been normalized up to Third Normal Form (3NF), optimizing for data integrity and eliminating redundancy.",
      details: `Normalization involved the following:

1. **1NF**: Ensured all values are atomic and a proper primary key was set.
2. **2NF**: Split the table to separate customer and product details.
3. **3NF**: Removed transitive dependencies by creating a category table and linking it to products.

The final schema includes: orders, customers, products, and categories.`,
      recommendations: [
        "Ensure foreign key indexes for performance optimization.",
        "Apply constraints like NOT NULL and UNIQUE where appropriate.",
        "Review queries to make sure they align with the normalized structure.",
        "Ensure any application logic reflects the new schema relationships.",
      ],
    },
  };

  return result;
}
