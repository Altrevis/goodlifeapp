from flask import Blueprint, jsonify, request
from flask_login import login_user, logout_user, login_required
import bcrypt
import re
from mysql.connector import Error
from .models import User
from .db_config import get_db_connection

auth_bp = Blueprint('auth', __name__)


def is_valid_email(email: str) -> bool:
    pattern = r"^[\w\.-]+@[\w\.-]+\.\w+$"
    return bool(re.match(pattern, email))


@auth_bp.route("/register", methods=["POST"])
def register():
    """
    Endpoint d'inscription d'utilisateur.

    URL finale appelée depuis le front : /api/user/register
    (car ce blueprint est enregistré avec le préfixe /api/user).
    """
    data = request.get_json(silent=True) or {}

    email = data.get("email", "").strip()
    password = data.get("password", "")
    first_name = data.get("first_name", "").strip()
    last_name = data.get("last_name", "").strip()

    if not email or not password:
        return jsonify({"error": "Email et mot de passe sont obligatoires."}), 400

    if not is_valid_email(email):
        return jsonify({"error": "Format d'email invalide."}), 400

    if len(password) < 6:
        return jsonify({"error": "Le mot de passe doit contenir au moins 6 caractères."}), 400

    conn = None
    cursor = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)

        # Vérifie si l'email existe déjà
        cursor.execute("SELECT id FROM users WHERE email = %s", (email,))
        if cursor.fetchone():
            return jsonify({"error": "Un utilisateur avec cet email existe déjà."}), 409

        # Hash du mot de passe
        hashed_password = bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt())

        # Insertion de l'utilisateur
        cursor.execute(
            """
            INSERT INTO users (email, password, first_name, last_name)
            VALUES (%s, %s, %s, %s)
            """,
            (email, hashed_password.decode("utf-8"), first_name, last_name),
        )
        conn.commit()

        new_user_id = cursor.lastrowid

        # Création de l'objet User pour Flask-Login
        user = User(new_user_id, email, first_name, last_name)
        login_user(user)

        # On renvoie un objet { "user": { ... } } pour correspondre au front
        return (
            jsonify(
                {
                    "user": {
                        "id": new_user_id,
                        "email": email,
                        "first_name": first_name,
                        "last_name": last_name,
                    }
                }
            ),
            201,
        )

    except Error as e:
        if conn:
            conn.rollback()
        return jsonify({"error": str(e)}), 500

    finally:
        if cursor:
            cursor.close()
        if conn and conn.is_connected():
            conn.close()


@auth_bp.route("/login", methods=["POST"])
def login():
    """
    Endpoint de connexion utilisateur.
    """
    data = request.get_json(silent=True) or {}
    email = data.get("email", "").strip()
    password = data.get("password", "")

    if not email or not password:
        return jsonify({"error": "Email et mot de passe sont obligatoires."}), 400

    conn = None
    cursor = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute(
            "SELECT id, email, first_name, last_name, password FROM users WHERE email = %s",
            (email,),
        )
        user_row = cursor.fetchone()

        if not user_row:
            return jsonify({"error": "Identifiants invalides."}), 401

        stored_hash = user_row["password"].encode("utf-8")
        if not bcrypt.checkpw(password.encode("utf-8"), stored_hash):
            return jsonify({"error": "Identifiants invalides."}), 401

        user = User(
            user_row["id"],
            user_row["email"],
            user_row.get("first_name"),
            user_row.get("last_name"),
        )
        login_user(user)

        # Même structure de réponse que pour /register
        return jsonify(
            {
                "user": {
                    "id": user_row["id"],
                    "email": user_row["email"],
                    "first_name": user_row.get("first_name"),
                    "last_name": user_row.get("last_name"),
                }
            }
        )

    except Error as e:
        return jsonify({"error": str(e)}), 500

    finally:
        if cursor:
            cursor.close()
        if conn and conn.is_connected():
            conn.close()


@auth_bp.route("/logout", methods=["POST"])
@login_required
def logout():
    """
    Déconnexion de l'utilisateur courant.
    """
    logout_user()
    return jsonify({"message": "Déconnecté avec succès."}), 200
