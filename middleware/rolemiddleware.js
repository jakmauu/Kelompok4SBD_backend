const User = require('../models/user');

exports.checkAdmin = async (req, res, next) => {
  try {
    const { userId, adminId } = req.body;
    
    // Verifikasi userId diberikan - cek dari kedua field untuk fleksibilitas
    const id = userId || adminId;
    
    if (!id) {
      return res.status(400).json({
        message: 'User ID diperlukan'
      });
    }

    // Cari user berdasarkan ID
    const user = await User.findById(id);
    
    if (!user) {
      return res.status(404).json({
        message: 'User tidak ditemukan'
      });
    }

    // Periksa apakah user adalah admin
    if (user.role !== 'admin') {
      return res.status(403).json({
        message: 'Akses ditolak. Hanya admin yang diizinkan.'
      });
    }

    // Jika admin, lanjutkan ke handler berikutnya
    next();
  } catch (err) {
    console.error('Role check error:', err);
    res.status(500).json({
      message: 'Terjadi kesalahan server'
    });
  }
};