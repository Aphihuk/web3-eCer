const crypto = require("crypto");
const { db } = require("../db");
const transporter = require("../config/mailer");
const { pendingUsers } = require("../config/store");
const verifyEmailTemplate = require("../../templates/verifyEmailTemplate");

// bowser
const register = async (req, res) => {
  const { name, email, password, wallet } = req.body;

  const Check = "SELECT * FROM users WHERE email = ?";

  db.query(Check, [email], async (err1, results) => {
    if (err1) return res.send(err1);

    if (results.length > 0) {
      return res.json({ success: false, message: "Email already exists" });
    }

    const token = crypto.randomBytes(20).toString("hex");
    pendingUsers.set(token, { name, email, password, wallet });

    const verliflie = `${process.env.BASE_URL}/verliflie/${token}`;

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "ຢືນຢັນທີ່ຢູ່ວ່ານຳໃຊ້ຂອງທ່ານ - Verify Your Email",
      html: verifyEmailTemplate(verliflie),
    });

    return res.send({ status: true, message: "Email sent successfully" });
  });
};

// mobile

const registerMobile = async (req, res) => {
  const { name, email, password, wallet } = req.body;

  const Check = "SELECT * FROM users WHERE email = ?";

  db.query(Check, [email], async (err1, results) => {
    if (err1) return res.send(err1);

    if (results.length > 0) {
      return res.json({ success: false, message: "Email already exists" });
    }

    const token = crypto.randomBytes(20).toString("hex");
    pendingUsers.set(token, { name, email, password, wallet });

    const verliflie = `${process.env.BASE_URL}/verliflie-mobile/${token}`;

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "ຢືນຢັນທີ່ຢູ່ວ່ານຳໃຊ້ຂອງທ່ານ - Verify Your Email",
      html: verifyEmailTemplate(verliflie),
    });

    return res.send({ status: true, message: "Email sent successfully" });
  });
};

module.exports = { register, registerMobile };
