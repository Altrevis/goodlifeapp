from flask import Blueprint, jsonify, request
from mysql.connector import Error
from flask_login import current_user
from .db_config import db_config

sleep_bp = Blueprint('sleep', __name__)

# ---------------------------------------------------------
# SLEEP API (MYSQL) - Score local
# ---------------------------------------------------------
@sleep_bp.route('/api/sleep', methods=['GET', 'POST'])
def get_sleep():
    # Récupérer l'user_id depuis les paramètres ou l'utilisateur connecté
    user_id = request.args.get('user_id', type=int) or (current_user.id if current_user.is_authenticated else None)
    
    if not user_id:
        return jsonify({"error": "user_id requis ou utilisateur non authentifié"}), 401
    conn = None
    cursor = None
    try:
        import mysql.connector

        conn = mysql.connector.connect(**db_config)
        cursor = conn.cursor(dictionary=True)

        if request.method == 'GET':
            cursor.execute("""
                SELECT date, duration, quality
                FROM sleep_data
                WHERE user_id = %s
                ORDER BY date DESC
                LIMIT 7
            """, (user_id,))

            data = cursor.fetchall()
            if not data:
                return jsonify({"message": "Aucune donnée"}), 404

            # Calcul durée moyenne
            avg_duration = sum(d["duration"] for d in data) / len(data)
            avg_quality = sum(d["quality"] for d in data) / len(data)

            # Calcul régularité : variance inversée des durées
            durations = [d["duration"] for d in data]
            mean = avg_duration
            variance = sum((x - mean) ** 2 for x in durations) / len(durations)
            consistency = max(0, 1 - variance / (mean**2))  # 0 à 1

            # Score de sommeil local (0-100)
            # Basé sur : durée optimale (7-9h), qualité, régularité
            duration_score = min(100, (avg_duration / 8) * 100)  # 8h = 100
            quality_score = (avg_quality / 10) * 100  # Quality sur 10
            consistency_score = consistency * 100  # 0-1 -> 0-100

            # Moyenne pondérée
            sleep_score = (duration_score * 0.4 + quality_score * 0.35 + consistency_score * 0.25)

            # Catégorie
            if sleep_score >= 80:
                status = "Excellent"
            elif sleep_score >= 60:
                status = "Bon"
            elif sleep_score >= 40:
                status = "À améliorer"
            else:
                status = "Mauvais"

            return jsonify({
                "user_id": user_id,
                "average_duration": round(avg_duration, 2),
                "average_quality": round(avg_quality, 2),
                "consistency": round(consistency, 2),
                "sleep_score": round(sleep_score, 2),
                "status": status,
                "breakdown": {
                    "duration_score": round(duration_score, 2),
                    "quality_score": round(quality_score, 2),
                    "consistency_score": round(consistency_score, 2)
                },
                "last_7_days": data
            })

        elif request.method == 'POST':
            data = request.get_json()
            date = data.get('date')
            duration = data.get('duration')
            quality = data.get('quality')

            if not all([date, duration, quality]):
                return jsonify({"error": "Missing data"}), 400

            # Vérifier que l'utilisateur existe
            cursor.execute("SELECT id FROM users WHERE id = %s", (user_id,))
            if not cursor.fetchone():
                return jsonify({"error": f"User with ID {user_id} does not exist"}), 404

            cursor.execute("""
                INSERT INTO sleep_data (user_id, date, duration, quality)
                VALUES (%s, %s, %s, %s)
            """, (user_id, date, duration, quality))
            conn.commit()
            return jsonify({"message": "Sleep data added successfully"}), 201

    except Exception as e:
        return jsonify({"error": str(e)}), 500

    finally:
        if cursor: cursor.close()
        if conn and conn.is_connected(): conn.close()
