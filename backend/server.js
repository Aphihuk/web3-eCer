require("dotenv").config();
const express = require("express");
const morgan = require("morgan");
const app = express();
const cors = require("cors");
app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));
// app.use(cors({
//   origin: (origin, callback) => {
//     // allow mobile apps (no origin) and any localhost port (Flutter web dev)
//     if (!origin || /^http:\/\/localhost(:\d+)?$/.test(origin)) {
//       return callback(null, true);
//     }
//     callback(new Error("Not allowed by CORS"));
//   },
//   methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
//   allowedHeaders: ["Content-Type", "Authorization"],
// }));

app.use(morgan("dev"));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

const fs = require("fs");

fs.readdirSync("./router").map((r) => {
  app.use("/api", require("./router/" + r));
});

app.get("/test", (req, res) => {
    res.send("Hello from the server");
});

app.listen(3200, () => {
  console.log("Server is running on port 3200");
});

const { startListener } = require("./blockchain/listener");
startListener();
