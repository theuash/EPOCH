const express = require('express');
const router = express.Router();
const multer = require('multer');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const authJWT = require('../middleware/authJWT');
const roleGuard = require('../middleware/roleGuard');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/') || file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only images and PDFs allowed'));
    }
  }
});

router.post('/', authJWT, roleGuard(['admin']), upload.single('receiptFile'), (req, res) => {
  try {
    const fileBuffer = fs.readFileSync(req.file.path);
    const hash = crypto.createHash('sha256').update(fileBuffer).digest('hex');
    res.json({ hash, fileName: req.file.filename });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
