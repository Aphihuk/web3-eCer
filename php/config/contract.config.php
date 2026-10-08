<?php
// Where the backend is reachable depends on how the backend itself runs.
//
//   native  `node server.js` on Windows -> Node listens on 3200 directly on the host.
//   Docker  docker compose (backend repo) -> Node's 3200 is only `expose`d, never
//           published, so the host-reachable entrypoint is the nginx container's port 85.
//
// PHP itself may run either inside the learnbadge_web container or natively (php -S).
// Inside that container "localhost" means the container itself, so the host must be
// addressed as host.docker.internal. Natively PHP shares the host network namespace.
$__nftInDocker = file_exists('/.dockerenv') || preg_match('/^[0-9a-f]{12}$/', (string) gethostname()) === 1;

$__backendPort = getenv('BACKEND_PORT') ?: '3200';
define('_API_BASE_URL',     $__nftInDocker ? "http://host.docker.internal:{$__backendPort}" : "http://localhost:{$__backendPort}");
define('_API_URL',          _API_BASE_URL . '/api');
define('_CHAIN_ID',         '5222');
define('_CONTRACT_ADDRESS', '0xA80ae5b8B672A9C5eF6eBB66c2A151854Ee1eEcD');
define('_PINATA_GATEWAY',   'https://gateway.pinata.cloud/ipfs/');
