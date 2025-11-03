-- Database: cod_tournament
CREATE DATABASE IF NOT EXISTS cod_tournament;
USE cod_tournament;

-- 1️⃣ Admin table
CREATE TABLE IF NOT EXISTS admin (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL,
    password VARCHAR(100) NOT NULL
);

-- 2️⃣ Teams table
CREATE TABLE IF NOT EXISTS teams (
    id INT AUTO_INCREMENT PRIMARY KEY,
    team_name VARCHAR(100) NOT NULL,
    logo VARCHAR(255),
    year INT NOT NULL,
    total_matches INT DEFAULT 0,
    wins INT DEFAULT 0,
    losses INT DEFAULT 0,
    kd_ratio FLOAT DEFAULT 0
);

-- 3️⃣ Players table
CREATE TABLE IF NOT EXISTS players (
    id INT AUTO_INCREMENT PRIMARY KEY,
    player_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    team_id INT,
    photo VARCHAR(255),
    kills INT DEFAULT 0,
    deaths INT DEFAULT 0,
    assists INT DEFAULT 0,
    kd_ratio FLOAT DEFAULT 0,
    total_matches INT DEFAULT 0,
    year INT NOT NULL,
    FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE SET NULL
);

-- 4️⃣ Matches table
CREATE TABLE IF NOT EXISTS matches (
    id INT AUTO_INCREMENT PRIMARY KEY,
    team1_id INT,
    team2_id INT,
    team1_score INT DEFAULT 0,
    team2_score INT DEFAULT 0,
    winner_team_id INT,
    match_date DATE,
    year INT NOT NULL,
    FOREIGN KEY (team1_id) REFERENCES teams(id),
    FOREIGN KEY (team2_id) REFERENCES teams(id),
    FOREIGN KEY (winner_team_id) REFERENCES teams(id)
);

-- 5️⃣ Tournament Winners table
CREATE TABLE IF NOT EXISTS winners (
    id INT AUTO_INCREMENT PRIMARY KEY,
    year INT NOT NULL,
    winner_team_id INT,
    runnerup_team_id INT,
    winner_photo VARCHAR(255),
    FOREIGN KEY (winner_team_id) REFERENCES teams(id),
    FOREIGN KEY (runnerup_team_id) REFERENCES teams(id)
);
