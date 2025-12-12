<?php
require_once __DIR__ . '/../config/database.php';

class User {
    private $conn;
    private $table = 'pessoa';

    public $id_pessoa;
    public $nome;
    public $password;

    public function __construct() {
        $this->conn = Database::getInstance()->getConnection();
    }
    public function criar() {
        $query = "INSERT INTO " . $this->table . " (nome_pessoa, password) VALUES (:nome_pessoa, :password)";
        $stmt = $this->conn->prepare($query);
        $password_hash = password_hash($this->password, PASSWORD_BCRYPT);
        $stmt->bindParam(':nome_pessoa', $this->nome);
        $stmt->bindParam(':password', $password_hash);
        if ($stmt->execute()) return $this->conn->lastInsertId();
        return false;
    }
    public function login($email, $password) {
        $query = "SELECT p.id_pessoa, p.nome_pessoa, p.password
                  FROM pessoa p
                  LEFT JOIN aluno a ON p.id_pessoa = a.id_pessoa
                  LEFT JOIN prof pr ON p.id_pessoa = pr.id_pessoa
                  LEFT JOIN administrador ad ON p.id_pessoa = ad.id_pessoa
                  WHERE a.email_aluno = :email OR pr.email_prof = :email2 OR ad.email_admin = :email3";

        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':email', $email);
        $stmt->bindParam(':email2', $email);
        $stmt->bindParam(':email3', $email);
        $stmt->execute();
        $user = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($user && password_verify($password, $user['password'])) {
            return $user;
        }
        return false;
    }
    public function obterTipo($id_pessoa) {
        $stmt = $this->conn->prepare("SELECT id_aluno FROM aluno WHERE id_pessoa = :id");
        $stmt->bindParam(':id', $id_pessoa);
        $stmt->execute();
        if ($stmt->fetch()) return 'aluno';

        $stmt = $this->conn->prepare("SELECT id_prof FROM prof WHERE id_pessoa = :id");
        $stmt->bindParam(':id', $id_pessoa);
        $stmt->execute();
        if ($stmt->fetch()) return 'professor';

        $stmt = $this->conn->prepare("SELECT id_admin FROM administrador WHERE id_pessoa = :id");
        $stmt->bindParam(':id', $id_pessoa);
        $stmt->execute();
        if ($stmt->fetch()) return 'administrador';

        return null;
    }
}

