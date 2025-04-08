from flask import Blueprint, request, jsonify
import sqlite3
import csv
import json
import io
import os 

upload_bp = Blueprint('upload', __name__)
INPUT_FOLDER = "input"
os.makedirs(INPUT_FOLDER, exist_ok=True)

def get_file_type(filename):
    filename = filename.lower()
    if filename.endswith(".csv"): return "csv"
    if filename.endswith(".json"): return "json"
    if filename.endswith(".sql") or filename.endswith(".db"): return "sql"
    raise ValueError("Unsupported file format. Please upload a CSV, JSON, or SQL file.")

def save_file(file):
    file_path = os.path.join(INPUT_FOLDER, file.filename)
    file.save(file_path)
    return file_path

def parse_csv(file):
    file_path = save_file(file)
    with open(file_path, "r", encoding="utf-8") as f:
        reader = csv.reader(f)
        rows = list(reader)
    
    if len(rows) < 2:
        raise ValueError("CSV file must contain headers and at least one data row")
    
    headers = rows[0]
    data = [dict(zip(headers, row)) for row in rows[1: min(1001, len(rows))]]
    
    schema = {
        "tableName": file.filename.replace(".csv", ""),
        "columns": [{
            "name": header,
            "type": "TEXT",
            "nullable": any(not row.get(header) for row in data)
        } for header in headers]
    }
    return {"schema": schema, "data": data}

def parse_json(file):
    file_path = save_file(file)
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
        "tableName": file.filename.replace(".json", ""),
        "columns": [{
            "name": key,
            "type": "TEXT",
            "nullable": any(key not in obj or obj[key] is None for obj in data[:20])
        } for key in keys]
    }
    
    return {"schema": schema, "data": data[:1000]}

from sqlalchemy import create_engine, MetaData, text
from sqlalchemy.exc import SQLAlchemyError

def save_file(file):
    file_path = os.path.join(INPUT_FOLDER, file.filename)
    file.save(file_path)
    return file_path

def parse_database_file(file):
    """
    Processes an uploaded database file.
    - For SQLite files (.db, .sqlite), it connects directly.
    - For SQL dump files (.sql), it loads them into a temporary in-memory SQLite database.
    """
    file_path = save_file(file)
    filename_lower = file.filename.lower()

    # Determine the connection string and engine based on file extension.
    if filename_lower.endswith((".db", ".sqlite")):
        connection_string = f"sqlite:///{file_path}"
    elif filename_lower.endswith(".sql"):
        # Use an in-memory SQLite database for SQL dumps.
        connection_string = "sqlite:///:memory:"
    else:
        raise ValueError("Unsupported SQL file format. Please upload a SQLite database file or a SQL dump file.")

    engine = create_engine(connection_string)

    if filename_lower.endswith(".sql"):
        # Read the SQL dump file and execute its contents on the in-memory database.
        with open(file_path, "r", encoding="utf-8") as f:
            sql_script = f.read()

        # A simple split by semicolon—note this may not handle complex dumps with semicolons in strings.
        statements = [stmt.strip() for stmt in sql_script.split(";") if stmt.strip()]
        with engine.begin() as conn:
            for stmt in statements:
                try:
                    conn.execute(text(stmt))
                except SQLAlchemyError as e:
                    raise ValueError(f"Error executing SQL statement: {e}")

    # Reflect the database schema using SQLAlchemy's MetaData.
    metadata = MetaData()
    try:
        metadata.reflect(bind=engine)
        if not metadata.tables:
            raise ValueError("No tables found in the database.")
        # For demonstration, choose the first table.
        table_name, table_obj = next(iter(metadata.tables.items()))
    except Exception as e:
        raise ValueError(f"Error reflecting database schema: {e}")

    # Build schema information similar to your CSV/JSON functions.
    schema = {
        "tableName": table_name,
        "columns": [{
            "name": col.name,
            "type": str(col.type),
            "nullable": col.nullable
        } for col in table_obj.columns]
    }

    # Query the first 1000 rows from the selected table.
    query = table_obj.select().limit(1000)
    with engine.connect() as conn:
        result_proxy = conn.execute(query)
        rows = result_proxy.fetchall()
        column_names = result_proxy.keys()

    data = [dict(zip(column_names, row)) for row in rows]
    return {"schema": schema, "data": data}

@upload_bp.route('', methods=['GET', 'POST'])
def upload_file():
    if "file" not in request.files:
        return jsonify({"error": "No file provided"}), 400

    file = request.files["file"]
    if file.filename == "":
        return jsonify({"error": "No file selected"}), 400

    # We assume here the file is either a CSV, JSON, or a database file (SQLite or SQL dump).
    filename_lower = file.filename.lower()
    try:
        if filename_lower.endswith(".csv"):
            # (Your CSV parsing code remains unchanged)
            result = parse_csv(file)
        elif filename_lower.endswith(".json"):
            # (Your JSON parsing code remains unchanged)
            result = parse_json(file)
        elif filename_lower.endswith((".db", ".sqlite", ".sql")):
            result = parse_database_file(file)
        else:
            return jsonify({"error": "Unsupported file format"}), 400

        return jsonify(result)
    except Exception as e:
        return jsonify({"error": str(e)}), 400
