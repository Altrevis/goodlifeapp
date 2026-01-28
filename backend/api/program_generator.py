from flask import Blueprint, jsonify, request
from flask_login import login_required
import requests
import json
import re
from .db_config import get_db_connection
from .profile import get_profile
# We'll use the locally defined function or import existing logic
# To avoid circular imports, lets query the DB directly for profile info like in app.py

program_gen_bp = Blueprint('program_gen', __name__)

# URL LM Studio (hardcoded for now as in app.py)
LM_STUDIO_URL = "http://10.37.7.211:1234/v1/chat/completions"

def get_user_data_internal(user_id):
    """Reuse logic to get user data for the prompt"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT * FROM users WHERE id = %s", (user_id,))
        user = cursor.fetchone()
        
        cursor.execute("SELECT * FROM health_data WHERE user_id = %s ORDER BY date DESC LIMIT 1", (user_id,))
        health = cursor.fetchone()
        
        cursor.close()
        conn.close()
        return user, health
    except Exception as e:
        print(f"Error fetching user data: {e}")
        return None, None

def clean_json_string(s):
    """Clean markdown code blocks from string to extract JSON"""
    # Remove ```json ... ``` or just ``` ... ```
    pattern = r"```(?:json)?\s*(.*?)\s*```"
    match = re.search(pattern, s, re.DOTALL)
    if match:
        return match.group(1)
    return s

@program_gen_bp.route('/api/generate-program', methods=['POST'])
# @login_required # Temporarily disabled for easier testing if needed, but should be enabled
def generate_program():
    data = request.json
    user_id = data.get('user_id')
    
    if not user_id:
        return jsonify({"error": "user_id required"}), 400

    user, health = get_user_data_internal(user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404

    # Build prompt
    prompt = f"""
    Agis comme un coach sportif et nutritionnel expert.
    Voici le profil de l'utilisateur :
    - Prénom: {user.get('first_name')}
    - Âge: {user.get('age')}
    - Genre: {user.get('gender')}
    """
    if health:
        prompt += f"""
        - Poids: {health.get('weight')} kg
        - Taille: {health.get('height')} cm
        - Activité: {health.get('steps', 0)} pas/jour
        """
    
    prompt += """
    Génère un programme quotidien complet et personnalisé pour AUJOURD'HUI.
    Ta réponse doit être UNIQUEMENT un objet JSON valide (pas de texte avant ou après).
    Le JSON doit suivre exactement cette structure :
    {
      "sport_tasks": [
        { "title": "...", "description": "...", "activity_type": "...", "target_duration_minutes": 30 }
      ],
      "nutrition_tasks": [
        { "title": "...", "description": "...", "recipe_name": "...", "target_calories": 500, "meal_type": "lunch" } 
        // meal_type peut être: breakfast, lunch, dinner, snack
      ],
      "sleep_tasks": [
        { "title": "...", "description": "...", "target_duration_hours": 8, "target_bedtime": "22:00", "target_waketime": "06:00" }
      ],
      "general_recommendation": "Un court texte d'encouragement résumant la journée."
    }
    """

    try:
        payload = {
            "model": "mistralai/ministral-3-3b",
            "messages": [
                {"role": "system", "content": "Tu es un assistant JSON strict. Tu ne réponds qu'avec du JSON valide."},
                {"role": "user", "content": prompt}
            ],
            "temperature": 0.7
        }

        # Call LM Studio
        response = requests.post(LM_STUDIO_URL, json=payload, headers={"Content-Type": "application/json"}, timeout=120)
        response_data = response.json()
        
        content = response_data['choices'][0]['message']['content']
        
        # Parse JSON
        cleaned_content = clean_json_string(content)
        program_data = json.loads(cleaned_content)
        
        # Save to DB
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Optional: Archive old active tasks for clarity? 
        # For now, let's just add new ones.
        
        # Insert Sport Tasks
        for task in program_data.get('sport_tasks', []):
            cursor.execute("""
                INSERT INTO tasks (user_id, task_type, title, description, activity_type, target_duration_minutes, is_active)
                VALUES (%s, 'sport', %s, %s, %s, %s, 1)
            """, (user_id, task.get('title'), task.get('description'), task.get('activity_type'), task.get('target_duration_minutes')))
            
        # Insert Nutrition Tasks
        for task in program_data.get('nutrition_tasks', []):
            cursor.execute("""
                INSERT INTO tasks (user_id, task_type, title, description, recipe_name, meal_type, target_calories, is_active)
                VALUES (%s, 'nutrition', %s, %s, %s, %s, %s, 1)
            """, (user_id, task.get('title'), task.get('description'), task.get('recipe_name'), task.get('meal_type'), task.get('target_calories')))

        # Insert Sleep Tasks
        for task in program_data.get('sleep_tasks', []):
            cursor.execute("""
                INSERT INTO tasks (user_id, task_type, title, description, target_duration_hours, target_bedtime, target_waketime, is_active)
                VALUES (%s, 'sleep', %s, %s, %s, %s, %s, 1)
            """, (user_id, task.get('title'), task.get('description'), task.get('target_duration_hours'), task.get('target_bedtime'), task.get('target_waketime')))

        conn.commit()
        cursor.close()
        conn.close()
        
        return jsonify({
            "success": True, 
            "message": "Programme généré avec succès",
            "details": program_data.get('general_recommendation')
        })

    except json.JSONDecodeError:
        print("Failed to decode JSON from LLM: ", content)
        return jsonify({"error": "Invalid JSON response from AI", "raw_content": content}), 500
    except Exception as e:
        print(f"Error generating program: {e}")
        return jsonify({"error": str(e)}), 500
