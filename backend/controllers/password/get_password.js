const crypto = require("crypto");
const { db } = require("../db");
const transporter = require("../config/mailer");
const { get_passwords } = require("../config/store");
const resetPasswordEmailTemplate = require("../../templates/resetPasswordEmailTemplate");

const get_password = async (req, res) => {
  try {
    const { email } = req.body;
    const [result] = await db.promise().query("SELECT * FROM users WHERE email = ?", [email]);

    if (result.length === 0) {
      return res.send({ status: false, message: "Email not found" });
    }

    const token_reset = crypto.randomBytes(20).toString("hex");
    get_passwords.set(token_reset, { email });

    const verliflie_password = `${process.env.BASE_URL}/reset/${token_reset}`;

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Reset Password",
      html: resetPasswordEmailTemplate(verliflie_password),
    });

    return res.send({ status: true, message: "Check your email to reset your password" });
  } catch (error) {
    console.error(error);
    return res.status(500).send("Internal Server Error");
  }
};

module.exports = get_password;
