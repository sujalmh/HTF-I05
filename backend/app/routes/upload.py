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

def parse_sql(file):
    file_path = save_file(file)
    conn = sqlite3.connect(file_path)
    cursor = conn.cursor()
    
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table'")
    tables = [row[0] for row in cursor.fetchall()]
    
    if not tables:
        raise ValueError("No tables found in SQL file.")
    
    table_name = tables[0]
    cursor.execute(f"PRAGMA table_info({table_name})")
    
    columns = [{
        "name": col[1],
        "type": col[2],
        "nullable": col[3] == 0
    } for col in cursor.fetchall()]
    
    cursor.execute(f"SELECT * FROM {table_name} LIMIT 1000")
    column_names = [desc[0] for desc in cursor.description]
    data = [dict(zip(column_names, row)) for row in cursor.fetchall()]
    
    conn.close()
    return {"schema": {"tableName": table_name, "columns": columns}, "data": data}

@upload_bp.route('', methods=['GET', 'POST'])
def upload_file():
    if "file" not in request.files:
        return jsonify({"error": "No file provided"}), 400
    
    file = request.files["file"]
    if file.filename == "":
        return jsonify({"error": "No file selected"}), 400
    
    try:
        file_type = get_file_type(file.filename)
        if file_type == "csv":
            result = parse_csv(file)
        elif file_type == "json":
            result = parse_json(file)
        elif file_type == "sql":
            result = parse_sql(file)
        else:
            return jsonify({"error": "Unsupported file format"}), 400
        
        return jsonify(result)
    except Exception as e:
        return jsonify({"error": str(e)}), 400