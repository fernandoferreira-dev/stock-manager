-- ===========================================
-- DATABASE: stock_manager (CORRECTED SCHEMA)
-- ===========================================
DROP DATABASE IF EXISTS stock_manager;
CREATE DATABASE stock_manager;
USE stock_manager;

-- ===========================================
-- TABELAS BASE DE UTILIZADORES
-- ===========================================
CREATE TABLE pessoa (
    id_pessoa INT AUTO_INCREMENT PRIMARY KEY,
    nome_pessoa VARCHAR(100) NOT NULL,
    password VARCHAR(255) NOT NULL
);

CREATE TABLE curso (
    id_curso INT AUTO_INCREMENT PRIMARY KEY,
    nome_curso VARCHAR(100) NOT NULL
);

CREATE TABLE aluno (
    id_aluno INT AUTO_INCREMENT PRIMARY KEY,
    id_pessoa INT NOT NULL,
    id_curso INT NOT NULL,
    num_aluno BIGINT NOT NULL UNIQUE,
    email_aluno VARCHAR(100) NOT NULL UNIQUE,
    FOREIGN KEY (id_pessoa) REFERENCES pessoa(id_pessoa) ON DELETE CASCADE,
    FOREIGN KEY (id_curso) REFERENCES curso(id_curso) ON DELETE CASCADE
);

CREATE TABLE prof (
    id_prof INT AUTO_INCREMENT PRIMARY KEY,
    id_pessoa INT NOT NULL,
    email_prof VARCHAR(100) NOT NULL UNIQUE,
    FOREIGN KEY (id_pessoa) REFERENCES pessoa(id_pessoa) ON DELETE CASCADE
);

CREATE TABLE administrador (
    id_admin INT AUTO_INCREMENT PRIMARY KEY,
    id_pessoa INT NOT NULL,
    email_admin VARCHAR(100) NOT NULL UNIQUE,
    FOREIGN KEY (id_pessoa) REFERENCES pessoa(id_pessoa) ON DELETE CASCADE
);

-- ===========================================
-- TABELAS DE INVENTÁRIO
-- ===========================================
CREATE TABLE categoria (
    id_cat INT AUTO_INCREMENT PRIMARY KEY,
    nome_cat VARCHAR(100) NOT NULL
);

CREATE TABLE subcategoria (
    id_subcat INT AUTO_INCREMENT PRIMARY KEY,
    nome_subcat VARCHAR(100) NOT NULL,
    id_cat INT NOT NULL,
    FOREIGN KEY (id_cat) REFERENCES categoria(id_cat) ON DELETE CASCADE
);

CREATE TABLE lab (
    id_lab INT AUTO_INCREMENT PRIMARY KEY,
    num_lab INT NOT NULL
);

CREATE TABLE artigo (
    id_artigo INT AUTO_INCREMENT PRIMARY KEY,
    nome_artigo VARCHAR(100) NOT NULL,
    num_serial VARCHAR(50) DEFAULT NULL,
    id_subcat INT,
    FOREIGN KEY (id_subcat) REFERENCES subcategoria(id_subcat) ON DELETE SET NULL
);

CREATE TABLE artigo_lab (
    id_artigo INT,
    id_lab INT,
    FOREIGN KEY (id_artigo) REFERENCES artigo(id_artigo) ON DELETE CASCADE,
    FOREIGN KEY (id_lab) REFERENCES lab(id_lab) ON DELETE CASCADE
);

CREATE TABLE estado (
    id_estado CHAR(1) PRIMARY KEY,
    descricao VARCHAR(100)
);

CREATE TABLE reserva (
    id_reserva INT AUTO_INCREMENT PRIMARY KEY,
    id_prof INT NOT NULL,
    id_aluno INT,
    motivo VARCHAR(255),
    data_reserva DATE,
    data_entrega DATE,
    id_estado CHAR(1) DEFAULT 'P',
    FOREIGN KEY (id_prof) REFERENCES prof(id_prof) ON DELETE CASCADE,
    FOREIGN KEY (id_aluno) REFERENCES aluno(id_aluno) ON DELETE SET NULL,
    FOREIGN KEY (id_estado) REFERENCES estado(id_estado) ON DELETE SET NULL
);

CREATE TABLE artigo_reserva (
    id_reserva INT,
    id_artigo INT,
    FOREIGN KEY (id_reserva) REFERENCES reserva(id_reserva) ON DELETE CASCADE,
    FOREIGN KEY (id_artigo) REFERENCES artigo(id_artigo) ON DELETE CASCADE
);

CREATE TABLE reports (
    id_report INT AUTO_INCREMENT PRIMARY KEY,
    id_reserva INT NOT NULL,
    tipo ENUM('quebrado','faltando','funcionamento','outro') NOT NULL,
    titulo VARCHAR(150) NOT NULL,
    descricao TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_reserva) REFERENCES reserva(id_reserva) ON DELETE CASCADE
);

-- ===========================================
-- TABELAS DE CARTÕES NFC
-- ===========================================

-- Tabela de cartões NFC
CREATE TABLE cartao_nfc (
    id_cartao_nfc INT AUTO_INCREMENT PRIMARY KEY,
    uid_nfc VARCHAR(100) NOT NULL UNIQUE COMMENT 'UID lido do cartão NFC',
    id_artigo INT NOT NULL COMMENT 'Artigo permanentemente associado ao cartão',
    data_associacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ativo BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (id_artigo) REFERENCES artigo(id_artigo) ON DELETE CASCADE
);

-- Tabela de histórico de quem levantou cada cartão/produto
CREATE TABLE cartao_nfc_historico (
    id_historico INT AUTO_INCREMENT PRIMARY KEY,
    id_cartao_nfc INT NOT NULL,
    id_reserva INT NOT NULL COMMENT 'Reserva associada ao levantamento',
    id_aluno INT COMMENT 'Quem levantou o produto',
    data_levantamento TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    data_devolucao TIMESTAMP NULL,
    observacoes TEXT,
    FOREIGN KEY (id_cartao_nfc) REFERENCES cartao_nfc(id_cartao_nfc) ON DELETE CASCADE,
    FOREIGN KEY (id_reserva) REFERENCES reserva(id_reserva) ON DELETE CASCADE,
    FOREIGN KEY (id_aluno) REFERENCES aluno(id_aluno) ON DELETE SET NULL
);

-- Índices
CREATE INDEX idx_nfc_artigo ON cartao_nfc(id_artigo);
CREATE INDEX idx_historico_reserva ON cartao_nfc_historico(id_reserva);
CREATE INDEX idx_historico_aluno ON cartao_nfc_historico(id_aluno);
CREATE INDEX idx_historico_devolucao ON cartao_nfc_historico(data_devolucao);

-- ===========================================
-- INSERIR CURSOS
-- ===========================================
INSERT INTO curso (nome_curso) VALUES
('Engenharia Informática'),
('Engenharia Eletrónica e Automação'),
('Tecnologias de Informação'),
('Gestão de Sistemas Industriais');

-- ===========================================
-- INSERIR PESSOAS
-- ===========================================
INSERT INTO pessoa (nome_pessoa, password) VALUES
('Tiago Almeida', '$2y$10$XPcMU8PX4Gn8G/LmucGzdecDT0jd2lnwMkm5DeM/dQ0S3/opOzdE.'),
('Pedro Santos', '$2y$10$XPcMU8PX4Gn8G/LmucGzdecDT0jd2lnwMkm5DeM/dQ0S3/opOzdE.'),
('David Costa', '$2y$10$XPcMU8PX4Gn8G/LmucGzdecDT0jd2lnwMkm5DeM/dQ0S3/opOzdE.');

-- ===========================================
-- INSERIR ALUNO / PROFESSOR / ADMINISTRADOR
-- ===========================================
INSERT INTO aluno (id_pessoa, id_curso, num_aluno, email_aluno) VALUES
(1, 1, 202301160, '202301160@estudantes.ips.pt');

INSERT INTO prof (id_pessoa, email_prof) VALUES
(2, '202501160@estssetubal.ips.pt');

INSERT INTO administrador (id_pessoa, email_admin) VALUES
(3, '202401160@estssetubal.ips.pt');

-- ===========================================
-- CATEGORIAS E SUBCATEGORIAS
-- ===========================================
INSERT INTO categoria (nome_cat) VALUES
('Microcontroladores'),
('Sensores'),
('Atuação e Controlo'),
('Componentes Eletrónicos'),
('Comunicação e Redes'),
('Energia e Alimentação');

INSERT INTO subcategoria (nome_subcat, id_cat) VALUES
-- Microcontroladores
('Arduino Uno', 1),
('Arduino Mega', 1),
('ESP32', 1),
('Raspberry Pi 4', 1),
-- Sensores
('Sensor Ultrassónico HC-SR04', 2),
('Sensor de Temperatura DHT11', 2),
('Sensor de Humidade DHT22', 2),
('Sensor de Movimento PIR', 2),
('Sensor de Luz LDR', 2),
-- Atuação e Controlo
('Servo Motor SG90', 3),
('Relé 5V', 3),
('Motor DC', 3),
('Driver L298N', 3),
-- Componentes Eletrónicos
('LED Vermelho', 4),
('LED Verde', 4),
('LED Azul', 4),
('Resistor 220Ω', 4),
('Resistor 10kΩ', 4),
('Breadboard', 4),
('Jumper Wires', 4),
-- Comunicação e Redes
('Módulo Bluetooth HC-05', 5),
('Módulo WiFi ESP8266', 5),
('Módulo RF 433MHz', 5),
-- Energia e Alimentação
('Fonte 5V 2A', 6),
('Bateria 9V', 6),
('Carregador USB-C', 6);

-- ===========================================
-- LABORATÓRIOS
-- ===========================================
INSERT INTO lab (num_lab) VALUES
(1),
(2);

-- ===========================================
-- ARTIGOS (5 produtos por lab = 10 total)
-- ===========================================
INSERT INTO artigo (nome_artigo, num_serial, id_subcat) VALUES
-- Produtos para Lab 1
('Arduino Uno R3', 'A1001', 1),
('ESP32 DevKit', 'E1001', 3),
('Sensor Ultrassónico HC-SR04', 'S2001', 5),
('Servo Motor SG90', 'M3001', 10),
('Breadboard 830 pontos', 'E4006', 19),
-- Produtos para Lab 2
('Raspberry Pi 4B', 'R1001', 4),
('Sensor DHT22', 'S2003', 7),
('Motor DC 5V', 'M3003', 12),
('Módulo Bluetooth HC-05', 'C5001', 21),
('Fonte 5V 2A', 'P6001', 24);

-- ===========================================
-- ASSOCIAR ARTIGOS AOS LABORATÓRIOS
-- ===========================================
INSERT INTO artigo_lab (id_artigo, id_lab) VALUES
-- Lab 1
(1, 1), -- Arduino Uno R3
(2, 1), -- ESP32 DevKit
(3, 1), -- Sensor Ultrassónico HC-SR04
(4, 1), -- Servo Motor SG90
(5, 1), -- Breadboard 830 pontos
-- Lab 2
(6, 2), -- Raspberry Pi 4B
(7, 2), -- Sensor DHT22
(8, 2), -- Motor DC 5V
(9, 2), -- Módulo Bluetooth HC-05
(10, 2); -- Fonte 5V 2A

-- ===========================================
-- ESTADOS
-- ===========================================
INSERT INTO estado (id_estado, descricao) VALUES
('P', 'Pendente'),
('A', 'Aprovado'),
('R', 'Rejeitado'),
('L', 'A Levantar'),
('E', 'Levantado'),
('D', 'Devolvido');

-- ===========================================
-- TAGS NFC ALEATÓRIAS PARA CADA PRODUTO
-- ===========================================
INSERT INTO cartao_nfc (uid_nfc, id_artigo, ativo) VALUES
-- Tags NFC para Lab 1
('04:A3:2F:BA:E6:5C:80', 1, TRUE), -- Arduino Uno R3
('04:7D:91:3A:12:4B:81', 2, TRUE), -- ESP32 DevKit
('04:C5:68:FA:29:8E:80', 3, TRUE), -- Sensor Ultrassónico HC-SR04
('04:1B:D4:6C:7F:A2:81', 4, TRUE), -- Servo Motor SG90
('04:8E:42:BD:93:1C:80', 5, TRUE), -- Breadboard 830 pontos
-- Tags NFC para Lab 2
('04:F2:7A:4D:B8:65:81', 6, TRUE), -- Raspberry Pi 4B
('04:36:C1:8F:2E:D4:80', 7, TRUE), -- Sensor DHT22
('04:9A:5B:E3:71:26:81', 8, TRUE), -- Motor DC 5V
('04:D7:18:A9:4F:B3:80', 9, TRUE), -- Módulo Bluetooth HC-05
('04:52:E6:3C:8D:74:81', 10, TRUE); -- Fonte 5V 2A

-- ===========================================
-- ADMIN LAB TABLE
-- ===========================================
CREATE TABLE adminlab (
    id_adminlab INT AUTO_INCREMENT PRIMARY KEY,
    id_admin INT NOT NULL,
    id_lab INT NOT NULL,
    data_atribuicao DATE,
    FOREIGN KEY (id_admin) REFERENCES administrador(id_admin),
    FOREIGN KEY (id_lab) REFERENCES lab(id_lab)
);
