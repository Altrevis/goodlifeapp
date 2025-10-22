from flask import Flask, jsonify
from flask_cors import CORS
import mysql.connector
from mysql.connector import Error

app = Flask(__name__)
CORS(app)

# --- Configuration de la base MySQL ---
db_config = {
    'host': 'localhost',          # ou ton IP MySQL
    'port': 3307,                 # port MySQL par défaut
    'user': 'leo',               # ton utilisateur MySQL
    'password': 'leo',  # ton mot de passe
    'database': 'bienetre'     # ta base
}

# --- Test de connexion ---
@app.route('/')
def home():
    try:
        connection = mysql.connector.connect(**db_config)
        if connection.is_connected():
            cursor = connection.cursor()
            cursor.execute("SELECT DATABASE();")
            db_name = cursor.fetchone()[0]
            return jsonify({"message": f"Connexion réussie à {db_name} ✅"})
    except Error as e:
        return jsonify({"error": str(e)})
    finally:
        if connection.is_connected():
            cursor.close()
            connection.close()

@app.route('/users')
def get_users():
    try:
        connection = mysql.connector.connect(**db_config)
        cursor = connection.cursor(dictionary=True)
        cursor.execute("SELECT id, first_name, last_name, email, age, gender FROM users;")
        result = cursor.fetchall()
        return jsonify(result)
    except Error as e:
        return jsonify({"error": str(e)})
    finally:
        if connection.is_connected():
            cursor.close()
            connection.close()

if __name__ == '__main__':
    app.run(debug=True)
