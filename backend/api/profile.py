from flask import Blueprint, jsonify, request
import mysql.connector
from mysql.connector import Error
from datetime import datetime
import requests
from flask_login import current_user

from api.db_config import db_config 

profile_bp = Blueprint('profile', __name__)

# Configuration API Ninjas pour les calories
API_NINJAS_BASE_URL = "https://api.api-ninjas.com/v1"
API_NINJAS_KEY = "DbNQ6NpBp8Sc3Ukvk+wsqA==9oxJRkGCmNnFT5ai"

# Dictionnaire des activités sportives (français -> anglais pour l'API)
ACTIVITIES_FR_TO_EN = {
    # Athlétisme (Sports olympiques)
    "Course à pied": "running",
    "Sprint": "sprinting",
    "Course de fond": "long distance running",
    "Marathon": "marathon running",
    "Semi-marathon": "half marathon",
    "Course d'obstacles": "obstacle course",
    "Haies": "hurdling",
    "Saut en hauteur": "high jump",
    "Saut en longueur": "long jump",
    "Triple saut": "triple jump",
    "Saut à la perche": "pole vault",
    "Lancer du javelot": "javelin throw",
    "Lancer du poids": "shot put",
    "Lancer du disque": "discus throw",
    "Lancer du marteau": "hammer throw",
    "Décathlon": "decathlon",
    "Heptathlon": "heptathlon",
    "Marche athlétique": "race walking",
    
    # Sports aquatiques (Compétition)
    "Natation": "swimming",
    "Nage libre": "freestyle swimming",
    "Brasse": "breaststroke",
    "Dos crawlé": "backstroke",
    "Papillon": "butterfly stroke",
    "Water-polo": "water polo",
    "Natation synchronisée": "synchronized swimming",
    "Plongeon": "diving",
    "Aviron": "rowing",
    "Kayak": "kayaking",
    "Canoë": "canoeing",
    "Voile": "sailing",
    "Surf": "surfing",
    "Paddle": "paddleboarding",
    "Planche à voile": "windsurfing",
    "Kitesurf": "kitesurfing",
    
    # Cyclisme (Compétition)
    "Vélo": "cycling",
    "Cyclisme sur route": "road cycling",
    "VTT": "mountain biking",
    "BMX": "BMX",
    "Cyclisme sur piste": "track cycling",
    "Vélo d'appartement": "stationary bike",
    
    # Sports collectifs (Professionnels)
    "Football": "soccer",
    "Basketball": "basketball",
    "Handball": "handball",
    "Volleyball": "volleyball",
    "Beach volley": "beach volleyball",
    "Rugby": "rugby",
    "Football américain": "football",
    "Baseball": "baseball",
    "Softball": "softball",
    "Hockey sur glace": "ice hockey",
    "Hockey sur gazon": "field hockey",
    "Polo": "polo",
    "Ultimate frisbee": "ultimate frisbee",
    
    # Sports de raquette (Compétition)
    "Tennis": "tennis",
    "Badminton": "badminton",
    "Tennis de table": "table tennis",
    "Squash": "squash",
    "Padel": "padel",
    "Racquetball": "racquetball",
    
    # Sports de combat (Compétition olympique)
    "Boxe": "boxing",
    "Boxe anglaise": "boxing",
    "Kick-boxing": "kickboxing",
    "Muay Thai": "muay thai",
    "MMA": "mixed martial arts",
    "Judo": "judo",
    "Karaté": "karate",
    "Taekwondo": "taekwondo",
    "Jiu-jitsu": "jiu jitsu",
    "Lutte": "wrestling",
    "Lutte gréco-romaine": "greco roman wrestling",
    "Lutte libre": "freestyle wrestling",
    "Escrime": "fencing",
    "Kendo": "kendo",
    "Aikido": "aikido",
    "Kung fu": "kung fu",
    "Capoeira": "capoeira",
    
    # Sports d'hiver (Olympiques)
    "Ski alpin": "alpine skiing",
    "Ski de fond": "cross country skiing",
    "Ski freestyle": "freestyle skiing",
    "Snowboard": "snowboarding",
    "Biathlon": "biathlon",
    "Saut à ski": "ski jumping",
    "Combiné nordique": "nordic combined",
    "Patinage artistique": "figure skating",
    "Patinage de vitesse": "speed skating",
    "Hockey sur glace": "ice hockey",
    "Curling": "curling",
    "Bobsleigh": "bobsleigh",
    "Luge": "luge",
    "Skeleton": "skeleton",
    
    # Gymnastique (Olympique)
    "Gymnastique": "gymnastics",
    "Gymnastique artistique": "artistic gymnastics",
    "Gymnastique rythmique": "rhythmic gymnastics",
    "Trampoline": "trampoline",
    "Acrobatie": "acrobatics",
    
    # Fitness et musculation (Compétition)
    "Musculation": "weightlifting",
    "Haltérophilie": "weightlifting",
    "Powerlifting": "powerlifting",
    "Bodybuilding": "bodybuilding",
    "CrossFit": "crossfit",
    "Fitness": "fitness",
    "Aérobic": "aerobics",
    "Step": "step aerobics",
    "Zumba": "zumba",
    "HIIT": "HIIT",
    "Circuit training": "circuit training",
    "Entraînement fractionné": "interval training",
    "Corde à sauter": "jump rope",
    
    # Sports individuels (Olympiques)
    "Triathlon": "triathlon",
    "Pentathlon moderne": "modern pentathlon",
    "Équitation": "horseback riding",
    "Dressage": "dressage",
    "Saut d'obstacles": "show jumping",
    "Tir à l'arc": "archery",
    "Tir sportif": "shooting",
    "Golf": "golf",
    "Bowling": "bowling",
    
    # Sports extrêmes (Compétition)
    "Skateboard": "skateboarding",
    "Roller": "roller skating",
    "Escalade": "rock climbing",
    "Escalade sportive": "sport climbing",
    "Alpinisme": "mountaineering",
    "Parkour": "parkour",
    "Trail": "trail running",
    "Course d'orientation": "orienteering",
    "Triathlon": "triathlon",
    "Ironman": "ironman",
    "Duathlon": "duathlon",
    
    # Danse sportive (Compétition)
    "Danse sportive": "ballroom dancing",
    "Danse classique": "ballet",
    "Breakdance": "breakdancing",
    "Hip-hop": "hip hop dancing",
    "Danse contemporaine": "contemporary dance",
    
    # Sports mécaniques (avec effort physique)
    "Motocross": "motocross",
    "VTT descente": "downhill mountain biking",
    
    # Arts martiaux traditionnels
    "Tai chi": "tai chi",
    "Qi gong": "qigong",
    "Yoga": "yoga",
    "Pilates": "pilates",
    
    # Appareils de fitness
    "Tapis de course": "treadmill",
    "Vélo elliptique": "elliptical",
    "Rameur": "rowing machine",
    "Stepper": "stair climbing"
}


@profile_bp.route('/profile', methods=['GET'])
def get_profile():
    """Récupère les dernières données de santé de l'utilisateur"""
    # Récupérer l'user_id depuis les paramètres ou l'utilisateur connecté
    user_id = request.args.get('user_id', type=int) or (current_user.id if current_user.is_authenticated else None)
    
    if not user_id:
        return jsonify({"error": "user_id requis ou utilisateur non authentifié"}), 401
    
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


@profile_bp.route('/profile/health', methods=['POST'])
def update_health_data():
    """Met à jour ou ajoute les données de santé de l'utilisateur"""
    # Récupérer l'user_id depuis les paramètres, le body ou l'utilisateur connecté
    user_id = request.json.get('user_id') if request.json else None
    user_id = user_id or request.args.get('user_id', type=int) or (current_user.id if current_user.is_authenticated else None)
    
    if not user_id:
        return jsonify({"error": "user_id requis ou utilisateur non authentifié"}), 401
    
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


@profile_bp.route('/profile', methods=['PUT'])
def update_profile():
    """Met à jour les informations de base de l'utilisateur"""
    # Récupérer l'user_id depuis les paramètres, le body ou l'utilisateur connecté
    user_id = request.json.get('user_id') if request.json else None
    user_id = user_id or request.args.get('user_id', type=int) or (current_user.id if current_user.is_authenticated else None)
    
    if not user_id:
        return jsonify({"error": "user_id requis ou utilisateur non authentifié"}), 401
    
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


@profile_bp.route('/profile/history', methods=['GET'])
def get_health_history():
    """Récupère l'historique des données de santé"""
    # Récupérer l'user_id depuis les paramètres ou l'utilisateur connecté
    user_id = request.args.get('user_id', type=int) or (current_user.id if current_user.is_authenticated else None)
    
    if not user_id:
        return jsonify({"error": "user_id requis ou utilisateur non authentifié"}), 401
    
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


@profile_bp.route('/profile/calculate-calories', methods=['POST'])
def calculate_user_calories():
    """
    Calcule les calories brûlées pour un utilisateur en fonction de son activité.
    
    Body JSON:
        - activity (required): Nom de l'activité sportive
        - duration (required): Durée en minutes
        - use_profile_weight (optional): Si true, utilise le poids du profil utilisateur
        - weight (optional): Poids en kg (prioritaire sur use_profile_weight)
        - user_id (optional): ID de l'utilisateur (sinon utilise current_user)
    
    Returns:
        Calories brûlées avec toutes les informations de l'activité
    """
    # Récupérer l'user_id depuis les paramètres, le body ou l'utilisateur connecté
    user_id = request.json.get('user_id') if request.json else None
    user_id = user_id or request.args.get('user_id', type=int) or (current_user.id if current_user.is_authenticated else None)
    
    if not user_id:
        return jsonify({"error": "user_id requis ou utilisateur non authentifié"}), 401
    
    conn = None
    cursor = None
    try:
        data = request.json
        
        if not data or 'activity' not in data or 'duration' not in data:
            return jsonify({
                'error': 'Paramètres manquants',
                'message': 'Les paramètres "activity" et "duration" sont requis'
            }), 400
        
        activity = data['activity']
        duration = data['duration']
        weight_kg = data.get('weight')
        use_profile_weight = data.get('use_profile_weight', True)
        
        # Si pas de poids fourni et demande d'utiliser le poids du profil
        if not weight_kg and use_profile_weight:
            conn = mysql.connector.connect(**db_config)
            cursor = conn.cursor(dictionary=True)
            
            # Récupérer le dernier poids enregistré
            cursor.execute("""
                SELECT weight 
                FROM health_data 
                WHERE user_id = %s AND weight IS NOT NULL
                ORDER BY date DESC 
                LIMIT 1
            """, (user_id,))
            
            health_data = cursor.fetchone()
            if health_data and health_data.get('weight'):
                weight_kg = health_data['weight']
        
        if not weight_kg:
            return jsonify({
                'error': 'Poids non disponible',
                'message': 'Veuillez fournir un poids ou renseigner votre poids dans votre profil'
            }), 400
        
        # Appel à l'API Ninjas
        if not API_NINJAS_KEY:
            return jsonify({
                'error': 'API non configurée',
                'message': 'La clé API Ninjas n\'est pas configurée'
            }), 500
        
        # Convertir le poids de kg en livres (1 kg = 2.20462 lbs)
        weight_lbs = round(weight_kg * 2.20462, 1)
        
        params = {
            'activity': activity,
            'weight': weight_lbs,
            'duration': duration
        }
        
        headers = {'X-Api-Key': API_NINJAS_KEY}
        
        response = requests.get(
            f"{API_NINJAS_BASE_URL}/caloriesburned",
            headers=headers,
            params=params,
            timeout=10
        )
        
        if response.status_code == 200:
            results = response.json()
            
            if not results:
                return jsonify({
                    'success': False,
                    'message': f'Aucune activité trouvée pour "{activity}"'
                }), 404
            
            # Filtrer et trier les résultats pour trouver la meilleure correspondance
            # Priorité 1: correspondance exacte avec le nom de l'activité
            # Priorité 2: commence par l'activité recherchée
            # Priorité 3: le nom contient l'activité recherchée (mais pas dans une liste avec "or")
            # Priorité 4: autres résultats
            exact_match = []
            starts_with_match = []
            clean_contains = []
            or_contains = []
            other_results = []
            
            for result in results:
                result_name = result.get('name', '').lower()
                activity_lower = activity.lower()
                
                if result_name == activity_lower:
                    exact_match.append(result)
                elif result_name.startswith(activity_lower):
                    starts_with_match.append(result)
                elif activity_lower in result_name:
                    # Vérifier si c'est dans une énumération avec "or"
                    if ' or ' in result_name:
                        or_contains.append(result)
                    else:
                        clean_contains.append(result)
                else:
                    other_results.append(result)
            
            # Prendre le meilleur résultat en priorité
            sorted_results = exact_match + starts_with_match + clean_contains + or_contains + other_results
            
            # Enrichir avec les infos utilisateur
            enriched_results = []
            for result in sorted_results:
                enriched_result = result.copy()
                enriched_result['weight_kg'] = weight_kg
                enriched_result['user_id'] = user_id
                enriched_results.append(enriched_result)
            
            return jsonify({
                'success': True,
                'user_id': user_id,
                'weight_used_kg': weight_kg,
                'count': len(enriched_results),
                'results': enriched_results
            })
        else:
            return jsonify({
                'error': 'Erreur API',
                'status': response.status_code,
                'message': response.text
            }), response.status_code
    
    except requests.exceptions.RequestException as e:
        return jsonify({
            'error': 'Erreur de connexion API',
            'message': str(e)
        }), 500
    
    except Error as e:
        return jsonify({
            'error': 'Erreur base de données',
            'message': str(e)
        }), 500
    
    finally:
        if cursor:
            cursor.close()
        if conn and conn.is_connected():
            conn.close()


@profile_bp.route('/profile/activities', methods=['GET'])
def get_available_activities():
    """
    Récupère la liste de toutes les activités sportives disponibles en français.
    Endpoint pratique pour afficher une liste déroulante dans le frontend.
    
    Note: L'endpoint /caloriesburnedactivities de l'API Ninjas est premium,
    donc nous utilisons une liste prédéfinie d'activités courantes.
    Note: user_id n'est pas nécessaire pour cet endpoint (liste statique)
    """
    try:
        # Retourner les activités avec noms français et valeurs anglaises
        activities_list = [
            {'label': fr_name, 'value': en_name}
            for fr_name, en_name in sorted(ACTIVITIES_FR_TO_EN.items())
        ]
        
        return jsonify({
            'success': True,
            'count': len(activities_list),
            'activities': activities_list
        })
    
    except Exception as e:
        return jsonify({
            'error': 'Erreur',
            'message': str(e)
        }), 500
