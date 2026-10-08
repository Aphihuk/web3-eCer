// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";


contract test is ERC721, ERC721URIStorage, Ownable {

    enum UserType { NONE, USER }

    // ໂປຣໄຟລ໌ຂອງຜູ້ໃຊ້ແຕ່ລະ wallet
    struct UserProfile {
        UserType userType;
        string name;
        bool active;
        address recoveredTo; 
        uint256 registeredAt;
    }

    mapping(address => UserProfile) public profiles;
    mapping(address => bool)        public blacklisted;

    uint256 private _tokenIdCounter; // ໂຕນັບ tokenId ສຳລັບ badge ໃບຕໍ່ໄປ
    address payable public fundsReceiver; // wallet ປາຍທາງທີ່ຈະຮັບເງິນ (ປະຈຸບັນ _forwardFunds ຍັງບໍ່ໄດ້ໂອນຈິງ)
    mapping(address => bool) public operators; // ຜູ້ຊ່ວຍ admin ທີ່ owner ແຕ່ງຕັ້ງ

    uint256 public mintPrice        = 0; // ລາຄາ mint ມາດຕະຖານ (ຫົວໜ່ວຍ wei)
    uint256 public recoveryFeePerNFT = 0; // ຄ່າທຳນຽມກູ້ wallet ຄືນຕໍ່ NFT
    uint256 public maxBadgePerUser  = 0; // ຈຳກັດ badge ສູງສຸດຕໍ່ຜູ້ໃຊ້ (0 = ບໍ່ຈຳກັດ)

    mapping(address => uint256) public customMintPrice;    // ລາຄາ mint ສະເພາະຜູ້ໃຊ້ (overrides mintPrice ຖ້າ > 0)
    mapping(address => uint256) public customRecoveryFee;  // ຄ່າທຳນຽມ recovery ສະເພາະຜູ້ໃຊ້
    mapping(address => uint256) public customMaxBadge;  // ຈຳກັດ badge ສະເພາະຜູ້ໃຊ້

    bool public mintingPaused = false;

    // ຂໍ້ມູນ badge ແຕ່ລະໃບທີ່ mint ອອກ (1 token = 1 badge)
    struct Badge {
        string badgeName;
        string activity;
        address issuedTo;
        uint256 issuedAt;
    }

    mapping(uint256 => Badge)      public badges;
    mapping(uint256 => bool)       public transferable; // badge ໃບນີ້ໂອນໄດ້ຫຼືບໍ່
    mapping(address => uint256[])  public studentBadges; // ລາຍການ tokenId ທີ່ຜູ້ໃຊ້ນີ້ຖືຢູ່
    mapping(uint256 => string[])   public tokenURIHistory; // ປະຫວັດ tokenURI ເກົ່າ ກ່ອນຖືກ updateBadge() ທັບ


    event UserRegistered(address indexed wallet, string name);
    event UserDeactivated(address indexed oldWallet, address indexed newWallet);
    event UserReactivated(address indexed wallet);
    event BadgeMinted(uint256 indexed tokenId, address indexed student, string badgeName, string activity);
    event BadgeRevoked(uint256 indexed tokenId, address indexed from);
    event MintPriceUpdated(uint256 newPrice);
    event RecoveryFeeUpdated(uint256 newFee);
    event WalletRecovered(address indexed oldWallet, address indexed newWallet, uint256 nftsMoved);
    event TokenURIUpdated(uint256 indexed tokenId, string oldTokenURI, string newTokenURI);
    event FundsReceiverUpdated(address indexed oldReceiver, address indexed newReceiver);
    event OperatorSet(address indexed wallet, bool status);
    event MintingPaused(bool status);
    event ProfileUpdated(address indexed wallet, string newName);


    constructor() ERC721("", "") Ownable(msg.sender) {
        fundsReceiver = payable(msg.sender);
    }

 // ຜູ້ເອີ້ນຕ້ອງລົງທະບຽນແລ້ວ ແລະ ສະຖານະຍັງ active

    modifier onlyRegistered() {
        require(profiles[msg.sender].userType != UserType.NONE);
        require(profiles[msg.sender].active );
        _;
    }
 // ຜູ້ຮັບຕ້ອງລົງທະບຽນແລ້ວ ແລະ ຍັງ active
    modifier recipientRegistered(address target) {
        require(profiles[target].userType != UserType.NONE );
        require(profiles[target].active );
        _;
    }
// ອະນຸຍາດໃຫ້ owner ຫຼື operator ທີ່ owner ແຕ່ງຕັ້ງ
    modifier onlyOwnerOrOperator() { 
        require(msg.sender == owner() || operators[msg.sender], "Not authorized");
        _;
    }

    modifier notBlacklisted() {
        require(!blacklisted[msg.sender]);
        _;
    }

    modifier whenNotPaused() {
        require(!mintingPaused);
        _;
    }


    // ການລົງທະບຽນ

    function register(string calldata name) external notBlacklisted {
        require(profiles[msg.sender].userType == UserType.NONE );
        require(bytes(name).length > 0);

        profiles[msg.sender] = UserProfile({
            userType:     UserType.USER,
            name:         name,
            active:       true,
            recoveredTo:  address(0),
            registeredAt: block.timestamp
        });

        emit UserRegistered(msg.sender, name);
    }

    // ໃຫ້ admin/operator ລົງທະບຽນແທນຜູ້ໃຊ້ (ກໍລະນີຜູ້ໃຊ້ບໍ່ມີ wallet ມາລົງທະບຽນເອງ)
    function registerFor(address wallet, string calldata name) external onlyOwnerOrOperator {
        require(profiles[wallet].userType == UserType.NONE);
        require(bytes(name).length > 0);
        require(!blacklisted[wallet]);

        profiles[wallet] = UserProfile({
            userType:     UserType.USER,
            name:         name,
            active:       true,
            recoveredTo:  address(0),
            registeredAt: block.timestamp
        });

        emit UserRegistered(wallet, name);
    }



    // Admin: ການຕັ້ງຄ່າລາຄາ/ຈຳກັດ ລວມ ແລະ ສະເພາະຜູ້ໃຊ້

    function setMintPrice(uint256 newPrice) external onlyOwner {
        mintPrice = newPrice;
        emit MintPriceUpdated(newPrice);
    }

    function setRecoveryFee(uint256 newFee) external onlyOwner {
        recoveryFeePerNFT = newFee;
        emit RecoveryFeeUpdated(newFee);
    }

    function setMaxBadgePerUser(uint256 max) external onlyOwner {
        maxBadgePerUser = max;
    }

    function setCustomMintPrice(address user, uint256 price) external onlyOwner {
        customMintPrice[user] = price;
    }

    function setCustomRecoveryFee(address user, uint256 fee) external onlyOwner {
        customRecoveryFee[user] = fee;
    }

    function setCustomMaxBadge(address user, uint256 max) external onlyOwner {
        customMaxBadge[user] = max;
    }

    // ລາຄາ mint ຈິງຂອງຜູ້ໃຊ້ນີ້: ໃຊ້ customMintPrice ຖ້າຕັ້ງໄວ້ (> 0) ບໍ່ດັ່ງນັ້ນໃຊ້ mintPrice ລວມ
    function getMintPriceFor(address user) public view returns (uint256) {
        uint256 cp = customMintPrice[user];
        return cp > 0 ? cp : mintPrice;
    }

    function getRecoveryFeeFor(address user) public view returns (uint256) {
        uint256 cf = customRecoveryFee[user];
        return cf > 0 ? cf : recoveryFeePerNFT;
    }

    function getMaxBadgeFor(address user) public view returns (uint256) {
        uint256 cm = customMaxBadge[user];
        return cm > 0 ? cm : maxBadgePerUser;
    }

    function pauseMinting(bool status) external onlyOwner {
        mintingPaused = status;
        emit MintingPaused(status);
    }

    function setOperator(address wallet, bool status) external onlyOwner {
        require(wallet != address(0));
        operators[wallet] = status;
        emit OperatorSet(wallet, status);
    }


    function setFundsReceiver(address payable newReceiver) external onlyOwner {
        require(newReceiver != address(0));
        emit FundsReceiverUpdated(fundsReceiver, newReceiver);
        fundsReceiver = newReceiver;
    }

    // ດຶງເງິນທີ່ຄ້າງຢູ່ໃນ contract ອອກໄປຫາ fundsReceiver (ຕ້ອງເອີ້ນເອງ ເພາະ _forwardFunds ບໍ່ໄດ້ໂອນອັດຕະໂນມັດ)
    function withdrawFunds() external onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0);
        (bool ok, ) = fundsReceiver.call{value: balance}("");
        require(ok);
    }


    // Admin/Operator: ການຈັດການ blacklist / ການກູ້ wallet ຄືນ

    function setBlacklist(address wallet, bool status) external onlyOwnerOrOperator {
        blacklisted[wallet] = status;
    }

    function reactivateWallet(address wallet) external onlyOwnerOrOperator {
        require(profiles[wallet].userType != UserType.NONE);
        require(!profiles[wallet].active);
        profiles[wallet].active      = true;
        profiles[wallet].recoveredTo = address(0);
        emit UserReactivated(wallet);
    }

    // ໃຫ້ admin/operator ບັງຄັບໂອນ badge ທັງໝົດຈາກ wallet ເກົ່າ ໄປ wallet ໃໝ່ (ກໍລະນີຜູ້ໃຊ້ເສຍ wallet)
    function adminForceRecover(
        address oldWallet,
        address newWallet,
        uint256[] calldata tokenIds
    ) external onlyOwnerOrOperator recipientRegistered(newWallet) {
        require(newWallet != oldWallet, "");
        require(profiles[oldWallet].userType != UserType.NONE, "");

        for (uint256 i = 0; i < tokenIds.length; i++) {
            uint256 tokenId = tokenIds[i];
            require(_ownerOf(tokenId) == oldWallet, "");

            bool wasTransferable = transferable[tokenId];
            transferable[tokenId] = true;
            _safeTransfer(oldWallet, newWallet, tokenId, "");
            transferable[tokenId] = wasTransferable;
            badges[tokenId].issuedTo = newWallet;
        }

        profiles[oldWallet].active      = false;
        profiles[oldWallet].recoveredTo = newWallet;

        emit WalletRecovered(oldWallet, newWallet, tokenIds.length);
        emit UserDeactivated(oldWallet, newWallet);
    }

    function updateProfile(address wallet, string calldata newName) external onlyOwnerOrOperator {
        require(profiles[wallet].userType != UserType.NONE);
        require(bytes(newName).length > 0);
        profiles[wallet].name = newName;
        emit ProfileUpdated(wallet, newName);
    }


    function updateBadge(
        uint256 tokenId,
        string memory newBadgeName,
        string memory newActivity,
        string memory newTokenURI_
    ) external onlyOwnerOrOperator {
        badges[tokenId].badgeName = newBadgeName;
        badges[tokenId].activity  = newActivity;
        string memory oldURI = tokenURI(tokenId);
        tokenURIHistory[tokenId].push(oldURI);
        _setTokenURI(tokenId, newTokenURI_);
        emit TokenURIUpdated(tokenId, oldURI, newTokenURI_);
    }

    function setTransferable(uint256 tokenId, bool status) external onlyOwnerOrOperator {
        transferable[tokenId] = status;
    }

    // ເຜົາ badge ຖິ້ມ
    function revokeBadge(uint256 tokenId) external onlyOwnerOrOperator {
        address owner = _ownerOf(tokenId);
        require(owner != address(0));
        transferable[tokenId] = true;
        _burn(tokenId);
        emit BadgeRevoked(tokenId, owner);
    }

    // ດຶງປະຫວັດ tokenURI ເກົ່າທັງໝົດຂອງ badge ນີ້ ສຳລັບກວດສອບການແກ້ໄຂ metadata
    function getTokenURIHistory(uint256 tokenId) external view returns (string[] memory) {
        return tokenURIHistory[tokenId];
    }


    function _recoverSigner(bytes32 hash, bytes memory sig) internal pure returns (address) {
        require(sig.length == 65, "Invalid sig length");
        bytes32 r; bytes32 s; uint8 v;
        assembly {
            r := mload(add(sig, 32))
            s := mload(add(sig, 64))
            v := byte(0, mload(add(sig, 96)))
        }
        return ecrecover(hash, v, r, s);
    }

    // ກວດວ່າ voucher (contractAddress, user, price, expiry) ຖືກເຊັນຈິງໂດຍ owner() ແລະ ຍັງບໍ່ໝົດອາຍຸ
    function _verifyVoucher(
        address user,
        uint256 price,
        uint256 expiry,
        bytes memory sig
    ) internal view returns (bool) {
        require(block.timestamp <= expiry, "Voucher expired");
        bytes32 msgHash = keccak256(abi.encodePacked(address(this), user, price, expiry));
        bytes32 ethHash = keccak256(abi.encodePacked("\x19Ethereum Signed Message:\n32", msgHash));
        return _recoverSigner(ethHash, sig) == owner();
    }


    function mintBadge(
        address student,
        string memory badgeName,
        string memory activity,
        string memory tokenURI_,
        bool isTransferable
    ) external payable onlyRegistered notBlacklisted whenNotPaused recipientRegistered(student) returns (uint256) {
        require(msg.value >= getMintPriceFor(msg.sender));
        uint256 userMax = getMaxBadgeFor(student);
        if (userMax > 0) {
            require(studentBadges[student].length < userMax);
        }

        _forwardFunds(msg.value);
        return _mintBadgeInternal(student, badgeName, activity, tokenURI_, isTransferable);
    }

    function batchMintBadge(
        address[] calldata students,
        string memory badgeName,
        string memory activity,
        string memory tokenURI_,
        bool isTransferable
    ) external payable onlyRegistered notBlacklisted whenNotPaused {
        require(msg.value >= getMintPriceFor(msg.sender) * students.length);

        _forwardFunds(msg.value);

        for (uint256 i = 0; i < students.length; i++) {
            require(profiles[students[i]].userType != UserType.NONE);
            require(profiles[students[i]].active);
            uint256 sMax = getMaxBadgeFor(students[i]);
            if (sMax > 0) {
                require(studentBadges[students[i]].length < sMax);
            }
            _mintBadgeInternal(students[i], badgeName, activity, tokenURI_, isTransferable);
        }
    }


    function mintBadgeWithVoucher(
        address student,
        string memory badgeName,
        string memory activity,
        string memory tokenURI_,
        bool isTransferable,
        uint256 voucherPrice,
        uint256 voucherExpiry,
        bytes calldata voucherSig
    ) external payable onlyRegistered notBlacklisted whenNotPaused recipientRegistered(student) returns (uint256) {
        require(_verifyVoucher(msg.sender, voucherPrice, voucherExpiry, voucherSig), "Invalid voucher");
        require(msg.value >= voucherPrice, "Insufficient fee");
        uint256 userMax = getMaxBadgeFor(student);
        if (userMax > 0) {
            require(studentBadges[student].length < userMax);
        }
        _forwardFunds(msg.value);
        return _mintBadgeInternal(student, badgeName, activity, tokenURI_, isTransferable);
    }

    function batchMintBadgeWithVoucher(
        address[] calldata students,
        string memory badgeName,
        string memory activity,
        string memory tokenURI_,
        bool isTransferable,
        uint256 voucherPrice,
        uint256 voucherExpiry,
        bytes calldata voucherSig
    ) external payable onlyRegistered notBlacklisted whenNotPaused {
        require(_verifyVoucher(msg.sender, voucherPrice, voucherExpiry, voucherSig), "Invalid voucher");
        require(msg.value >= voucherPrice * students.length, "Insufficient fee");
        _forwardFunds(msg.value);
        for (uint256 i = 0; i < students.length; i++) {
            require(profiles[students[i]].userType != UserType.NONE);
            require(profiles[students[i]].active);
            uint256 sMax = getMaxBadgeFor(students[i]);
            if (sMax > 0) {
                require(studentBadges[students[i]].length < sMax);
            }
            _mintBadgeInternal(students[i], badgeName, activity, tokenURI_, isTransferable);
        }
    }


    // ----- ການກູ້ wallet ຄືນ ໂດຍຜູ້ໃຊ້ເອງ (ເສຍຄ່າທຳນຽມ) -----

    function recoverWalletSelected(address newWallet, uint256[] calldata tokenIds)
        external
        payable
        onlyRegistered
        recipientRegistered(newWallet)
    {
        require(newWallet != msg.sender);

        uint256 totalFee = getRecoveryFeeFor(msg.sender) * tokenIds.length;
        require(msg.value >= totalFee);

        _forwardFunds(msg.value);

        for (uint256 i = 0; i < tokenIds.length; i++) {
            uint256 tokenId = tokenIds[i];
            require(_ownerOf(tokenId) == msg.sender);

            bool wasTransferable = transferable[tokenId];
            transferable[tokenId] = true;
            _safeTransfer(msg.sender, newWallet, tokenId, "");
            transferable[tokenId] = wasTransferable;
            badges[tokenId].issuedTo = newWallet;
        }

        profiles[msg.sender].active      = false;
        profiles[msg.sender].recoveredTo = newWallet;

        emit WalletRecovered(msg.sender, newWallet, tokenIds.length);
        emit UserDeactivated(msg.sender, newWallet);
    }




    receive() external payable {}

    function _forwardFunds(uint256 amount) internal {
    }

    // ສ່ວນກາງທີ່ໃຊ້ mint badge ຈິງ (ຖືກເອີ້ນຈາກທັງ 4 ຟັງຊັນ mint ຂ້າງເທິງ)
    function _mintBadgeInternal(
        address student,
        string memory badgeName,
        string memory activity,
        string memory tokenURI_,
        bool isTransferable
    ) internal returns (uint256) {
        uint256 tokenId = _tokenIdCounter++;

        _safeMint(student, tokenId);
        _setTokenURI(tokenId, tokenURI_);

        badges[tokenId] = Badge({
            badgeName: badgeName,
            activity:  activity,
            issuedTo:  student,
            issuedAt:  block.timestamp
        });

        transferable[tokenId] = isTransferable;
        studentBadges[student].push(tokenId);

        emit BadgeMinted(tokenId, student, badgeName, activity);
        return tokenId;
    }

    // ຟັງຊັນ override ຂອງ ERC721 ທີ່ຖືກເອີ້ນທຸກຄັ້ງທີ່ມີການໂອນ/mint/burn — ໃຊ້ຄວບຄຸມວ່າ badge ໂອນໄດ້ບໍ່ ແລະ ອັບເດດ studentBadges
    function _update(address to, uint256 tokenId, address auth)
        internal
        override
        returns (address)
    {
        address from = _ownerOf(tokenId);

        if (from == address(0)) {
            return super._update(to, tokenId, auth);
        }

        require(transferable[tokenId]);

        if (to != address(0)) {
            require(profiles[to].userType != UserType.NONE);
            require(profiles[to].active);
        }

        uint256[] storage fromBadges = studentBadges[from];
        for (uint256 i = 0; i < fromBadges.length; i++) {
            if (fromBadges[i] == tokenId) {
                fromBadges[i] = fromBadges[fromBadges.length - 1];
                fromBadges.pop();
                break;
            }
        }

        if (to != address(0)) {
            studentBadges[to].push(tokenId);
        }

        return super._update(to, tokenId, auth);
    }



    function getBadgesOf(address student) external view returns (uint256[] memory) {
        return studentBadges[student];
    }

    function totalMinted() external view returns (uint256) {
        return _tokenIdCounter;
    }

    function getProfile(address wallet) external view returns (UserProfile memory) {
        return profiles[wallet];
    }

    function isActive(address wallet) external view returns (bool) {
        return profiles[wallet].active;
    }

    function tokenURI(uint256 tokenId)
        public view override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(bytes4 interfaceId)
        public view override(ERC721, ERC721URIStorage)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
