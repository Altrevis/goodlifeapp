from flask import Flask, jsonify, request
from flask_cors import CORS
from flask_login import LoginManager, login_required
from api.models import User
from api.main import main_bp, init_database
from api.users import users_bp
from api.nutrition import nutrition_bp
from api.sport import sport_bp
from api.body_ext import body_ext_bp
from api.sleep import sleep_bp
from api.auth import auth_bp
from api.profile import profile_bp
from api.calories_burned import calories_bp
from api.tasks import tasks_bp
from api.program_generator import program_gen_bp
from api.db_config import db_config, get_db_connection

import mysql.connector
from mysql.connector import Error
import requests

app = Flask(__name__)
CORS(app, supports_credentials=True)
app.secret_key = 'your_secret_key_here'  # Change this to a secure key

# ---------------------------------------------------------
# LM STUDIO / MESSAGES CONFIGURATION
# ---------------------------------------------------------

# URL для LM Studio API
LM_STUDIO_URL = "http://127.0.0.1:1234/v1/chat/completions"

def close_resources(cursor, connection):
    if cursor is not None:
        try:
            cursor.close()
        except Error:
            pass
    if connection is not None and connection.is_connected():
        connection.close()


def ensure_messages_table():
    """Crée/ajuste la table messages pour stocker l'historique du chat par utilisateur."""
    connection = None
    cursor = None
    try:
        connection = get_db_connection()
        connection.autocommit = True
        cursor = connection.cursor()
        cursor.execute(
            """
            CREATE TABLE IF NOT EXISTS messages (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NULL,
                role ENUM('user','assistant','system') NOT NULL,
                content TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                INDEX idx_user_id (user_id)
            ) ENGINE=InnoDB;
            """
        )
        # Si la table existe déjà sans colonne user_id, on tente de l'ajouter.
        try:
            cursor.execute("ALTER TABLE messages ADD COLUMN user_id INT NULL")
            cursor.execute("CREATE INDEX idx_messages_user_id ON messages(user_id)")
        except Exception:
            pass
    except Error as e:
        # Utilise le logger Flask si disponible
        try:
            from flask import current_app

            current_app.logger.error(f"Unable to ensure messages table: {e}")
        except Exception:
            # Fallback si current_app n'est pas disponible
            print(f"Unable to ensure messages table: {e}")
    finally:
        close_resources(cursor, connection)


login_manager = LoginManager()
login_manager.init_app(app)

@login_manager.user_loader
def load_user(user_id):
    try:
        conn = mysql.connector.connect(**db_config)
        cursor = conn.cursor(dictionary=True) # Toujours utiliser dictionary=True pour éviter les erreurs r['key']
        cursor.execute("SELECT id, email, first_name, last_name FROM users WHERE id = %s", (user_id,))
        user_data = cursor.fetchone()
        if user_data:
            return User(user_data['id'], user_data['email'], user_data['first_name'], user_data['last_name'])
    except Error as e:
        print(f"Error loading user: {e}")
    finally:
        if cursor: cursor.close()
        if conn and conn.is_connected(): conn.close()
    return None

# Register blueprints
app.register_blueprint(main_bp)
app.register_blueprint(users_bp)
app.register_blueprint(nutrition_bp)
app.register_blueprint(sport_bp)
app.register_blueprint(body_ext_bp)
app.register_blueprint(sleep_bp)
app.register_blueprint(profile_bp)
app.register_blueprint(calories_bp)
app.register_blueprint(tasks_bp, url_prefix="/api/tasks")
app.register_blueprint(program_gen_bp)
# Auth routes will now live under /api/user (e.g. /api/user/register, /api/user/login)
app.register_blueprint(auth_bp, url_prefix="/api/user")


# ---------------------------------------------------------
# LM STUDIO / CHAT ENDPOINTS
# ---------------------------------------------------------

@app.route("/messages", methods=["GET"])
def list_messages():
    """Retourne l'historique des messages filtré par utilisateur."""
    connection = None
    cursor = None
    try:
        user_id = request.args.get("user_id", type=int)
        if not user_id:
            return jsonify({"error": "user_id requis"}), 400

        connection = get_db_connection()
        cursor = connection.cursor(dictionary=True)
        cursor.execute(
            """
            SELECT id, user_id, role, content, created_at
            FROM messages
            WHERE user_id = %s
            ORDER BY id ASC;
            """,
            (user_id,),
        )
        return jsonify(cursor.fetchall())
    except Error as e:
        return jsonify({"error": str(e)}), 500
    finally:
        close_resources(cursor, connection)


@app.route("/messages", methods=["POST"])
def add_message():
    """Enregistre un message (user / assistant / system) dans la base pour un utilisateur."""
    payload = request.get_json(silent=True) or {}
    role = payload.get("role")
    content = payload.get("content")
    user_id = payload.get("user_id")

    if role not in {"user", "assistant", "system"} or not content or not user_id:
        return jsonify({"error": "Invalid payload"}), 400

    connection = None
    cursor = None
    try:
        connection = get_db_connection()
        cursor = connection.cursor()
        cursor.execute(
            "INSERT INTO messages (user_id, role, content) VALUES (%s, %s, %s);",
            (user_id, role, content),
        )
        connection.commit()
        return jsonify({"status": "saved"}), 201
    except Error as e:
        if connection is not None:
            connection.rollback()
        return jsonify({"error": str(e)}), 500
    finally:
        close_resources(cursor, connection)


def get_user_health_data(user_id):
    """Récupère les données de santé de l'utilisateur depuis la base de données."""
    connection = None
    cursor = None
    try:
        connection = get_db_connection()
        cursor = connection.cursor(dictionary=True)
        
        # Récupérer les informations de base de l'utilisateur
        cursor.execute("""
            SELECT id, first_name, last_name, email, age, gender 
            FROM users 
            WHERE id = %s
        """, (user_id,))
        user = cursor.fetchone()
        
        if not user:
            return None
        
        # Récupérer les dernières données de santé
        cursor.execute("""
            SELECT date, weight, height, heart_rate, sleep_hours, calories_burned, steps 
            FROM health_data 
            WHERE user_id = %s 
            ORDER BY date DESC 
            LIMIT 1
        """, (user_id,))
        health_data = cursor.fetchone()
        
        return {
            "user": user,
            "health_data": health_data if health_data else {}
        }
    except Error as e:
        print(f"Error fetching user health data: {e}")
        return None
    finally:
        close_resources(cursor, connection)


def has_system_message_with_data(user_id):
    """Vérifie si un message système avec les données utilisateur existe déjà."""
    connection = None
    cursor = None
    try:
        connection = get_db_connection()
        cursor = connection.cursor(dictionary=True)
        cursor.execute("""
            SELECT COUNT(*) as count
            FROM messages
            WHERE user_id = %s AND role = 'system' 
            AND content LIKE %s
        """, (user_id, "%J'ai bien récupéré vos données%"))
        result = cursor.fetchone()
        return result and result['count'] > 0
    except Error as e:
        print(f"Error checking system message: {e}")
        return False
    finally:
        close_resources(cursor, connection)


def consolidate_messages(messages):
    """
    Garde uniquement le dernier message système, tronque l'historique à 10 échanges
    et s'assure que les rôles alternent entre 'user' et 'assistant'.
    """
    if not messages:
        return []

    # 1. Ne garder que le dernier message système (le plus récent/à jour)
    system_messages = [m for m in messages if m.get("role") == "system"]
    other_messages = [m for m in messages if m.get("role") != "system"]

    # 2. Filtrer les messages vides ou placeholder
    other_messages = [
        m for m in other_messages
        if m.get("content", "").strip() and m.get("content") != "(pas de réponse)"
    ]

    # 3. Limiter l'historique aux 20 derniers messages (10 échanges) pour éviter de dépasser le contexte
    other_messages = other_messages[-20:]

    # 4. Alterner les rôles (fusionner les messages consécutifs du même rôle)
    consolidated_other = []
    current_role = None
    for msg in other_messages:
        role = msg.get("role")
        content = msg.get("content", "")
        if role == current_role:
            consolidated_other[-1]["content"] += "\n" + content
        else:
            consolidated_other.append({"role": role, "content": content})
            current_role = role

    # 5. S'assurer que le premier message après system est 'user'
    while consolidated_other and consolidated_other[0].get("role") != "user":
        consolidated_other.pop(0)

    consolidated = []
    if system_messages:
        # Utiliser uniquement le dernier message système
        consolidated.append({
            "role": "system",
            "content": system_messages[-1].get("content", "")
        })
    consolidated.extend(consolidated_other)

    return consolidated


@app.route("/api/chat", methods=["POST"])
def proxy_chat():
    """
    Proxy pour les requêtes vers l'API LM Studio, afin d'éviter les problèmes CORS
    côté front-end. Récupère automatiquement les données utilisateur et les inclut dans le contexte.
    """
    try:
        payload = request.get_json()
        if not payload:
            return jsonify({"error": "No payload provided"}), 400

        user_id = payload.get("user_id")
        messages = payload.get("messages", [])
        
        # Si un user_id est fourni, récupérer les données utilisateur
        if user_id:
            user_data = get_user_health_data(user_id)
            
            if user_data:
                # Construire le message système avec les données utilisateur
                user_info = user_data["user"]
                health_info = user_data["health_data"]
                
                system_content_parts = [
                    "Vous êtes un assistant santé et bien-être personnalisé spécialisé UNIQUEMENT dans les domaines suivants :",
                    "- Sport et activité physique (exercices, programmes d'entraînement, conseils sportifs)",
                    "- Nutrition et alimentation (recettes, diététique, conseils nutritionnels)",
                    "- Bien-être et santé (sommeil, stress, récupération, habitudes de vie saines)",
                    "- Suivi des données de santé (poids, calories, fréquence cardiaque, etc.)",
                    "",
                    "RÈGLES STRICTES À RESPECTER :",
                    "1. Vous NE DEVEZ RÉPONDRE qu'aux questions liées au sport, à la nutrition et au bien-être.",
                    "2. Si une question concerne des sujets hors de votre domaine (dates historiques, géographie, géopolitique, culture générale, mathématiques, programmation, etc.), vous DEVEZ répondre : 'Je suis désolé, mais je suis spécialisé uniquement dans les domaines du sport, de la nutrition et du bien-être. Je ne peux pas répondre à cette question. Comment puis-je vous aider pour votre santé ou votre activité physique ?'",
                    "3. Restez toujours dans le contexte du bien-être et de la santé de l'utilisateur.",
                    "",
                    "Voici les données de l'utilisateur :"
                ]
                
                if user_info.get("first_name"):
                    system_content_parts.append(f"Prénom: {user_info['first_name']}")
                if user_info.get("last_name"):
                    system_content_parts.append(f"Nom: {user_info['last_name']}")
                if user_info.get("age"):
                    system_content_parts.append(f"Âge: {user_info['age']} ans")
                if user_info.get("gender"):
                    system_content_parts.append(f"Genre: {user_info['gender']}")
                
                weight_value = None
                if health_info:
                    if health_info.get("weight"):
                        weight_value = health_info['weight']
                        system_content_parts.append(f"Poids: {weight_value} kg")
                    if health_info.get("height"):
                        system_content_parts.append(f"Taille: {health_info['height']} cm")
                    if health_info.get("heart_rate"):
                        system_content_parts.append(f"Fréquence cardiaque: {health_info['heart_rate']} bpm")
                    if health_info.get("sleep_hours"):
                        system_content_parts.append(f"Heures de sommeil (Moyenne 7 jours): {health_info['sleep_hours']} h")
                    if health_info.get("steps"):
                        system_content_parts.append(f"Pas: {health_info['steps']}")
                    if health_info.get("calories_burned"):
                        system_content_parts.append(f"Calories brûlées: {health_info['calories_burned']} kcal")
                
                # Construire la ligne de confirmation dynamiquement selon les données dispos
                confirm_parts = []
                if weight_value:
                    confirm_parts.append(f"poids: {weight_value} kg")
                if health_info.get("sleep_hours"):
                    confirm_parts.append(f"sommeil moyen: {health_info['sleep_hours']} h")
                if health_info.get("steps"):
                    confirm_parts.append(f"pas: {health_info['steps']}")
                
                if not confirm_parts:
                    system_content_parts.append("\nINSTRUCTION: Invitez l'utilisateur à remplir son profil.")
                
                import time
                system_message = "\n".join(system_content_parts) + f"\n\n[Context Timestamp: {time.time()}]"
                print(f"DEBUG - System Message for User {user_id} (Sleep: {health_info.get('sleep_hours')})")
                
                # S'assurer que le premier message est le message système mis à jour
                is_first_conversation = not has_system_message_with_data(user_id)
                
                if not (messages and messages[0].get("role") == "system"):
                    messages.insert(0, {
                        "role": "system",
                        "content": system_message
                    })
                else:
                    messages[0] = {
                        "role": "system",
                        "content": system_message
                    }
                
                if is_first_conversation:
                    try:
                        connection = get_db_connection()
                        cursor = connection.cursor()
                        cursor.execute(
                            "INSERT INTO messages (user_id, role, content) VALUES (%s, %s, %s);",
                            (user_id, "system", system_message),
                        )
                        connection.commit()
                    except Error as e:
                        print(f"Error saving system message: {e}")
                    finally:
                        close_resources(cursor, connection)
                
        # --- FIX: Consolider les messages pour assurer l'alternance des rôles ---
        payload["messages"] = consolidate_messages(messages)

        # Limiter la longueur de réponse si non défini (accélère la génération)
        if "max_tokens" not in payload:
            payload["max_tokens"] = 512

        # Transfert de la requête vers LM Studio
        response = requests.post(
            LM_STUDIO_URL,
            json=payload,
            headers={"Content-Type": "application/json"},
            timeout=180,
        )

        if response.status_code == 200:
            return jsonify(response.json()), 200
        else:
            return (
                jsonify(
                    {
                        "error": f"LM Studio error: {response.status_code}",
                        "details": response.text,
                    }
                ),
                response.status_code,
            )

    except requests.exceptions.Timeout:
        return jsonify({"error": "Request timeout - LM Studio ne répond pas"}), 504
    except requests.exceptions.ConnectionError:
        return jsonify(
            {"error": "Connection error - impossible de se connecter à LM Studio"}
        ), 503
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# ---------------------------------------------------------
# SERVER LAUNCH
# ---------------------------------------------------------
if __name__ == '__main__':
    # S'assure que la table messages existe pour le chat
    ensure_messages_table()
    init_database()
    app.run(debug=True)
