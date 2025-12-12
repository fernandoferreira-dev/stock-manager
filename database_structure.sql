-- MySQL dump 10.13  Distrib 8.1.0, for Linux (x86_64)
--
-- Host: localhost    Database: stock_manager
-- ------------------------------------------------------
-- Server version	8.1.0

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `administrador`
--

DROP TABLE IF EXISTS `administrador`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `administrador` (
  `id_admin` int NOT NULL AUTO_INCREMENT,
  `id_pessoa` int NOT NULL,
  PRIMARY KEY (`id_admin`),
  KEY `id_pessoa` (`id_pessoa`),
  CONSTRAINT `administrador_ibfk_1` FOREIGN KEY (`id_pessoa`) REFERENCES `pessoa` (`id_pessoa`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `aluno`
--

DROP TABLE IF EXISTS `aluno`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `aluno` (
  `id_aluno` int NOT NULL AUTO_INCREMENT,
  `id_pessoa` int NOT NULL,
  `id_curso` int NOT NULL,
  PRIMARY KEY (`id_aluno`),
  KEY `id_pessoa` (`id_pessoa`),
  KEY `id_curso` (`id_curso`),
  CONSTRAINT `aluno_ibfk_1` FOREIGN KEY (`id_pessoa`) REFERENCES `pessoa` (`id_pessoa`) ON DELETE CASCADE,
  CONSTRAINT `aluno_ibfk_2` FOREIGN KEY (`id_curso`) REFERENCES `curso` (`id_curso`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `artigo`
--

DROP TABLE IF EXISTS `artigo`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `artigo` (
  `id_artigo` int NOT NULL AUTO_INCREMENT,
  `nome_artigo` varchar(100) NOT NULL,
  `num_serial` varchar(50) DEFAULT NULL,
  `id_subcat` int DEFAULT NULL,
  PRIMARY KEY (`id_artigo`),
  KEY `id_subcat` (`id_subcat`),
  CONSTRAINT `artigo_ibfk_1` FOREIGN KEY (`id_subcat`) REFERENCES `subcategoria` (`id_subcat`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `artigo_lab`
--

DROP TABLE IF EXISTS `artigo_lab`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `artigo_lab` (
  `id_artigo` int NOT NULL,
  `id_lab` int NOT NULL,
  PRIMARY KEY (`id_artigo`,`id_lab`),
  KEY `id_lab` (`id_lab`),
  CONSTRAINT `artigo_lab_ibfk_1` FOREIGN KEY (`id_artigo`) REFERENCES `artigo` (`id_artigo`) ON DELETE CASCADE,
  CONSTRAINT `artigo_lab_ibfk_2` FOREIGN KEY (`id_lab`) REFERENCES `lab` (`id_lab`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `artigo_reserva`
--

DROP TABLE IF EXISTS `artigo_reserva`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `artigo_reserva` (
  `id_reserva` int NOT NULL,
  `id_artigo` int NOT NULL,
  `quantidade` int NOT NULL DEFAULT '1',
  PRIMARY KEY (`id_reserva`,`id_artigo`),
  KEY `id_artigo` (`id_artigo`),
  CONSTRAINT `artigo_reserva_ibfk_1` FOREIGN KEY (`id_reserva`) REFERENCES `reserva` (`id_reserva`) ON DELETE CASCADE,
  CONSTRAINT `artigo_reserva_ibfk_2` FOREIGN KEY (`id_artigo`) REFERENCES `artigo` (`id_artigo`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `cartao_nfc`
--

DROP TABLE IF EXISTS `cartao_nfc`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cartao_nfc` (
  `id_cartao_nfc` int NOT NULL AUTO_INCREMENT,
  `id_pessoa` int NOT NULL,
  `id_artigo` int DEFAULT NULL,
  `id_reserva` int DEFAULT NULL,
  `estado` enum('disponivel','reservado','em_uso','devolvido') DEFAULT 'disponivel',
  `codigo_uid` varchar(255) NOT NULL,
  `data_inicio` date NOT NULL,
  `data_fim` date DEFAULT NULL,
  PRIMARY KEY (`id_cartao_nfc`),
  UNIQUE KEY `codigo_uid` (`codigo_uid`),
  KEY `id_pessoa` (`id_pessoa`),
  KEY `id_artigo` (`id_artigo`),
  KEY `id_reserva` (`id_reserva`),
  CONSTRAINT `cartao_nfc_ibfk_1` FOREIGN KEY (`id_pessoa`) REFERENCES `pessoa` (`id_pessoa`) ON DELETE CASCADE,
  CONSTRAINT `cartao_nfc_ibfk_2` FOREIGN KEY (`id_artigo`) REFERENCES `artigo` (`id_artigo`) ON DELETE CASCADE,
  CONSTRAINT `cartao_nfc_ibfk_3` FOREIGN KEY (`id_reserva`) REFERENCES `reserva` (`id_reserva`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `cartao_nfc_historico`
--

DROP TABLE IF EXISTS `cartao_nfc_historico`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cartao_nfc_historico` (
  `id_historico` int NOT NULL AUTO_INCREMENT,
  `id_cartao_nfc` int NOT NULL,
  `id_reserva` int DEFAULT NULL,
  `codigo_uid` varchar(255) NOT NULL,
  `data_inicio` date NOT NULL,
  `data_fim` date DEFAULT NULL,
  PRIMARY KEY (`id_historico`),
  KEY `id_cartao_nfc` (`id_cartao_nfc`),
  KEY `fk_historico_reserva` (`id_reserva`),
  CONSTRAINT `cartao_nfc_historico_ibfk_1` FOREIGN KEY (`id_cartao_nfc`) REFERENCES `cartao_nfc` (`id_cartao_nfc`),
  CONSTRAINT `fk_historico_reserva` FOREIGN KEY (`id_reserva`) REFERENCES `reserva` (`id_reserva`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `categoria`
--

DROP TABLE IF EXISTS `categoria`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `categoria` (
  `id_cat` int NOT NULL AUTO_INCREMENT,
  `nome_cat` varchar(100) NOT NULL,
  PRIMARY KEY (`id_cat`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `curso`
--

DROP TABLE IF EXISTS `curso`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `curso` (
  `id_curso` int NOT NULL AUTO_INCREMENT,
  `nome_curso` varchar(100) NOT NULL,
  PRIMARY KEY (`id_curso`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `estado`
--

DROP TABLE IF EXISTS `estado`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `estado` (
  `id_estado` int NOT NULL AUTO_INCREMENT,
  `nome_estado` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`id_estado`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `lab`
--

DROP TABLE IF EXISTS `lab`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `lab` (
  `id_lab` int NOT NULL AUTO_INCREMENT,
  `num_lab` int NOT NULL,
  PRIMARY KEY (`id_lab`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `pessoa`
--

DROP TABLE IF EXISTS `pessoa`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `pessoa` (
  `id_pessoa` int NOT NULL AUTO_INCREMENT,
  `nome` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `senha` varchar(255) NOT NULL,
  PRIMARY KEY (`id_pessoa`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=25 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `prof`
--

DROP TABLE IF EXISTS `prof`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `prof` (
  `id_prof` int NOT NULL AUTO_INCREMENT,
  `id_pessoa` int NOT NULL,
  PRIMARY KEY (`id_prof`),
  KEY `id_pessoa` (`id_pessoa`),
  CONSTRAINT `prof_ibfk_1` FOREIGN KEY (`id_pessoa`) REFERENCES `pessoa` (`id_pessoa`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `reports`
--

DROP TABLE IF EXISTS `reports`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `reports` (
  `id_report` int NOT NULL AUTO_INCREMENT,
  `id_reserva` int NOT NULL,
  `id_admin` int DEFAULT NULL,
  `tipo` varchar(50) DEFAULT NULL,
  `titulo` varchar(255) DEFAULT NULL,
  `descricao` text,
  PRIMARY KEY (`id_report`),
  KEY `id_reserva` (`id_reserva`),
  KEY `id_admin` (`id_admin`),
  CONSTRAINT `reports_ibfk_1` FOREIGN KEY (`id_reserva`) REFERENCES `reserva` (`id_reserva`) ON DELETE CASCADE,
  CONSTRAINT `reports_ibfk_2` FOREIGN KEY (`id_admin`) REFERENCES `administrador` (`id_admin`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `reserva`
--

DROP TABLE IF EXISTS `reserva`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `reserva` (
  `id_reserva` int NOT NULL AUTO_INCREMENT,
  `id_aluno` int NOT NULL,
  `id_prof` int NOT NULL,
  `id_estado` int NOT NULL,
  `data_reserva` date NOT NULL,
  `data_retorno` date DEFAULT NULL,
  `motivo` text,
  PRIMARY KEY (`id_reserva`),
  KEY `id_aluno` (`id_aluno`),
  KEY `id_prof` (`id_prof`),
  KEY `id_estado` (`id_estado`),
  CONSTRAINT `reserva_ibfk_1` FOREIGN KEY (`id_aluno`) REFERENCES `aluno` (`id_aluno`) ON DELETE CASCADE,
  CONSTRAINT `reserva_ibfk_2` FOREIGN KEY (`id_prof`) REFERENCES `prof` (`id_prof`) ON DELETE CASCADE,
  CONSTRAINT `reserva_ibfk_3` FOREIGN KEY (`id_estado`) REFERENCES `estado` (`id_estado`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `subcategoria`
--

DROP TABLE IF EXISTS `subcategoria`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `subcategoria` (
  `id_subcat` int NOT NULL AUTO_INCREMENT,
  `id_cat` int NOT NULL,
  `nome_subcat` varchar(100) NOT NULL,
  PRIMARY KEY (`id_subcat`),
  KEY `id_cat` (`id_cat`),
  CONSTRAINT `subcategoria_ibfk_1` FOREIGN KEY (`id_cat`) REFERENCES `categoria` (`id_cat`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-12-11 15:37:20
