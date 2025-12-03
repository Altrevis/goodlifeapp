from flask import Blueprint, jsonify
import requests

sport_bp = Blueprint('sport', __name__)

# ---------------------------------------------------------
# API SPORT - Routines (wger)
# ---------------------------------------------------------
@sport_bp.route('/api/sport/routines', methods=['GET'])
def get_sport_routines():
    try:
        url = "https://wger.de/api/v2/routine/"
        headers = {
            "Authorization": "Token 1f9e15dbc95fef539836822396af7b72aa05b5fe"
        }

        r = requests.get(url, headers=headers, timeout=10)

        if r.status_code != 200:
            return jsonify({"error": "Erreur API WGER", "status": r.status_code}), r.status_code

        return jsonify(r.json())

    except requests.exceptions.RequestException as e:
        return jsonify({"error": f"Connexion impossible : {str(e)}"}), 500


# ---------------------------------------------------------
# API SPORT - Exercices (wger - SANS authentification)
# ---------------------------------------------------------
@sport_bp.route('/api/sport/exercises', methods=['GET'])
def get_sport_exercises():
    try:
        url = "https://wger.de/api/v2/exercise/"
        r = requests.get(url, timeout=10)

        if r.status_code != 200:
            return jsonify({"error": "Erreur wger", "status": r.status_code}), r.status_code

        return jsonify(r.json())

    except Exception as e:
        return jsonify({"error": str(e)}), 500
