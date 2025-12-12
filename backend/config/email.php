<?php

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;
use PHPMailer\PHPMailer\SMTP;

require_once __DIR__ . '/../vendor/autoload.php';

class EmailConfig {
    public static function getMailer(): PHPMailer {
        $mail = new PHPMailer(true);

        try {

            $mail->SMTPDebug = SMTP::DEBUG_OFF;  
            $mail->Debugoutput = 'error_log';    
            $mail->isSMTP();
            $mail->Host       = 'mail.fernandoferreira.dev';
            $mail->SMTPAuth   = true;
            $mail->Username   = 'mailuser';
            $mail->Password   = 'mail';
            $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
            $mail->Port       = 587;
            $mail->CharSet    = 'UTF-8';

            $allowSelfSigned = (getenv('MAIL_ALLOW_SELF_SIGNED') === 'true');
            if ($allowSelfSigned) {
                $mail->SMTPOptions = [
                    'ssl' => [
                        'verify_peer' => false,
                        'verify_peer_name' => false,
                        'allow_self_signed' => true,
                    ],
                ];
            }

            $mailAuthType = getenv('MAIL_AUTH_TYPE');
            if ($mailAuthType) {
                $mail->AuthType = $mailAuthType;
            }

            $mail->setFrom(getenv('MAIL_FROM_ADDRESS'), getenv('MAIL_FROM_NAME'));

            return $mail;

        } catch (Exception $e) {
            $errorMsg = "[" . date('Y-m-d H:i:s') . "] PHPMailer setup error: " . $e->getMessage() . "\n";
            error_log($errorMsg);
            file_put_contents(__DIR__ . '/../storage/logs/email_errors.log', $errorMsg, FILE_APPEND);
            throw $e;
        }
    }
}

