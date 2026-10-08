
const express = require("express")
const app = express.Router()
const requireSupport = require('../middleware/requireSupport');
const {
    register, 
    verliflie,
    get_password, 
    reset_passwords,
    reset_password,
    login,
    getMe,
    mintVoucher,
    registerWallet,
    changeWallet,
    verifyWallet,
    checkWalletLinked,
    checkWallet,
    adminRecover,
    getUserByWallet,
    dedupWalletHistory,
    getAllUsers,
    setUserMaxBadge,
    setUserPrices,
    setUserRole,
    updateUserName,
    saveTxLog,
    getTxLogs,
    clearTxLogs,
    createTicket,
    listTickets,
    readTicket,
    deleteTicket,
    replyTicket,
    getNFTs,
    getTxHash,
    saveFcmToken,
    testNotification,
    getSetting,
    setSetting,
    registerMobile,
    verliflieMobile} = require("../controllers");

app.post("/register", register);
app.post("/register-mobile", registerMobile);
app.get("/verliflie/:token", verliflie);
app.get("/verliflie-mobile/:token", verliflieMobile);

app.post("/get_password", get_password);


app.post("/reset/:token", reset_passwords);
app.get("/reset/:token", reset_password);


app.post("/login", login);
app.get("/me", getMe);

app.get("/mint-voucher",             mintVoucher);
app.post("/wallet/register-for",    registerWallet);
app.get("/wallet/verify",           verifyWallet);
app.get("/wallet/check-linked",     checkWalletLinked);
app.get("/wallet/check-registered", checkWallet);    
app.post("/wallet/change",          changeWallet);
app.post("/wallet/admin-recover",   adminRecover);
app.get("/wallet/user-by-wallet",   getUserByWallet);
app.get("/wallet/history-dedup",    dedupWalletHistory);
app.get("/admin/users",             getAllUsers);
app.post("/admin/set-max-badge",    setUserMaxBadge);
app.post("/admin/set-user-prices",  setUserPrices);
app.post("/admin/set-role",         setUserRole);
app.post("/admin/update-name",      updateUserName);
app.post("/admin/tx-log",           saveTxLog);
app.get("/admin/tx-log",            getTxLogs);
app.delete("/admin/tx-log",         clearTxLogs);




app.post('/tickets',               createTicket);
app.get('/tickets',                listTickets);
app.patch('/tickets/:id/read',     readTicket);
app.delete('/tickets/:id',         deleteTicket);
app.post('/tickets/:id/reply',     replyTicket);


app.get('/support/tickets',                requireSupport, listTickets);
app.patch('/support/tickets/:id/read',     requireSupport, readTicket);
app.delete('/support/tickets/:id',         requireSupport, deleteTicket);
app.post('/support/tickets/:id/reply',     requireSupport, replyTicket);




app.get("/nfts",                getNFTs);
app.get("/nfts/:tokenId/txhash", getTxHash);
app.post("/fcm-token",          saveFcmToken);
app.post("/test-notification",  testNotification);

// settings (pinata_jwt etc.)
app.get("/settings/:key",       getSetting);
app.post("/settings/:key",      setSetting);

module.exports = app