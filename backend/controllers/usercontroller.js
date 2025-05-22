const User = require('../models/user');
const jwt = require('jsonwebtoken');

// Register new user
exports.register = async (req, res) => {
  try {
    const { username, email, password, role } = req.body;

    // Check if user already exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: 'User dengan email ini sudah terdaftar' });
    }

    user = await User.findOne({ username });
    if (user) {
      return res.status(400).json({ message: 'Username sudah digunakan' });
    }

    // Create new user (default role adalah user jika tidak disediakan)
    user = new User({
      username,
      email,
      password,
      role: role || 'user'
    });

    await user.save();

    res.status(201).json({
      message: 'Registrasi berhasil',
      userId: user._id,
      username: user.username,
      role: user.role
    });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Login user
exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;
    console.log(`Mencoba login untuk pengguna: ${username}`);

    // Cek apakah pengguna ada
    const user = await User.findOne({ username });
    if (!user) {
      console.log('Pengguna tidak ditemukan');
      return res.status(400).json({ message: 'Username atau password tidak valid' });
    }

    // Cek password
    console.log('Membandingkan password...');
    const isMatch = await user.comparePassword(password);
    console.log('Hasil pencocokan password:', isMatch);
    
    if (!isMatch) {
      return res.status(400).json({ message: 'Username atau password tidak valid' });
    }

    res.json({
      message: 'Login berhasil',
      userId: user._id,
      username: user.username,
      role: user.role
    });
  } catch (err) {
    console.error('Detail error login:', err);
    res.status(500).json({ message: 'Server error: ' + err.message });
  }
};

// Get current user
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User tidak ditemukan' });
    }
    res.json(user);
  } catch (err) {
    console.error('Get me error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get user by ID
exports.getUserById = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User tidak ditemukan' });
    }
    
    res.json(user);
  } catch (err) {
    console.error('Get user error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get all users - dimodifikasi untuk GET dengan query parameter
exports.getAllUsers = async (req, res) => {
  try {
    const { adminId } = req.query;
    
    if (!adminId) {
      return res.status(400).json({ message: 'Admin ID diperlukan sebagai query parameter' });
    }
    
    // Verifikasi admin
    const admin = await User.findById(adminId);
    if (!admin || admin.role !== 'admin') {
      return res.status(403).json({ message: 'Akses ditolak. Hanya admin yang diizinkan.' });
    }
    
    // Ambil semua user jika admin terverifikasi
    const users = await User.find().select('-password');
    
    res.status(200).json(users);
  } catch (err) {
    console.error('Get all users error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};