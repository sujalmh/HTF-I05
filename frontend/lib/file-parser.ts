import initSqlJs from "sql.js";

function getFileType(file: File): "csv" | "json" | "sql" | "db" {
  const fileName = file.name.toLowerCase()
  if (fileName.endsWith(".csv")) return "csv"
  if (fileName.endsWith(".json")) return "json"
  if (fileName.endsWith(".sql")) return "sql"
  if (fileName.endsWith(".db")) return "db"
  throw new Error("Unsupported file format. Please upload a CSV, JSON, or SQL file.")
}

// Optimized CSV parser for large files
async function parseCSV(file: File): Promise<{ schema: any; data: any[] }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = (event) => {
      try {
        const csvText = event.target?.result as string
        const lines = csvText.split("\n").filter((line) => line.trim())

        if (lines.length < 2) {
          throw new Error("CSV file must contain headers and at least one data row")
        }

        // Parse headers
        const headers = lines[0].split(",").map((header) => header.trim())

        // For large files, limit initial data processing to first 1000 rows
        const maxRows = Math.min(lines.length - 1, 1000)

        // Parse sample data rows for schema inference
        const sampleData = lines.slice(1, 21).map((line) => {
          const values = line.split(",").map((value) => value.trim())
          return headers.reduce(
            (obj, header, index) => {
              obj[header] = values[index] || ""
              return obj
            },
            {} as Record<string, string>,
          )
        })

        // Parse all data rows (up to maxRows)
        const data = lines.slice(1, maxRows + 1).map((line) => {
          const values = line.split(",").map((value) => value.trim())
          return headers.reduce(
            (obj, header, index) => {
              obj[header] = values[index] || ""
              return obj
            },
            {} as Record<string, string>,
          )
        })

        // Infer schema from sample data
        const schema = {
          tableName: file.name.replace(".csv", ""),
          columns: headers.map((header) => {
            // Try to infer data type from first 20 rows
            const columnValues = sampleData.map((row) => row[header]).filter(Boolean)
            let dataType = "TEXT"

            // Check if all values are numbers
            if (columnValues.length > 0 && columnValues.every((val) => !isNaN(Number(val)))) {
              dataType = columnValues.some((val) => val.includes(".")) ? "REAL" : "INTEGER"
            }
            // Check if all values are booleans
            else if (
              columnValues.length > 0 &&
              columnValues.every((val) => ["true", "false", "0", "1"].includes(val.toLowerCase()))
            ) {
              dataType = "BOOLEAN"
            }
            // Check if all values are dates
            else if (columnValues.length > 0 && columnValues.every((val) => /^\d{4}-\d{2}-\d{2}/.test(val))) {
              dataType = "DATE"
            }

            return {
              name: header,
              type: dataType,
              nullable: sampleData.some((row) => !row[header]),
            }
          }),
        }

        resolve({ schema, data })
      } catch (error) {
        reject(new Error("Failed to parse CSV file. Please check the format."))
      }
    }

    reader.onerror = () => {
      reject(new Error("Failed to read the file."))
    }

    reader.readAsText(file)
  })
}

// Optimized JSON parser for large files
async function parseJSON(file: File): Promise<{ schema: any; data: any[] }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = (event) => {
      try {
        const jsonText = event.target?.result as string
        const jsonData = JSON.parse(jsonText)

        // Handle array of objects
        if (Array.isArray(jsonData)) {
          if (jsonData.length === 0) {
            throw new Error("JSON file contains an empty array")
          }

          // For large arrays, limit to first 1000 items
          const maxItems = Math.min(jsonData.length, 1000)
          const processedData = jsonData.slice(0, maxItems)

          // Get sample for schema inference
          const sampleData = jsonData.slice(0, 20)

          // Get all unique keys from sample objects
          const allKeys = new Set<string>()
          sampleData.forEach((item) => {
            if (typeof item === "object" && item !== null) {
              Object.keys(item).forEach((key) => allKeys.add(key))
            }
          })

          // Infer schema from sample data
          const schema = {
            tableName: file.name.replace(".json", ""),
            columns: Array.from(allKeys).map((key) => {
              // Find first non-null value for this key
              const firstValue = sampleData.find((item) => item[key] !== undefined && item[key] !== null)?.[key]
              let dataType = "TEXT"

              if (typeof firstValue === "number") {
                dataType = Number.isInteger(firstValue) ? "INTEGER" : "REAL"
              } else if (typeof firstValue === "boolean") {
                dataType = "BOOLEAN"
              } else if (typeof firstValue === "string") {
                if (/^\d{4}-\d{2}-\d{2}/.test(firstValue)) {
                  dataType = "DATE"
                }
              }

              return {
                name: key,
                type: dataType,
                nullable: sampleData.some((item) => item[key] === null || item[key] === undefined),
              }
            }),
          }

          resolve({ schema, data: processedData })
        }
        // Handle object with arrays
        else if (typeof jsonData === "object" && jsonData !== null) {
          // Find the first array property
          const arrayProp = Object.keys(jsonData).find((key) => Array.isArray(jsonData[key]))

          if (!arrayProp || !jsonData[arrayProp].length) {
            throw new Error("JSON file must contain an array of objects")
          }

          const dataArray = jsonData[arrayProp]

          // For large arrays, limit to first 1000 items
          const maxItems = Math.min(dataArray.length, 1000)
          const processedData = dataArray.slice(0, maxItems)

          // Get sample for schema inference
          const sampleData = dataArray.slice(0, 20)

          // Get all unique keys from sample objects
          const allKeys = new Set<string>()
          sampleData.forEach((item: any) => {
            if (typeof item === "object" && item !== null) {
              Object.keys(item).forEach((key) => allKeys.add(key))
            }
          })

          // Infer schema from sample data
          const schema = {
            tableName: arrayProp,
            columns: Array.from(allKeys).map((key) => {
              // Find first non-null value for this key
              const firstValue = sampleData.find((item: any) => item[key] !== undefined && item[key] !== null)?.[key]
              let dataType = "TEXT"

              if (typeof firstValue === "number") {
                dataType = Number.isInteger(firstValue) ? "INTEGER" : "REAL"
              } else if (typeof firstValue === "boolean") {
                dataType = "BOOLEAN"
              } else if (typeof firstValue === "string") {
                if (/^\d{4}-\d{2}-\d{2}/.test(firstValue)) {
                  dataType = "DATE"
                }
              }

              return {
                name: key,
                type: dataType,
                nullable: sampleData.some((item: any) => item[key] === null || item[key] === undefined),
              }
            }),
          }

          resolve({ schema, data: processedData })
        } else {
          throw new Error("JSON file must contain an array of objects or an object with arrays")
        }
      } catch (error) {
        reject(new Error("Failed to parse JSON file. Please check the format."))
      }
    }

    reader.onerror = () => {
      reject(new Error("Failed to read the file."))
    }

    reader.readAsText(file)
  })
}

// SQL parser with optimizations for large files
async function parseSQL(file: File): Promise<{ schema: any; data: any[] }> {
  const sqlJs = await initSqlJs();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (event) => {
      try {
        const sqlText = event.target?.result as string;

        // Initialize an SQLite database in memory
        const db = new sqlJs.Database();

        // Execute the SQL dump to create the schema and insert data
        db.exec(sqlText);

        // Extract the table names
        const tables = db.exec(
          "SELECT name FROM sqlite_master WHERE type='table';"
        )[0]?.values.map((row) => row[0]) as string[];

        if (!tables || tables.length === 0) {
          throw new Error("No tables found in SQL file.");
        }

        // Process first table
        const tableName = tables[0];

        // Extract columns
        const columnsQuery = db.exec(`PRAGMA table_info(${tableName})`);
        const columns = columnsQuery[0]?.values.map((col) => ({
          name: col[1] as string,
          type: col[2] as string,
          nullable: col[3] === 0 ? true : false,
        }));

        // Extract data (limit to 1000 rows)
        const dataQuery = db.exec(`SELECT * FROM ${tableName} LIMIT 1000`);
        const columnNames = dataQuery[0]?.columns || [];
        const data = dataQuery[0]?.values.map((row) =>
          Object.fromEntries(columnNames.map((col, i) => [col, row[i]]))
        );

        const schema = { tableName, columns };
        resolve({ schema, data });
      } catch (error) {
        reject(new Error("Failed to parse SQLite SQL file."));
      }
    };

    reader.onerror = () => {
      reject(new Error("Failed to read the file."));
    };

    reader.readAsText(file);
  });
}

// Main parse function that delegates to the appropriate parser
export async function parseFile(file: File): Promise<{ schema: any; data: any[] }> {
  const fileType = getFileType(file)

  switch (fileType) {
    case "csv":
      return parseCSV(file)
    case "json":
      return parseJSON(file)
    case "sql":
      return parseSQL(file)
    case "db":
      return parseSQL(file)
    default:
      throw new Error("Unsupported file format")
  }
}

