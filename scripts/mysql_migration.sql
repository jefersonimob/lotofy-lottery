-- ============================================
-- LOTOFY - MySQL 8 Migration Script
-- ============================================
-- Execute este script no seu banco 'lotofy' via MAMP/phpMyAdmin

USE lotofy;

-- Drop tables if exist (para re-criar limpo)
DROP TABLE IF EXISTS prize_verifications;
DROP TABLE IF EXISTS user_predictions;
DROP TABLE IF EXISTS all_possible_games;
DROP TABLE IF EXISTS number_statistics;
DROP TABLE IF EXISTS lottery_results;
DROP TABLE IF EXISTS profiles;

-- ============================================
-- 1. PROFILES (Usuários)
-- ============================================
CREATE TABLE profiles (
  id VARCHAR(36) PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL COMMENT 'bcrypt hash',
  full_name VARCHAR(255),
  bio TEXT,
  phone VARCHAR(50),
  city VARCHAR(100),
  state VARCHAR(50),
  role VARCHAR(20) NOT NULL DEFAULT 'user' COMMENT 'user ou admin',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_email (email),
  INDEX idx_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 2. LOTTERY_RESULTS (Resultados históricos)
-- ============================================
CREATE TABLE lottery_results (
  id VARCHAR(36) PRIMARY KEY,
  contest_number INT NOT NULL UNIQUE,
  draw_date DATE NOT NULL,
  numbers TEXT NOT NULL COMMENT 'JSON array: [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15]',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_contest_number (contest_number),
  INDEX idx_draw_date (draw_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 3. USER_PREDICTIONS (Apostas dos usuários)
-- ============================================
CREATE TABLE user_predictions (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  contest_number INT,
  predicted_numbers TEXT NOT NULL COMMENT 'JSON array: [1,2,3,...]',
  prediction_method VARCHAR(50) NOT NULL COMMENT 'statistical, random, manual',
  confidence_score DECIMAL(3,2) COMMENT '0.00 to 1.00',
  prize_level INT,
  is_winner BOOLEAN DEFAULT FALSE,
  checked_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE,
  INDEX idx_user_id (user_id),
  INDEX idx_contest_number (contest_number),
  INDEX idx_is_winner (is_winner)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 4. NUMBER_STATISTICS (Estatísticas de números)
-- ============================================
CREATE TABLE number_statistics (
  id VARCHAR(36) PRIMARY KEY,
  number_value INT NOT NULL UNIQUE COMMENT '1-25',
  frequency INT NOT NULL DEFAULT 0,
  last_appearance_contest INT,
  days_since_last_draw INT DEFAULT 0,
  hot_cold_status VARCHAR(20) COMMENT 'hot, cold, neutral',
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_number_value (number_value),
  INDEX idx_frequency (frequency DESC),
  CHECK (number_value >= 1 AND number_value <= 25)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 5. PRIZE_VERIFICATIONS (Histórico de verificações)
-- ============================================
CREATE TABLE prize_verifications (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  prediction_id VARCHAR(36) NOT NULL,
  contest_number INT NOT NULL,
  predicted_numbers TEXT NOT NULL COMMENT 'JSON array',
  drawn_numbers TEXT NOT NULL COMMENT 'JSON array',
  matches TEXT NOT NULL COMMENT 'JSON array of matched numbers',
  misses TEXT NOT NULL COMMENT 'JSON array of missed numbers',
  match_count INT NOT NULL,
  prize_level INT,
  prize_description TEXT,
  is_winner BOOLEAN DEFAULT FALSE,
  verified_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE,
  FOREIGN KEY (prediction_id) REFERENCES user_predictions(id) ON DELETE CASCADE,
  INDEX idx_user_id (user_id),
  INDEX idx_contest_number (contest_number),
  INDEX idx_is_winner (is_winner)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 6. ALL_POSSIBLE_GAMES (3.268.760 combinações)
-- ============================================
CREATE TABLE all_possible_games (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  numbers TEXT NOT NULL COMMENT 'JSON array: [1,2,3,...]',
  numbers_str VARCHAR(100) NOT NULL UNIQUE COMMENT '01-02-03-04-05-06-07-08-09-10-11-12-13-14-15',
  sum_numbers INT NOT NULL COMMENT '120-300',
  odd_count INT NOT NULL COMMENT '0-15',
  even_count INT NOT NULL COMMENT '0-15',
  low_count INT NOT NULL COMMENT 'Numbers 1-12',
  high_count INT NOT NULL COMMENT 'Numbers 13-25',
  range_01_05 INT NOT NULL,
  range_06_10 INT NOT NULL,
  range_11_15 INT NOT NULL,
  range_16_20 INT NOT NULL,
  range_21_25 INT NOT NULL,
  has_sequence BOOLEAN NOT NULL,
  max_sequence_length INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_sum_numbers (sum_numbers),
  INDEX idx_odd_even (odd_count, even_count),
  INDEX idx_low_high (low_count, high_count),
  INDEX idx_has_sequence (has_sequence),
  INDEX idx_numbers_str (numbers_str)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- SEED: Criar usuário admin padrão
-- ============================================
-- Password: admin123 (bcrypt hash)
INSERT INTO profiles (id, email, password, full_name, role, created_at, updated_at)
VALUES (
  UUID(),
  'admin@lotofy.com',
  '$2a$10$YourBcryptHashHere',  -- Você vai precisar gerar um hash real
  'Administrador',
  'admin',
  NOW(),
  NOW()
);

-- ============================================
-- SEED: Inicializar estatísticas dos números 1-25
-- ============================================
INSERT INTO number_statistics (id, number_value, frequency, days_since_last_draw, hot_cold_status, updated_at)
SELECT
  UUID(),
  n,
  0,
  0,
  'neutral',
  NOW()
FROM (
  SELECT 1 AS n UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION SELECT 5 UNION
  SELECT 6 UNION SELECT 7 UNION SELECT 8 UNION SELECT 9 UNION SELECT 10 UNION
  SELECT 11 UNION SELECT 12 UNION SELECT 13 UNION SELECT 14 UNION SELECT 15 UNION
  SELECT 16 UNION SELECT 17 UNION SELECT 18 UNION SELECT 19 UNION SELECT 20 UNION
  SELECT 21 UNION SELECT 22 UNION SELECT 23 UNION SELECT 24 UNION SELECT 25
) numbers;

-- ============================================
-- CONCLUÍDO!
-- ============================================
-- Próximos passos:
-- 1. Gerar hash bcrypt para senha admin
-- 2. Importar resultados históricos da Lotofácil
-- 3. Popular tabela all_possible_games (via script Node.js)
