<?php
require_once __DIR__ . '/../config/contract.config.php';
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['ok' => false, 'msg' => 'Method not allowed']);
    exit;
}

$data   = json_decode(file_get_contents('php://input'), true) ?? [];
$name   = trim($data['name']   ?? '');
$email  = trim($data['email']  ?? '');
$type   = trim($data['type']   ?? '');
$msg    = trim($data['msg']    ?? '');
$wallet = trim($data['wallet'] ?? '');

if (!$name || !$email || !$type || !$msg) {
    http_response_code(400);
    echo json_encode(['ok' => false, 'msg' => 'ຂໍ້ມູນບໍ່ຄົບ']);
    exit;
}
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode(['ok' => false, 'msg' => 'Email ບໍ່ຖືກຕ້ອງ']);
    exit;
}

$payload = json_encode([
    'name' => $name, 'email' => $email,
    'type' => $type, 'msg'   => $msg, 'wallet' => $wallet,
]);

$ctx = stream_context_create([
    'http' => [
        'method'        => 'POST',
        'header'        => "Content-Type: application/json\r\nContent-Length: " . strlen($payload) . "\r\n",
        'content'       => $payload,
        'timeout'       => 10,
        'ignore_errors' => true,
    ],
]);

$result   = file_get_contents(_API_URL . '/tickets', false, $ctx);
$httpCode = 500;
if (isset($http_response_header[0])) {
    preg_match('/HTTP\/\S+\s+(\d+)/', $http_response_header[0], $m);
    $httpCode = (int)($m[1] ?? 500);
}

if ($result === false) {
    http_response_code(503);
    echo json_encode(['ok' => false, 'msg' => 'ບໍ່ສາມາດເຊື່ອມຕໍ່ Server']);
    exit;
}

http_response_code($httpCode);
echo $result;
