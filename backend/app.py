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
LM_STUDIO_URL = "http://10.37.7.211:1234/v1/chat/completions"

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
        cursor = conn.cursor(dictionary=True)
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
# Auth routes will now live under /auth (e.g. /auth/register, /auth/login)
app.register_blueprint(auth_bp, url_prefix="/auth")


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
            AND content LIKE '%J\'ai bien récupéré vos données%'
        """, (user_id,))
        result = cursor.fetchone()
        return result and result['count'] > 0
    except Error as e:
        print(f"Error checking system message: {e}")
        return False
    finally:
        close_resources(cursor, connection)


def consolidate_messages(messages):
    """
    S'assure que les rôles alternent entre 'user' et 'assistant' après le message système.
    Fusionne les messages consécutifs du même rôle.
    """
    if not messages:
        return []
    
    consolidated = []
    
    # 1. Gérer les messages système (on les garde au début)
    system_messages = [m for m in messages if m.get("role") == "system"]
    other_messages = [m for m in messages if m.get("role") != "system"]
    
    if system_messages:
        consolidated.append({
            "role": "system",
            "content": "\n".join([m.get("content", "") for m in system_messages])
        })
    
    if not other_messages:
        return consolidated
        
    # 2. Alterner les messages restants
    current_role = None
    for msg in other_messages:
        role = msg.get("role")
        content = msg.get("content", "")
        
        if role == current_role:
            # Fusionner avec le précédent
            consolidated[-1]["content"] += "\n" + content
        else:
            consolidated.append({"role": role, "content": content})
            current_role = role
            
    # 3. Certains modèles (Mistral) exigent que le premier message après 'system' soit 'user'
    # Si le premier message consolidé après le système est un assistant, on peut soit le supprimer,
    # soit le fusionner dans le système, ou simplement espérer que le modèle l'accepte 
    # une fois consolidé. Ici, on s'assure au moins de l'alternance.
    
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
                    "Vous êtes un assistant santé personnalisé. Voici les données de l'utilisateur :"
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
                        system_content_parts.append(f"Heures de sommeil: {health_info['sleep_hours']} h")
                    if health_info.get("steps"):
                        system_content_parts.append(f"Pas: {health_info['steps']}")
                    if health_info.get("calories_burned"):
                        system_content_parts.append(f"Calories brûlées: {health_info['calories_burned']} kcal")
                
                if weight_value:
                    system_content_parts.append(f"\nINSTRUCTION IMPORTANTE: Lorsque l'utilisateur vous salue ou commence une conversation, vous DEVEZ TOUJOURS commencer votre réponse par confirmer que vous avez bien récupéré ses données en mentionnant son poids. Répondez exactement dans ce format: 'J'ai bien récupéré vos données ({weight_value} kg).' Ensuite, vous pouvez continuer normalement la conversation.")
                else:
                    system_content_parts.append("\nINSTRUCTION IMPORTANTE: Lorsque l'utilisateur vous salue ou commence une conversation, vous DEVEZ TOUJOURS commencer votre réponse par confirmer que vous avez bien récupéré ses données.")
                
                system_message = "\n".join(system_content_parts)
                
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

        # Transfert de la requête vers LM Studio
        response = requests.post(
            LM_STUDIO_URL,
            json=payload,
            headers={"Content-Type": "application/json"},
            timeout=60,
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
