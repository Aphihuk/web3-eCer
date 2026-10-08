const express = require("express")
const app = express.Router()
const { uploadFile, uploadBase64 } = require("../controllers/ipfs/upload");
const { uploadMetadata } = require("../controllers/ipfs/metadata");
const fileUpload = require("express-fileupload");

app.use(fileUpload({ limits: { fileSize: 10 * 1024 * 1024 } }));

app.post("/ipfs/upload", uploadFile);
app.post("/ipfs/upload-base64", uploadBase64);
app.post("/ipfs/metadata", uploadMetadata);

module.exports = app;
