<?php

class Report
{
    private $pdo;

    public static $tipos = ['partido', 'faltando', 'funcionamento', 'outro'];

    public function __construct($pdo)
    {
        $this->pdo = $pdo;
    }

    public function getAll()
    {
        $sql = "
            SELECT 
                r.id_report,
                r.id_reserva,
                r.tipo,
                r.titulo,
                r.descricao,
                res.motivo AS reserva_motivo,
                res.data_reserva,
                COALESCE(p_aluno.nome_pessoa, p_prof.nome_pessoa) AS nome,
                COALESCE(a.email_aluno, pr.email_prof) AS email
            FROM reports r
            LEFT JOIN reserva res ON r.id_reserva = res.id_reserva
            LEFT JOIN aluno a ON res.id_aluno = a.id_aluno
            LEFT JOIN pessoa p_aluno ON a.id_pessoa = p_aluno.id_pessoa
            LEFT JOIN prof pr ON res.id_prof = pr.id_prof
            LEFT JOIN pessoa p_prof ON pr.id_pessoa = p_prof.id_pessoa
            ORDER BY r.id_report DESC
        ";

        $stmt = $this->pdo->query($sql);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function getById($id)
    {
        $sql = "
            SELECT 
                r.id_report,
                r.id_reserva,
                r.tipo,
                r.titulo,
                r.descricao,
                res.motivo AS reserva_motivo,
                res.data_reserva,
                COALESCE(p_aluno.nome_pessoa, p_prof.nome_pessoa) AS nome,
                COALESCE(a.email_aluno, pr.email_prof) AS email
            FROM reports r
            LEFT JOIN reserva res ON r.id_reserva = res.id_reserva
            LEFT JOIN aluno a ON res.id_aluno = a.id_aluno
            LEFT JOIN pessoa p_aluno ON a.id_pessoa = p_aluno.id_pessoa
            LEFT JOIN prof pr ON res.id_prof = pr.id_prof
            LEFT JOIN pessoa p_prof ON pr.id_pessoa = p_prof.id_pessoa
            WHERE r.id_report = :id
        ";

        $stmt = $this->pdo->prepare($sql);
        $stmt->execute(['id' => $id]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    public function create($data)
    {
        $sql = "INSERT INTO reports (id_reserva, tipo, titulo, descricao) 
                VALUES (:id_reserva, :tipo, :titulo, :descricao)";

        $stmt = $this->pdo->prepare($sql);
        $stmt->execute([
            'id_reserva' => $data['id_reserva'],
            'tipo' => $data['tipo'],
            'titulo' => $data['titulo'],
            'descricao' => $data['descricao']
        ]);

        return $this->pdo->lastInsertId();
    }

    public function update($id, $data)
    {
        $fields = [];
        $params = ['id' => $id];

        if (isset($data['id_reserva'])) {
            $fields[] = "id_reserva = :id_reserva";
            $params['id_reserva'] = $data['id_reserva'];
        }
        if (isset($data['tipo'])) {
            $fields[] = "tipo = :tipo";
            $params['tipo'] = $data['tipo'];
        }
        if (isset($data['titulo'])) {
            $fields[] = "titulo = :titulo";
            $params['titulo'] = $data['titulo'];
        }
        if (isset($data['descricao'])) {
            $fields[] = "descricao = :descricao";
            $params['descricao'] = $data['descricao'];
        }

        if (empty($fields)) {
            return false;
        }

        $sql = "UPDATE reports SET " . implode(', ', $fields) . " WHERE id_report = :id";
        $stmt = $this->pdo->prepare($sql);
        return $stmt->execute($params);
    }

    public function delete($id)
    {
        $sql = "DELETE FROM reports WHERE id_report = :id";
        $stmt = $this->pdo->prepare($sql);
        return $stmt->execute(['id' => $id]);
    }

    public function validate($data, $isUpdate = false)
    {
        $errors = [];

        if (!$isUpdate || isset($data['id_reserva'])) {
            if (empty($data['id_reserva'])) {
                $errors[] = "id_reserva Ã© obrigatÃ³rio";
            }
        }

        if (!$isUpdate || isset($data['tipo'])) {
            if (empty($data['tipo'])) {
                $errors[] = "tipo Ã© obrigatÃ³rio";
            } elseif (!in_array($data['tipo'], self::$tipos)) {
                $errors[] = "tipo deve ser: " . implode(', ', self::$tipos);
            }
        }

        if (!$isUpdate || isset($data['titulo'])) {
            if (empty($data['titulo'])) {
                $errors[] = "titulo Ã© obrigatÃ³rio";
            } elseif (strlen($data['titulo']) > 150) {
                $errors[] = "titulo nÃ£o pode ter mais de 150 caracteres";
            }
        }

        if (!$isUpdate || isset($data['descricao'])) {
            if (empty($data['descricao'])) {
                $errors[] = "descricao Ã© obrigatÃ³ria";
            }
        }

        return $errors;
    }
}
