from flask import Blueprint, jsonify, request
import requests
import re

# Blueprint attendu par app.py : nutrition_bp
nutrition_bp = Blueprint('nutrition', __name__, url_prefix='/api')

def _parse_serving_grams(serving_size: str):
    """
    Tente d'extraire un nombre de grammes depuis la chaîne serving_size.
    Exemples: "100 g", "1 slice (30 g)", "250ml" -> None (non g)
    """
    if not serving_size:
        return None
    m = re.search(r"(\d+(?:[\.,]\d+)?)\s*g", serving_size.lower())
    if not m:
        return None
    try:
        return float(m.group(1).replace(',', '.'))
    except:
        return None

def _nutriments_for_serving(nutriments: dict, serving_grams: float):
    """
    Calcule une version 'per serving' si serving_grams disponible.
    Attendu nutriments keys: 'xxx_100g'
    """
    if serving_grams is None:
        return None
    factor = serving_grams / 100.0
    out = {}
    for k, v in nutriments.items():
        if isinstance(k, str) and k.endswith("_100g"):
            try:
                out[k.replace("_100g", "_serving")] = round(v * factor, 2) if v is not None else None
            except:
                out[k.replace("_100g", "_serving")] = None
    return out

@nutrition_bp.route('/nutrition/<barcode>', methods=['GET'])
def get_nutrition_by_barcode(barcode):
    """
    Recherche un produit par code-barres via OpenFoodFacts
    Exemple: GET /api/nutrition/3608580000019
    Retourne caractéristiques détaillées + nutriments per 100g et per serving si possible.
    """
    try:
        url = f"https://world.openfoodfacts.org/api/v0/product/{barcode}.json"
        r = requests.get(url, timeout=10)
        if r.status_code != 200:
            return jsonify({"error": "Erreur OpenFoodFacts", "status": r.status_code, "details": r.text}), r.status_code
        data = r.json()
        if data.get("status") == 0:
            return jsonify({"message": "Produit introuvable"}), 404
        product = data.get("product", {})

        nutriments = product.get("nutriments", {}) or {}
        # Extraire nutriments usuels
        common = {
            "energy_kcal_100g": nutriments.get("energy-kcal_100g") or nutriments.get("energy-kj_100g"),
            "proteins_100g": nutriments.get("proteins_100g"),
            "fat_100g": nutriments.get("fat_100g"),
            "saturated_fat_100g": nutriments.get("saturated-fat_100g"),
            "carbohydrates_100g": nutriments.get("carbohydrates_100g"),
            "sugars_100g": nutriments.get("sugars_100g"),
            "fiber_100g": nutriments.get("fiber_100g") or nutriments.get("dietary-fiber_100g"),
            "salt_100g": nutriments.get("salt_100g"),
            "sodium_100g": nutriments.get("sodium_100g")
        }

        serving_size_str = product.get("serving_size") or product.get("serving_quantity")
        serving_grams = None
        if isinstance(serving_size_str, (int, float)):
            # some products use numeric serving_quantity but not grams
            serving_grams = None
        else:
            serving_grams = _parse_serving_grams(str(serving_size_str)) if serving_size_str else None

        nutriments_serving = _nutriments_for_serving(nutriments, serving_grams)

        details = {
            "barcode": barcode,
            "product_name": product.get("product_name"),
            "generic_name": product.get("generic_name"),
            "brands": product.get("brands"),
            "brands_tags": product.get("brands_tags"),
            "categories": product.get("categories"),
            "categories_tags": product.get("categories_tags"),
            "labels": product.get("labels"),
            "quantity": product.get("quantity"),
            "packaging": product.get("packaging"),
            "countries": product.get("countries"),
            "image": product.get("image_small_url") or product.get("image_url"),
            "ingredients_text": product.get("ingredients_text"),
            "allergens": product.get("allergens"),
            "additives": product.get("additives"),
            "serving_size": serving_size_str,
            "serving_grams": serving_grams,
            "nutriments_100g": common,
            "nutriments_raw_100g": nutriments,
            "nutriments_serving": nutriments_serving,
            "nutriments_raw_serving": nutriments_serving  # same structure, kept for clarity
        }

        return jsonify(details)

    except requests.exceptions.RequestException as e:
        return jsonify({"error": "Erreur réseau", "details": str(e)}), 500
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@nutrition_bp.route('/nutrition_search/<string:query>', methods=['GET'])
def search_nutrition(query):
    """
    Recherche textuelle via OpenFoodFacts (sans clé)
    Exemple: GET /api/nutrition_search/pomme
    Retourne jusqu'à 5 résultats simplifiés avec nutriments principaux.
    """
    try:
        url = "https://world.openfoodfacts.org/cgi/search.pl"
        params = {
            "search_terms": query,
            "search_simple": 1,
            "action": "process",
            "json": 1,
            "page_size": 5
        }
        r = requests.get(url, params=params, timeout=10)
        if r.status_code != 200:
            return jsonify({"error": "Erreur OpenFoodFacts", "status": r.status_code}), r.status_code
        data = r.json()
        products = data.get("products", [])[:5]
        results = []
        for p in products:
            nutr = p.get("nutriments", {}) or {}
            results.append({
                "name": p.get("product_name"),
                "brand": p.get("brands"),
                "barcode": p.get("code"),
                "serving_size": p.get("serving_size"),
                "calories_kcal_100g": nutr.get("energy-kcal_100g") or nutr.get("energy-kj_100g"),
                "proteins_100g": nutr.get("proteins_100g"),
                "fat_100g": nutr.get("fat_100g"),
                "saturated_fat_100g": nutr.get("saturated-fat_100g"),
                "carbohydrates_100g": nutr.get("carbohydrates_100g"),
                "sugars_100g": nutr.get("sugars_100g"),
                "fiber_100g": nutr.get("fiber_100g") or nutr.get("dietary-fiber_100g"),
                "salt_100g": nutr.get("salt_100g"),
                "image": p.get("image_small_url")
            })
        if not results:
            return jsonify({"message": "Aucun produit trouvé"}), 404
        return jsonify({"query": query, "results": results})
    except requests.exceptions.RequestException as e:
        return jsonify({"error": "Erreur réseau", "details": str(e)}), 500
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# <-- Alias route compatible with frontend call (/api/nutritionix/search/...) -->
@nutrition_bp.route('/nutritionix/search/<string:query>', methods=['GET'])
def nutritionix_search(query):
    """
    Alias pour compatibilité frontend : redirige vers la recherche OpenFoodFacts.
    Exemple: GET /api/nutritionix/search/céréale
    """
    return search_nutrition(query)