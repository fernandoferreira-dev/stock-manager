-- =====================================================
-- Stock Management System - Database Setup
-- Data: 2025-12-11
-- =====================================================

CREATE DATABASE IF NOT EXISTS stock_manager;
USE stock_manager;

-- =====================================================
-- TABELA: pessoa (central para todos os utilizadores)
-- =====================================================
CREATE TABLE IF NOT EXISTS `pessoa` (
  `id_pessoa` INT NOT NULL AUTO_INCREMENT,
  `nome` VARCHAR(100) NOT NULL,
  `email` VARCHAR(100) NOT NULL UNIQUE,
  `senha` VARCHAR(255) NOT NULL,
  PRIMARY KEY (`id_pessoa`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- TABELA: curso
-- =====================================================
CREATE TABLE IF NOT EXISTS `curso` (
  `id_curso` INT NOT NULL AUTO_INCREMENT,
  `nome_curso` VARCHAR(100) NOT NULL,
  PRIMARY KEY (`id_curso`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- TABELA: aluno
-- =====================================================
CREATE TABLE IF NOT EXISTS `aluno` (
  `id_aluno` INT NOT NULL AUTO_INCREMENT,
  `id_pessoa` INT NOT NULL,
  `id_curso` INT NOT NULL,
  PRIMARY KEY (`id_aluno`),
  KEY `id_pessoa` (`id_pessoa`),
  KEY `id_curso` (`id_curso`),
  CONSTRAINT `aluno_ibfk_1` FOREIGN KEY (`id_pessoa`) REFERENCES `pessoa` (`id_pessoa`) ON DELETE CASCADE,
  CONSTRAINT `aluno_ibfk_2` FOREIGN KEY (`id_curso`) REFERENCES `curso` (`id_curso`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- TABELA: prof
-- =====================================================
CREATE TABLE IF NOT EXISTS `prof` (
  `id_prof` INT NOT NULL AUTO_INCREMENT,
  `id_pessoa` INT NOT NULL,
  PRIMARY KEY (`id_prof`),
  KEY `id_pessoa` (`id_pessoa`),
  CONSTRAINT `prof_ibfk_1` FOREIGN KEY (`id_pessoa`) REFERENCES `pessoa` (`id_pessoa`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- TABELA: administrador
-- =====================================================
CREATE TABLE IF NOT EXISTS `administrador` (
  `id_admin` INT NOT NULL AUTO_INCREMENT,
  `id_pessoa` INT NOT NULL,
  PRIMARY KEY (`id_admin`),
  KEY `id_pessoa` (`id_pessoa`),
  CONSTRAINT `administrador_ibfk_1` FOREIGN KEY (`id_pessoa`) REFERENCES `pessoa` (`id_pessoa`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- TABELA: categoria
-- =====================================================
CREATE TABLE IF NOT EXISTS `categoria` (
  `id_cat` INT NOT NULL AUTO_INCREMENT,
  `nome_cat` VARCHAR(100) NOT NULL,
  PRIMARY KEY (`id_cat`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- TABELA: subcategoria
-- =====================================================
CREATE TABLE IF NOT EXISTS `subcategoria` (
  `id_subcat` INT NOT NULL AUTO_INCREMENT,
  `nome_subcat` VARCHAR(100) NOT NULL,
  `id_cat` INT NOT NULL,
  PRIMARY KEY (`id_subcat`),
  KEY `id_cat` (`id_cat`),
  CONSTRAINT `subcategoria_ibfk_1` FOREIGN KEY (`id_cat`) REFERENCES `categoria` (`id_cat`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- TABELA: lab
-- =====================================================
CREATE TABLE IF NOT EXISTS `lab` (
  `id_lab` INT NOT NULL AUTO_INCREMENT,
  `num_lab` VARCHAR(10) NOT NULL,
  PRIMARY KEY (`id_lab`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- TABELA: artigo
-- =====================================================
CREATE TABLE IF NOT EXISTS `artigo` (
  `id_artigo` INT NOT NULL AUTO_INCREMENT,
  `nome_artigo` VARCHAR(100) NOT NULL,
  `num_serial` VARCHAR(50) DEFAULT NULL,
  `id_subcat` INT DEFAULT NULL,
  PRIMARY KEY (`id_artigo`),
  KEY `id_subcat` (`id_subcat`),
  CONSTRAINT `artigo_ibfk_1` FOREIGN KEY (`id_subcat`) REFERENCES `subcategoria` (`id_subcat`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- TABELA: artigo_lab
-- =====================================================
CREATE TABLE IF NOT EXISTS `artigo_lab` (
  `id_artigo` INT NOT NULL,
  `id_lab` INT NOT NULL,
  PRIMARY KEY (`id_artigo`, `id_lab`),
  KEY `id_lab` (`id_lab`),
  CONSTRAINT `artigo_lab_ibfk_1` FOREIGN KEY (`id_artigo`) REFERENCES `artigo` (`id_artigo`) ON DELETE CASCADE,
  CONSTRAINT `artigo_lab_ibfk_2` FOREIGN KEY (`id_lab`) REFERENCES `lab` (`id_lab`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- TABELA: estado_reserva
-- =====================================================
CREATE TABLE IF NOT EXISTS `estado_reserva` (
  `id_estado` INT NOT NULL AUTO_INCREMENT,
  `nome_estado` VARCHAR(50) NOT NULL,
  PRIMARY KEY (`id_estado`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- TABELA: reserva
-- =====================================================
CREATE TABLE IF NOT EXISTS `reserva` (
  `id_reserva` INT NOT NULL AUTO_INCREMENT,
  `id_aluno` INT NOT NULL,
  `id_prof` INT NOT NULL,
  `id_estado` INT NOT NULL,
  `data_reserva` DATE NOT NULL,
  `data_retorno` DATE DEFAULT NULL,
  `motivo` TEXT,
  PRIMARY KEY (`id_reserva`),
  KEY `id_aluno` (`id_aluno`),
  KEY `id_prof` (`id_prof`),
  KEY `id_estado` (`id_estado`),
  CONSTRAINT `reserva_ibfk_1` FOREIGN KEY (`id_aluno`) REFERENCES `aluno` (`id_aluno`) ON DELETE CASCADE,
  CONSTRAINT `reserva_ibfk_2` FOREIGN KEY (`id_prof`) REFERENCES `prof` (`id_prof`) ON DELETE CASCADE,
  CONSTRAINT `reserva_ibfk_3` FOREIGN KEY (`id_estado`) REFERENCES `estado_reserva` (`id_estado`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- TABELA: artigo_reserva
-- =====================================================
CREATE TABLE IF NOT EXISTS `artigo_reserva` (
  `id_reserva` INT NOT NULL,
  `id_artigo` INT NOT NULL,
  `quantidade` INT NOT NULL DEFAULT 1,
  PRIMARY KEY (`id_reserva`, `id_artigo`),
  KEY `id_artigo` (`id_artigo`),
  CONSTRAINT `artigo_reserva_ibfk_1` FOREIGN KEY (`id_reserva`) REFERENCES `reserva` (`id_reserva`) ON DELETE CASCADE,
  CONSTRAINT `artigo_reserva_ibfk_2` FOREIGN KEY (`id_artigo`) REFERENCES `artigo` (`id_artigo`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- TABELA: cartao_nfc (cartões NFC associados aos artigos)
-- =====================================================
CREATE TABLE IF NOT EXISTS `cartao_nfc` (
  `id_cartao_nfc` INT NOT NULL AUTO_INCREMENT,
  `codigo_uid` VARCHAR(255) NOT NULL UNIQUE,
  `id_artigo` INT NOT NULL,
  `id_reserva` INT DEFAULT NULL,
  `estado` ENUM('disponivel', 'reservado', 'em_uso', 'devolvido') NOT NULL DEFAULT 'disponivel',
  `data_inicio` DATE DEFAULT NULL,
  `data_fim` DATE DEFAULT NULL,
  PRIMARY KEY (`id_cartao_nfc`),
  KEY `id_artigo` (`id_artigo`),
  KEY `id_reserva` (`id_reserva`),
  CONSTRAINT `cartao_nfc_ibfk_1` FOREIGN KEY (`id_artigo`) REFERENCES `artigo` (`id_artigo`) ON DELETE CASCADE,
  CONSTRAINT `cartao_nfc_ibfk_2` FOREIGN KEY (`id_reserva`) REFERENCES `reserva` (`id_reserva`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- TABELA: cartao_nfc_historico (histórico de devoluções)
-- =====================================================
CREATE TABLE IF NOT EXISTS `cartao_nfc_historico` (
  `id_historico` INT NOT NULL AUTO_INCREMENT,
  `id_cartao_nfc` INT NOT NULL,
  `id_reserva` INT DEFAULT NULL,
  `codigo_uid` VARCHAR(255) NOT NULL,
  `data_inicio` DATE NOT NULL,
  `data_fim` DATE DEFAULT NULL,
  PRIMARY KEY (`id_historico`),
  KEY `id_cartao_nfc` (`id_cartao_nfc`),
  KEY `id_reserva` (`id_reserva`),
  CONSTRAINT `cartao_nfc_historico_ibfk_1` FOREIGN KEY (`id_cartao_nfc`) REFERENCES `cartao_nfc` (`id_cartao_nfc`) ON DELETE CASCADE,
  CONSTRAINT `cartao_nfc_historico_ibfk_2` FOREIGN KEY (`id_reserva`) REFERENCES `reserva` (`id_reserva`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- TABELA: reports (reportes de problemas)
-- =====================================================
CREATE TABLE IF NOT EXISTS `reports` (
  `id_report` INT NOT NULL AUTO_INCREMENT,
  `id_reserva` INT NOT NULL,
  `id_admin` INT DEFAULT NULL,
  `tipo` VARCHAR(50) DEFAULT NULL,
  `titulo` VARCHAR(255) DEFAULT NULL,
  `descricao` TEXT,
  PRIMARY KEY (`id_report`),
  KEY `id_reserva` (`id_reserva`),
  KEY `id_admin` (`id_admin`),
  CONSTRAINT `reports_ibfk_1` FOREIGN KEY (`id_reserva`) REFERENCES `reserva` (`id_reserva`) ON DELETE CASCADE,
  CONSTRAINT `reports_ibfk_2` FOREIGN KEY (`id_admin`) REFERENCES `administrador` (`id_admin`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- INSERIR ESTADOS DE RESERVA PADRÃO
-- =====================================================
INSERT INTO `estado_reserva` (`id_estado`, `nome_estado`) VALUES
(1, 'Pendente'),
(2, 'Aprovado'),
(3, 'Rejeitado'),
(4, 'Em Uso'),
(5, 'Devolvido')
ON DUPLICATE KEY UPDATE `nome_estado` = VALUES(`nome_estado`);

-- =====================================================
-- FIM DO SCRIPT
-- =====================================================
