<?php
require_once __DIR__ . '/../config/database.php';

class Artigo {
    private $conn;
    private $table = 'artigo';

    public $id_artigo;
    public $nome_artigo;
    public $num_serial;
    public $id_subcat;

    public function __construct() {
        $this->conn = Database::getInstance()->getConnection();
    }
    public function listarTodos() {
        $query = "SELECT 
                    a.id_artigo,
                    a.nome_artigo,
                    a.num_serial,
                    c.id_cat,
                    c.nome_cat,
                    s.id_subcat,
                    s.nome_subcat,
                    l.id_lab,
                    l.num_lab,
                    1 as quantidade_disponivel
                  FROM " . $this->table . " a
                  LEFT JOIN subcategoria s ON a.id_subcat = s.id_subcat
                  LEFT JOIN categoria c ON s.id_cat = c.id_cat
                  LEFT JOIN artigo_lab al ON a.id_artigo = al.id_artigo
                  LEFT JOIN lab l ON al.id_lab = l.id_lab
                  GROUP BY a.id_artigo, l.id_lab, c.id_cat, s.id_subcat
                  ORDER BY a.id_artigo";

        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
    public function listarPorLab($id_lab) {
        $query = "SELECT 
                    a.id_artigo,
                    a.nome_artigo,
                    a.num_serial,
                    c.id_cat,
                    c.nome_cat,
                    s.id_subcat,
                    s.nome_subcat,
                    l.id_lab,
                    l.num_lab,
                    COUNT(DISTINCT a.id_artigo) as quantidade
                  FROM " . $this->table . " a
                  LEFT JOIN subcategoria s ON a.id_subcat = s.id_subcat
                  LEFT JOIN categoria c ON s.id_cat = c.id_cat
                  LEFT JOIN artigo_lab al ON a.id_artigo = al.id_artigo
                  LEFT JOIN lab l ON al.id_lab = l.id_lab
                  WHERE l.id_lab = :id_lab
                  GROUP BY a.id_artigo, l.id_lab, c.id_cat, s.id_subcat
                  ORDER BY a.nome_artigo";

        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':id_lab', $id_lab);
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
    public function listarPorCategoria($id_cat) {
        $query = "SELECT 
                    a.id_artigo,
                    a.nome_artigo,
                    a.num_serial,
                    c.id_cat,
                    c.nome_cat,
                    s.id_subcat,
                    s.nome_subcat,
                    l.id_lab,
                    l.num_lab,
                    COUNT(DISTINCT a.id_artigo) as quantidade
                  FROM " . $this->table . " a
                  LEFT JOIN subcategoria s ON a.id_subcat = s.id_subcat
                  LEFT JOIN categoria c ON s.id_cat = c.id_cat
                  LEFT JOIN artigo_lab al ON a.id_artigo = al.id_artigo
                  LEFT JOIN lab l ON al.id_lab = l.id_lab
                  WHERE c.id_cat = :id_cat
                  GROUP BY a.id_artigo, l.id_lab, c.id_cat, s.id_subcat
                  ORDER BY a.nome_artigo";

        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':id_cat', $id_cat);
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
    public function obterPorId($id) {
        $query = "SELECT 
                    a.id_artigo,
                    a.nome_artigo,
                    a.num_serial,
                    c.id_cat,
                    c.nome_cat,
                    s.id_subcat,
                    s.nome_subcat
                  FROM " . $this->table . " a
                  LEFT JOIN subcategoria s ON a.id_subcat = s.id_subcat
                  LEFT JOIN categoria c ON s.id_cat = c.id_cat
                  WHERE a.id_artigo = :id";

        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':id', $id);
        $stmt->execute();
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }
    public function criar() {
        $query = "INSERT INTO " . $this->table . " 
                  (nome_artigo, num_serial, id_subcat) 
                  VALUES (:nome, :serial, :subcat)";

        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':nome', $this->nome_artigo);
        $stmt->bindParam(':serial', $this->num_serial);
        $stmt->bindParam(':subcat', $this->id_subcat);

        if ($stmt->execute()) {
            return $this->conn->lastInsertId();
        }
        return false;
    }
    public function atualizar() {
        $query = "UPDATE " . $this->table . " 
                  SET nome_artigo = :nome, 
                      num_serial = :serial, 
                      id_subcat = :subcat 
                  WHERE id_artigo = :id";

        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':nome', $this->nome_artigo);
        $stmt->bindParam(':serial', $this->num_serial);
        $stmt->bindParam(':subcat', $this->id_subcat);
        $stmt->bindParam(':id', $this->id_artigo);

        return $stmt->execute();
    }
    public function eliminar($id) {
        $query = "DELETE FROM " . $this->table . " WHERE id_artigo = :id";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':id', $id);
        return $stmt->execute();
    }
    public function adicionarAoLab($id_artigo, $id_lab) {
        $query = "INSERT INTO artigo_lab (id_artigo, id_lab) VALUES (:artigo, :lab)";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':artigo', $id_artigo);
        $stmt->bindParam(':lab', $id_lab);
        return $stmt->execute();
    }
    public function removerTodosLabs($id_artigo) {
        $query = "DELETE FROM artigo_lab WHERE id_artigo = :artigo";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':artigo', $id_artigo);
        return $stmt->execute();
    }
    public function setLab($id_artigo, $id_lab) {
        try {
            $this->removerTodosLabs($id_artigo);
            if ($id_lab === null || $id_lab === '' ) return true;
            return $this->adicionarAoLab($id_artigo, $id_lab);
        } catch (Exception $e) {
            return false;
        }
    }
    public function setQuantidadeIfExists($id_artigo, $quantidade) {
        $check = $this->conn->prepare("SHOW COLUMNS FROM " . $this->table . " LIKE 'quantidade'");
        $check->execute();
        $col = $check->fetch(PDO::FETCH_ASSOC);
        if (!$col) return true;

        $query = "UPDATE " . $this->table . " SET quantidade = :q WHERE id_artigo = :id";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':q', $quantidade);
        $stmt->bindParam(':id', $id_artigo);
        return $stmt->execute();
    }
    public function removerDoLab($id_artigo, $id_lab) {
        $query = "DELETE FROM artigo_lab WHERE id_artigo = :artigo AND id_lab = :lab";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':artigo', $id_artigo);
        $stmt->bindParam(':lab', $id_lab);
        return $stmt->execute();
    }
    public function pesquisar($termo) {
        $query = "SELECT 
                    a.id_artigo,
                    a.nome_artigo,
                    a.num_serial,
                    c.id_cat,
                    c.nome_cat,
                    s.id_subcat,
                    s.nome_subcat,
                    l.id_lab,
                    l.num_lab
                  FROM " . $this->table . " a
                  LEFT JOIN subcategoria s ON a.id_subcat = s.id_subcat
                  LEFT JOIN categoria c ON s.id_cat = c.id_cat
                  LEFT JOIN artigo_lab al ON a.id_artigo = al.id_artigo
                  LEFT JOIN lab l ON al.id_lab = l.id_lab
                  WHERE a.nome_artigo LIKE :termo 
                     OR a.num_serial LIKE :termo
                  ORDER BY a.nome_artigo";

        $stmt = $this->conn->prepare($query);
        $searchTerm = "%{$termo}%";
        $stmt->bindParam(':termo', $searchTerm);
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
}
?>
