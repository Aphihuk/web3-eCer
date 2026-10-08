<?php
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit; }

require_once __DIR__ . '/../config/contract.config.php';
define('BACKEND', _API_URL);

// Forward the Authorization header sent by the browser.
// apache_request_headers() only exists under Apache; under "php -S" it is undefined,
// so fall back to the CGI/$_SERVER variables and guard the Apache-only path.
$_authHeader = $_SERVER['HTTP_AUTHORIZATION'] ?? $_SERVER['REDIRECT_HTTP_AUTHORIZATION'] ?? '';
if ($_authHeader === '' && function_exists('apache_request_headers')) {
    $_apacheHeaders = apache_request_headers();
    $_authHeader = $_apacheHeaders['Authorization'] ?? $_apacheHeaders['authorization'] ?? '';
}
if ($_authHeader && str_starts_with($_authHeader, 'Bearer ')) {
    $_authToken = $_authHeader;
}

function backend_call(string $method, string $path, array $body = []): string {
    global $_authToken;
    $headers = "Content-Type: application/json\r\n";
    if ($_authToken) {
        $headers .= "Authorization: {$_authToken}\r\n";
    }
    $opts = [
        'http' => [
            'method'        => $method,
            'header'        => $headers,
            'timeout'       => 10,
            'ignore_errors' => true,
        ],
    ];
    if ($body) {
        $json                      = json_encode($body);
        $opts['http']['content']   = $json;
        $opts['http']['header']   .= 'Content-Length: ' . strlen($json) . "\r\n";
    }
    $result = file_get_contents(BACKEND . $path, false, stream_context_create($opts));
    $code   = 500;
    if (isset($http_response_header[0])) {
        preg_match('/HTTP\/\S+\s+(\d+)/', $http_response_header[0], $m);
        $code = (int)($m[1] ?? 500);
    }
    if ($result === false) {
        http_response_code(503);
        echo json_encode(['ok' => false, 'msg' => 'ບໍ່ສາມາດເຊື່ອມຕໍ່ Server']);
        exit;
    }
    http_response_code($code);
    return $result;
}

$body   = json_decode(file_get_contents('php://input'), true) ?? [];
$action = $_GET['action'] ?? $body['action'] ?? '';


if ($action === 'list') {
    echo backend_call('GET', '/tickets');
    exit;
}

if ($action === 'read') {
    $id = $body['id'] ?? '';
    echo backend_call('PATCH', '/tickets/' . urlencode($id) . '/read');
    exit;
}

if ($action === 'delete') {
    $id = $body['id'] ?? '';
    echo backend_call('DELETE', '/tickets/' . urlencode($id));
    exit;
}

if ($action === 'reply') {
    $id    = $body['id']    ?? '';
    $reply = $body['reply'] ?? '';
    if (!$id || !trim($reply)) {
        http_response_code(400);
        echo json_encode(['ok' => false, 'msg' => 'ຂໍ້ມູນບໍ່ຄົບ']);
        exit;
    }
    echo backend_call('POST', '/tickets/' . urlencode($id) . '/reply', ['reply' => $reply]);
    exit;
}

http_response_code(400);
echo json_encode(['ok' => false, 'msg' => 'Unknown action']);
