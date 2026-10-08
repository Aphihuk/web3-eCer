const { db } = require('../db');
const jwt = require('jsonwebtoken');

const setUserRole = async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ ok: false, msg: 'ກະລຸນາ Login ກ່ອນ' });

  try {
    jwt.verify(token, 'SECRET_KEY');
  } catch {
    return res.status(401).json({ ok: false, msg: 'Token ໝົດອາຍຸ — Login ໃໝ່' });
  }

  const { userId, role } = req.body;
  if (!userId || !role) return res.status(400).json({ ok: false, msg: 'userId ແລະ role ຈຳເປັນ' });
  if (!['user', 'support', 'admin'].includes(role)) {
    return res.status(400).json({ ok: false, msg: 'role ຕ້ອງເປັນ: user, support, admin' });
  }

  try {
    const [result] = await db.promise().query('UPDATE users SET role = ? WHERE ID = ?', [role, userId]);
    if (!result.affectedRows) return res.status(404).json({ ok: false, msg: 'ບໍ່ພົບ User' });
    res.json({ ok: true, msg: `ອັບເດດ role ສຳເລັດ → ${role}` });
  } catch (e) {
    res.status(500).json({ ok: false, msg: e.message });
  }
};

module.exports = setUserRole;
