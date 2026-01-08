from flask import Blueprint, jsonify, request
import requests

calories_bp = Blueprint('calories', __name__)

# Configuration API Ninjas
API_NINJAS_BASE_URL = "https://api.api-ninjas.com/v1"
API_NINJAS_KEY = "DbNQ6NpBp8Sc3Ukvk+wsqA==9oxJRkGCmNnFT5ai"  # TODO: Ajoutez votre clé API depuis api-ninjas.com

def get_api_ninjas_headers():
    """Retourne les headers pour les requêtes API Ninjas"""
    return {
        'X-Api-Key': API_NINJAS_KEY
    }


@calories_bp.route('/calories/activities', methods=['GET'])
def get_activities_list():
    """
    Récupère la liste de toutes les activités sportives disponibles.
    
    Returns:
        Liste de toutes les activités supportées par l'API
    """
    try:
        if not API_NINJAS_KEY:
            return jsonify({
                'error': 'Clé API non configurée',
                'message': 'Veuillez ajouter votre clé API Ninjas dans calories_burned.py'
            }), 500
        
        url = f"{API_NINJAS_BASE_URL}/caloriesburnedactivities"
        headers = get_api_ninjas_headers()
        
        response = requests.get(url, headers=headers, timeout=10)
        
        if response.status_code == 200:
            activities = response.json()
            return jsonify({
                'success': True,
                'count': len(activities),
                'activities': sorted(activities)  # Trier par ordre alphabétique
            })
        else:
            return jsonify({
                'error': 'Erreur API Ninjas',
                'status': response.status_code,
                'message': response.text
            }), response.status_code
    
    except requests.exceptions.RequestException as e:
        return jsonify({
            'error': 'Erreur de connexion',
            'message': str(e)
        }), 500


@calories_bp.route('/calories/calculate', methods=['POST'])
def calculate_calories():
    """
    Calcule les calories brûlées pour une activité donnée.
    
    Body JSON:
        - activity (required): Nom de l'activité (ex: "running", "swimming")
        - weight (optional): Poids en kg (converti en livres pour l'API)
        - duration (optional): Durée en minutes (défaut: 60)
    
    Returns:
        Informations sur les calories brûlées pour l'activité
    """
    try:
        if not API_NINJAS_KEY:
            return jsonify({
                'error': 'Clé API non configurée',
                'message': 'Veuillez ajouter votre clé API Ninjas dans calories_burned.py'
            }), 500
        
        data = request.json
        
        if not data or 'activity' not in data:
            return jsonify({
                'error': 'Paramètre manquant',
                'message': 'Le paramètre "activity" est requis'
            }), 400
        
        activity = data['activity']
        
        # Paramètres optionnels
        weight_kg = data.get('weight')  # Poids en kg
        duration_minutes = data.get('duration', 60)  # Durée par défaut: 60 minutes
        
        # Construction des paramètres pour l'API
        params = {
            'activity': activity,
            'duration': duration_minutes
        }
        
        # Convertir le poids de kg en livres si fourni (1 kg = 2.20462 lbs)
        if weight_kg:
            weight_lbs = round(weight_kg * 2.20462, 1)
            params['weight'] = weight_lbs
        
        url = f"{API_NINJAS_BASE_URL}/caloriesburned"
        headers = get_api_ninjas_headers()
        
        response = requests.get(url, headers=headers, params=params, timeout=10)
        
        if response.status_code == 200:
            results = response.json()
            
            if not results:
                return jsonify({
                    'success': False,
                    'message': f'Aucune activité trouvée pour "{activity}"',
                    'suggestion': 'Essayez un terme différent ou utilisez /calories/activities pour voir la liste complète'
                }), 404
            
            # Enrichir les résultats avec les informations en kg
            enriched_results = []
            for result in results:
                enriched_result = result.copy()
                if weight_kg:
                    enriched_result['weight_kg'] = weight_kg
                enriched_results.append(enriched_result)
            
            return jsonify({
                'success': True,
                'count': len(enriched_results),
                'results': enriched_results
            })
        else:
            return jsonify({
                'error': 'Erreur API Ninjas',
                'status': response.status_code,
                'message': response.text
            }), response.status_code
    
    except requests.exceptions.RequestException as e:
        return jsonify({
            'error': 'Erreur de connexion',
            'message': str(e)
        }), 500


@calories_bp.route('/calories/search', methods=['GET'])
def search_activities():
    """
    Recherche des activités par mot-clé.
    
    Query Parameters:
        - q: Terme de recherche (ex: "ski" trouvera "water skiing", "downhill skiing")
        - weight: Poids en kg (optionnel)
        - duration: Durée en minutes (optionnel, défaut: 60)
    
    Returns:
        Liste d'activités correspondant à la recherche avec calcul des calories
    """
    try:
        if not API_NINJAS_KEY:
            return jsonify({
                'error': 'Clé API non configurée',
                'message': 'Veuillez ajouter votre clé API Ninjas dans calories_burned.py'
            }), 500
        
        query = request.args.get('q', '')
        
        if not query:
            return jsonify({
                'error': 'Paramètre manquant',
                'message': 'Le paramètre "q" (recherche) est requis'
            }), 400
        
        weight_kg = request.args.get('weight', type=float)
        duration_minutes = request.args.get('duration', 60, type=int)
        
        # Construction des paramètres pour l'API
        params = {
            'activity': query,
            'duration': duration_minutes
        }
        
        # Convertir le poids de kg en livres si fourni
        if weight_kg:
            weight_lbs = round(weight_kg * 2.20462, 1)
            params['weight'] = weight_lbs
        
        url = f"{API_NINJAS_BASE_URL}/caloriesburned"
        headers = get_api_ninjas_headers()
        
        response = requests.get(url, headers=headers, params=params, timeout=10)
        
        if response.status_code == 200:
            results = response.json()
            
            if not results:
                return jsonify({
                    'success': False,
                    'message': f'Aucune activité trouvée pour "{query}"',
                    'suggestion': 'Essayez un terme plus général'
                }), 404
            
            # Enrichir les résultats
            enriched_results = []
            for result in results:
                enriched_result = result.copy()
                if weight_kg:
                    enriched_result['weight_kg'] = weight_kg
                enriched_results.append(enriched_result)
            
            return jsonify({
                'success': True,
                'query': query,
                'count': len(enriched_results),
                'results': enriched_results
            })
        else:
            return jsonify({
                'error': 'Erreur API Ninjas',
                'status': response.status_code,
                'message': response.text
            }), response.status_code
    
    except requests.exceptions.RequestException as e:
        return jsonify({
            'error': 'Erreur de connexion',
            'message': str(e)
        }), 500
