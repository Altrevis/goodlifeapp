from flask import Blueprint, jsonify
import mysql.connector
from mysql.connector import Error

users_bp = Blueprint('users', __name__)

# Configuration de la base de données
db_config = {
    'host': 'localhost',
    'port': 3306,
    'user': 'alexandre',
    'password': 'ynov2526',
    'database': 'bienetre'
}

@users_bp.route('/users', methods=['GET'])
def get_users():
    try:
        conn = mysql.connector.connect(**db_config)
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT id, first_name, last_name, email, age, gender FROM users")
        return jsonify(cursor.fetchall())

    except Error as e:
        return jsonify({"error": str(e)})

    finally:
        if cursor: cursor.close()
        if conn and conn.is_connected(): conn.close()
