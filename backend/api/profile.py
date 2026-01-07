from flask import Blueprint, jsonify, request
import mysql.connector
from mysql.connector import Error
from datetime import datetime

profile_bp = Blueprint('profile', __name__)

# Configuration de la base de données
db_config = {
    'host': 'localhost',
    'port': 3307,
    'user': 'leo',
    'password': 'leo',
    'database': 'bienetre'
}

@profile_bp.route('/profile/<int:user_id>', methods=['GET'])
def get_profile(user_id):
    """Récupère les dernières données de santé de l'utilisateur"""
    try:
        conn = mysql.connector.connect(**db_config)
        cursor = conn.cursor(dictionary=True)
        
        # Récupérer les informations de base de l'utilisateur
        cursor.execute("""
            SELECT id, first_name, last_name, email, age, gender 
            FROM users 
            WHERE id = %s
        """, (user_id,))
        user = cursor.fetchone()
        
        if not user:
            return jsonify({"error": "Utilisateur non trouvé"}), 404
        
        # Récupérer les dernières données de santé
        cursor.execute("""
            SELECT date, weight, height, heart_rate, sleep_hours, calories_burned, steps 
            FROM health_data 
            WHERE user_id = %s 
            ORDER BY date DESC 
            LIMIT 1
        """, (user_id,))
        health_data = cursor.fetchone()
        
        result = {
            "user": user,
            "health_data": health_data if health_data else {}
        }
        
        return jsonify(result)

    except Error as e:
        return jsonify({"error": str(e)}), 500

    finally:
        if cursor:
            cursor.close()
        if conn and conn.is_connected():
            conn.close()


@profile_bp.route('/profile/<int:user_id>/health', methods=['POST'])
def update_health_data(user_id):
    """Met à jour ou ajoute les données de santé de l'utilisateur"""
    conn = None
    cursor = None
    try:
        data = request.json
        
        conn = mysql.connector.connect(**db_config)
        cursor = conn.cursor(dictionary=True)
        
        # Vérifier si l'utilisateur existe
        cursor.execute("SELECT id FROM users WHERE id = %s", (user_id,))
        user_exists = cursor.fetchone()
        if not user_exists:
            return jsonify({"error": "Utilisateur non trouvé"}), 404
        
        # Préparer les données
        date = data.get('date', datetime.now().strftime('%Y-%m-%d'))
        
        # Vérifier si des données existent déjà pour cette date
        cursor.execute("""
            SELECT id FROM health_data 
            WHERE user_id = %s AND date = %s
        """, (user_id, date))
        
        existing_record = cursor.fetchone()
        cursor.fetchall()  # Consommer tous les résultats restants
        
        if existing_record:
            # Mise à jour : construire la requête dynamiquement pour ne mettre à jour que les champs fournis
            fields = []
            values = []
            
            # Vérifier chaque champ s'il est présent dans la requête (pas de vérification de None)
            if 'weight' in data:
                fields.append("weight = %s")
                values.append(data['weight'])
            
            if 'height' in data:
                fields.append("height = %s")
                values.append(data['height'])
            
            if 'heart_rate' in data:
                fields.append("heart_rate = %s")
                values.append(data['heart_rate'])
            
            if 'sleep_hours' in data:
                fields.append("sleep_hours = %s")
                values.append(data['sleep_hours'])
            
            if 'calories_burned' in data:
                fields.append("calories_burned = %s")
                values.append(data['calories_burned'])
            
            if 'steps' in data:
                fields.append("steps = %s")
                values.append(data['steps'])
            
            if not fields:
                return jsonify({"error": "Aucune donnée à mettre à jour"}), 400
            
            # Ajouter les conditions WHERE
            values.extend([user_id, date])
            query = f"UPDATE health_data SET {', '.join(fields)} WHERE user_id = %s AND date = %s"
            
            cursor.execute(query, values)
            conn.commit()
            
            return jsonify({
                "success": True,
                "message": "Données de santé mises à jour avec succès",
                "action": "update"
            }), 200
        else:
            # Insertion : créer une nouvelle entrée
            weight = data.get('weight')
            height = data.get('height')
            heart_rate = data.get('heart_rate')
            sleep_hours = data.get('sleep_hours')
            calories_burned = data.get('calories_burned')
            steps = data.get('steps')
            
            cursor.execute("""
                INSERT INTO health_data 
                (user_id, date, weight, height, heart_rate, sleep_hours, calories_burned, steps)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
            """, (user_id, date, weight, height, heart_rate, sleep_hours, calories_burned, steps))
            
            conn.commit()
            
            return jsonify({
                "success": True,
                "message": "Données de santé enregistrées avec succès",
                "action": "insert"
            }), 201

    except Error as e:
        return jsonify({"error": str(e)}), 500

    finally:
        if cursor:
            cursor.close()
        if conn and conn.is_connected():
            conn.close()


@profile_bp.route('/profile/<int:user_id>', methods=['PUT'])
def update_profile(user_id):
    """Met à jour les informations de base de l'utilisateur"""
    try:
        data = request.json
        
        conn = mysql.connector.connect(**db_config)
        cursor = conn.cursor()
        
        # Construire la requête de mise à jour dynamiquement
        fields = []
        values = []
        
        if 'first_name' in data:
            fields.append("first_name = %s")
            values.append(data['first_name'])
        
        if 'last_name' in data:
            fields.append("last_name = %s")
            values.append(data['last_name'])
        
        if 'age' in data:
            fields.append("age = %s")
            values.append(data['age'])
        
        if 'gender' in data:
            fields.append("gender = %s")
            values.append(data['gender'])
        
        if not fields:
            return jsonify({"error": "Aucune donnée à mettre à jour"}), 400
        
        values.append(user_id)
        query = f"UPDATE users SET {', '.join(fields)} WHERE id = %s"
        
        cursor.execute(query, values)
        conn.commit()
        
        if cursor.rowcount == 0:
            return jsonify({"error": "Utilisateur non trouvé"}), 404
        
        return jsonify({
            "success": True,
            "message": "Profil mis à jour avec succès"
        })

    except Error as e:
        return jsonify({"error": str(e)}), 500

    finally:
        if cursor:
            cursor.close()
        if conn and conn.is_connected():
            conn.close()


@profile_bp.route('/profile/<int:user_id>/history', methods=['GET'])
def get_health_history(user_id):
    """Récupère l'historique des données de santé"""
    try:
        limit = request.args.get('limit', 30, type=int)
        
        conn = mysql.connector.connect(**db_config)
        cursor = conn.cursor(dictionary=True)
        
        cursor.execute("""
            SELECT date, weight, height, heart_rate, sleep_hours, calories_burned, steps 
            FROM health_data 
            WHERE user_id = %s 
            ORDER BY date DESC 
            LIMIT %s
        """, (user_id, limit))
        
        history = cursor.fetchall()
        
        return jsonify(history)

    except Error as e:
        return jsonify({"error": str(e)}), 500

    finally:
        if cursor:
            cursor.close()
        if conn and conn.is_connected():
            conn.close()
