const crypto      = require('crypto');
const { db }      = require('../db');
const transporter = require('../config/mailer');

const typeLabels = {
  wallet:   'Wallet / MetaMask',
  mint:     'ການ Mint NFT',
  transfer: 'ການໂອນ NFT',
  contract: 'Contract Address',
  account:  'ບັນຊີ / ລະຫັດ',
  other:    'ອື່ນໆ',
};


// db.query(`
//   CREATE TABLE IF NOT EXISTS tickets (
//     id          CHAR(16)     NOT NULL PRIMARY KEY,
//     name        VARCHAR(255) NOT NULL,
//     email       VARCHAR(255) NOT NULL,
//     type        VARCHAR(50)  NOT NULL,
//     type_label  VARCHAR(100) NOT NULL,
//     msg         TEXT         NOT NULL,
//     wallet      VARCHAR(42)  NOT NULL DEFAULT '',
//     status      ENUM('new','read','replied') NOT NULL DEFAULT 'new',
//     reply       TEXT         DEFAULT NULL,
//     replied_at  INT UNSIGNED DEFAULT NULL,
//     created_at  INT UNSIGNED NOT NULL
//   ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
// `, (err) => {
//   if (err) console.error('[tickets] table init failed:', err.message);
//   else console.log('[tickets] table ready');
// });

function esc(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\n/g, '<br>');
}

// POST /api/tickets 
const createTicket = (req, res) => {
  const { name, email, type, msg, wallet = '' } = req.body;

  if (!name || !email || !type || !msg)
    return res.status(400).json({ ok: false, msg: 'ຂໍ້ມູນບໍ່ຄົບ' });
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    return res.status(400).json({ ok: false, msg: 'Email ບໍ່ຖືກຕ້ອງ' });

  const id         = crypto.randomBytes(8).toString('hex');
  const typeLabel  = typeLabels[type] || type;
  const created_at = Math.floor(Date.now() / 1000);

  db.query(
    `INSERT INTO tickets (id, name, email, type, type_label, msg, wallet, status, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, 'new', ?)`,
    [id, name, email, type, typeLabel, msg, wallet, created_at],
    async (err) => {
      if (err) return res.status(500).json({ ok: false, msg: err.message });

      const walletRow = wallet
        ? `<tr><td style='color:#7ea3c4;padding:8px 0;'>Wallet</td>
           <td style='color:#e2e8f0;font-family:monospace;font-size:12px;'>${esc(wallet)}</td></tr>`
        : '';

      try {
        await transporter.sendMail({
          from:    process.env.EMAIL_USER,
          to:      process.env.EMAIL_USER,
          replyTo: email,
          subject: `[Support Ticket] ${typeLabel} — ${name}`,
          html: `
            <div style='font-family:sans-serif;max-width:560px;margin:auto;background:#0d1117;color:#e2e8f0;border-radius:12px;overflow:hidden;'>
              <div style='background:linear-gradient(135deg,#0064c8,#00aaff);padding:24px 28px;'>
                <h2 style='margin:0;color:#fff;font-size:18px;'>Support Ticket ໃໝ່</h2>
                <p style='margin:4px 0 0;color:rgba(255,255,255,0.8);font-size:13px;'>NFT LAO · ${new Date().toLocaleString('en-GB')}</p>
              </div>
              <div style='padding:24px 28px;'>
                <table style='width:100%;border-collapse:collapse;font-size:14px;'>
                  <tr><td style='color:#7ea3c4;padding:8px 0;width:130px;'>ຊື່</td><td style='color:#e2e8f0;font-weight:600;'>${esc(name)}</td></tr>
                  <tr><td style='color:#7ea3c4;padding:8px 0;'>Email</td><td><a href='mailto:${esc(email)}' style='color:#00aaff;'>${esc(email)}</a></td></tr>
                  <tr><td style='color:#7ea3c4;padding:8px 0;'>ປະເພດ</td><td style='color:#e2e8f0;'>${esc(typeLabel)}</td></tr>
                  ${walletRow}
                </table>
                <hr style='border:none;border-top:1px solid rgba(0,170,255,0.15);margin:16px 0;'>
                <p style='color:#7ea3c4;font-size:12px;margin:0 0 8px;'>ລາຍລະອຽດ:</p>
                <p style='color:#e2e8f0;font-size:14px;line-height:1.7;margin:0;white-space:pre-wrap;'>${esc(msg)}</p>
              </div>
              <div style='padding:16px 28px;background:rgba(0,170,255,0.05);font-size:11px;color:#7ea3c4;text-align:center;'>NFT LAO ຈຳກັດ · Chain ID 5222</div>
            </div>`,
          text: `Support Ticket\n\nຊື່: ${name}\nEmail: ${email}\nປະເພດ: ${typeLabel}\nWallet: ${wallet}\n\n${msg}`,
        });
      } catch (mailErr) {
        console.error('[tickets] notify email failed:', mailErr.message);
      }

      res.json({ ok: true, msg: 'ສົ່ງສຳເລັດ' });
    }
  );
};

// GET /api/tickets
const listTickets = (req, res) => {
  db.query('SELECT * FROM tickets ORDER BY created_at DESC', (err, rows) => {
    if (err) return res.status(500).json({ ok: false, msg: err.message });
    res.json({
      ok: true,
      tickets: rows,
      stats: {
        total:   rows.length,
        new:     rows.filter(t => t.status === 'new').length,
        replied: rows.filter(t => t.status === 'replied').length,
      },
    });
  });
};

// PATCH /api/tickets/:id/read
const readTicket = (req, res) => {
  db.query(
    "UPDATE tickets SET status='read' WHERE id=? AND status='new'",
    [req.params.id],
    (err) => {
      if (err) return res.status(500).json({ ok: false, msg: err.message });
      res.json({ ok: true });
    }
  );
};

// DELETE /api/tickets/:id
const deleteTicket = (req, res) => {
  db.query('DELETE FROM tickets WHERE id=?', [req.params.id], (err) => {
    if (err) return res.status(500).json({ ok: false, msg: err.message });
    res.json({ ok: true });
  });
};


const replyTicket = (req, res) => {
  const { id }    = req.params;
  const { reply } = req.body;

  if (!reply || !reply.trim())
    return res.status(400).json({ ok: false, msg: 'ຂໍ້ຄວາມ reply ຫວ່າງ' });

  db.query('SELECT * FROM tickets WHERE id=?', [id], async (err, rows) => {
    if (err)          return res.status(500).json({ ok: false, msg: err.message });
    if (!rows.length) return res.status(404).json({ ok: false, msg: 'ບໍ່ພົບ Ticket' });

    const t        = rows[0];
    const ticketId = id.substring(0, 8).toUpperCase();

    try {
      await transporter.sendMail({
        from:    process.env.EMAIL_USER,
        to:      t.email,
        subject: `Re: [Ticket #${ticketId}] Support — NFT LAO`,
        html: `
          <div style='font-family:sans-serif;max-width:560px;margin:auto;background:#0d1117;color:#e2e8f0;border-radius:12px;overflow:hidden;'>
            <div style='background:linear-gradient(135deg,#0064c8,#00aaff);padding:20px 24px;'>
              <h2 style='margin:0;color:#fff;font-size:17px;'>ຕອບກັບ Support Ticket</h2>
              <p style='margin:4px 0 0;color:rgba(255,255,255,0.8);font-size:12px;'>Ticket #${ticketId} · NFT LAO · ${new Date().toLocaleString('en-GB')}</p>
            </div>
            <div style='padding:24px;'>
              <p style='color:#7ea3c4;font-size:12px;margin:0 0 6px;'>ສະບາຍດີ <strong style='color:#e2e8f0;'>${esc(t.name)}</strong>,</p>
              <div style='background:rgba(0,170,255,0.07);border-left:3px solid #00aaff;border-radius:0 8px 8px 0;padding:14px 16px;font-size:14px;line-height:1.75;color:#e2e8f0;margin-bottom:20px;'>
                ${esc(reply)}
              </div>
              <hr style='border:none;border-top:1px solid rgba(255,255,255,0.08);margin:16px 0;'>
              <p style='color:#7ea3c4;font-size:11px;margin:0 0 6px;'>ຂໍ້ຄວາມເດີມ:</p>
              <p style='color:#64748b;font-size:12px;line-height:1.6;white-space:pre-wrap;'>${esc(t.msg)}</p>
            </div>
            <div style='padding:14px 24px;background:rgba(0,170,255,0.04);font-size:11px;color:#64748b;text-align:center;'>
              NFT LAO ຈຳກັດ · Chain ID 5222 · support@nftlao.com
            </div>
          </div>`,
        text: `ຕອບກັບ Ticket #${ticketId}\n\n${reply}\n\n---\nຂໍ້ຄວາມເດີມ:\n${t.msg}`,
      });
    } catch (mailErr) {
      return res.status(500).json({ ok: false, msg: 'ສົ່ງ Email ບໍ່ສຳເລັດ: ' + mailErr.message });
    }

    db.query(
      "UPDATE tickets SET status='replied', reply=?, replied_at=? WHERE id=?",
      [reply.trim(), Math.floor(Date.now() / 1000), id],
      (err2) => {
        if (err2) return res.status(500).json({ ok: false, msg: err2.message });
        res.json({ ok: true, msg: 'ສົ່ງ Reply ສຳເລັດ' });
      }
    );
  });
};

module.exports = { createTicket, listTickets, readTicket, deleteTicket, replyTicket };
