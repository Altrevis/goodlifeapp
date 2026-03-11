-- phpMyAdmin SQL Dump
-- version 5.2.1deb3
-- https://www.phpmyadmin.net/
--
-- Hôte : localhost:3306
-- Généré le : mer. 11 mars 2026 à 09:43
-- Version du serveur : 8.0.45-0ubuntu0.24.04.1
-- Version de PHP : 8.2.30

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de données : `bienetre`
--

-- --------------------------------------------------------

--
-- Structure de la table `activity_sessions`
--

CREATE TABLE `activity_sessions` (
  `id` int NOT NULL,
  `user_id` int DEFAULT NULL,
  `date` date DEFAULT NULL,
  `activity_type` varchar(50) DEFAULT NULL,
  `duration_minutes` int DEFAULT NULL,
  `avg_heart_rate` int DEFAULT NULL,
  `calories_burned` float DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Structure de la table `ai_predictions`
--

CREATE TABLE `ai_predictions` (
  `id` int NOT NULL,
  `user_id` int DEFAULT NULL,
  `prediction_date` date DEFAULT NULL,
  `prediction_type` varchar(50) DEFAULT NULL,
  `predicted_value` float DEFAULT NULL,
  `confidence` float DEFAULT NULL,
  `recommendation` text
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Structure de la table `api_sources`
--

CREATE TABLE `api_sources` (
  `id` int NOT NULL,
  `name` varchar(100) DEFAULT NULL,
  `base_url` varchar(255) DEFAULT NULL,
  `api_key` varchar(255) DEFAULT NULL,
  `last_sync` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Structure de la table `daily_progress`
--

CREATE TABLE `daily_progress` (
  `id` int NOT NULL,
  `user_id` int NOT NULL,
  `date` date NOT NULL,
  `sport_tasks_completed` int DEFAULT '0',
  `sport_total_duration` int DEFAULT '0' COMMENT 'Minutes totales de sport',
  `nutrition_tasks_completed` int DEFAULT '0',
  `nutrition_calories_consumed` int DEFAULT '0',
  `sleep_tasks_completed` int DEFAULT '0',
  `sleep_duration_hours` float DEFAULT '0',
  `overall_score` float DEFAULT NULL COMMENT 'Score global du jour (0-100)',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Déchargement des données de la table `daily_progress`
--

INSERT INTO `daily_progress` (`id`, `user_id`, `date`, `sport_tasks_completed`, `sport_total_duration`, `nutrition_tasks_completed`, `nutrition_calories_consumed`, `sleep_tasks_completed`, `sleep_duration_hours`, `overall_score`, `created_at`, `updated_at`) VALUES
(1, 3, '2026-01-31', 0, 0, 0, 0, 0, 0, NULL, '2026-01-31 18:16:34', '2026-01-31 18:16:34'),
(2, 3, '2026-03-11', 0, 0, 0, 0, 0, 0, NULL, '2026-03-11 08:37:56', '2026-03-11 08:37:56');

-- --------------------------------------------------------

--
-- Structure de la table `health_data`
--

CREATE TABLE `health_data` (
  `id` int NOT NULL,
  `user_id` int DEFAULT NULL,
  `date` date DEFAULT NULL,
  `weight` float DEFAULT NULL,
  `height` float DEFAULT NULL,
  `heart_rate` int DEFAULT NULL,
  `sleep_hours` float DEFAULT NULL,
  `calories_burned` float DEFAULT NULL,
  `steps` int DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Déchargement des données de la table `health_data`
--

INSERT INTO `health_data` (`id`, `user_id`, `date`, `weight`, `height`, `heart_rate`, `sleep_hours`, `calories_burned`, `steps`, `created_at`) VALUES
(2, 3, '2026-01-28', 70, 175, 72, 8, NULL, 10000, '2026-01-28 15:42:47'),
(4, 3, '2026-01-31', 65, 185, 72, 8, 840, 5000, '2026-01-31 19:10:48'),
(5, 3, '2026-03-11', 70, 47, 72, 8, 87, 1000, '2026-03-11 10:15:12');

-- --------------------------------------------------------

--
-- Structure de la table `messages`
--

CREATE TABLE `messages` (
  `id` int NOT NULL,
  `user_id` int DEFAULT NULL,
  `role` enum('user','assistant','system') COLLATE utf8mb4_unicode_ci NOT NULL,
  `content` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `messages`
--

INSERT INTO `messages` (`id`, `user_id`, `role`, `content`, `created_at`) VALUES
(3, 3, 'system', 'Vous êtes un assistant santé personnalisé. Voici les données de l\'utilisateur :\nPrénom: test\nNom: test\nÂge: 20 ans\nGenre: male\nPoids: 70.0 kg\nTaille: 175.0 cm\nFréquence cardiaque: 72 bpm\nHeures de sommeil: 8.0 h\nPas: 10000\n\nINSTRUCTION IMPORTANTE: Lorsque l\'utilisateur vous salue ou commence une conversation, vous DEVEZ TOUJOURS commencer votre réponse par confirmer que vous avez bien récupéré ses données en mentionnant son poids. Répondez exactement dans ce format: \'J\'ai bien récupéré vos données (70.0 kg).\' Ensuite, vous pouvez continuer normalement la conversation.', '2026-01-28 14:45:01'),
(4, 3, 'system', 'Vous êtes un assistant santé personnalisé. Voici les données de l\'utilisateur :\nPrénom: test\nNom: test\nÂge: 20 ans\nGenre: male\nPoids: 70.0 kg\nTaille: 175.0 cm\nFréquence cardiaque: 72 bpm\nHeures de sommeil: 8.0 h\nPas: 10000\n\nINSTRUCTION IMPORTANTE: Lorsque l\'utilisateur vous salue ou commence une conversation, vous DEVEZ TOUJOURS commencer votre réponse par confirmer que vous avez bien récupéré ses données en mentionnant son poids. Répondez exactement dans ce format: \'J\'ai bien récupéré vos données (70.0 kg).\' Ensuite, vous pouvez continuer normalement la conversation.', '2026-01-28 14:45:01'),
(5, 3, 'user', 'bonjour', '2026-01-28 15:19:43'),
(6, 3, 'system', 'Vous êtes un assistant santé personnalisé. Voici les données de l\'utilisateur :\nPrénom: test\nNom: test\nÂge: 20 ans\nGenre: male\nPoids: 70.0 kg\nTaille: 175.0 cm\nFréquence cardiaque: 72 bpm\nHeures de sommeil: 8.0 h\nPas: 10000\n\nINSTRUCTION IMPORTANTE: Lorsque l\'utilisateur vous salue ou commence une conversation, vous DEVEZ TOUJOURS commencer votre réponse par confirmer que vous avez bien récupéré ses données en mentionnant son poids. Répondez exactement dans ce format: \'J\'ai bien récupéré vos données (70.0 kg).\' Ensuite, vous pouvez continuer normalement la conversation.', '2026-01-28 15:19:44'),
(7, 3, 'assistant', 'J\'ai bien récupéré vos données (70.0 kg).\nBonjour test ! Comment puis-je vous aider aujourd\'hui concernant votre santé ou vos objectifs ? 😊\nVous souhaitez des conseils sur l\'alimentation, l\'exercice, le sommeil, ou autre chose ?', '2026-01-28 15:19:50'),
(8, 3, 'assistant', '✅ Programme mis à jour !\n\nSuper aujourd’hui ! Gardez le rythme, combinez effort physique et alimentation variée pour des résultats durables. Passez une journée active en optimisant votre récupération (hydratation + sommeil). 💪✨', '2026-01-28 15:42:25'),
(13, 3, 'assistant', '✅ Programme mis à jour !\n\nSuper journée à venir ! Optimise tes pas quotidiens avec des pauses actives (étirements) pendant le travail. Hydrate-toi bien et écoute ton corps – l’équilibre est la clé.', '2026-01-31 18:15:55'),
(14, 3, 'user', 'Dit moi la date de la seconde guerre mondial', '2026-03-11 08:38:48'),
(15, 3, 'system', 'Vous êtes un assistant santé personnalisé. Voici les données de l\'utilisateur :\nPrénom: test\nNom: test\nÂge: 20 ans\nGenre: male\nPoids: 65.0 kg\nTaille: 185.0 cm\nFréquence cardiaque: 72 bpm\nHeures de sommeil: 8.0 h\nPas: 5000\nCalories brûlées: 840.0 kcal\n\nINSTRUCTION IMPORTANTE: Lorsque l\'utilisateur vous salue ou commence une conversation, vous DEVEZ TOUJOURS commencer votre réponse par confirmer que vous avez bien récupéré ses données en mentionnant son poids. Répondez exactement dans ce format: \'J\'ai bien récupéré vos données (65.0 kg).\' Ensuite, vous pouvez continuer normalement la conversation.', '2026-03-11 08:38:48'),
(16, 3, 'user', 'Dit moi la date de la seconde guerre mondial', '2026-03-11 08:39:25'),
(17, 3, 'system', 'Vous êtes un assistant santé personnalisé. Voici les données de l\'utilisateur :\nPrénom: test\nNom: test\nÂge: 20 ans\nGenre: male\nPoids: 65.0 kg\nTaille: 185.0 cm\nFréquence cardiaque: 72 bpm\nHeures de sommeil: 8.0 h\nPas: 5000\nCalories brûlées: 840.0 kcal\n\nINSTRUCTION IMPORTANTE: Lorsque l\'utilisateur vous salue ou commence une conversation, vous DEVEZ TOUJOURS commencer votre réponse par confirmer que vous avez bien récupéré ses données en mentionnant son poids. Répondez exactement dans ce format: \'J\'ai bien récupéré vos données (65.0 kg).\' Ensuite, vous pouvez continuer normalement la conversation.', '2026-03-11 08:39:26'),
(18, 3, 'user', 'Dit moi la date de la seconde guerre mondial', '2026-03-11 08:40:17'),
(19, 3, 'system', 'Vous êtes un assistant santé personnalisé. Voici les données de l\'utilisateur :\nPrénom: test\nNom: test\nÂge: 20 ans\nGenre: male\nPoids: 65.0 kg\nTaille: 185.0 cm\nFréquence cardiaque: 72 bpm\nHeures de sommeil: 8.0 h\nPas: 5000\nCalories brûlées: 840.0 kcal\n\nINSTRUCTION IMPORTANTE: Lorsque l\'utilisateur vous salue ou commence une conversation, vous DEVEZ TOUJOURS commencer votre réponse par confirmer que vous avez bien récupéré ses données en mentionnant son poids. Répondez exactement dans ce format: \'J\'ai bien récupéré vos données (65.0 kg).\' Ensuite, vous pouvez continuer normalement la conversation.', '2026-03-11 08:40:17'),
(20, 3, 'assistant', '(pas de réponse)', '2026-03-11 08:40:17'),
(21, 3, 'user', 'Ce serais quoi pour toi un bon entrainement ?', '2026-03-11 08:40:39'),
(22, 3, 'system', 'Vous êtes un assistant santé personnalisé. Voici les données de l\'utilisateur :\nPrénom: test\nNom: test\nÂge: 20 ans\nGenre: male\nPoids: 65.0 kg\nTaille: 185.0 cm\nFréquence cardiaque: 72 bpm\nHeures de sommeil: 8.0 h\nPas: 5000\nCalories brûlées: 840.0 kcal\n\nINSTRUCTION IMPORTANTE: Lorsque l\'utilisateur vous salue ou commence une conversation, vous DEVEZ TOUJOURS commencer votre réponse par confirmer que vous avez bien récupéré ses données en mentionnant son poids. Répondez exactement dans ce format: \'J\'ai bien récupéré vos données (65.0 kg).\' Ensuite, vous pouvez continuer normalement la conversation.', '2026-03-11 08:40:39'),
(23, 3, 'assistant', '(pas de réponse)', '2026-03-11 08:40:39'),
(24, 3, 'user', ' Ce serais quoi pour toi un bon entrainement ?', '2026-03-11 08:41:04'),
(25, 3, 'system', 'Vous êtes un assistant santé personnalisé. Voici les données de l\'utilisateur :\nPrénom: test\nNom: test\nÂge: 20 ans\nGenre: male\nPoids: 65.0 kg\nTaille: 185.0 cm\nFréquence cardiaque: 72 bpm\nHeures de sommeil: 8.0 h\nPas: 5000\nCalories brûlées: 840.0 kcal\n\nINSTRUCTION IMPORTANTE: Lorsque l\'utilisateur vous salue ou commence une conversation, vous DEVEZ TOUJOURS commencer votre réponse par confirmer que vous avez bien récupéré ses données en mentionnant son poids. Répondez exactement dans ce format: \'J\'ai bien récupéré vos données (65.0 kg).\' Ensuite, vous pouvez continuer normalement la conversation.', '2026-03-11 08:41:04'),
(26, 3, 'assistant', 'J\'ai bien récupéré vos données **(70,0 kg)**.\n\nPour un **bon entraînement** adapté à tes caractéristiques (20 ans, 10 000 pas/jour), voici une approche équilibrée et personnalisable :\n\n### **1. Cardio modéré à intense**\n- **Objectif** : Maintenir ta fréquence cardiaque autour de **72 bpm** (ton rythme naturel) pour un effort durable.\n- **Exemples** :\n  - Marche rapide ou course légère (30 min/jour).\n  - Vélo ou natation pour varier les sensations.\n  - *Ton pas actuel (10 000) est déjà excellent !* Ajoute des intervalles (ex : 2 min à allure soutenue, 1 min repos).\n\n### **2. Renforcement musculaire**\n- **Pourquoi ?** Ton poids (70 kg) et ta taille (175 cm) suggèrent un besoin de force pour éviter les blessures.\n- **Exemples** :\n  - Squats ou fentes (3 séries de 12 répétitions).\n  - Pompes ou tractions assistées si possible.\n  - Gainage (planche, abdos) pour la stabilité.\n\n### **3. Mobilité et récupération**\n- **Étirements** : Étire tes jambes et dos après l’effort (5 min).\n- **Yoga ou mobilité active** : Idéal pour éviter les raideurs (ex : chat-chameau).\n\n---\n### **Exemple de routine type (1h)**\n- **Échauffement** : 5 min de marche + étirements dynamiques.\n- **Cardio** : 30 min de vélo ou natation à rythme modéré.\n- **Musculation** : Squats (3x12) + pompes (3x8).\n- **Récupération** : Étirements + hydratation.\n\n---\n### **À adapter selon tes objectifs**\n- **Perte de poids** ? Ajoute des calories brûlées (840 kcal/jour) avec une alimentation équilibrée.\n- **Musculation** ? Intègre du poids du corps ou haltères progressivement.\n- **Endurance** ? Augmente la durée/intensité des séances.\n\n---\n### **Conseil bonus**\nTon sommeil (8h) et ton FC (72 bpm) sont parfaits pour une récupération optimale. *Écoute ton corps* : si tu sens de la fatigue, réduis l’intensité ou prends un repos actif !\n\nTu veux que je t’aide à affiner un programme spécifique ? 😊', '2026-03-11 08:41:49'),
(27, 3, 'user', 'Dit moi la date de la seconde guerre mondial', '2026-03-11 08:42:04'),
(28, 3, 'system', 'Vous êtes un assistant santé personnalisé. Voici les données de l\'utilisateur :\nPrénom: test\nNom: test\nÂge: 20 ans\nGenre: male\nPoids: 65.0 kg\nTaille: 185.0 cm\nFréquence cardiaque: 72 bpm\nHeures de sommeil: 8.0 h\nPas: 5000\nCalories brûlées: 840.0 kcal\n\nINSTRUCTION IMPORTANTE: Lorsque l\'utilisateur vous salue ou commence une conversation, vous DEVEZ TOUJOURS commencer votre réponse par confirmer que vous avez bien récupéré ses données en mentionnant son poids. Répondez exactement dans ce format: \'J\'ai bien récupéré vos données (65.0 kg).\' Ensuite, vous pouvez continuer normalement la conversation.', '2026-03-11 08:42:05'),
(29, 3, 'assistant', 'La **Seconde Guerre mondiale** s\'est déroulée du **1er septembre 1939** (déclaration de guerre de l\'Allemagne nazie à la Pologne) au **2 septembre 1945** (capitulation officielle des forces japonaises après les bombes atomiques sur Hiroshima et Nagasaki).\n\nSi tu cherches une date précise pour un événement clé, je peux t\'aider ! 😊', '2026-03-11 08:42:14'),
(30, 3, 'user', 'Dit moi la date de la seconde guerre mondial', '2026-03-11 08:45:56'),
(31, 3, 'system', 'Vous êtes un assistant santé et bien-être personnalisé spécialisé UNIQUEMENT dans les domaines suivants :\n- Sport et activité physique (exercices, programmes d\'entraînement, conseils sportifs)\n- Nutrition et alimentation (recettes, diététique, conseils nutritionnels)\n- Bien-être et santé (sommeil, stress, récupération, habitudes de vie saines)\n- Suivi des données de santé (poids, calories, fréquence cardiaque, etc.)\n\nRÈGLES STRICTES À RESPECTER :\n1. Vous NE DEVEZ RÉPONDRE qu\'aux questions liées au sport, à la nutrition et au bien-être.\n2. Si une question concerne des sujets hors de votre domaine (dates historiques, géographie, géopolitique, culture générale, mathématiques, programmation, etc.), vous DEVEZ répondre : \'Je suis désolé, mais je suis spécialisé uniquement dans les domaines du sport, de la nutrition et du bien-être. Je ne peux pas répondre à cette question. Comment puis-je vous aider pour votre santé ou votre activité physique ?\'\n3. Restez toujours dans le contexte du bien-être et de la santé de l\'utilisateur.\n\nVoici les données de l\'utilisateur :\nPrénom: test\nNom: test\nÂge: 20 ans\nGenre: male\nPoids: 65.0 kg\nTaille: 185.0 cm\nFréquence cardiaque: 72 bpm\nHeures de sommeil: 8.0 h\nPas: 5000\nCalories brûlées: 840.0 kcal\n\nINSTRUCTION IMPORTANTE: Lorsque l\'utilisateur vous salue ou commence une conversation, vous DEVEZ TOUJOURS commencer votre réponse par confirmer que vous avez bien récupéré ses données en mentionnant son poids. Répondez exactement dans ce format: \'J\'ai bien récupéré vos données (65.0 kg).\' Ensuite, vous pouvez continuer normalement la conversation.', '2026-03-11 08:45:56'),
(32, 3, 'assistant', 'Je suis désolé, mais je suis spécialisé uniquement dans les domaines du sport, de la nutrition et du bien-être. Je ne peux pas répondre à cette question.\n\nComment puis-je vous aider pour votre santé ou votre activité physique ? 😊\nPar exemple :\n- Un programme d\'entraînement adapté ?\n- Des conseils nutritionnels personnalisés ?\n- Des astuces pour améliorer votre récupération ou votre sommeil ?', '2026-03-11 08:46:23');

-- --------------------------------------------------------

--
-- Structure de la table `sleep_data`
--

CREATE TABLE `sleep_data` (
  `id` int NOT NULL,
  `user_id` int NOT NULL,
  `date` date NOT NULL,
  `duration` float NOT NULL,
  `quality` int NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Déchargement des données de la table `sleep_data`
--

INSERT INTO `sleep_data` (`id`, `user_id`, `date`, `duration`, `quality`, `created_at`) VALUES
(64, 3, '2026-01-30', 9, 4, '2026-01-28 09:54:29'),
(65, 3, '2026-01-31', 8, 7, '2026-01-28 09:54:52'),
(66, 3, '2026-01-29', 4, 5, '2026-01-28 10:18:04'),
(70, 3, '2026-03-19', 7, 8, '2026-03-11 08:59:14');

-- --------------------------------------------------------

--
-- Structure de la table `tasks`
--

CREATE TABLE `tasks` (
  `id` int NOT NULL,
  `user_id` int NOT NULL,
  `task_type` enum('sport','nutrition','sleep') NOT NULL COMMENT 'Type de tâche',
  `title` varchar(255) NOT NULL,
  `description` text,
  `activity_type` varchar(50) DEFAULT NULL COMMENT 'Type d''activité (Course, Musculation, Yoga, etc.)',
  `target_duration_minutes` int DEFAULT NULL COMMENT 'Durée cible en minutes',
  `target_reps` int DEFAULT NULL COMMENT 'Répétitions cibles si applicable',
  `recipe_name` varchar(255) DEFAULT NULL COMMENT 'Nom de la recette',
  `meal_type` enum('breakfast','lunch','dinner','snack') DEFAULT NULL COMMENT 'Type de repas',
  `target_calories` int DEFAULT NULL COMMENT 'Calories cibles',
  `ingredients` text COMMENT 'Ingrédients de la recette',
  `target_duration_hours` float DEFAULT NULL COMMENT 'Heures de sommeil cibles',
  `target_bedtime` time DEFAULT NULL COMMENT 'Heure de coucher cible',
  `target_waketime` time DEFAULT NULL COMMENT 'Heure de réveil cible',
  `is_active` tinyint(1) DEFAULT '1' COMMENT 'Tâche active ou archivée',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Déchargement des données de la table `tasks`
--

INSERT INTO `tasks` (`id`, `user_id`, `task_type`, `title`, `description`, `activity_type`, `target_duration_minutes`, `target_reps`, `recipe_name`, `meal_type`, `target_calories`, `ingredients`, `target_duration_hours`, `target_bedtime`, `target_waketime`, `is_active`, `created_at`, `updated_at`) VALUES
(1, 3, 'sport', 'Échauffement dynamique et cardio léger', 'Séance de 10 min en marche rapide sur tapis, puis étirements des articulations (bras/hanches). Ensuite, 20 min de HIIT (squats, pompes, montées de genoux) pour activer le métabolisme.', 'Cardio + Renforcement', 30, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 1, '2026-01-28 15:42:25', '2026-01-28 15:42:25'),
(2, 3, 'sport', 'Musculation ciblée', 'Séance de renforcement en salle (ou home-gym) avec : Squats – 4x12, Pompes inclinées – 3x15, Fentes marchées – 2x10 par jambe. Optionnel : gainage planche – 3x30 sec.', 'Full-body', 40, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 1, '2026-01-28 15:42:25', '2026-01-28 15:42:25'),
(3, 3, 'nutrition', 'Petit-déjeuner protéiné et complexe', 'Porridge aux flocons d\'avoine, lait végétal (amande), graines de chia, banane et quelques noix. Option : œuf dur pour le côté protéiné.', NULL, NULL, NULL, 'Omelette aux légumes sur pain complet', 'breakfast', 500, NULL, NULL, NULL, NULL, 1, '2026-01-28 15:42:25', '2026-01-28 15:42:25'),
(4, 3, 'nutrition', 'Déjeuner équilibré et digestif', 'Filet de colin grillé (120g) avec quinoa, brocolis vapeur et sauce tahini. Ajoutez une poignée d’amandes pour les bonnes graisses.', NULL, NULL, NULL, 'Salade de lentilles au poulet', 'lunch', 650, NULL, NULL, NULL, NULL, 1, '2026-01-28 15:42:25', '2026-01-28 15:42:25'),
(5, 3, 'nutrition', 'Collation saine', 'Fromage blanc 0% avec des fruits rouges et un peu de miel. Évitez les sucres rapides.', NULL, NULL, NULL, 'Smoothie vert', 'snack', 250, NULL, NULL, NULL, NULL, 1, '2026-01-28 15:42:25', '2026-01-28 15:42:25'),
(6, 3, 'nutrition', 'Dîner léger mais nutritif', 'Soupe miso aux légumes (poivrons, tofu), riz complet et saumon vapeur. Privilégiez les aliments riches en oméga-3.', NULL, NULL, NULL, 'Tartare de tomate et avocat', 'dinner', 400, NULL, NULL, NULL, NULL, 1, '2026-01-28 15:42:25', '2026-01-28 15:42:25'),
(7, 3, 'sleep', 'Routine sommeil optimale', 'Couchez-vous avant 23h pour un cycle complet. Utilisez une lumière froide dans la pièce et évitez les écrans (1h avant le coucher). Respectez votre cible de 7-9h de sommeil.', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 8, '22:30:00', '06:30:00', 1, '2026-01-28 15:42:25', '2026-01-28 15:42:25'),
(15, 3, 'sport', 'Échauffement dynamique', 'Marche rapide sur place ou montées de genoux pendant 5 minutes pour préparer les muscles.', 'Cardio léger', 10, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 1, '2026-01-31 18:15:55', '2026-01-31 18:15:55'),
(16, 3, 'sport', 'Séance HIIT (Home Workout)', 'Exercices courts et intenses : Burpees, pompes, squats sautés, mountain climbers. Répéter 3 séries de 45 secondes avec 15 secondes de repos.', 'Full Body', 20, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 1, '2026-01-31 18:15:55', '2026-01-31 18:15:55'),
(17, 3, 'sport', 'Renforcement musculaire (Circuit)', 'Fentes statiques, pompes inclinées, gainage ventral (planche) sur 3 tours de 45 secondes.', 'Musculation', 10, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 1, '2026-01-31 18:15:55', '2026-01-31 18:15:55'),
(18, 3, 'nutrition', 'Petit-déjeuner équilibré', 'Céréales complètes (ex : muesli sans sucre ajouté) + protéines (fromage blanc ou œufs durs) + fruits rouges.', NULL, NULL, NULL, NULL, 'breakfast', 500, NULL, NULL, NULL, NULL, 1, '2026-01-31 18:15:55', '2026-01-31 18:15:55'),
(19, 3, 'nutrition', 'Collation santé', '1 poignée d’amandes (environ 20 g) ou une compote sans sucre ajouté + quelques noix.', NULL, NULL, NULL, NULL, 'snack', 300, NULL, NULL, NULL, NULL, 1, '2026-01-31 18:15:55', '2026-01-31 18:15:55'),
(20, 3, 'nutrition', 'Déjeuner protéiné', 'Filet de poulet grillé (120 g) + quinoa ou patate douce + épinards à la salsa. Sauce yaourt-citron.', NULL, NULL, NULL, 'Poulet aux épices avec quinoa et légumes vapeur', 'lunch', 650, NULL, NULL, NULL, NULL, 1, '2026-01-31 18:15:55', '2026-01-31 18:15:55'),
(21, 3, 'nutrition', 'Post-entraînement (repos)', 'Eau plate ou infusion (gingembre/menthe) pour hydratation post-séance.', NULL, NULL, NULL, NULL, 'snack', 50, NULL, NULL, NULL, NULL, 1, '2026-01-31 18:15:55', '2026-01-31 18:15:55'),
(22, 3, 'nutrition', 'Dîner léger', 'Soupe de légumes maison (carotte, poireau, courgette) + saumon grillé (80 g) ou tofu. Épices douces.', NULL, NULL, NULL, 'Soupe de légumes et poisson grillé', 'dinner', 650, NULL, NULL, NULL, NULL, 1, '2026-01-31 18:15:55', '2026-01-31 18:15:55'),
(23, 3, 'sleep', 'Routine du coucher', 'Lecture légère ou méditation guidée (10 min) pour détendre avant le sommeil.', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 8, '23:00:00', '07:00:00', 1, '2026-01-31 18:15:55', '2026-01-31 18:15:55');

-- --------------------------------------------------------

--
-- Structure de la table `task_completions`
--

CREATE TABLE `task_completions` (
  `id` int NOT NULL,
  `user_id` int NOT NULL,
  `task_type` enum('sport','nutrition','sleep') NOT NULL,
  `task_id` int NOT NULL COMMENT 'ID de la tâche',
  `completed_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `completion_date` date NOT NULL COMMENT 'Date de réalisation',
  `duration_minutes` int DEFAULT NULL COMMENT 'Temps réel passé',
  `notes` text COMMENT 'Notes sur la réalisation',
  `quality_rating` int DEFAULT NULL COMMENT 'Notation de 1 à 10',
  `actual_value` float DEFAULT NULL COMMENT 'Valeur réelle (heures de sommeil, calories, etc.)'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Déchargement des données de la table `task_completions`
--

INSERT INTO `task_completions` (`id`, `user_id`, `task_type`, `task_id`, `completed_at`, `completion_date`, `duration_minutes`, `notes`, `quality_rating`, `actual_value`) VALUES
(1, 3, 'sport', 15, '2026-01-31 18:16:33', '2026-01-31', 4, '', 9, NULL),
(2, 3, 'sport', 15, '2026-03-11 08:37:56', '2026-03-11', 12, '', 5, NULL);

-- --------------------------------------------------------

--
-- Structure de la table `users`
--

CREATE TABLE `users` (
  `id` int NOT NULL,
  `first_name` varchar(50) DEFAULT NULL,
  `last_name` varchar(50) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `password` varchar(255) DEFAULT NULL,
  `age` int DEFAULT NULL,
  `gender` varchar(10) DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Déchargement des données de la table `users`
--

INSERT INTO `users` (`id`, `first_name`, `last_name`, `email`, `password`, `age`, `gender`, `created_at`) VALUES
(3, 'test', 'test', 'leo.benazeth@gmail.com', '$2b$12$5jS6KMK5iEtktwNNtHQQ7.zMo.J7HGHpp3PkiOFZU8ETG/J8OubVy', 20, 'male', '2026-01-28 10:26:16');

--
-- Index pour les tables déchargées
--

--
-- Index pour la table `activity_sessions`
--
ALTER TABLE `activity_sessions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`);

--
-- Index pour la table `ai_predictions`
--
ALTER TABLE `ai_predictions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`);

--
-- Index pour la table `api_sources`
--
ALTER TABLE `api_sources`
  ADD PRIMARY KEY (`id`);

--
-- Index pour la table `daily_progress`
--
ALTER TABLE `daily_progress`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `user_date_unique` (`user_id`,`date`),
  ADD KEY `idx_progress_date` (`date`);

--
-- Index pour la table `health_data`
--
ALTER TABLE `health_data`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`);

--
-- Index pour la table `messages`
--
ALTER TABLE `messages`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_messages_user_id` (`user_id`);

--
-- Index pour la table `sleep_data`
--
ALTER TABLE `sleep_data`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`);

--
-- Index pour la table `tasks`
--
ALTER TABLE `tasks`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `idx_task_type` (`task_type`),
  ADD KEY `idx_task_active` (`is_active`),
  ADD KEY `idx_user_type` (`user_id`,`task_type`);

--
-- Index pour la table `task_completions`
--
ALTER TABLE `task_completions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `idx_completion_date` (`completion_date`),
  ADD KEY `idx_task_type` (`task_type`);

--
-- Index pour la table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- AUTO_INCREMENT pour les tables déchargées
--

--
-- AUTO_INCREMENT pour la table `activity_sessions`
--
ALTER TABLE `activity_sessions`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT pour la table `ai_predictions`
--
ALTER TABLE `ai_predictions`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT pour la table `api_sources`
--
ALTER TABLE `api_sources`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT pour la table `daily_progress`
--
ALTER TABLE `daily_progress`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT pour la table `health_data`
--
ALTER TABLE `health_data`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT pour la table `messages`
--
ALTER TABLE `messages`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=33;

--
-- AUTO_INCREMENT pour la table `sleep_data`
--
ALTER TABLE `sleep_data`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=71;

--
-- AUTO_INCREMENT pour la table `tasks`
--
ALTER TABLE `tasks`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=24;

--
-- AUTO_INCREMENT pour la table `task_completions`
--
ALTER TABLE `task_completions`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT pour la table `users`
--
ALTER TABLE `users`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- Contraintes pour les tables déchargées
--

--
-- Contraintes pour la table `activity_sessions`
--
ALTER TABLE `activity_sessions`
  ADD CONSTRAINT `activity_sessions_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Contraintes pour la table `ai_predictions`
--
ALTER TABLE `ai_predictions`
  ADD CONSTRAINT `ai_predictions_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Contraintes pour la table `daily_progress`
--
ALTER TABLE `daily_progress`
  ADD CONSTRAINT `daily_progress_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Contraintes pour la table `health_data`
--
ALTER TABLE `health_data`
  ADD CONSTRAINT `health_data_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Contraintes pour la table `messages`
--
ALTER TABLE `messages`
  ADD CONSTRAINT `messages_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Contraintes pour la table `sleep_data`
--
ALTER TABLE `sleep_data`
  ADD CONSTRAINT `sleep_data_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Contraintes pour la table `tasks`
--
ALTER TABLE `tasks`
  ADD CONSTRAINT `tasks_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Contraintes pour la table `task_completions`
--
ALTER TABLE `task_completions`
  ADD CONSTRAINT `task_completions_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
