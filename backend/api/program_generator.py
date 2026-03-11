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
LM_STUDIO_URL = "http://10.37.6.153:1234/v1/chat/completions"

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
    Génère un programme complet et personnalisé. 
    Pour chaque tâche, tu DOIS définir un 'weekly_quota' (nombre de fois que cette action doit être faite par semaine, entre 1 et 7). 
    Si une action doit être faite tous les jours, quota=7. Si c'est 3 fois par semaine, quota=3.
    
    IMPORTANT pour les tâches nutritionnelles :
    Le champ 'meal_type' DOIT être l'une des valeurs exactes suivantes : 'breakfast', 'lunch', 'dinner', 'snack'.
    Ne mets PAS de texte français comme "déjeuner" ou "dîner" dans le champ 'meal_type'.
    
    Ta réponse doit être UNIQUEMENT un objet JSON valide (pas de texte avant ou après).
    Le JSON doit suivre exactement cette structure :
    {
      "sport_tasks": [
        { "title": "...", "description": "...", "activity_type": "...", "target_duration_minutes": 30, "weekly_quota": 3 }
      ],
      "nutrition_tasks": [
        { "title": "...", "description": "...", "recipe_name": "...", "target_calories": 500, "meal_type": "breakfast", "weekly_quota": 7 } 
      ],
      "sleep_tasks": [
        { "title": "...", "description": "...", "target_duration_hours": 8, "target_bedtime": "22:00", "target_waketime": "06:00", "weekly_quota": 7 }
      ],
      "general_recommendation": "Un court texte d'encouragement résumant la journée."
    }
    """

    try:
        payload = {
            "model": "mistralai/ministral-3-3b",
            "messages": [
                {"role": "system", "content": "Tu es un assistant JSON strict spécialisé UNIQUEMENT dans le sport, la nutrition et le bien-être. Tu ne réponds qu'avec du JSON valide. Tu respectes strictement les valeurs ENUM demandées : 'breakfast', 'lunch', 'dinner', 'snack' for meal_type."},
                {"role": "user", "content": prompt}
            ],
            "temperature": 0.4 # Reduced temperature for better adherence to JSON schema
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
        
        # Insert Sport Tasks
        for task in program_data.get('sport_tasks', []):
            cursor.execute("""
                INSERT INTO tasks (user_id, task_type, title, description, activity_type, target_duration_minutes, weekly_quota, is_active)
                VALUES (%s, 'sport', %s, %s, %s, %s, %s, 1)
            """, (user_id, task.get('title'), task.get('description'), task.get('activity_type'), task.get('target_duration_minutes'), task.get('weekly_quota', 7)))
            
        # Insert Nutrition Tasks
        allowed_meals = {'breakfast', 'lunch', 'dinner', 'snack'}
        for task in program_data.get('nutrition_tasks', []):
            # Valider meal_type pour éviter erreur SQL ENUM
            m_type = task.get('meal_type', 'snack').lower()
            if m_type not in allowed_meals:
                # Mapping basique si l'IA s'obstine en français
                if "petit-déjeuner" in m_type or "matin" in m_type: m_type = "breakfast"
                elif "déjeuner" in m_type or "midi" in m_type: m_type = "lunch"
                elif "dîner" in m_type or "soir" in m_type: m_type = "dinner"
                else: m_type = "snack"

            cursor.execute("""
                INSERT INTO tasks (user_id, task_type, title, description, recipe_name, meal_type, target_calories, weekly_quota, is_active)
                VALUES (%s, 'nutrition', %s, %s, %s, %s, %s, %s, 1)
            """, (user_id, task.get('title'), task.get('description'), task.get('recipe_name'), m_type, task.get('target_calories'), task.get('weekly_quota', 7)))

        # Insert Sleep Tasks
        for task in program_data.get('sleep_tasks', []):
            cursor.execute("""
                INSERT INTO tasks (user_id, task_type, title, description, target_duration_hours, target_bedtime, target_waketime, weekly_quota, is_active)
                VALUES (%s, 'sleep', %s, %s, %s, %s, %s, %s, 1)
            """, (user_id, task.get('title'), task.get('description'), task.get('target_duration_hours'), task.get('target_bedtime'), task.get('target_waketime'), task.get('weekly_quota', 7)))

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
