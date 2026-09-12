const express = require('express');

const Permission = require('../models/Permission');
const User = require('../models/User');
const authMiddleware = require('../middleware/auth');
const requireRole = require('../middleware/roleCheck');

const router = express.Router();

router.get('/permissions', authMiddleware, async (req, res) => {
  try {
    let permissions;
    if (req.userRole === 'super_admin' || req.userRole === 'discipline_admin') {
      permissions = await Permission.find().sort({ createdAt: -1 });
    } else {
      permissions = await Permission.find({ requesterId: req.userId }).sort({ createdAt: -1 });
    }
    res.json(permissions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/permissions', authMiddleware, async (req, res) => {
  try {
    const permission = await Permission.create({
      ...req.body, requesterId: req.userId,
      requesterName: req.userName, requesterRole: req.userRole
    });
    res.json({ success: true, permission });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put('/permissions/:id', authMiddleware, requireRole('discipline_admin', 'super_admin'), async (req, res) => {
  try {
    const permission = await Permission.findByIdAndUpdate(
      req.params.id,
      { ...req.body, reviewedBy: req.userId, reviewedAt: new Date() },
      { new: true }
    );
    res.json({ success: true, permission });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/super-admin/permissions', authMiddleware, requireRole('super_admin'), async (req, res) => {
  try {
    const permissions = await Permission.find().sort({ createdAt: -1 });
    res.json(permissions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/permissions/:id/slip', async (req, res) => {
  try {
    const permission = await Permission.findById(req.params.id);
    if (!permission) {
      return res.status(404).send('<h2>Permission request not found</h2>');
    }

    if (permission.status !== 'approved') {
      return res.status(400).send('<h2>Permission slip can only be generated for approved requests</h2>');
    }

    const user = await User.findById(permission.requesterId);

    const slipHtml = `<!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Permission Slip - ESSA Nyarugunga</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: 'Segoe UI', Arial, sans-serif; background: #e0e0e0; display: flex; justify-content: center; align-items: center; min-height: 100vh; padding: 20px; }
          .slip-container { max-width: 800px; width: 100%; background: white; border-radius: 16px; box-shadow: 0 20px 40px rgba(0,0,0,0.2); overflow: hidden; }
          .header { background: linear-gradient(135deg, #0d1f33, #1a3a5c); color: white; padding: 25px 30px; text-align: center; }
          .header h1 { font-size: 24px; margin-bottom: 5px; letter-spacing: 1px; }
          .header p { font-size: 12px; opacity: 0.8; }
          .content { padding: 30px; }
          .title { text-align: center; margin-bottom: 25px; }
          .title h2 { color: #1a3a5c; font-size: 20px; border-bottom: 2px solid #ffc107; display: inline-block; padding-bottom: 8px; }
          .info-row { display: flex; margin-bottom: 15px; padding: 8px 0; border-bottom: 1px solid #f0f0f0; }
          .info-label { width: 140px; font-weight: 700; color: #555; font-size: 13px; }
          .info-value { flex: 1; color: #333; font-size: 14px; }
          .status-badge { display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 700; background: #e8f5e9; color: #27ae60; }
          .qr-code { text-align: center; margin: 25px 0; padding: 20px; background: #f8f9fa; border-radius: 12px; }
          .qr-code img { width: 120px; height: 120px; }
          .footer { background: #f8f9fa; padding: 20px 30px; text-align: center; font-size: 11px; color: #888; border-top: 1px solid #eee; }
          .signature-area { display: flex; justify-content: space-between; margin-top: 30px; padding-top: 20px; }
          .signature { text-align: center; width: 200px; }
          .signature-line { border-top: 1px solid #333; margin-top: 40px; padding-top: 8px; font-size: 11px; color: #666; }
          .button-group { text-align: center; padding: 20px 30px; background: #f8f9fa; border-top: 1px solid #eee; }
          .print-btn { background: #1a3a5c; color: white; border: none; padding: 10px 24px; border-radius: 8px; font-size: 14px; font-weight: 600; cursor: pointer; margin: 0 5px; transition: all 0.2s; }
          .print-btn:hover { background: #0d2b42; transform: translateY(-1px); }
          .close-btn { background: #e74c3c; color: white; border: none; padding: 10px 24px; border-radius: 8px; font-size: 14px; font-weight: 600; cursor: pointer; margin: 0 5px; transition: all 0.2s; }
          .close-btn:hover { background: #c0392b; }
          @media print { body { background: white; padding: 0; } .button-group { display: none; } .slip-container { box-shadow: none; border-radius: 0; } }
        </style>
      </head>
      <body>
        <div class="slip-container">
          <div class="header">
            <h1>🎓 ESSA NYARUGUNGA</h1>
            <p>Excel in Studies, Serve in Spirit, Act in Love</p>
            <p>P.O Box 123, Kigali, Rwanda | Tel: +250 788 123 456</p>
          </div>
          <div class="content">
            <div class="title"><h2>📄 OFFICIAL PERMISSION SLIP</h2></div>
            <div class="info-row"><div class="info-label">Permission Number:</div><div class="info-value"><strong>#${permission._id.toString().slice(-8).toUpperCase()}</strong></div></div>
            <div class="info-row"><div class="info-label">Requester Name:</div><div class="info-value"><strong>${permission.requesterName || user?.fullName || 'N/A'}</strong></div></div>
            <div class="info-row"><div class="info-label">Role:</div><div class="info-value">${permission.requesterRole?.toUpperCase() || 'N/A'}</div></div>
            <div class="info-row"><div class="info-label">Permission Type:</div><div class="info-value">${permission.type?.toUpperCase() || 'N/A'}</div></div>
            <div class="info-row"><div class="info-label">Reason:</div><div class="info-value">${permission.reason || 'Not specified'}</div></div>
            <div class="info-row"><div class="info-label">Valid From:</div><div class="info-value">${new Date(permission.fromDate).toLocaleDateString('en-RW', { day: '2-digit', month: 'long', year: 'numeric' })}</div></div>
            <div class="info-row"><div class="info-label">Valid To:</div><div class="info-value">${new Date(permission.toDate).toLocaleDateString('en-RW', { day: '2-digit', month: 'long', year: 'numeric' })}</div></div>
            <div class="info-row"><div class="info-label">Status:</div><div class="info-value"><span class="status-badge">✓ APPROVED</span></div></div>
            <div class="info-row"><div class="info-label">Approved On:</div><div class="info-value">${permission.reviewedAt ? new Date(permission.reviewedAt).toLocaleString() : new Date().toLocaleString()}</div></div>
            <div class="signature-area">
              <div class="signature"><div class="signature-line">Student's Signature</div></div>
              <div class="signature"><div class="signature-line">Parent's/Guardian's Signature</div></div>
              <div class="signature"><div class="signature-line">School Stamp & Signature</div></div>
            </div>
          </div>
          <div class="footer">
            <p>This is an electronically generated permission slip. Please present this document when requested.</p>
            <p>© ${new Date().getFullYear()} ESSA Nyarugunga - All Rights Reserved</p>
          </div>
          <div class="button-group">
            <button class="print-btn" onclick="window.print()">🖨️ Print / Save as PDF</button>
            <button class="close-btn" onclick="window.close()">✖️ Close</button>
          </div>
        </div>
      </body>
      </html>
    `;

    res.send(slipHtml);
  } catch (error) {
    console.error('Error generating permission slip:', error);
    res.status(500).send('<h2>Error generating permission slip</h2>');
  }
});

router.get('/permissions/:id/slip-pdf', authMiddleware, async (req, res) => {
  try {
    const permission = await Permission.findById(req.params.id);
    if (!permission) {
      return res.status(404).json({ message: 'Permission request not found' });
    }

    if (permission.status !== 'approved') {
      return res.status(400).json({ message: 'Permission slip can only be generated for approved requests' });
    }

    res.redirect(`/api/permissions/${req.params.id}/slip`);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/my-permissions', authMiddleware, async (req, res) => {
  try {
    const permissions = await Permission.find({
      requesterId: req.userId,
      status: 'approved'
    }).sort({ createdAt: -1 });
    res.json(permissions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;