const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).json({ ok: false, msg: 'ກະລຸນາ Login ກ່ອນ' });

  const token = auth.split(' ')[1];
  try {
    const decoded = jwt.verify(token, 'SECRET_KEY');
    if (!['support', 'admin'].includes(decoded.role)) {
      return res.status(403).json({ ok: false, msg: 'ຕ້ອງການສິດທິ support ຫຼື admin' });
    }
    req.user = decoded;
    next();
  } catch {
    res.status(401).json({ ok: false, msg: 'Token ບໍ່ຖືກຕ້ອງ ຫຼື ໝົດອາຍຸ' });
  }
};
