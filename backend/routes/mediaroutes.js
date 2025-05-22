const express = require('express');
const router = express.Router();
const mediaController = require('../controllers/mediacontroller');
const upload = require('../middleware/upload');

// Route untuk upload file/media
router.post('/upload', upload.single('file'), mediaController.uploadMedia);

// Route untuk hapus media
router.delete('/delete', mediaController.deleteMedia);

module.exports = router;