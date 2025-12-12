-- Criar tabela cartao_rfid
-- Execute este script no seu banco de dados stock_manager

CREATE TABLE IF NOT EXISTS `cartao_rfid` (
    `id` INT PRIMARY KEY AUTO_INCREMENT,
    `uid` VARCHAR(50) UNIQUE NOT NULL COMMENT 'UID único do cartão (ex: 1A2B3C4D)',
    `id_artigo` INT DEFAULT NULL COMMENT 'ID do artigo associado',
    `status` ENUM('ativo', 'inativo', 'disponivel') DEFAULT 'ativo' COMMENT 'Status do cartão',
    `data_associacao` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Data de associação',
    `ultimo_uso` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Última vez que foi lido',
    `criado_em` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Data de criação do registro',
    
    -- Índices para performance
    UNIQUE INDEX `idx_uid` (`uid`),
    INDEX `idx_id_artigo` (`id_artigo`),
    INDEX `idx_status` (`status`),
    INDEX `idx_ultimo_uso` (`ultimo_uso`),
    
    -- Foreign key com artigo
    CONSTRAINT `fk_cartao_rfid_artigo` 
        FOREIGN KEY (`id_artigo`) 
        REFERENCES `artigo`(`id_artigo`) 
        ON DELETE SET NULL 
        ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Cartões RFID RC522 e sua associação com artigos';

-- Criar índice composto para buscas rápidas
CREATE INDEX idx_artigo_status ON cartao_rfid(id_artigo, status);

-- Inserir alguns dados de exemplo (opcional)
INSERT INTO `cartao_rfid` (`uid`, `id_artigo`, `status`) VALUES
('AABBCCDD', 1, 'ativo'),
('11223344', 2, 'ativo'),
('99887766', NULL, 'disponivel')
ON DUPLICATE KEY UPDATE `status` = VALUES(`status`);

-- Visualizar a tabela criada
SELECT * FROM cartao_rfid;

-- Ver estrutura da tabela
DESCRIBE cartao_rfid;
