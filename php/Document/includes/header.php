<!DOCTYPE html>
<html lang="lo">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>NFT LAO Docs</title>
  <link rel="stylesheet" href="/Document/assets/css/style.css">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css">
</head>
<body>

<!-- Mobile overlay -->
<div class="overlay" id="overlay"></div>

<!-- ══ SIDEBAR ══ -->
<aside class="sidebar" id="sidebar" aria-label="ການນຳທາງເອກະສານ">

  <div class="sidebar-brand">
    <div class="brand-icon"><i class="fa-solid fa-diagram-project"></i></div>
    <span class="brand-text">NFT LAO Docs</span>
  </div>

  <ul class="sidebar-nav" role="list">

    <li class="nav-label" aria-hidden="true">ເລີ່ມຕົ້ນ</li>

    <li class="nav-item">
      <a href="/Document/index.php" class="nav-link" data-tip="Overview">
        <i class="fa-solid fa-house" aria-hidden="true"></i>
        <span class="label">Overview</span>
      </a>
    </li>

    <li class="nav-item" id="navGetting">
      <button class="nav-toggle" data-tip="Getting Started" aria-expanded="false" aria-controls="sub-getting">
        <i class="fa-solid fa-rocket" aria-hidden="true"></i>
        <span class="label">Getting Started</span>
        <i class="fa-solid fa-chevron-down nav-arrow" aria-hidden="true"></i>
      </button>
      <ul class="nav-sub" id="sub-getting">
        <li><a href="/Document/pages/installation.php">ການຕິດຕັ້ງ</a></li>
        <li><a href="/Document/index.php">Quick Start</a></li>
      </ul>
    </li>

    <li class="nav-label" aria-hidden="true">NFT Guide</li>

    <li class="nav-item" id="navNFT">
      <button class="nav-toggle" data-tip="NFT Guide" aria-expanded="false" aria-controls="sub-nft">
        <i class="fa-solid fa-image" aria-hidden="true"></i>
        <span class="label">NFT Guide</span>
        <i class="fa-solid fa-chevron-down nav-arrow" aria-hidden="true"></i>
      </button>
      <ul class="nav-sub" id="sub-nft">
        <li><a href="/Document/pages/nft-guide.php#mint">Mint NFT</a></li>
        <li><a href="/Document/pages/nft-guide.php#transfer">ໂອນ NFT</a></li>
        <li><a href="/Document/pages/nft-guide.php#view">ເບິ່ງ Collection</a></li>
      </ul>
    </li>

    <li class="nav-label" aria-hidden="true">Reference</li>

    <li class="nav-item" id="navContract">
      <button class="nav-toggle" data-tip="Smart Contracts" aria-expanded="false" aria-controls="sub-contract">
        <i class="fa-solid fa-file-code" aria-hidden="true"></i>
        <span class="label">Smart Contracts</span>
        <i class="fa-solid fa-chevron-down nav-arrow" aria-hidden="true"></i>
      </button>
      <ul class="nav-sub" id="sub-contract">
        <li><a href="/Document/pages/smart-contract.php#address">Contract Address</a></li>
        <li><a href="/Document/pages/smart-contract.php#functions">Functions</a></li>
        <li><a href="/Document/pages/smart-contract.php#events">Events</a></li>
      </ul>
    </li>

    <li class="nav-label" aria-hidden="true">ເພີ່ມເຕີມ</li>

    <li class="nav-item">
      <a href="/Document/pages/about.php" class="nav-link" data-tip="About">
        <i class="fa-solid fa-circle-info" aria-hidden="true"></i>
        <span class="label">About</span>
      </a>
    </li>
    <li class="nav-item">
      <a href="/support/support.php" class="nav-link" data-tip="Support">
        <i class="fa-solid fa-headset" aria-hidden="true"></i>
        <span class="label">Support</span>
      </a>
    </li>

  </ul>

  <div class="sidebar-foot">
    <span class="chain-badge">Chain ID 5222</span>
    <span class="sidebar-foot-text">LABChain · EVM</span>
  </div>

</aside>

<!-- ══ TOP BAR ══ -->
<header class="topbar">
  <button class="topbar-toggle" id="sidebarToggle" aria-label="Toggle sidebar" aria-expanded="false" aria-controls="sidebar">
    <i class="fa-solid fa-bars" aria-hidden="true"></i>
  </button>

  <div class="topbar-search" role="search">
    <i class="fa-solid fa-magnifying-glass" aria-hidden="true"></i>
    <label for="doc-search" class="sr-only">ຄົ້ນຫາເອກະສານ</label>
    <input type="search" id="doc-search" placeholder="ຄົ້ນຫາ..." aria-label="ຄົ້ນຫາເອກະສານ">
  </div>

  <div class="topbar-right">
    <a href="/index.php" class="topbar-btn">
      <i class="fa-solid fa-arrow-left" aria-hidden="true"></i> ກັບໄປ
    </a>
  </div>
</header>
