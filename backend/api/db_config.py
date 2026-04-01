import mysql.connector
from mysql.connector import Error

db_config = {
    "host": "localhost",
    "port": 8889,        
    "user": "root",
    "password": "root",
    "database": "bienetre",
}

def get_db_connection():
    """Retourne une connexion MySQL configurée pour l'application."""
    return mysql.connector.connect(**db_config)


