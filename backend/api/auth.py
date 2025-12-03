from flask import Blueprint, jsonify, request
from flask_login import login_user, logout_user, login_required
import mysql.connector
import bcrypt
import re
from mysql.connector import Error
from .models import User

auth_bp = Blueprint('auth', __name__)
