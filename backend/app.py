from flask import Flask
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

app = Flask(__name__)
CORS(app)
app.secret_key = 'your_secret_key_here'  # Change this to a secure key

login_manager = LoginManager()
login_manager.init_app(app)

@login_manager.user_loader
def load_user(user_id):
    try:
        import mysql.connector
        from mysql.connector import Error
        db_config = {
            'host': 'localhost',
            'port': 3307,
            'user': 'leo',
            'password': 'leo',
            'database': 'bienetre'
        }
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
app.register_blueprint(auth_bp)

# ---------------------------------------------------------
# SERVER LAUNCH
# ---------------------------------------------------------
if __name__ == '__main__':
    init_database()
    app.run(debug=True)
