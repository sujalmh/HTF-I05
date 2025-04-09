from datetime import datetime
from flask import Blueprint, request, jsonify
import sqlite3
import csv
import json
import io
import os 
from pymongo import MongoClient
import uuid
from sqlalchemy import create_engine, MetaData, text
from sqlalchemy.exc import SQLAlchemyError
import uuid

# MongoDB connection
MONGO_URI = "mongodb+srv://smh01:mnbvcx12@cluster0.amgq0s8.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"
mongo_client = MongoClient(MONGO_URI)
db = mongo_client["try1"] 
chat_collection = db.chats

upload_bp = Blueprint('upload', __name__)
INPUT_FOLDER = "input"
os.makedirs(INPUT_FOLDER, exist_ok=True)

def get_next_project_id():
    counter = db.counters.find_one_and_update(
        {"_id": "project_id"},
        {"$inc": {"sequence_value": 1}},
        return_document=True
    )
    if counter is None:
        db.counters.insert_one({"_id": "project_id", "sequence_value": 1})
        return 1
    return counter["sequence_value"]

def get_file_type(filename):
    filename = filename.lower()
    if filename.endswith(".csv"): return "csv"
    if filename.endswith(".json"): return "json"
    if filename.endswith(".sql") or filename.endswith(".db"): return "sql"
    raise ValueError("Unsupported file format. Please upload a CSV, JSON, or SQL file.")

def save_file(file):
    ext = os.path.splitext(file.filename)[1]
    unique_filename = f"{uuid.uuid4()}{ext}"

    file_path = os.path.join(INPUT_FOLDER, unique_filename)
    file.save(file_path)
    return file_path, file.filename

def parse_csv(file):
    file_path, original_filename  = save_file(file)
    with open(file_path, "r", encoding="utf-8") as f:
        reader = csv.reader(f)
        rows = list(reader)
    
    if len(rows) < 2:
        raise ValueError("CSV file must contain headers and at least one data row")
    
    headers = rows[0]
    data = [dict(zip(headers, row)) for row in rows[1: min(1001, len(rows))]]
    
    schema = {
        "tableName": original_filename.replace(".csv", ""),
        "columns": [{
            "name": header,
            "type": "TEXT",
            "nullable": any(not row.get(header) for row in data)
        } for header in headers]
    }
    return {"schema": schema, "data": data}

def parse_json(file):
    file_path, original_filename = save_file(file)
    with open(file_path, "r", encoding="utf-8") as f:
        data = json.load(f)
    
    if not isinstance(data, list):
        raise ValueError("JSON file must contain an array of objects")
    
    if len(data) == 0:
        raise ValueError("JSON file contains an empty array")
    
    keys = set()
    for obj in data[:20]:
        if isinstance(obj, dict):
            keys.update(obj.keys())
    
    schema = {
        "tableName": original_filename.replace(".json", ""),
        "columns": [{
            "name": key,
            "type": "TEXT",
            "nullable": any(key not in obj or obj[key] is None for obj in data[:20])
        } for key in keys]
    }
    
    return {"schema": schema, "data": data[:1000]}


def update_schema_and_data_to_db(file, chat_id, user_id):
    file_path, original_filename = save_file(file)
    filename_lower = file.filename.lower()
    db_name = file.filename.replace(".db", "").replace(".sqlite", "").replace(".sql", "")

    if filename_lower.endswith((".db", ".sqlite")):
        connection_string = f"sqlite:///{file_path}"
    elif filename_lower.endswith(".sql"):
        connection_string = "sqlite:///:memory:"
    else:
        raise ValueError("Unsupported SQL file format. Please upload a SQLite database file or a SQL dump file.")

    engine = create_engine(connection_string)

    if filename_lower.endswith(".sql"):
        with open(file_path, "r", encoding="utf-8") as f:
            sql_script = f.read()

        statements = [stmt.strip() for stmt in sql_script.split(";") if stmt.strip()]
        with engine.begin() as conn:
            for stmt in statements:
                try:
                    conn.execute(text(stmt))
                except SQLAlchemyError as e:
                    raise ValueError(f"Error executing SQL statement: {e}")

    metadata = MetaData()
    try:
        metadata.reflect(bind=engine)
        if not metadata.tables:
            raise ValueError("No tables found in the database.")
    except Exception as e:
        raise ValueError(f"Error reflecting database schema: {e}")

    schema = {
        table_name: [
            {
                "name": col.name,
                "type": str(col.type),
                "nullable": col.nullable
            } for col in table_obj.columns
        ]
        for table_name, table_obj in metadata.tables.items()
    }

    data = {}
    with engine.connect() as conn:
        for table_name, table_obj in metadata.tables.items():
            query = table_obj.select().limit(1000)
            result_proxy = conn.execute(query)
            rows = result_proxy.fetchall()
            column_names = result_proxy.keys()
            data[table_name] = [dict(zip(column_names, row)) for row in rows]

    project_id = get_next_project_id()

    database_entry = {
        "file_path": file_path,
        "original_filename": original_filename,
        "db_name": db_name,
        "tables": [
            {"table_name": table_name, "columns": [col["name"] for col in schema[table_name]]}
            for table_name in schema
        ],
        "data": data
    }

    project_document = {
        "_id": project_id,
        "user_id": user_id,
        "name": db_name,
        "chat_id": chat_id,
        "original_filename": original_filename,
        "file_path": file_path,
        "description": f"Database project for {db_name}",
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow(),
        "database_uploaded": True,
        "database_details": database_entry,
        "status": "active",
        "shared_with": [],
        "last_accessed": datetime.utcnow()
    }
    db.projects.insert_one(project_document)

    return {"project_id": project_id, "schema": schema, "data": data}

def parse_database_file(file):
    file_path, orignal_filename = save_file(file)
    filename_lower = orignal_filename.lower()

    if filename_lower.endswith((".db", ".sqlite")):
        connection_string = f"sqlite:///{file_path}"
    elif filename_lower.endswith(".sql"):
        connection_string = "sqlite:///:memory:"
    else:
        raise ValueError("Unsupported SQL file format. Please upload a SQLite database file or a SQL dump file.")

    engine = create_engine(connection_string)

    if filename_lower.endswith(".sql"):
        with open(file_path, "r", encoding="utf-8") as f:
            sql_script = f.read()

        statements = [stmt.strip() for stmt in sql_script.split(";") if stmt.strip()]
        with engine.begin() as conn:
            for stmt in statements:
                try:
                    conn.execute(text(stmt))
                except SQLAlchemyError as e:
                    raise ValueError(f"Error executing SQL statement: {e}")

    metadata = MetaData()
    try:
        metadata.reflect(bind=engine)
        if not metadata.tables:
            raise ValueError("No tables found in the database.")
    except Exception as e:
        raise ValueError(f"Error reflecting database schema: {e}")

    schema = {
        table_name: [
            {
                "name": col.name,
                "type": str(col.type),
                "nullable": col.nullable
            } for col in table_obj.columns
        ]
        for table_name, table_obj in metadata.tables.items()
    }

    data = {}
    with engine.connect() as conn:
        for table_name, table_obj in metadata.tables.items():
            query = table_obj.select().limit(1000)
            result_proxy = conn.execute(query)
            rows = result_proxy.fetchall()
            column_names = result_proxy.keys()
            data[table_name] = [dict(zip(column_names, row)) for row in rows]

    return { "schema": schema, "data": data}

@upload_bp.route('/start', methods=['GET', 'POST'])
def store_schema():
    if "file" not in request.files:
        return jsonify({"error": "No file provided"}), 400

    file = request.files["file"]
    
    if file.filename == "":
        return jsonify({"error": "No file selected"}), 400
    
    user_id = int(request.form.get("user_id"))
    chat_id = request.form.get("chat_id")

    filename_lower = file.filename.lower()
    try:
        if filename_lower.endswith(".csv"):
            result = parse_csv(file)
        elif filename_lower.endswith(".json"):
            result = parse_json(file)
        elif filename_lower.endswith((".db", ".sqlite", ".sql")):
            result = update_schema_and_data_to_db(file, chat_id, user_id)
        else:
            return jsonify({"error": "Unsupported file format"}), 400
        schema = result.get("schema", {})
        table_count = len(schema)

        agent_steps = [
            {
                "id": str(uuid.uuid4()),
                "description": "Database file processed successfully",
                "status": "done"
            },
            {
                "id": str(uuid.uuid4()),
                "description": f"Detected {table_count} tables",
                "status": "done"
            },
            *[
                {
                    "id": str(uuid.uuid4()),
                    "description": f'Table "{table}" with {len(columns)} columns',
                    "status": "done"
                }
                for table, columns in schema.items()
            ],
            {
                "id": str(uuid.uuid4()),
                "description": "Ready to answer questions about your data",
                "status": "done"
            }
        ]

        assistant_message = {
            "id": str(uuid.uuid4()),
            "chat_id": chat_id,
            "role": "assistant",
            "content": "Database uploaded successfully! You can now ask questions about your data.",
            "timestamp": datetime.utcnow(),
            "agentSteps": agent_steps,
            "currentStep": len(agent_steps),
            "explanation": "I've analyzed your database and I'm ready to help you query it.",
            "followUpSuggestions": [
                "Show me the schema",
                "List all tables",
                "How many rows are in each table?"
            ]
        }
        chat_collection.insert_one(assistant_message)

        return jsonify(result)
    except Exception as e:
        print(f"Error: {str(e)}")  
        return jsonify({"error": str(e)}), 400

@upload_bp.route('/', methods=['GET', 'POST'])
def upload_file():
    if "file" not in request.files:
        return jsonify({"error": "No file provided"}), 400

    file = request.files["file"]
    if file.filename == "":
        return jsonify({"error": "No file selected"}), 400

    filename_lower = file.filename.lower()
    try:
        if filename_lower.endswith(".csv"):
            result = parse_csv(file)
        elif filename_lower.endswith(".json"):
            result = parse_json(file)
        elif filename_lower.endswith((".db", ".sqlite", ".sql")):
            result = parse_database_file(file)
        else:
            return jsonify({"error": "Unsupported file format"}), 400
        return jsonify(result)
    except Exception as e:
        print(f"Error: {str(e)}")  
        return jsonify({"error": str(e)}), 400
