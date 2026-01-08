import mysql.connector
from mysql.connector import Error

db_config = {
    "host": "localhost",
    "port": 3306,
    "user": "alexandre",
    "password": "ynov2526",
    "database": "bienetre",
}


def get_db_connection():
    """Retourne une connexion MySQL configurée pour l'application."""
    return mysql.connector.connect(**db_config)


