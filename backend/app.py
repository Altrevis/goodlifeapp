from flask import Flask, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # ← doit être appelé juste après la création de l'app

@app.route('/')
def home():
    return jsonify({"message": "Hello from Flask!"})

if __name__ == '__main__':
    app.run(debug=True)
