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
(1, 'Leo', 'Benazeth', 'leo@example.com', 'monMotDePasse123', 22, 'male', '2025-10-22 12:45:17');

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
-- AUTO_INCREMENT pour la table `health_data`
--
ALTER TABLE `health_data`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT pour la table `users`
--
ALTER TABLE `users`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

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
-- Contraintes pour la table `health_data`
--
ALTER TABLE `health_data`
  ADD CONSTRAINT `health_data_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
