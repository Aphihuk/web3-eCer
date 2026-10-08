function nftImgErr(el) {
  if (el.dataset.f) { el.src = el.dataset.f; el.dataset.f = ''; return; }
  el.parentElement.innerHTML = '<div class="nft-no-image"><div class="icon"></div>ບໍ່ມີຮູບ</div>';
}


function renderSkeletonGrid(count) {
  const grid = document.getElementById("nftGrid");
  const controls = document.getElementById("nftControls");
  grid.style.display = "grid";
  controls.style.display = "flex";
  grid.innerHTML = "";

  for (var i = 0; i < count; i++) {
    var slot = document.createElement("div");
    slot.id = "nft-slot-" + i;
    slot.className = "nft-card skeleton";
    slot.setAttribute("aria-hidden", "true");
    slot.innerHTML =
      '<div class="nft-image-wrap">' +
        '<div class="skeleton-block" style="width:100%;height:100%;border-radius:0;"></div>' +
      '</div>' +
      '<div class="nft-info">' +
        '<div class="skeleton-block" style="height:16px;width:65%;margin-bottom:9px;"></div>' +
        '<div class="skeleton-block" style="height:12px;width:42%;"></div>' +
      '</div>';
    grid.appendChild(slot);
  }
}


function replaceSkeletonCard(idx, nft) {
  var slot = document.getElementById("nft-slot-" + idx);
  if (!slot) return;
  var card = createNFTCard(nft, 0);
  slot.replaceWith(card);
}

function createNFTCard(nft, animIdx) {
  var card = document.createElement("div");
  card.className = "nft-card";
  card.setAttribute("role", "listitem");
  card.setAttribute("tabindex", "0");
  card.style.animationDelay = (animIdx * 0.05) + "s";
  card.onclick = function() { openModal(nft); };
  card.onkeydown = function(e) { if (e.key === "Enter" || e.key === " ") openModal(nft); };

  // Image — with IPFS fallback gateways
  var imgHtml;
  if (nft.image) {
    var _cid = nft.image.includes("/ipfs/") ? nft.image.split("/ipfs/")[1] : null;
    var _fb1 = _cid ? "https://ipfs.io/ipfs/" + _cid : "";
    var _fb2 = _cid ? "https://cloudflare-ipfs.com/ipfs/" + _cid : "";
    imgHtml = '<img src="' + nft.image + '" alt="' + (nft.name || "") + '" loading="lazy"' +
      (_fb1 ? ' data-f="' + _fb1 + '" data-f2="' + _fb2 + '" onload="this.dataset.f=this.dataset.f2||\'\';"' : '') +
      ' onerror="nftImgErr(this)">';
  } else {
    imgHtml = '<div class="nft-no-image"><div class="icon"></div>ບໍ່ມີຮູບ</div>';
  }


  var transferChip = nft.isTransferable !== undefined
    ? '<div class="trans-chip">' +
        (nft.isTransferable
          ? '<span style="color:var(--success);font-size:0.7rem;"> ໂອນໄດ້</span>'
          : '<span style="color:var(--muted);font-size:0.7rem;"> ໂອນບໍ່ໄດ້</span>') +
      '</div>'
    : '';


  var descHtml = '';
  if (nft.description) {
    var d = nft.description;
    var sep = d.includes("\nຜູ້ສົ່ງ:")   ? "\nຜູ້ສົ່ງ:"
            : d.includes("— ຜູ້ສົ່ງ:") ? "— ຜູ້ສົ່ງ:"
            : d.includes("—ຜູ້ສົ່ງ:")  ? "—ຜູ້ສົ່ງ:"
            : d.includes("- ຜູ້ສົ່ງ:")  ? "- ຜູ້ສົ່ງ:"
            : null;
    if (sep) {
      var parts = d.split(sep);
      descHtml = '<div class="nft-desc">' + parts[0].trim() + '</div>' +
                 '<div class="nft-sender">ຜູ້ສົ່ງ: ' + parts[1].trim() + '</div>';
    } else {
      descHtml = '<div class="nft-desc">' + d + '</div>';
    }
  }

  // Date
  var dateHtml = nft.issuedAt
    ? '<div class="nft-date">' +
        new Date(Number(nft.issuedAt) * 1000).toLocaleDateString("lo-LA", {
          year: "numeric", month: "short", day: "numeric"
        }) +
      '</div>'
    : '';

  card.innerHTML =
    '<div class="nft-image-wrap">' +
      imgHtml +
      '<div class="token-id-overlay">#' + nft.tokenId + '</div>' +
    '</div>' +
    '<div class="nft-info">' +
      '<div class="nft-name">' + (nft.name || 'Badge #' + nft.tokenId) + '</div>' +
      '<div class="nft-collection">' + (nft.collection || '') + '</div>' +
      descHtml +
      dateHtml +
      transferChip +
    '</div>';

  return card;
}


function renderGrid(nfts) {
  var grid = document.getElementById("nftGrid");
  var controls = document.getElementById("nftControls");
  grid.style.display = "grid";
  controls.style.display = "flex";
  grid.innerHTML = "";

  nfts.forEach(function(nft, i) {
    grid.appendChild(createNFTCard(nft, i));
  });


  var badge = document.getElementById("nftCountBadge");
  if (badge) badge.textContent = nfts.length;
}
