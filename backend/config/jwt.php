<?php
if (!class_exists('Firebase\JWT\JWT')) {
    require_once __DIR__ . '/../vendor/autoload.php';
}
use Firebase\JWT\JWT as FirebaseJWT;
use Firebase\JWT\Key;

require_once __DIR__ . '/helpers.php';

class JWT {
    private static $secret;
    private static $algorithm;
    private static $expiration;

    private static function init() {
        if (!self::$secret) {
            self::$secret = obterVariavelAmbiente('JWT_SECRET');
            self::$algorithm = obterVariavelAmbiente('JWT_ALGORITHM', 'HS256');
            self::$expiration = (int)obterVariavelAmbiente('JWT_EXPIRATION', 3600);

            if (empty(self::$secret)) {
                throw new Exception("JWT_SECRET nÃ£o estÃ¡ configurado");
            }
        }
    }

    public static function encode(array $payload) {
        self::init();
        $payload['iat'] = time();
        $payload['exp'] = time() + self::$expiration;
        return FirebaseJWT::encode($payload, self::$secret, self::$algorithm);
    }

    public static function decode(string $token) {
        self::init();

        try {
            $decoded = FirebaseJWT::decode($token, new Key(self::$secret, self::$algorithm));
            return (array)$decoded;

        } catch (\Firebase\JWT\ExpiredException $e) {
            throw new Exception("Token expirado");
        } catch (\Firebase\JWT\SignatureInvalidException $e) {
            throw new Exception("Assinatura do token invÃ¡lida");
        } catch (\Exception $e) {
            throw new Exception("Formato de token invÃ¡lido");
        }
    }
}
