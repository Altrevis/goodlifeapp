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
            # Utilisation d'une sous-requête pour obtenir les 7 derniers jours puis les trier par date croissante
            cursor.execute("""
                SELECT * FROM (
                    SELECT date, duration, quality
                    FROM sleep_data
                    WHERE user_id = %s
                    ORDER BY date DESC
                    LIMIT 7
                ) AS sub
                ORDER BY date ASC
            """, (user_id,))

            data = cursor.fetchall()
            if not data:
                return jsonify({"message": "Aucune donnée"}), 404

            # Calcul durée moyenne
            avg_duration = sum(d["duration"] for d in data) / len(data)
            avg_quality = sum(d["quality"] for d in data) / len(data)
            
            # ... rest of the existing GET logic ...
            # (I will keep the existing calculation logic for scores below)
            
            # Reprenons le calcul des scores pour ne pas casser le reste du GET
            durations = [d["duration"] for d in data]
            mean = avg_duration
            variance = sum((x - mean) ** 2 for x in durations) / len(durations)
            consistency = max(0, 1 - variance / (mean**2)) if mean > 0 else 0

            duration_score = min(100, (avg_duration / 8) * 100) if 8 > 0 else 0
            quality_score = (avg_quality / 10) * 100
            consistency_score = consistency * 100

            sleep_score = (duration_score * 0.4 + quality_score * 0.35 + consistency_score * 0.25)

            if sleep_score >= 80: status = "Excellent"
            elif sleep_score >= 60: status = "Bon"
            elif sleep_score >= 40: status = "À améliorer"
            else: status = "Mauvais"

            # On formate les dates pour le JSON (évite les erreurs de sérialisation si besoin)
            for d in data:
                if hasattr(d['date'], 'isoformat'):
                    d['date'] = d['date'].isoformat()

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
            date_val = data.get('date')
            duration = data.get('duration')
            quality = data.get('quality')

            if not all([date_val, duration, quality]):
                return jsonify({"error": "Missing data"}), 400

            cursor.execute("SELECT id FROM users WHERE id = %s", (user_id,))
            if not cursor.fetchone():
                return jsonify({"error": f"User with ID {user_id} does not exist"}), 404

            # Insérer la nouvelle donnée de sommeil
            cursor.execute("""
                INSERT INTO sleep_data (user_id, date, duration, quality)
                VALUES (%s, %s, %s, %s)
            """, (user_id, date_val, duration, quality))
            
            # --- LOGIQUE DE MISE À JOUR AUTOMATIQUE DU PROFIL ---
            # 1. Calculer la nouvelle moyenne sur les 7 derniers jours enregistrés
            cursor.execute("""
                SELECT duration FROM sleep_data 
                WHERE user_id = %s 
                ORDER BY date DESC LIMIT 7
            """, (user_id,))
            rows = cursor.fetchall()
            
            if rows:
                new_avg = sum(r['duration'] for r in rows) / len(rows)
                new_avg = round(new_avg, 1) # On arrondit pour le profil
                
                # 2. Mettre à jour le champ sleep_hours dans la table health_data
                # On met à jour l'entrée la plus récente pour que le profil et l'ИИ всегда видели актуальную среднюю.
                cursor.execute("""
                    SELECT id FROM health_data 
                    WHERE user_id = %s 
                    ORDER BY date DESC LIMIT 1
                """, (user_id,))
                latest_health = cursor.fetchone()
                
                if latest_health:
                    cursor.execute("""
                        UPDATE health_data 
                        SET sleep_hours = %s 
                        WHERE id = %s
                    """, (new_avg, latest_health['id']))
                else:
                    # Si aucune donnée de santé n'existe du tout, on en crée une pour aujourd'hui
                    cursor.execute("""
                        INSERT INTO health_data (user_id, date, sleep_hours)
                        VALUES (%s, CURDATE(), %s)
                    """, (user_id, new_avg))

            conn.commit()
            return jsonify({"message": "Données de sommeil ajoutées et profil mis à jour !"}), 201

    except Exception as e:
        return jsonify({"error": str(e)}), 500

    finally:
        if cursor: cursor.close()
        if conn and conn.is_connected(): conn.close()
