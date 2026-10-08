const { get_passwords } = require("../config/store");
const resetPasswordFormTemplate = require("../../templates/resetPasswordFormTemplate");

const reset_password = async (req, res) => {
  try {
    const { token } = req.params;
    const get = get_passwords.get(token);
    if (!get) return res.status(404).send("Token not found");
    res.send(resetPasswordFormTemplate(token, process.env.BASE_URL));
  } catch (error) {
    return res.status(500).send(error.message);
  }
};

module.exports = reset_password;
