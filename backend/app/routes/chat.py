from flask import Blueprint, request, jsonify
import sqlite3
import uuid
from datetime import datetime

chat_bp = Blueprint('chat', __name__)

# Simulated in-memory chat history (replace with a database in production)
chat_history = []

def get_database_schema():
    conn = sqlite3.connect("input\\dataset.db")
    cursor = conn.cursor()
    
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table'")
    tables = cursor.fetchall()
    if not tables:
        return None
    
    table_name = tables[0][0]  # Assuming one table for simplicity
    cursor.execute(f"PRAGMA table_info({table_name})")
    columns = cursor.fetchall()
    
    schema = {
        "tableName": table_name,
        "columns": [{"name": col[1], "type": col[2]} for col in columns]
    }
    conn.close()
    return schema

def get_sample_data(table_name, limit=5):
    conn = sqlite3.connect("database.db")
    cursor = conn.cursor()
    cursor.execute(f"SELECT * FROM {table_name} LIMIT {limit}")
    rows = cursor.fetchall()
    
    cursor.execute(f"PRAGMA table_info({table_name})")
    columns = [col[1] for col in cursor.fetchall()]
    conn.close()
    
    return {"columns": columns, "data": [dict(zip(columns, row)) for row in rows]}

@chat_bp.route("/chat-history", methods=["GET"])
def get_chat_history():
    return jsonify({"history": chat_history})

@chat_bp.route("/query", methods=["POST"])
def execute_query():
    data = request.json
    query = data.get("query")
    if not query:
        return jsonify({"error": "Query is required."}), 400
    
    schema = get_database_schema()
    if not schema:
        return jsonify({"error": "No database schema found."}), 400
    
    try:
        conn = sqlite3.connect("input\\dataset.db")
        cursor = conn.cursor()
        cursor.execute(query)
        result = cursor.fetchall()
        columns = [desc[0] for desc in cursor.description] if cursor.description else []
        conn.close()
        
        explanation = f"Executed query: {query}"
        agent_steps = [
            {"id": str(uuid.uuid4()), "description": "Parsed user query", "status": "done"},
            {"id": str(uuid.uuid4()), "description": "Generated SQL query", "status": "done"},
            {"id": str(uuid.uuid4()), "description": "Executed query and retrieved results", "status": "done"}
        ]
        
        response = {
            "id": str(uuid.uuid4()),
            "timestamp": datetime.utcnow().isoformat(),
            "query": query,
            "result": result,
            "columns": columns,
            "explanation": explanation,
            "agentSteps": agent_steps,
            "currentStep": len(agent_steps),
            "visualizationType": "table" if columns else "none",
            "followUpSuggestions": ["Show me more data", "Filter by a specific condition"]
        }
        
        chat_history.append(response)
        return jsonify(response)
    except Exception as e:
        print(e)
        return jsonify({"error": str(e)}), 500

@chat_bp.route("/schema", methods=["GET"])
def get_schema():
    schema = get_database_schema()
    if not schema:
        return jsonify({"error": "No schema found."}), 400
    return jsonify(schema)