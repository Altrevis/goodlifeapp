from flask import Blueprint, jsonify

body_ext_bp = Blueprint('body_ext', __name__)

# ---------------------------------------------------------
# BMI (calcul local)
# ---------------------------------------------------------
@body_ext_bp.route('/api/body_ext/<float:weight>/<float:height>', methods=['GET'])
def get_body_ext(weight, height):
    if height <= 0 or weight <= 0:
        return jsonify({"error": "Valeurs invalides"}), 400

    height_m = height / 100
    bmi = weight / (height_m ** 2)

    if bmi < 18.5:
        category = "Sous-poids"
    elif bmi < 25:
        category = "Poids normal"
    elif bmi < 30:
        category = "Surpoids"
    else:
        category = "Obésité"

    return jsonify({
        "weight": weight,
        "height": height,
        "bmi": round(bmi, 2),
        "category": category
    })
