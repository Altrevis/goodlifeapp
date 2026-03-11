"""
API pour la gestion des todolists (Sport, Nutrition, Sommeil)
"""
from flask import Blueprint, jsonify, request
from flask_login import login_required, current_user
from .db_config import get_db_connection
from datetime import datetime, date

tasks_bp = Blueprint('tasks', __name__)

# ==================== SPORT TASKS ====================

@tasks_bp.route('/sport/tasks', methods=['GET'])
def get_sport_tasks():
    """Récupérer toutes les tâches sportives actives"""
    try:
        user_id = request.args.get('user_id', type=int) or (current_user.id if current_user.is_authenticated else None)
        if not user_id:
            return jsonify({"success": False, "error": "User ID required"}), 401
            
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        
        cursor.execute("""
            SELECT t.*, 
                   (SELECT COUNT(*) FROM task_completions tc 
                    WHERE tc.task_id = t.id 
                    AND tc.completion_date >= DATE_SUB(CURDATE(), INTERVAL WEEKDAY(CURDATE()) DAY)
                   ) as weekly_completions
            FROM tasks t
            WHERE t.user_id = %s AND t.task_type = 'sport' AND t.is_active = 1
            ORDER BY t.created_at DESC
        """, (user_id,))
        
        tasks = cursor.fetchall()
        cursor.close()
        conn.close()
        
        return jsonify({"success": True, "tasks": tasks}), 200
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


@tasks_bp.route('/sport/tasks', methods=['POST'])
def create_sport_task():
    """Créer une nouvelle tâche sportive"""
    try:
        data = request.get_json()
        user_id = data.get('user_id') or (current_user.id if current_user.is_authenticated else None)
        if not user_id:
            return jsonify({"success": False, "error": "User ID required"}), 401
        
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute("""
            INSERT INTO tasks 
            (user_id, task_type, title, description, activity_type, target_duration_minutes, target_reps, weekly_quota)
            VALUES (%s, 'sport', %s, %s, %s, %s, %s, %s)
        """, (
            user_id,
            data.get('title'),
            data.get('description'),
            data.get('activity_type'),
            data.get('target_duration_minutes'),
            data.get('target_reps'),
            data.get('weekly_quota', 7)
        ))
        
        conn.commit()
        task_id = cursor.lastrowid
        cursor.close()
        conn.close()
        
        return jsonify({"success": True, "task_id": task_id}), 201
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


@tasks_bp.route('/sport/tasks/<int:task_id>', methods=['PUT'])
def update_sport_task(task_id):
    """Mettre à jour une tâche sportive"""
    try:
        data = request.get_json()
        user_id = data.get('user_id') or request.args.get('user_id', type=int) or (current_user.id if current_user.is_authenticated else None)
        if not user_id:
            return jsonify({"success": False, "error": "User ID required"}), 401

        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute("""
            UPDATE tasks 
            SET title = %s, description = %s, activity_type = %s, 
                target_duration_minutes = %s, target_reps = %s, weekly_quota = %s
            WHERE id = %s AND user_id = %s AND task_type = 'sport'
        """, (
            data.get('title'),
            data.get('description'),
            data.get('activity_type'),
            data.get('target_duration_minutes'),
            data.get('target_reps'),
            data.get('weekly_quota', 7),
            task_id,
            user_id
        ))
        
        conn.commit()
        cursor.close()
        conn.close()
        
        return jsonify({"success": True}), 200
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


@tasks_bp.route('/sport/tasks/<int:task_id>', methods=['DELETE'])
def delete_sport_task(task_id):
    """Supprimer (archiver) une tâche sportive"""
    try:
        user_id = request.args.get('user_id', type=int) or (current_user.id if current_user.is_authenticated else None)
        if not user_id:
            return jsonify({"success": False, "error": "User ID required"}), 401

        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute("""
            UPDATE tasks 
            SET is_active = 0
            WHERE id = %s AND user_id = %s AND task_type = 'sport'
        """, (task_id, user_id))
        
        conn.commit()
        cursor.close()
        conn.close()
        
        return jsonify({"success": True}), 200
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


# ==================== NUTRITION TASKS ====================

@tasks_bp.route('/nutrition/tasks', methods=['GET'])
def get_nutrition_tasks():
    """Récupérer toutes les tâches nutritionnelles actives"""
    try:
        user_id = request.args.get('user_id', type=int) or (current_user.id if current_user.is_authenticated else None)
        if not user_id:
            return jsonify({"success": False, "error": "User ID required"}), 401

        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        
        cursor.execute("""
            SELECT t.*, 
                   (SELECT COUNT(*) FROM task_completions tc 
                    WHERE tc.task_id = t.id 
                    AND tc.completion_date >= DATE_SUB(CURDATE(), INTERVAL WEEKDAY(CURDATE()) DAY)
                   ) as weekly_completions
            FROM tasks t
            WHERE t.user_id = %s AND t.task_type = 'nutrition' AND t.is_active = 1
            ORDER BY t.created_at DESC
        """, (user_id,))
        
        tasks = cursor.fetchall()
        cursor.close()
        conn.close()
        
        return jsonify({"success": True, "tasks": tasks}), 200
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


@tasks_bp.route('/nutrition/tasks', methods=['POST'])
def create_nutrition_task():
    """Créer une nouvelle tâche nutritionnelle"""
    try:
        data = request.get_json()
        user_id = data.get('user_id') or (current_user.id if current_user.is_authenticated else None)
        if not user_id:
            return jsonify({"success": False, "error": "User ID required"}), 401
        
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute("""
            INSERT INTO tasks 
            (user_id, task_type, title, description, recipe_name, meal_type, target_calories, ingredients, weekly_quota)
            VALUES (%s, 'nutrition', %s, %s, %s, %s, %s, %s, %s)
        """, (
            user_id,
            data.get('title'),
            data.get('description'),
            data.get('recipe_name'),
            data.get('meal_type'),
            data.get('target_calories'),
            data.get('ingredients'),
            data.get('weekly_quota', 7)
        ))
        
        conn.commit()
        task_id = cursor.lastrowid
        cursor.close()
        conn.close()
        
        return jsonify({"success": True, "task_id": task_id}), 201
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


@tasks_bp.route('/nutrition/tasks/<int:task_id>', methods=['PUT'])
def update_nutrition_task(task_id):
    """Mettre à jour une tâche nutritionnelle"""
    try:
        data = request.get_json()
        user_id = data.get('user_id') or request.args.get('user_id', type=int) or (current_user.id if current_user.is_authenticated else None)
        if not user_id:
            return jsonify({"success": False, "error": "User ID required"}), 401

        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute("""
            UPDATE tasks 
            SET title = %s, description = %s, recipe_name = %s, 
                meal_type = %s, target_calories = %s, ingredients = %s, weekly_quota = %s
            WHERE id = %s AND user_id = %s AND task_type = 'nutrition'
        """, (
            data.get('title'),
            data.get('description'),
            data.get('recipe_name'),
            data.get('meal_type'),
            data.get('target_calories'),
            data.get('ingredients'),
            data.get('weekly_quota', 7),
            task_id,
            user_id
        ))
        
        conn.commit()
        cursor.close()
        conn.close()
        
        return jsonify({"success": True}), 200
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


@tasks_bp.route('/nutrition/tasks/<int:task_id>', methods=['DELETE'])
def delete_nutrition_task(task_id):
    """Supprimer (archiver) une tâche nutritionnelle"""
    try:
        user_id = request.args.get('user_id', type=int) or (current_user.id if current_user.is_authenticated else None)
        if not user_id:
            return jsonify({"success": False, "error": "User ID required"}), 401

        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute("""
            UPDATE tasks 
            SET is_active = 0
            WHERE id = %s AND user_id = %s AND task_type = 'nutrition'
        """, (task_id, user_id))
        
        conn.commit()
        cursor.close()
        conn.close()
        
        return jsonify({"success": True}), 200
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


# ==================== SLEEP TASKS ====================

@tasks_bp.route('/sleep/tasks', methods=['GET'])
def get_sleep_tasks():
    """Récupérer toutes les tâches de sommeil actives"""
    try:
        user_id = request.args.get('user_id', type=int) or (current_user.id if current_user.is_authenticated else None)
        if not user_id:
            return jsonify({"success": False, "error": "User ID required"}), 401

        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        
        cursor.execute("""
            SELECT t.*, 
                   (SELECT COUNT(*) FROM task_completions tc 
                    WHERE tc.task_id = t.id 
                    AND tc.completion_date >= DATE_SUB(CURDATE(), INTERVAL WEEKDAY(CURDATE()) DAY)
                   ) as weekly_completions
            FROM tasks t
            WHERE t.user_id = %s AND t.task_type = 'sleep' AND t.is_active = 1
            ORDER BY t.created_at DESC
        """, (user_id,))
        
        tasks = cursor.fetchall()
        
        from datetime import timedelta
        for task in tasks:
            for key, value in list(task.items()):
                if isinstance(value, timedelta):
                    task[key] = str(value)
                    
        cursor.close()
        conn.close()
        
        return jsonify({"success": True, "tasks": tasks}), 200
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


@tasks_bp.route('/sleep/tasks', methods=['POST'])
def create_sleep_task():
    """Créer une nouvelle tâche de sommeil"""
    try:
        data = request.get_json()
        user_id = data.get('user_id') or (current_user.id if current_user.is_authenticated else None)
        if not user_id:
            return jsonify({"success": False, "error": "User ID required"}), 401
        
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute("""
            INSERT INTO tasks 
            (user_id, task_type, title, description, target_duration_hours, target_bedtime, target_waketime, weekly_quota)
            VALUES (%s, 'sleep', %s, %s, %s, %s, %s, %s)
        """, (
            user_id,
            data.get('title'),
            data.get('description'),
            data.get('target_duration_hours'),
            data.get('target_bedtime'),
            data.get('target_waketime'),
            data.get('weekly_quota', 7)
        ))
        
        conn.commit()
        task_id = cursor.lastrowid
        cursor.close()
        conn.close()
        
        return jsonify({"success": True, "task_id": task_id}), 201
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


@tasks_bp.route('/sleep/tasks/<int:task_id>', methods=['PUT'])
def update_sleep_task(task_id):
    """Mettre à jour une tâche de sommeil"""
    try:
        data = request.get_json()
        user_id = data.get('user_id') or request.args.get('user_id', type=int) or (current_user.id if current_user.is_authenticated else None)
        if not user_id:
            return jsonify({"success": False, "error": "User ID required"}), 401

        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute("""
            UPDATE tasks 
            SET title = %s, description = %s, target_duration_hours = %s,
                target_bedtime = %s, target_waketime = %s, weekly_quota = %s
            WHERE id = %s AND user_id = %s AND task_type = 'sleep'
        """, (
            data.get('title'),
            data.get('description'),
            data.get('target_duration_hours'),
            data.get('target_bedtime'),
            data.get('target_waketime'),
            data.get('weekly_quota', 7),
            task_id,
            user_id
        ))
        
        conn.commit()
        cursor.close()
        conn.close()
        
        return jsonify({"success": True}), 200
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


@tasks_bp.route('/sleep/tasks/<int:task_id>', methods=['DELETE'])
def delete_sleep_task(task_id):
    """Supprimer (archiver) une tâche de sommeil"""
    try:
        user_id = request.args.get('user_id', type=int) or (current_user.id if current_user.is_authenticated else None)
        if not user_id:
            return jsonify({"success": False, "error": "User ID required"}), 401

        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute("""
            UPDATE tasks 
            SET is_active = 0
            WHERE id = %s AND user_id = %s AND task_type = 'sleep'
        """, (task_id, user_id))
        
        conn.commit()
        cursor.close()
        conn.close()
        
        return jsonify({"success": True}), 200
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


# ==================== TASK COMPLETIONS ====================

@tasks_bp.route('/completions', methods=['POST'])
def complete_task():
    """Marquer une tâche comme terminée avec le temps passé"""
    try:
        data = request.get_json()
        user_id = data.get('user_id') or (current_user.id if current_user.is_authenticated else None)
        if not user_id:
            return jsonify({"success": False, "error": "User ID required"}), 401

        task_type = data.get('task_type')  # 'sport', 'nutrition', 'sleep'
        task_id = data.get('task_id')
        duration_minutes = data.get('duration_minutes')
        quality_rating = data.get('quality_rating')
        actual_value = data.get('actual_value')
        notes = data.get('notes', '')
        completion_date = data.get('completion_date', date.today().isoformat())
        
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Enregistrer la completion
        cursor.execute("""
            INSERT INTO task_completions 
            (user_id, task_type, task_id, completion_date, duration_minutes, 
             notes, quality_rating, actual_value)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
        """, (
            user_id,
            task_type,
            task_id,
            completion_date,
            duration_minutes,
            notes,
            quality_rating,
            actual_value
        ))
        
        # Mettre à jour le progrès quotidien
        cursor.execute("""
            INSERT INTO daily_progress 
            (user_id, date, sport_tasks_completed, sport_total_duration,
             nutrition_tasks_completed, sleep_tasks_completed, sleep_duration_hours)
            VALUES (%s, %s, 0, 0, 0, 0, 0)
            ON DUPLICATE KEY UPDATE
                sport_tasks_completed = sport_tasks_completed + IF(%s = 'sport', 1, 0),
                sport_total_duration = sport_total_duration + IF(%s = 'sport', %s, 0),
                nutrition_tasks_completed = nutrition_tasks_completed + IF(%s = 'nutrition', 1, 0),
                sleep_tasks_completed = sleep_tasks_completed + IF(%s = 'sleep', 1, 0),
                sleep_duration_hours = IF(%s = 'sleep' AND %s IS NOT NULL, %s, sleep_duration_hours)
        """, (
            user_id,
            completion_date,
            task_type,
            task_type,
            duration_minutes or 0,
            task_type,
            task_type,
            task_type,
            actual_value,
            actual_value or 0
        ))
        
        conn.commit()
        completion_id = cursor.lastrowid
        cursor.close()
        conn.close()
        
        return jsonify({"success": True, "completion_id": completion_id}), 201
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


@tasks_bp.route('/completions/<task_type>', methods=['GET'])
def get_task_completions(task_type):
    """Récupérer l'historique des complétions pour un type de tâche"""
    try:
        user_id = request.args.get('user_id', type=int) or (current_user.id if current_user.is_authenticated else None)
        if not user_id:
            return jsonify({"success": False, "error": "User ID required"}), 401

        days = request.args.get('days', 30, type=int)
        
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        
        cursor.execute("""
            SELECT tc.*, 
                   t.title as task_title
            FROM task_completions tc
            LEFT JOIN tasks t ON tc.task_id = t.id
            WHERE tc.user_id = %s AND tc.task_type = %s
                  AND tc.completion_date >= DATE_SUB(CURDATE(), INTERVAL %s DAY)
            ORDER BY tc.completion_date DESC, tc.completed_at DESC
        """, (user_id, task_type, days))
        
        completions = cursor.fetchall()
        cursor.close()
        conn.close()
        
        return jsonify({"success": True, "completions": completions}), 200
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


# ==================== DAILY PROGRESS & EVOLUTION ====================

@tasks_bp.route('/progress/daily', methods=['GET'])
def get_daily_progress():
    """Récupérer le progrès quotidien"""
    try:
        user_id = request.args.get('user_id', type=int) or (current_user.id if current_user.is_authenticated else None)
        if not user_id:
            return jsonify({"success": False, "error": "User ID required"}), 401

        days = request.args.get('days', 30, type=int)
        
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        
        cursor.execute("""
            SELECT * FROM daily_progress 
            WHERE user_id = %s 
                  AND date >= DATE_SUB(CURDATE(), INTERVAL %s DAY)
            ORDER BY date ASC
        """, (user_id, days))
        
        progress = cursor.fetchall()
        cursor.close()
        conn.close()
        
        return jsonify({"success": True, "progress": progress}), 200
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


@tasks_bp.route('/progress/summary', methods=['GET'])
def get_progress_summary():
    """Résumé global des progrès avec statistiques"""
    try:
        user_id = request.args.get('user_id', type=int) or (current_user.id if current_user.is_authenticated else None)
        if not user_id:
            return jsonify({"success": False, "error": "User ID required"}), 401

        days = request.args.get('days', 7, type=int)
        
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        
        # Statistiques sport
        cursor.execute("""
            SELECT 
                COUNT(*) as total_completions,
                SUM(duration_minutes) as total_duration,
                AVG(quality_rating) as avg_rating
            FROM task_completions
            WHERE user_id = %s AND task_type = 'sport'
                  AND completion_date >= DATE_SUB(CURDATE(), INTERVAL %s DAY)
        """, (user_id, days))
        sport_stats = cursor.fetchone()
        
        # Statistiques nutrition
        cursor.execute("""
            SELECT 
                COUNT(*) as total_completions,
                AVG(quality_rating) as avg_rating
            FROM task_completions
            WHERE user_id = %s AND task_type = 'nutrition'
                  AND completion_date >= DATE_SUB(CURDATE(), INTERVAL %s DAY)
        """, (user_id, days))
        nutrition_stats = cursor.fetchone()
        
        # Statistiques sommeil
        cursor.execute("""
            SELECT 
                COUNT(*) as total_completions,
                AVG(actual_value) as avg_sleep_hours,
                AVG(quality_rating) as avg_rating
            FROM task_completions
            WHERE user_id = %s AND task_type = 'sleep'
                  AND completion_date >= DATE_SUB(CURDATE(), INTERVAL %s DAY)
        """, (user_id, days))
        sleep_stats = cursor.fetchone()
        
        cursor.close()
        conn.close()
        
        return jsonify({
            "success": True,
            "period_days": days,
            "sport": sport_stats,
            "nutrition": nutrition_stats,
            "sleep": sleep_stats
        }), 200
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500
