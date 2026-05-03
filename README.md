# 🏃‍♂️ GoodLife App - Ydays Sport & Bien-être avec IA

Application web de suivi et d'analyse du bien-être personnel avec intelligence artificielle intégrée. Ce projet combine un backend Flask (Python) avec un frontend React (TypeScript) pour offrir une expérience complète de gestion de la santé.

---

## 📋 Lien Trello du projet

**Board Trello** : 👉 [Ydays – Sport & Bien-être avec IA](https://trello.com/invite/b/695e265b86283057a3a5cdde/ATTIdd55138ebb22f181bcceb16d0cedeae9298CFF2F/bien-etre-ia)

---

## 🎯 Objectif du projet

L'application **GoodLife** vise à offrir un suivi personnalisé du bien-être en combinant :

- **Collecte de données** : Sommeil, nutrition, activité physique, données corporelles
- **Analyse intelligente** : Calculs statistiques et prédictions via IA/ML
- **Visualisations** : Graphiques interactifs pour suivre les progrès
- **Recommandations** : Conseils personnalisés basés sur les données utilisateur
- **Chat IA** : Assistant conversationnel pour répondre aux questions sur la santé

### Fonctionnalités principales

✅ **Authentification** : Inscription, connexion et gestion des sessions utilisateur  
✅ **Suivi du sommeil** : Analyse de la durée, qualité et régularité  
✅ **Nutrition** : Recherche de produits alimentaires via OpenFoodFacts (code-barres et texte)  
✅ **Activité sportive** : Accès aux routines et exercices via API Wger  
✅ **Calcul IMC** : Évaluation du poids et catégorisation  
✅ **Chat avec IA** : Interface conversationnelle avec LM Studio  
✅ **Dashboard** : Visualisation des données avec graphiques (React Chart.js)  
✅ **Profil utilisateur** : Gestion des données de santé (poids, taille, fréquence cardiaque, pas)  
✅ **Calcul de calories brûlées** : Estimation par activité et durée via API Ninjas  
✅ **Todo List** : Gestion des tâches sportives, nutritionnelles et de sommeil  
✅ **Générateur de programme IA** : Programme sportif et nutritionnel personnalisé via LM Studio  
✅ **Mentions légales** : Page légale accessible sans connexion

---

## 🏗️ Architecture technique

### Backend - Flask (Python)

**Dossier** : `backend/`

**Technologies** :
- Flask (framework web)
- Flask-CORS (gestion CORS)
- Flask-Login (authentification)
- MySQL Connector (connexion base de données)
- Bcrypt (hashage des mots de passe)
- Requests (appels API externes)

**Structure** :
```
backend/
├── app.py                      # Point d'entrée principal
├── requirements.txt            # Dépendances Python
├── api/
│   ├── __init__.py
│   ├── auth.py                # Routes d'authentification
│   ├── body_ext.py            # Calcul IMC
│   ├── calories_burned.py     # Calcul calories brûlées (API Ninjas)
│   ├── db_config.py           # Configuration base de données
│   ├── main.py                # Route de test + init DB
│   ├── models.py              # Modèles utilisateur
│   ├── nutrition.py           # Routes nutrition (OpenFoodFacts)
│   ├── profile.py             # Routes profil + données de santé
│   ├── program_generator.py   # Génération de programme IA
│   ├── sleep.py               # Routes sommeil + score
│   ├── sport.py               # Routes sport (Wger API)
│   ├── tasks.py               # Gestion des todolists
│   └── users.py               # Routes utilisateurs
└── db/
    └── bienetre.sql           # Structure de la base de données
```

---

### Frontend - React (TypeScript)

**Dossier** : `frontend/`

**Technologies** :
- React 19
- TypeScript
- React Router DOM (navigation)
- Chart.js + React-Chartjs-2 (graphiques)
- React Scripts (Create React App)

**Structure** :
```
frontend/
├── public/
│   ├── index.html
│   ├── manifest.json
│   └── robots.txt
├── src/
│   ├── pages/
│   │   ├── login.tsx              # Page de connexion
│   │   ├── register.tsx           # Page d'inscription
│   │   ├── home.tsx               # Page d'accueil
│   │   ├── chat.tsx               # Interface chat IA
│   │   ├── graph.tsx              # Visualisations graphiques
│   │   ├── nutrition.tsx          # Recherche nutritionnelle
│   │   ├── profile.tsx            # Profil + données de santé + calories
│   │   ├── sleep.tsx              # Suivi du sommeil
│   │   ├── MentionsLegales.tsx    # Page mentions légales
│   │   └── css/                   # Styles CSS des pages
│   ├── components/
│   │   ├── EvolutionTab.tsx       # Onglet d'évolution des données
│   │   ├── TodoList.tsx           # Composant todo list
│   │   ├── UserInfo.tsx           # Composant infos utilisateur
│   │   └── css/                   # Styles CSS des composants
│   ├── App.tsx
│   ├── index.tsx
│   └── setupTests.ts
├── package.json
└── tsconfig.json
```

---

## 🛣️ Routes API du Backend

### 🔐 Authentification (`/auth`)

| Méthode | Route | Description |
|---------|-------|-------------|
| `POST` | `/auth/register` | Inscription d'un nouvel utilisateur |
| `POST` | `/auth/login` | Connexion utilisateur |
| `POST` | `/auth/logout` | Déconnexion (requiert authentification) |

**Exemple de payload** :
```json
{
  "email": "user@example.com",
  "password": "motdepasse123",
  "first_name": "Jean",
  "last_name": "Dupont"
}
```

---

### 👤 Utilisateurs

| Méthode | Route | Description |
|---------|-------|-------------|
| `GET` | `/users` | Liste de tous les utilisateurs |

---

### 😴 Sommeil

| Méthode | Route | Description |
|---------|-------|-------------|
| `GET` | `/api/sleep/<user_id>` | Récupère les 7 derniers jours de sommeil + score calculé |
| `POST` | `/api/sleep/<user_id>` | Ajoute une nouvelle entrée de sommeil |

**Score de sommeil calculé** : Basé sur la durée moyenne, qualité et régularité (0-100)

**Réponse GET** :
```json
{
  "user_id": 1,
  "average_duration": 7.8,
  "average_quality": 8.5,
  "consistency": 0.92,
  "sleep_score": 85.5,
  "status": "Excellent",
  "breakdown": {
    "duration_score": 97.5,
    "quality_score": 85.0,
    "consistency_score": 92.0
  },
  "last_7_days": [...]
}
```

---

### 🥗 Nutrition (OpenFoodFacts)

| Méthode | Route | Description |
|---------|-------|-------------|
| `GET` | `/api/nutrition/<barcode>` | Recherche par code-barres |
| `GET` | `/api/nutrition_search/<query>` | Recherche textuelle (5 résultats max) |
| `GET` | `/api/nutritionix/search/<query>` | Alias de recherche textuelle |

**Exemple de réponse** :
```json
{
  "barcode": "3608580000019",
  "product_name": "Nutella",
  "brands": "Ferrero",
  "nutriments_100g": {
    "energy_kcal_100g": 539,
    "proteins_100g": 6.3,
    "fat_100g": 30.9,
    "carbohydrates_100g": 57.5,
    "sugars_100g": 56.3
  },
  "nutriments_serving": {...},
  "serving_size": "15 g",
  "image": "https://..."
}
```

---

### 🏋️ Sport (Wger API)

| Méthode | Route | Description |
|---------|-------|-------------|
| `GET` | `/api/sport/routines` | Liste des routines d'entraînement (authentifié) |
| `GET` | `/api/sport/exercises` | Liste des exercices disponibles |

---

### 👤 Profil utilisateur

| Méthode | Route | Description |
|---------|-------|-------------|
| `GET` | `/api/profile/<user_id>` | Récupère le profil et les dernières données de santé |
| `PUT` | `/api/profile/<user_id>` | Met à jour les données de santé |

---

### 🔥 Calories brûlées (API Ninjas)

| Méthode | Route | Description |
|---------|-------|-------------|
| `GET` | `/calories/activities` | Liste de toutes les activités sportives disponibles |
| `POST` | `/calories/calculate` | Calcule les calories brûlées pour une activité et une durée |

**Exemple de payload POST** :
```json
{
  "activity": "running",
  "duration_minutes": 30,
  "weight_kg": 70
}
```

---

### ✅ Todo List

| Méthode | Route | Description |
|---------|-------|-------------|
| `GET` | `/sport/tasks` | Récupère les tâches sportives de l'utilisateur |
| `POST` | `/sport/tasks` | Crée une nouvelle tâche sportive |
| `GET` | `/nutrition/tasks` | Récupère les tâches nutritionnelles |
| `POST` | `/nutrition/tasks` | Crée une nouvelle tâche nutritionnelle |
| `GET` | `/sleep/tasks` | Récupère les tâches de sommeil |
| `POST` | `/sleep/tasks` | Crée une nouvelle tâche de sommeil |

---

### 🤖 Générateur de programme IA

| Méthode | Route | Description |
|---------|-------|-------------|
| `POST` | `/api/generate-program` | Génère un programme sportif et nutritionnel personnalisé via LM Studio |

**Exemple de payload** :
```json
{
  "user_id": 1
}
```

**Réponse** : Programme JSON structuré avec objectifs, planning hebdomadaire sport, plan nutritionnel et conseils personnalisés.

---

### ⚖️ Calcul IMC

| Méthode | Route | Description |
|---------|-------|-------------|
| `GET` | `/api/body_ext/<weight>/<height>` | Calcule l'IMC et retourne la catégorie |

**Paramètres** :
- `weight` : Poids en kg (float)
- `height` : Taille en cm (float)

**Réponse** :
```json
{
  "weight": 70,
  "height": 175,
  "bmi": 22.86,
  "category": "Poids normal"
}
```

**Catégories** : Sous-poids, Poids normal, Surpoids, Obésité

---

### 💬 Chat avec IA (LM Studio)

**Fonctionnalités** :
- 🤖 Assistant conversationnel intelligent
- 📥 Récupération des données après que l'utilisateur a tout renseigné
- 💾 Historique des conversations persistant en base de données et séparé par utilisateur
- 🧹 Nettoyage du Markdown brut retourné par le modèle
- 📑 Affichage avec paragraphes et retours à la ligne pour une meilleure lisibilité

---

## 🗄️ Base de données MySQL

**Nom de la base** : `bienetre`  
**Port** : `3306`

### Tables principales

| Table | Description |
|-------|-------------|
| `users` | Utilisateurs (id, email, password, first_name, last_name, age, gender) |
| `sleep_data` | Données de sommeil (user_id, date, duration, quality) |
| `health_data` | Données de santé générales (poids, taille, fréquence cardiaque, pas) |
| `activity_sessions` | Sessions d'activité physique |
| `ai_predictions` | Prédictions générées par l'IA |
| `api_sources` | Configuration des sources API externes |
| `messages` | Historique du chat IA (role, content, created_at) |
| `tasks` | Tâches todo (sport, nutrition, sommeil) par utilisateur |
| `task_completions` | Historique des complétions de tâches |

---

## 🚀 Installation et lancement

### Prérequis

- Python 3.8+
- Node.js 16+
- MySQL 8.0+
- LM Studio (pour le chat IA)

### 1️⃣ Configuration de la base de données

```bash
# Créer la base de données
mysql -u root -p < backend/db/bienetre.sql

# Ou via phpMyAdmin/MySQL Workbench
```

Configurer les credentials dans `backend/api/db_config.py` :
```python
db_config = {
    'host': 'localhost',
    'port': 3306,
    'user': 'user',
    'password': 'password',
    'database': 'bienetre'
}
```

---

### 2️⃣ Backend Flask

```bash
cd backend

# Créer un environnement virtuel
python -m venv venv
source venv/bin/activate  # Linux/Mac
# venv\Scripts\activate  # Windows

# Installer les dépendances
pip install -r requirements.txt

# Lancer le serveur
python app.py
```

**Serveur backend** : `http://localhost:5000`

---

### 3️⃣ Frontend React

```bash
cd frontend

# Installer les dépendances
npm install

# Lancer l'application
npm start
```

**Application frontend** : `http://localhost:3000`

---

## 📊 Roadmap du projet (Séances Ydays)

| Séance | Date | Objectif | Statut |
|--------|------|----------|--------|
| **Séance 1** | 03 oct. 2025 | Mise en place du projet | ✅ Terminé |
| **Séance 2** | 22 oct. 2025 | Base de données MySQL | ✅ Terminé |
| **Séance 3** | 12 nov. 2025 | Connexion API externe | ✅ Terminé |
| **Séance 4** | 03 déc. 2025 | Analyses simples | ✅ Terminé |
| **Séance 5** | 07 jan. 2026 | Graphiques (Recharts) | ✅ Terminé |
| **Séance 6** | 08 jan. 2026 | Début IA (ML simple) | ✅ Terminé |
| **Séance 7** | 28 jan. 2026 | IA intégrée au backend | ✅ Terminé |
| **Séance 8** | 11 mar. 2026 | Conseils personnalisés | ✅ Terminé |
| **Séance 9** | 01 avr. 2026 | Frontend avancé | ✅ Terminé |
| **Séance 10** | 12 mai 2026 | Optimisation & finalisation | 🟡 En cours |
| **Séance 11** | 13 mai 2026 | Bilan & présentation | 📌 À venir |

---

## 📦 Dépendances principales

### Backend
- `Flask==3.1.2` - Framework web
- `flask-cors==6.0.1` - Gestion CORS
- `flask-login==0.6.3` - Authentification
- `bcrypt==4.1.3` - Hashage sécurisé
- `mysql-connector-python` - Connexion MySQL
- `requests` - Appels HTTP

### Frontend
- `react==19.2.0` - Framework UI
- `react-router-dom==7.9.4` - Routing
- `chart.js==4.5.1` - Graphiques
- `react-chartjs-2==5.3.1` - Intégration Chart.js
- `typescript==4.9.5` - Typage statique

---

## 🔒 Sécurité

- Mots de passe hashés avec **bcrypt**
- Sessions gérées par **Flask-Login**
- CORS configuré pour le développement
- **À améliorer** : Changer `app.secret_key` en production

---

## 🌐 APIs externes utilisées

| API | Usage | Documentation |
|-----|-------|---------------|
| **OpenFoodFacts** | Données nutritionnelles | https://world.openfoodfacts.org/data |
| **Wger** | Exercices & routines sportives | https://wger.de/api/v2/ |
| **LM Studio** | Chat IA + Générateur de programme (LLM local) | http://127.0.0.1:1234 |
| **API Ninjas** | Calcul de calories brûlées par activité | https://api-ninjas.com/api/caloriesburned |

---

## 📝 Notes de développement

- Le serveur backend doit être lancé avant le frontend
- LM Studio doit être actif pour le chat IA
- MySQL sur le port 3307 (non standard)
- Les données de test sont créées automatiquement au premier lancement

---

## 👥 Équipe

**Projet Ydays - Promotion 2025-2026**  
YNOV - Sport & Bien-être avec IA

| Membre | Rôle | Responsabilités |
|--------|------|-----------------|
| **Leo** | Chef d'équipe + Dev Fullstack | Coordination du projet, développement backend & frontend |
| **Alexandre** | Dev IA + Backend | Intelligence artificielle, intégration ML, backend Python |
| **Ryan** | Dev Frontend | Interface utilisateur, React, visualisations |

**Formation** : B3 Dev / B3 Infra / B3 Cyber

---

## 🆘 Dépannage

### Erreur de connexion MySQL
```bash
# Vérifier que MySQL est actif
sudo systemctl status mysql

# Tester la connexion
mysql -u leo -p -P 3307 -h localhost bienetre
```

### Port 3000 déjà utilisé (Frontend)
```bash
# Linux/Mac
PORT=3001 npm start

# Windows
set PORT=3001 && npm start
```

### Erreur LM Studio
- Vérifier que LM Studio est lancé
- Vérifier l'URL dans `app.py` (variable `LM_STUDIO_URL`)

---

**Dernière mise à jour** : 4 mai 2026
