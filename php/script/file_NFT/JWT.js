// @time token
function setCookie(name, value, days) {
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie =
    name +
    "=" +
    encodeURIComponent(value) +
    "; expires=" +
    expires +
    "; path=/";
}

// @ເລຶ່ມສ້າງ token
function getCookie(APialchemyKey) {
  return document.cookie.split("; ").reduce((r, v) => {
    const parts = v.split("=");
    return parts[0] === APialchemyKey ? decodeURIComponent(parts[1]) : r;
  }, "");
}

// @select token
// function opentoMadotoken() {
//   let token = getCookie("alchemyKey");
//   if (!token) {
//     token = localStorage.getItem("alchemyKey");
//   }
//   if (!token) {
//     alert("Please connect Alchemy Key first");
//     return;
//   }
//   console.log("Alchemy Key:", token);
// }

// @ສ້າງ token
function saveToCookie() {
  setCookie("alchemyKey", token, 7);
  localStorage.setItem("alchemyKey", token);
}

// @delete token
function cleartoken(alchemyKey) {
  setCookie(alchemyKey, "", -1);
  localStorage.removeItem(alchemyKey);
}

function toChainNum(chainId) {
  if (chainId === null || chainId === undefined) return 0;
  if (typeof chainId === "number") return chainId;
  return parseInt(chainId, 16);
}