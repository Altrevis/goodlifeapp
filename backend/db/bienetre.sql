-- phpMyAdmin SQL Dump
-- version 5.2.1deb3
-- https://www.phpmyadmin.net/
--
-- Hôte : localhost:3306
-- Généré le : ven. 28 nov. 2025 à 19:02
-- Version du serveur : 8.0.44-0ubuntu0.24.04.1
-- Version de PHP : 8.3.27

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

-- --------------------------------------------------------

--
-- Structure de la table `messages`
-- (historique du chat IA par utilisateur)
--

CREATE TABLE `messages` (
  `id` int NOT NULL,
  `user_id` int DEFAULT NULL,
  `role` enum('user','assistant','system') NOT NULL,
  `content` text NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

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

-- --------------------------------------------------------

--
-- Structure de la table `tasks`
-- (Todolist unifiée pour Sport, Alimentation et Sommeil)
--

CREATE TABLE `tasks` (
  `id` int NOT NULL,
  `user_id` int NOT NULL,
  `task_type` enum('sport','nutrition','sleep') NOT NULL COMMENT 'Type de tâche',
  `title` varchar(255) NOT NULL,
  `description` text,
  `activity_type` varchar(50) DEFAULT NULL COMMENT 'Type d\'activité (Course, Musculation, Yoga, etc.)',
  `target_duration_minutes` int DEFAULT NULL COMMENT 'Durée cible en minutes',
  `target_reps` int DEFAULT NULL COMMENT 'Répétitions cibles si applicable',
  `recipe_name` varchar(255) DEFAULT NULL COMMENT 'Nom de la recette',
  `meal_type` enum('breakfast','lunch','dinner','snack') DEFAULT NULL COMMENT 'Type de repas',
  `target_calories` int DEFAULT NULL COMMENT 'Calories cibles',
  `ingredients` text COMMENT 'Ingrédients de la recette',
  `target_duration_hours` float DEFAULT NULL COMMENT 'Heures de sommeil cibles',
  `target_bedtime` time DEFAULT NULL COMMENT 'Heure de coucher cible',
  `target_waketime` time DEFAULT NULL COMMENT 'Heure de réveil cible',
  `is_active` tinyint(1) DEFAULT 1 COMMENT 'Tâche active ou archivée',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Structure de la table `task_completions`
-- (Historique des tâches terminées avec temps passé)
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

-- --------------------------------------------------------

--
-- Structure de la table `daily_progress`
-- (Évolution quotidienne globale)
--

CREATE TABLE `daily_progress` (
  `id` int NOT NULL,
  `user_id` int NOT NULL,
  `date` date NOT NULL,
  `sport_tasks_completed` int DEFAULT 0,
  `sport_total_duration` int DEFAULT 0 COMMENT 'Minutes totales de sport',
  `nutrition_tasks_completed` int DEFAULT 0,
  `nutrition_calories_consumed` int DEFAULT 0,
  `sleep_tasks_completed` int DEFAULT 0,
  `sleep_duration_hours` float DEFAULT 0,
  `overall_score` float DEFAULT NULL COMMENT 'Score global du jour (0-100)',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Déchargement des données de la table `users`
--

INSERT INTO `users` (`id`, `first_name`, `last_name`, `email`, `password`, `age`, `gender`, `created_at`) VALUES
(1, 'Leo', 'Benazeth', 'leo@example.com', 'monMotDePasse123', 22, 'male', '2025-10-22 12:45:17');

--
-- Déchargement des données de la table `sleep_data`
--

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
-- Index pour la table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- Index pour la table `tasks`
--
ALTER TABLE `tasks`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `idx_task_type` (`task_type`),
  ADD KEY `idx_task_active` (`is_active`),
  ADD KEY `idx_user_type` (`user_id`, `task_type`);

--
-- Index pour la table `task_completions`
--
ALTER TABLE `task_completions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `idx_completion_date` (`completion_date`),
  ADD KEY `idx_task_type` (`task_type`);

--
-- Index pour la table `daily_progress`
--
ALTER TABLE `daily_progress`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `user_date_unique` (`user_id`, `date`),
  ADD KEY `idx_progress_date` (`date`);

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
-- AUTO_INCREMENT pour la table `health_data`
--
ALTER TABLE `health_data`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT pour la table `messages`
--
ALTER TABLE `messages`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT pour la table `sleep_data`
--
ALTER TABLE `sleep_data`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT pour la table `users`
--
ALTER TABLE `users`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT pour la table `tasks`
--
ALTER TABLE `tasks`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT pour la table `task_completions`
--
ALTER TABLE `task_completions`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT pour la table `daily_progress`
--
ALTER TABLE `daily_progress`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- Contraintes pour les tables déchargées
--

--
-- Contraintes pour la table `activity_sessions`
--
ALTER TABLE `activity_sessions`
  ADD CONSTRAINT `activity_sessions_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Contraintes pour la table `sleep_data`
--
ALTER TABLE `sleep_data`
  ADD CONSTRAINT `sleep_data_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Contraintes pour la table `ai_predictions`
--
ALTER TABLE `ai_predictions`
  ADD CONSTRAINT `ai_predictions_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

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
-- Contraintes pour la table `tasks`
--
ALTER TABLE `tasks`
  ADD CONSTRAINT `tasks_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Contraintes pour la table `task_completions`
--
ALTER TABLE `task_completions`
  ADD CONSTRAINT `task_completions_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Contraintes pour la table `daily_progress`
--
ALTER TABLE `daily_progress`
  ADD CONSTRAINT `daily_progress_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
