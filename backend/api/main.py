from flask import Blueprint, jsonify
import mysql.connector
from mysql.connector import Error

main_bp = Blueprint('main', __name__)

# Configuration de la base de données
db_config = {
    'host': 'localhost',
    'port': 3307,
    'user': 'leo',
    'password': 'leo',
    'database': 'bienetre'
}

# ---------------------------------------------------------
# ROUTE TEST MYSQL
# ---------------------------------------------------------
@main_bp.route('/')
def home():
    try:
        conn = mysql.connector.connect(**db_config)
        cursor = conn.cursor()
        cursor.execute("SELECT DATABASE();")
        return jsonify({"message": f"Connecté à {cursor.fetchone()[0]} ✅"})

    except Error as e:
        return jsonify({"error": str(e)})

    finally:
        if cursor: cursor.close()
        if conn and conn.is_connected(): conn.close()


# ---------------------------------------------------------
# INITIALISATION DE LA BASE
# ---------------------------------------------------------
def init_database():
    try:
        conn = mysql.connector.connect(**db_config)
        cursor = conn.cursor()

        cursor.execute("""
            CREATE TABLE IF NOT EXISTS sleep_data (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NOT NULL,
                date DATE NOT NULL,
                duration FLOAT NOT NULL,
                quality INT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)

        cursor.execute("SELECT COUNT(*) FROM sleep_data")
        if cursor.fetchone()[0] == 0:
            cursor.execute("""
                INSERT INTO sleep_data (user_id, date, duration, quality) VALUES
                (1, '2025-11-27', 8.0, 9),
                (1, '2025-11-28', 7.5, 8),
                (1, '2025-11-29', 8.2, 9),
                (1, '2025-11-30', 7.0, 7),
                (1, '2025-12-01', 8.5, 9),
                (1, '2025-12-02', 7.8, 8),
                (1, '2025-12-03', 8.1, 9)
            """)

        conn.commit()
        print("✅ Table sleep_data initialisée")

    except Error as e:
        print("❌ Erreur MySQL:", e)

    finally:
        if cursor: cursor.close()
        if conn and conn.is_connected(): conn.close()
