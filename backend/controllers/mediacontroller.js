const cloudinary = require('cloudinary').v2;
const Assignment = require('../models/assignment');
const User = require('../models/user');

// Konfigurasi cloudinary dari environment variable
cloudinary.config({
  // URL akan diambil otomatis dari CLOUDINARY_URL di .env
});

// Upload file ke cloudinary
exports.uploadMedia = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Tidak ada file yang diunggah' });
    }

    // Upload ke cloudinary
    const result = await cloudinary.uploader.upload(req.file.path, {
      resource_type: 'auto', // Deteksi otomatis tipe file (image, video, dll)
    });

    // Kembalikan URL file yang sudah diunggah
    res.status(200).json({
      url: result.secure_url,
      publicId: result.public_id,
      format: result.format,
      resourceType: result.resource_type
    });
  } catch (err) {
    console.error('Media upload error:', err);
    res.status(500).json({ message: 'Gagal mengunggah file' });
  }
};

// Hapus media dari cloudinary
exports.deleteMedia = async (req, res) => {
  try {
    const { publicId, resourceType } = req.body;
    
    if (!publicId) {
      return res.status(400).json({ message: 'Public ID diperlukan' });
    }

    await cloudinary.uploader.destroy(publicId, { resource_type: resourceType || 'image' });
    
    res.status(200).json({ message: 'Media berhasil dihapus' });
  } catch (err) {
    console.error('Media delete error:', err);
    res.status(500).json({ message: 'Gagal menghapus file' });
  }
};