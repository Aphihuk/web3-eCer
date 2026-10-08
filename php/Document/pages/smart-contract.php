<?php include '../includes/header.php'; ?>

<style>
.lang-lo { display: none; }
body.lang-lo-active .lang-en { display: none; }
body.lang-lo-active .lang-lo { display: inline; }
/* block-level lao spans */
body.lang-lo-active p.lang-lo,
body.lang-lo-active li.lang-lo,
body.lang-lo-active div.lang-lo { display: block; }
p.lang-lo, li.lang-lo, div.lang-lo { display: none; }

.lang-toggle {
  display: flex;
  align-items: center;
  gap: 0;
  border: 1px solid var(--border);
  border-radius: 8px;
  overflow: hidden;
  margin-left: auto;
  flex-shrink: 0;
}
.lang-btn {
  padding: 6px 14px;
  font-size: 12px;
  font-weight: 600;
  font-family: inherit;
  background: none;
  border: none;
  color: var(--text-muted);
  cursor: pointer;
  transition: background .15s, color .15s;
  min-height: 34px;
}
.lang-btn.active {
  background: var(--cyan-dim);
  color: var(--cyan);
}
.sc-hero-row {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  flex-wrap: wrap;
}
</style>

<main>

  <div class="page-hero">
    <div class="sc-hero-row">
      <div style="flex:1;min-width:0;">
        <p class="eyebrow"><i class="fa-solid fa-file-code"></i> &nbsp;Reference</p>
        <h1>Smart Contract Reference</h1>
        <p class="lang-en">Technical reference for the NFT LAO badge contract — architecture, state variables, functions, access control, and events. Written engineer-to-engineer.</p>
        <p class="lang-lo">ເອກະສານອ້າງອີງດ້ານວິຊາການຂອງ NFT LAO Badge Contract — ໂຄງສ້າງ, State Variables, Functions, Access Control ແລະ Events.</p>
      </div>
      <div class="lang-toggle" id="langToggle" role="group" aria-label="Language selector">
        <button class="lang-btn active" id="btnEn" onclick="setLang('en')">EN</button>
        <button class="lang-btn" id="btnLo" onclick="setLang('lo')">ລາວ</button>
      </div>
    </div>
    <div class="tag-row" style="margin-top:16px;">
      <span class="tag tag-cyan">Solidity ^0.8.20</span>
      <span class="tag tag-blue">ERC721 + URIStorage</span>
      <span class="tag tag-green">OpenZeppelin</span>
    </div>
  </div>

  <hr class="divider">

  <!-- Deployment -->
  <p class="section-title" id="address">
    <i class="fa-solid fa-map-pin"></i>
    <span class="lang-en">Deployment</span>
    <span class="lang-lo">ຂໍ້ມູນ Deployment</span>
  </p>
  <table class="doc-table">
    <thead>
      <tr>
        <th scope="col"><span class="lang-en">Field</span><span class="lang-lo">ຫົວຂໍ້</span></th>
        <th scope="col"><span class="lang-en">Value</span><span class="lang-lo">ຄ່າ</span></th>
      </tr>
    </thead>
    <tbody>
      <tr><td><span class="lang-en">Contract Address</span><span class="lang-lo">Contract Address</span></td><td><code>0xadDcFB1a988f199F977D678a3A42650b1740466C</code></td></tr>
      <tr><td><span class="lang-en">Network</span><span class="lang-lo">Network</span></td><td>LABChain Mainnet</td></tr>
      <tr><td><span class="lang-en">Chain ID</span><span class="lang-lo">Chain ID</span></td><td><code>5222</code></td></tr>
      <tr><td><span class="lang-en">Standard</span><span class="lang-lo">Standard</span></td><td>ERC721 + ERC721URIStorage</td></tr>
      <tr><td><span class="lang-en">Compiler</span><span class="lang-lo">Compiler</span></td><td>Solidity ^0.8.20</td></tr>
      <tr><td><span class="lang-en">Explorer</span><span class="lang-lo">Explorer</span></td><td><a href="https://explorer.labchain.la/token/0xadDcFB1a988f199F977D678a3A42650b1740466C" target="_blank" rel="noopener">explorer.labchain.la</a></td></tr>
    </tbody>
  </table>

  <hr class="divider">

  <!-- Architecture -->
  <p class="section-title">
    <i class="fa-solid fa-sitemap"></i>
    <span class="lang-en">Architecture</span>
    <span class="lang-lo">ໂຄງສ້າງ Contract</span>
  </p>
  <p class="lang-en" style="font-size:13.5px;color:var(--text-muted);line-height:1.9;max-width:700px;margin-bottom:16px;">
    The contract is an <strong style="color:var(--text)">ERC721 with optional Soulbound behavior</strong>. Every token has a <code>transferable</code> flag. When <code>false</code>, the <code>_update()</code> override blocks all transfers except minting and burning. When <code>true</code>, the token behaves as a standard ERC721 — but the recipient must be a registered, active user.
  </p>
  <p class="lang-lo" style="font-size:13.5px;color:var(--text-muted);line-height:1.9;max-width:700px;margin-bottom:16px;">
    Contract ນີ້ແມ່ນ <strong style="color:var(--text)">ERC721 ທີ່ຮອງຮັບ Soulbound</strong>. ທຸກ Token ມີ Flag <code>transferable</code>. ຖ້າ <code>false</code>, <code>_update()</code> ຈະ Block ການໂອນ. ຖ້າ <code>true</code>, ໂອນໄດ້ເໝືອນ ERC721 ທົ່ວໄປ — ແຕ່ຜູ້ຮັບຕ້ອງລົງທະບຽນ ແລະ Active ໃນລະບົບ.
  </p>
  <p class="lang-en" style="font-size:13.5px;color:var(--text-muted);line-height:1.9;max-width:700px;margin-bottom:16px;">
    User identity is fully on-chain via a <code>profiles</code> mapping. Registration is one-time and permissionless (except blacklist gate). The owner can delegate write access to <strong style="color:var(--text)">Operators</strong> without giving up ownership.
  </p>
  <p class="lang-lo" style="font-size:13.5px;color:var(--text-muted);line-height:1.9;max-width:700px;margin-bottom:16px;">
    Identity ຂອງ User ຖືກເກັບ On-chain ຜ່ານ mapping <code>profiles</code>. ການລົງທະບຽນໃຊ້ຄັ້ງດຽວ (ຍົກເວັ້ນ Blacklist). Owner ສາມາດ Delegate ສິດໃຫ້ <strong style="color:var(--text)">Operator</strong> ໂດຍບໍ່ຕ້ອງໂອນ Ownership.
  </p>
  <div class="callout callout-warn" role="note">
    <i class="fa-solid fa-triangle-exclamation"></i>
    <div>
      <span class="lang-en"><strong>Transfer gate:</strong> <code>_update()</code> checks <code>transferable[tokenId]</code> on every non-mint transfer. Admin functions (<code>adminForceRecover</code>, <code>revokeBadge</code>) temporarily set it to <code>true</code> then restore the original value — so they bypass the gate without permanently changing the flag.</span>
      <span class="lang-lo"><strong>Transfer Gate:</strong> <code>_update()</code> ກວດສອບ <code>transferable[tokenId]</code> ທຸກຄັ້ງທີ່ໂອນ. Function Admin (<code>adminForceRecover</code>, <code>revokeBadge</code>) ຈະ Set <code>true</code> ຊົ່ວຄາວ ແລ້ວ Restore ຄ່າເດີມ — ຈຶ່ງ Bypass Gate ໂດຍບໍ່ປ່ຽນ Flag ຖາວອນ.</span>
    </div>
  </div>

  <hr class="divider">

  <!-- State Variables -->
  <p class="section-title">
    <i class="fa-solid fa-database"></i>
    <span class="lang-en">Public State Variables</span>
    <span class="lang-lo">Public State Variables</span>
  </p>
  <table class="doc-table">
    <thead>
      <tr>
        <th scope="col"><span class="lang-en">Variable</span><span class="lang-lo">Variable</span></th>
        <th scope="col"><span class="lang-en">Type</span><span class="lang-lo">ປະເພດ</span></th>
        <th scope="col"><span class="lang-en">Description</span><span class="lang-lo">ຄຳອະທິບາຍ</span></th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><code>profiles[address]</code></td>
        <td>mapping → UserProfile</td>
        <td>
          <span class="lang-en"><code>{userType, name, active, recoveredTo, registeredAt}</code>. <code>userType == NONE</code> means unregistered.</span>
          <span class="lang-lo">ຂໍ້ມູນ User On-chain. <code>userType == NONE</code> ໝາຍຄວາມວ່າຍັງບໍ່ລົງທະບຽນ.</span>
        </td>
      </tr>
      <tr>
        <td><code>blacklisted[address]</code></td>
        <td>mapping → bool</td>
        <td>
          <span class="lang-en">Blocks registration and minting when true.</span>
          <span class="lang-lo">ຖ້າ <code>true</code> — ລົງທະບຽນ ແລະ Mint ບໍ່ໄດ້.</span>
        </td>
      </tr>
      <tr>
        <td><code>badges[tokenId]</code></td>
        <td>mapping → Badge</td>
        <td>
          <span class="lang-en"><code>{badgeName, activity, issuedTo, issuedAt}</code>.</span>
          <span class="lang-lo">Metadata ຂອງ Badge ແຕ່ລະ Token.</span>
        </td>
      </tr>
      <tr>
        <td><code>transferable[tokenId]</code></td>
        <td>mapping → bool</td>
        <td>
          <span class="lang-en">Transfer gate per token. Default <code>false</code> (Soulbound) unless set at mint.</span>
          <span class="lang-lo">ຄວບຄຸມການໂອນຕໍ່ Token. Default <code>false</code> (Soulbound) ຖ້າບໍ່ Set ຕອນ Mint.</span>
        </td>
      </tr>
      <tr>
        <td><code>studentBadges[address]</code></td>
        <td>mapping → uint256[]</td>
        <td>
          <span class="lang-en">All token IDs held by a wallet. Kept in sync on transfer and burn.</span>
          <span class="lang-lo">Token IDs ທັງໝົດຂອງ Wallet. ອັບເດດທຸກຄັ້ງທີ່ໂອນ ຫຼື Burn.</span>
        </td>
      </tr>
      <tr>
        <td><code>tokenURIHistory[tokenId]</code></td>
        <td>mapping → string[]</td>
        <td>
          <span class="lang-en">Previous metadata URIs appended each time <code>updateBadge()</code> is called.</span>
          <span class="lang-lo">URI ເກົ່າທຸກອັນ ທີ່ຖືກບັນທຶກທຸກຄັ້ງທີ່ <code>updateBadge()</code> ຖືກເອີ້ນ.</span>
        </td>
      </tr>
      <tr>
        <td><code>mintPrice</code></td>
        <td>uint256</td>
        <td>
          <span class="lang-en">Global mint fee in wei. 0 = free. Per-user override takes precedence.</span>
          <span class="lang-lo">ຄ່າ Mint ທົ່ວໄປ (wei). 0 = ຟຣີ. Per-user Override ຈະ Override ຄ່ານີ້.</span>
        </td>
      </tr>
      <tr>
        <td><code>recoveryFeePerNFT</code></td>
        <td>uint256</td>
        <td>
          <span class="lang-en">Fee per token for wallet recovery. 0 = free.</span>
          <span class="lang-lo">ຄ່າ Fee ຕໍ່ Token ສຳລັບ Wallet Recovery. 0 = ຟຣີ.</span>
        </td>
      </tr>
      <tr>
        <td><code>maxBadgePerUser</code></td>
        <td>uint256</td>
        <td>
          <span class="lang-en">Global badge cap per wallet. 0 = unlimited.</span>
          <span class="lang-lo">ຈຳກັດ Badge ຕໍ່ Wallet ທົ່ວໄປ. 0 = ບໍ່ຈຳກັດ.</span>
        </td>
      </tr>
      <tr>
        <td><code>operators[address]</code></td>
        <td>mapping → bool</td>
        <td>
          <span class="lang-en">Delegated write access. Set by owner only.</span>
          <span class="lang-lo">ສິດ Write ທີ່ Delegate. ກຳນົດໄດ້ໂດຍ Owner ເທົ່ານັ້ນ.</span>
        </td>
      </tr>
      <tr>
        <td><code>fundsReceiver</code></td>
        <td>address payable</td>
        <td>
          <span class="lang-en">Destination for <code>withdrawFunds()</code>. Defaults to deployer.</span>
          <span class="lang-lo">ທີ່ຢູ່ຮັບເງິນຈາກ <code>withdrawFunds()</code>. Default = Deployer.</span>
        </td>
      </tr>
      <tr>
        <td><code>mintingPaused</code></td>
        <td>bool</td>
        <td>
          <span class="lang-en">Global pause for <code>mintBadge</code> and <code>batchMintBadge</code>.</span>
          <span class="lang-lo">Pause ການ Mint ທົ່ວໄປ.</span>
        </td>
      </tr>
    </tbody>
  </table>

  <hr class="divider">

  <!-- Functions -->
  <p class="section-title" id="functions">
    <i class="fa-solid fa-function"></i>
    <span class="lang-en">Functions</span>
    <span class="lang-lo">Functions</span>
  </p>

  <!-- User functions -->
  <p style="font-size:13px;font-weight:600;color:var(--text-muted);text-transform:uppercase;letter-spacing:.06em;margin-bottom:10px;">
    <span class="lang-en">User-callable</span>
    <span class="lang-lo">User ເອີ້ນໄດ້</span>
  </p>
  <table class="doc-table" style="margin-bottom:28px;">
    <thead>
      <tr>
        <th scope="col">Function</th>
        <th scope="col"><span class="lang-en">Access</span><span class="lang-lo">ສິດ</span></th>
        <th scope="col"><span class="lang-en">Description</span><span class="lang-lo">ຄຳອະທິບາຍ</span></th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><code>register(string name)</code></td>
        <td><span class="lang-en">Anyone (not blacklisted, not yet registered)</span><span class="lang-lo">ທຸກຄົນ (ຖ້າບໍ່ຢູ່ Blacklist ແລະ ຍັງບໍ່ລົງທະບຽນ)</span></td>
        <td>
          <span class="lang-en">One-time on-chain registration. Sets <code>userType = USER</code>, <code>active = true</code>. Reverts if already registered or blacklisted.</span>
          <span class="lang-lo">ລົງທະບຽນຄັ້ງດຽວ On-chain. ຕັ້ງ <code>userType = USER</code>, <code>active = true</code>. Revert ຖ້າລົງທະບຽນແລ້ວ ຫຼື ຢູ່ Blacklist.</span>
        </td>
      </tr>
      <tr>
        <td><code>mintBadge(address student, string badgeName, string activity, string tokenURI_, bool isTransferable) payable → uint256</code></td>
        <td><code>onlyRegistered</code>, <code>notBlacklisted</code>, <code>whenNotPaused</code></td>
        <td>
          <span class="lang-en">Mints one badge to <code>student</code> (must be registered and active). Caller pays <code>getMintPriceFor(msg.sender)</code>. Returns the new <code>tokenId</code>.</span>
          <span class="lang-lo">Mint Badge ໜຶ່ງໃຫ້ <code>student</code> (ຕ້ອງລົງທະບຽນ ແລະ Active). ຜູ້ເອີ້ນຈ່າຍ <code>getMintPriceFor(msg.sender)</code>. Return <code>tokenId</code> ໃໝ່.</span>
        </td>
      </tr>
      <tr>
        <td><code>batchMintBadge(address[] students, string badgeName, string activity, string tokenURI_, bool isTransferable) payable</code></td>
        <td><code>onlyRegistered</code>, <code>notBlacklisted</code>, <code>whenNotPaused</code></td>
        <td>
          <span class="lang-en">Mints the same badge to multiple students in one tx. Required value = <code>mintPrice × students.length</code>.</span>
          <span class="lang-lo">Mint Badge ດຽວກັນໃຫ້ຫຼາຍ Student ໃນ Transaction ດຽວ. ຈ່າຍ = <code>mintPrice × ຈຳນວນ Student</code>.</span>
        </td>
      </tr>
      <tr>
        <td><code>recoverWalletSelected(address newWallet, uint256[] tokenIds) payable</code></td>
        <td><code>onlyRegistered</code></td>
        <td>
          <span class="lang-en">User-initiated wallet migration. Moves selected tokens to <code>newWallet</code>, deactivates caller's profile. Fee = <code>recoveryFeePerNFT × tokenIds.length</code>.</span>
          <span class="lang-lo">User ຍ້າຍ Wallet ດ້ວຍຕົນເອງ. ໂອນ Token ທີ່ເລືອກໄປ <code>newWallet</code>, Deactivate Profile ເກົ່າ. Fee = <code>recoveryFeePerNFT × ຈຳນວນ Token</code>.</span>
        </td>
      </tr>
    </tbody>
  </table>

  <!-- Owner+Operator -->
  <p style="font-size:13px;font-weight:600;color:var(--text-muted);text-transform:uppercase;letter-spacing:.06em;margin-bottom:10px;" id="admin">
    <span class="lang-en">Owner / Operator</span>
    <span class="lang-lo">Owner / Operator</span>
  </p>
  <table class="doc-table" style="margin-bottom:28px;">
    <thead>
      <tr>
        <th scope="col">Function</th>
        <th scope="col"><span class="lang-en">Access</span><span class="lang-lo">ສິດ</span></th>
        <th scope="col"><span class="lang-en">Description</span><span class="lang-lo">ຄຳອະທິບາຍ</span></th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><code>setTransferable(uint256 tokenId, bool status)</code></td>
        <td><code>onlyOwnerOrOperator</code></td>
        <td>
          <span class="lang-en">Enable or disable transfers for a specific token. Primary control for Soulbound behavior.</span>
          <span class="lang-lo">ເປີດ/ປິດ Transfer ສຳລັບ Token ສະເພາະ. ຄວບຄຸມ Soulbound.</span>
        </td>
      </tr>
      <tr>
        <td><code>revokeBadge(uint256 tokenId)</code></td>
        <td><code>onlyOwnerOrOperator</code></td>
        <td>
          <span class="lang-en">Burns the token. Temporarily sets <code>transferable = true</code> to allow the internal burn, then removes it. Emits <code>BadgeRevoked</code>.</span>
          <span class="lang-lo">Burn Token. Set <code>transferable = true</code> ຊົ່ວຄາວ ເພື່ອໃຫ້ Burn ໄດ້ ແລ້ວ Remove. Emit <code>BadgeRevoked</code>.</span>
        </td>
      </tr>
      <tr>
        <td><code>updateBadge(uint256 tokenId, string badgeName, string activity, string newTokenURI_)</code></td>
        <td><code>onlyOwnerOrOperator</code></td>
        <td>
          <span class="lang-en">Updates badge metadata. Appends old <code>tokenURI</code> to history before overwriting. Emits <code>TokenURIUpdated</code>.</span>
          <span class="lang-lo">ອັບເດດ Metadata Badge. ບັນທຶກ URI ເກົ່າໃສ່ History ກ່ອນ Overwrite. Emit <code>TokenURIUpdated</code>.</span>
        </td>
      </tr>
      <tr>
        <td><code>adminForceRecover(address oldWallet, address newWallet, uint256[] tokenIds)</code></td>
        <td><code>onlyOwnerOrOperator</code></td>
        <td>
          <span class="lang-en">Admin-side wallet migration. Bypasses recovery fee. Deactivates <code>oldWallet</code>. Both wallets must be registered and active.</span>
          <span class="lang-lo">Admin ຍ້າຍ Wallet ໃຫ້ User. ບໍ່ມີ Fee. Deactivate <code>oldWallet</code>. ທັງສອງ Wallet ຕ້ອງລົງທະບຽນ ແລະ Active.</span>
        </td>
      </tr>
      <tr>
        <td><code>setBlacklist(address wallet, bool status)</code></td>
        <td><code>onlyOwnerOrOperator</code></td>
        <td>
          <span class="lang-en">Add or remove a wallet from the blacklist. Blacklisted wallets cannot register or mint.</span>
          <span class="lang-lo">ເພີ່ມ/ລຶບ Wallet ອອກຈາກ Blacklist. Wallet ທີ່ Blacklist ລົງທະບຽນ ແລະ Mint ບໍ່ໄດ້.</span>
        </td>
      </tr>
      <tr>
        <td><code>reactivateWallet(address wallet)</code></td>
        <td><code>onlyOwnerOrOperator</code></td>
        <td>
          <span class="lang-en">Reactivates a deactivated profile. Clears <code>recoveredTo</code>.</span>
          <span class="lang-lo">Reactivate Profile ທີ່ຖືກ Deactivate. Clear <code>recoveredTo</code>.</span>
        </td>
      </tr>
      <tr>
        <td><code>updateProfile(address wallet, string newName)</code></td>
        <td><code>onlyOwnerOrOperator</code></td>
        <td>
          <span class="lang-en">Updates the on-chain display name for any registered wallet.</span>
          <span class="lang-lo">ອັບເດດ Display Name On-chain ຂອງ Wallet ທີ່ລົງທະບຽນ.</span>
        </td>
      </tr>
    </tbody>
  </table>

  <!-- Owner only -->
  <p style="font-size:13px;font-weight:600;color:var(--text-muted);text-transform:uppercase;letter-spacing:.06em;margin-bottom:10px;">
    <span class="lang-en">Owner-only</span>
    <span class="lang-lo">Owner ເທົ່ານັ້ນ</span>
  </p>
  <table class="doc-table" style="margin-bottom:28px;">
    <thead>
      <tr>
        <th scope="col">Function</th>
        <th scope="col"><span class="lang-en">Description</span><span class="lang-lo">ຄຳອະທິບາຍ</span></th>
      </tr>
    </thead>
    <tbody>
      <tr><td><code>setMintPrice(uint256)</code></td><td><span class="lang-en">Set global mint fee in wei.</span><span class="lang-lo">ກຳນົດ Mint Fee ທົ່ວໄປ (wei).</span></td></tr>
      <tr><td><code>setRecoveryFee(uint256)</code></td><td><span class="lang-en">Set global recovery fee per token in wei.</span><span class="lang-lo">ກຳນົດ Recovery Fee ຕໍ່ Token (wei).</span></td></tr>
      <tr><td><code>setMaxBadgePerUser(uint256)</code></td><td><span class="lang-en">Set global badge cap. 0 = unlimited.</span><span class="lang-lo">ຈຳກັດ Badge ຕໍ່ User ທົ່ວໄປ. 0 = ບໍ່ຈຳກັດ.</span></td></tr>
      <tr><td><code>setCustomMintPrice(address, uint256)</code></td><td><span class="lang-en">Per-wallet mint price override.</span><span class="lang-lo">ກຳນົດ Mint Price ສະເພາະ Wallet.</span></td></tr>
      <tr><td><code>setCustomRecoveryFee(address, uint256)</code></td><td><span class="lang-en">Per-wallet recovery fee override.</span><span class="lang-lo">ກຳນົດ Recovery Fee ສະເພາະ Wallet.</span></td></tr>
      <tr><td><code>setCustomMaxBadge(address, uint256)</code></td><td><span class="lang-en">Per-wallet badge cap override.</span><span class="lang-lo">ຈຳກັດ Badge ສະເພາະ Wallet.</span></td></tr>
      <tr><td><code>pauseMinting(bool)</code></td><td><span class="lang-en">Pause or unpause all minting globally.</span><span class="lang-lo">Pause/Unpause ການ Mint ທົ່ວໄປ.</span></td></tr>
      <tr><td><code>setOperator(address, bool)</code></td><td><span class="lang-en">Grant or revoke operator privileges.</span><span class="lang-lo">ໃຫ້/ຖອນສິດ Operator.</span></td></tr>
      <tr><td><code>setFundsReceiver(address payable)</code></td><td><span class="lang-en">Change the funds withdrawal destination.</span><span class="lang-lo">ປ່ຽນ Address ຮັບເງິນ.</span></td></tr>
      <tr><td><code>withdrawFunds()</code></td><td><span class="lang-en">Flush entire contract balance to <code>fundsReceiver</code>.</span><span class="lang-lo">ໂອນເງິນທັງໝົດໃນ Contract ໄປ <code>fundsReceiver</code>.</span></td></tr>
    </tbody>
  </table>

  <!-- View -->
  <p style="font-size:13px;font-weight:600;color:var(--text-muted);text-transform:uppercase;letter-spacing:.06em;margin-bottom:10px;">
    <span class="lang-en">Read-only (view)</span>
    <span class="lang-lo">Read-only (view)</span>
  </p>
  <table class="doc-table">
    <thead>
      <tr>
        <th scope="col">Function</th>
        <th scope="col"><span class="lang-en">Returns</span><span class="lang-lo">Return</span></th>
        <th scope="col"><span class="lang-en">Description</span><span class="lang-lo">ຄຳອະທິບາຍ</span></th>
      </tr>
    </thead>
    <tbody>
      <tr><td><code>getProfile(address)</code></td><td>UserProfile</td><td><span class="lang-en">Full profile struct for any wallet.</span><span class="lang-lo">Profile struct ທັງໝົດຂອງ Wallet.</span></td></tr>
      <tr><td><code>isActive(address)</code></td><td>bool</td><td><span class="lang-en">Quick active-status check.</span><span class="lang-lo">ກວດສອບສະຖານະ Active ຢ່າງໄວ.</span></td></tr>
      <tr><td><code>getBadgesOf(address)</code></td><td>uint256[]</td><td><span class="lang-en">All token IDs currently held by a wallet.</span><span class="lang-lo">Token IDs ທັງໝົດທີ່ Wallet ນັ້ນຖື.</span></td></tr>
      <tr><td><code>totalMinted()</code></td><td>uint256</td><td><span class="lang-en">Total tokens minted (counter, not burn-adjusted).</span><span class="lang-lo">ຈຳນວນ Token ທີ່ Mint ທັງໝົດ (Counter, ບໍ່ຫັກ Burn).</span></td></tr>
      <tr><td><code>getMintPriceFor(address)</code></td><td>uint256</td><td><span class="lang-en">Effective mint price: custom override if set, else global.</span><span class="lang-lo">Mint Price ທີ່ໃຊ້ຈິງ: Custom ຖ້າ Set, ບໍ່ດັ່ງນັ້ນໃຊ້ Global.</span></td></tr>
      <tr><td><code>getRecoveryFeeFor(address)</code></td><td>uint256</td><td><span class="lang-en">Effective recovery fee per token.</span><span class="lang-lo">Recovery Fee ຕໍ່ Token ທີ່ໃຊ້ຈິງ.</span></td></tr>
      <tr><td><code>getMaxBadgeFor(address)</code></td><td>uint256</td><td><span class="lang-en">Effective badge cap. 0 = unlimited.</span><span class="lang-lo">Badge Cap ທີ່ໃຊ້ຈິງ. 0 = ບໍ່ຈຳກັດ.</span></td></tr>
      <tr><td><code>getTokenURIHistory(uint256)</code></td><td>string[]</td><td><span class="lang-en">All previous metadata URIs for a token.</span><span class="lang-lo">URI ທຸກ Version ທີ່ຜ່ານມາຂອງ Token.</span></td></tr>
      <tr><td><code>tokenURI(uint256)</code></td><td>string</td><td><span class="lang-en">Current metadata URI (ERC721 standard).</span><span class="lang-lo">URI Metadata ປັດຈຸບັນ (ERC721 Standard).</span></td></tr>
    </tbody>
  </table>

  <hr class="divider">

  <!-- Transfer Gate -->
  <p class="section-title" id="transferable">
    <i class="fa-solid fa-lock"></i>
    <span class="lang-en">Transfer Gate</span>
    <span class="lang-lo">Transfer Gate</span>
  </p>
  <p class="lang-en" style="font-size:13.5px;color:var(--text-muted);line-height:1.9;max-width:700px;margin-bottom:12px;">
    The <code>_update()</code> override enforces three rules on every non-mint transfer:
  </p>
  <p class="lang-lo" style="font-size:13.5px;color:var(--text-muted);line-height:1.9;max-width:700px;margin-bottom:12px;">
    <code>_update()</code> ກວດສອບ 3 ເງື່ອນໄຂໃນທຸກ Transfer ທີ່ບໍ່ແມ່ນ Mint:
  </p>
  <ol style="font-size:13.5px;color:var(--text-muted);line-height:2.2;padding-left:20px;margin-bottom:16px;">
    <li><code>transferable[tokenId]</code> <span class="lang-en">must be</span><span class="lang-lo">ຕ້ອງເປັນ</span> <code>true</code>.</li>
    <li><span class="lang-en">Recipient must have <code>userType != NONE</code> (registered).</span><span class="lang-lo">ຜູ້ຮັບຕ້ອງ <code>userType != NONE</code> (ລົງທະບຽນແລ້ວ).</span></li>
    <li><span class="lang-en">Recipient must have <code>active == true</code>.</span><span class="lang-lo">ຜູ້ຮັບຕ້ອງ <code>active == true</code>.</span></li>
  </ol>

  <hr class="divider">

  <!-- Recovery -->
  <p class="section-title" id="recovery">
    <i class="fa-solid fa-rotate"></i>
    <span class="lang-en">Wallet Recovery</span>
    <span class="lang-lo">Wallet Recovery</span>
  </p>
  <table class="doc-table">
    <thead>
      <tr>
        <th scope="col"></th>
        <th scope="col"><span class="lang-en">User-initiated</span><span class="lang-lo">User ເລີ່ມເອງ</span></th>
        <th scope="col"><span class="lang-en">Admin Force</span><span class="lang-lo">Admin Force</span></th>
      </tr>
    </thead>
    <tbody>
      <tr><td>Function</td><td><code>recoverWalletSelected()</code></td><td><code>adminForceRecover()</code></td></tr>
      <tr><td><span class="lang-en">Caller</span><span class="lang-lo">ຜູ້ເອີ້ນ</span></td><td><span class="lang-en">Registered user (old wallet)</span><span class="lang-lo">User ທີ່ລົງທະບຽນ (Wallet ເກົ່າ)</span></td><td><span class="lang-en">Owner or Operator</span><span class="lang-lo">Owner ຫຼື Operator</span></td></tr>
      <tr><td>Fee</td><td><code>recoveryFeePerNFT × count</code></td><td><span class="lang-en">None</span><span class="lang-lo">ບໍ່ມີ</span></td></tr>
      <tr><td><span class="lang-en">Post-state</span><span class="lang-lo">ສະຖານະຫຼັງ</span></td><td colspan="2"><span class="lang-en">Old wallet deactivated, <code>recoveredTo = newWallet</code></span><span class="lang-lo">Wallet ເກົ່າ Deactivate, <code>recoveredTo = newWallet</code></span></td></tr>
    </tbody>
  </table>

  <hr class="divider">

  <!-- Events -->
  <p class="section-title" id="events">
    <i class="fa-solid fa-bolt"></i>
    Events
  </p>
  <table class="doc-table">
    <thead>
      <tr>
        <th scope="col">Event</th>
        <th scope="col"><span class="lang-en">Parameters</span><span class="lang-lo">Parameters</span></th>
        <th scope="col"><span class="lang-en">Emitted when</span><span class="lang-lo">Emit ເມື່ອ</span></th>
      </tr>
    </thead>
    <tbody>
      <tr><td><code>UserRegistered</code></td><td><code>address wallet, string name</code></td><td><span class="lang-en"><code>register()</code> succeeds</span><span class="lang-lo"><code>register()</code> ສຳເລັດ</span></td></tr>
      <tr><td><code>UserDeactivated</code></td><td><code>address oldWallet, address newWallet</code></td><td><span class="lang-en">Profile deactivated after recovery</span><span class="lang-lo">Profile ຖືກ Deactivate ຫຼັງ Recovery</span></td></tr>
      <tr><td><code>UserReactivated</code></td><td><code>address wallet</code></td><td><code>reactivateWallet()</code></td></tr>
      <tr><td><code>ProfileUpdated</code></td><td><code>address wallet, string newName</code></td><td><code>updateProfile()</code></td></tr>
      <tr><td><code>BadgeMinted</code></td><td><code>uint256 tokenId, address student, string badgeName, string activity</code></td><td><span class="lang-en">Any successful mint</span><span class="lang-lo">ທຸກ Mint ທີ່ສຳເລັດ</span></td></tr>
      <tr><td><code>BadgeRevoked</code></td><td><code>uint256 tokenId, address from</code></td><td><code>revokeBadge()</code></td></tr>
      <tr><td><code>TokenURIUpdated</code></td><td><code>uint256 tokenId, string oldURI, string newURI</code></td><td><code>updateBadge()</code></td></tr>
      <tr><td><code>WalletRecovered</code></td><td><code>address oldWallet, address newWallet, uint256 nftsMoved</code></td><td><span class="lang-en">Either recovery path</span><span class="lang-lo">ທຸກ Recovery path</span></td></tr>
      <tr><td><code>MintPriceUpdated</code></td><td><code>uint256 newPrice</code></td><td><code>setMintPrice()</code></td></tr>
      <tr><td><code>RecoveryFeeUpdated</code></td><td><code>uint256 newFee</code></td><td><code>setRecoveryFee()</code></td></tr>
      <tr><td><code>FundsReceiverUpdated</code></td><td><code>address old, address new</code></td><td><code>setFundsReceiver()</code></td></tr>
      <tr><td><code>OperatorSet</code></td><td><code>address wallet, bool status</code></td><td><code>setOperator()</code></td></tr>
      <tr><td><code>MintingPaused</code></td><td><code>bool status</code></td><td><code>pauseMinting()</code></td></tr>
    </tbody>
  </table>

  <hr class="divider">

  <!-- Access control matrix -->
  <p class="section-title">
    <i class="fa-solid fa-shield-halved"></i>
    <span class="lang-en">Access Control Matrix</span>
    <span class="lang-lo">ຕາຕະລາງ Access Control</span>
  </p>
  <table class="doc-table">
    <thead>
      <tr>
        <th scope="col"><span class="lang-en">Operation</span><span class="lang-lo">ການດຳເນີນງານ</span></th>
        <th scope="col">Owner</th>
        <th scope="col">Operator</th>
        <th scope="col"><span class="lang-en">Registered User</span><span class="lang-lo">User ລົງທະບຽນ</span></th>
        <th scope="col"><span class="lang-en">Anyone</span><span class="lang-lo">ທຸກຄົນ</span></th>
      </tr>
    </thead>
    <tbody>
      <tr><td><code>register()</code></td><td>—</td><td>—</td><td>—</td><td><span class="lang-en"> (if new)</span><span class="lang-lo"> (ຖ້າໃໝ່)</span></td></tr>
      <tr><td><code>mintBadge()</code></td><td>—</td><td>—</td><td></td><td>—</td></tr>
      <tr><td><code>batchMintBadge()</code></td><td>—</td><td>—</td><td></td><td>—</td></tr>
      <tr><td><code>recoverWalletSelected()</code></td><td>—</td><td>—</td><td></td><td>—</td></tr>
      <tr><td><code>setTransferable()</code></td><td></td><td></td><td>—</td><td>—</td></tr>
      <tr><td><code>revokeBadge()</code></td><td></td><td></td><td>—</td><td>—</td></tr>
      <tr><td><code>updateBadge()</code></td><td></td><td></td><td>—</td><td>—</td></tr>
      <tr><td><code>adminForceRecover()</code></td><td></td><td></td><td>—</td><td>—</td></tr>
      <tr><td><code>setBlacklist()</code></td><td></td><td></td><td>—</td><td>—</td></tr>
      <tr><td><code>reactivateWallet()</code></td><td></td><td></td><td>—</td><td>—</td></tr>
      <tr><td><code>updateProfile()</code></td><td></td><td></td><td>—</td><td>—</td></tr>
      <tr><td><code>setMintPrice()</code> + config</td><td></td><td>—</td><td>—</td><td>—</td></tr>
      <tr><td><code>pauseMinting()</code></td><td></td><td>—</td><td>—</td><td>—</td></tr>
      <tr><td><code>setOperator()</code></td><td></td><td>—</td><td>—</td><td>—</td></tr>
      <tr><td><code>withdrawFunds()</code></td><td></td><td>—</td><td>—</td><td>—</td></tr>
      <tr><td><span class="lang-en">All view functions</span><span class="lang-lo">ທຸກ view functions</span></td><td></td><td></td><td></td><td></td></tr>
    </tbody>
  </table>

  <div class="callout callout-info" role="note" style="margin-top:28px;">
    <i class="fa-solid fa-circle-info"></i>
    <div>
      <span class="lang-en">Verify the contract at <a href="https://explorer.labchain.la/token/0xadDcFB1a988f199F977D678a3A42650b1740466C" target="_blank" rel="noopener">explorer.labchain.la</a>.</span>
      <span class="lang-lo">Verify Contract ທີ່ <a href="https://explorer.labchain.la/token/0xadDcFB1a988f199F977D678a3A42650b1740466C" target="_blank" rel="noopener">explorer.labchain.la</a>.</span>
    </div>
  </div>

</main>

<script>
function setLang(lang) {
  document.body.classList.toggle('lang-lo-active', lang === 'lo');
  document.getElementById('btnEn').classList.toggle('active', lang === 'en');
  document.getElementById('btnLo').classList.toggle('active', lang === 'lo');
  try { localStorage.setItem('doc-lang', lang); } catch(e) {}
}
(function() {
  try {
    var saved = localStorage.getItem('doc-lang');
    if (saved === 'lo') setLang('lo');
  } catch(e) {}
})();
</script>

<?php include '../includes/footer.php'; ?>
