module.exports = {
  // auth
  register:           require("./auth/register").register,
  registerMobile:     require("./auth/register").registerMobile,
  verliflie:          require("./auth/verliflie").verliflie,
  verliflieMobile:    require("./auth/verliflie").verliflieMobile,
  login:              require("./auth/login"),
  getMe:              require("./auth/getMe"),

  // password
  get_password:       require("./password/get_password"),
  reset_password:     require("./password/reset_password"),
  reset_passwords:    require("./password/reset_passwords"),

  // wallet
  mintVoucher:        require("./wallet/mintVoucher"),
  registerWallet:     require("./wallet/registerWallet"),
  changeWallet:       require("./wallet/changeWallet"),
  verifyWallet:       require("./wallet/verifyWallet"),
  checkWalletLinked:  require("./wallet/checkWalletLinked"),
  checkWallet:        require("./wallet/checkWallet"),
  adminRecover:       require("./wallet/adminRecover"),
  getUserByWallet:    require("./wallet/getUserByWallet"),
  dedupWalletHistory: require("./wallet/dedupWalletHistory"),

  // admin
  getAllUsers:         require("./admin/getAllUsers"),
  setUserMaxBadge:    require("./admin/setUserMaxBadge"),
  setUserPrices:      require("./admin/setUserPrices"),
  setUserRole:        require("./admin/setUserRole"),
  updateUserName:     require("./admin/updateUserName"),
  saveTxLog:          require("./admin/txLog").saveTxLog,
  getTxLogs:          require("./admin/txLog").getTxLogs,
  clearTxLogs:        require("./admin/txLog").clearTxLogs,

  // tickets
  createTicket:       require("./tickets").createTicket,
  listTickets:        require("./tickets").listTickets,
  readTicket:         require("./tickets").readTicket,
  deleteTicket:       require("./tickets").deleteTicket,
  replyTicket:        require("./tickets").replyTicket,

  test:               require("./test/test"),

  getNFTs:            require("./nft/getNFTs"),
  getTxHash:          require("./nft/getTxHash"),
  saveFcmToken:       require("./fcm/saveFcmToken"),
  testNotification:   require("./fcm/testNotification"),

  // settings
  getSetting:         require("./config/settings").getSetting,
  setSetting:         require("./config/settings").setSetting,
};
