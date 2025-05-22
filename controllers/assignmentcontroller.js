const Assignment = require('../models/assignment');
const User = require('../models/user');
const mongoose = require('mongoose');
const cloudinary = require('cloudinary').v2;
const fs = require('fs');

// Pastikan cloudinary terkonfigurasi
cloudinary.config();

// Get assignments for current user
exports.getAllAssignments = async (req, res) => {
  try {
    const assignments = await Assignment.find({ user: req.userId });
    res.json(assignments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get assignments by day for current user
exports.getAssignmentsByDay = async (req, res) => {
  try {
    const assignments = await Assignment.find({ 
      user: req.userId,
      day: req.params.day 
    });
    res.json(assignments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get a single assignment
exports.getAssignmentById = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId, adminId } = req.query;
    const requesterId = userId || adminId;

    if (!requesterId) {
      return res.status(400).json({ message: 'User ID atau Admin ID diperlukan sebagai query parameter' });
    }

    // Verifikasi user
    const user = await User.findById(requesterId);
    if (!user) {
      return res.status(404).json({ message: 'User tidak ditemukan' });
    }

    const assignment = await Assignment.findById(id);
    
    if (!assignment) {
      return res.status(404).json({ message: 'Tugas tidak ditemukan' });
    }

    // Jika bukan admin, cek apakah tugas ditugaskan kepada user ini
    if (user.role !== 'admin' && !assignment.assignedTo.includes(requesterId)) {
      return res.status(403).json({ message: 'Anda tidak memiliki akses ke tugas ini' });
    }

    res.json(assignment);
  } catch (err) {
    console.error('Get assignment error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Create assignment (admin only)
exports.createAssignment = async (req, res) => {
  try {
    const { 
      title, 
      description, 
      subject, 
      deadline, 
      assignedTo,
      day,
      startTime,
      endTime,
      userId // ID admin yang membuat
    } = req.body;

    // Validasi apakah pembuat adalah admin
    const admin = await User.findById(userId);
    if (!admin) {
      return res.status(404).json({ message: 'User tidak ditemukan' });
    }
    if (admin.role !== 'admin') {
      return res.status(403).json({ message: 'Hanya admin yang dapat membuat tugas' });
    }

    // Validasi apakah semua user yang ditugaskan valid
    if (assignedTo && assignedTo.length > 0) {
      const validUsers = await User.find({ _id: { $in: assignedTo } });
      if (validUsers.length !== assignedTo.length) {
        return res.status(400).json({ message: 'Beberapa user ID tidak valid' });
      }
    }

    // Buat assignment baru - perhatikan field user yang diisi dengan userId
    const newAssignment = new Assignment({
      title,
      description,
      subject,
      user: userId, // Ini yang penting, user sebagai pembuat (bukan createdBy)
      assignedTo,
      deadline,
      day,
      startTime,
      endTime,
      attachments: [],
      images: []
    });

    await newAssignment.save();
    res.status(201).json({
      message: 'Tugas berhasil dibuat',
      assignment: newAssignment
    });
  } catch (err) {
    console.error('Create assignment error:', err);
    res.status(500).json({ message: 'Server error: ' + err.message });
  }
};

// Get all assignments (admin) or user's assignments - modifikasi untuk GET dengan query parameter
exports.getAssignments = async (req, res) => {
  try {
    const { userId, adminId } = req.query;
    const id = userId || adminId;

    if (!id) {
      return res.status(400).json({ message: 'User ID atau Admin ID diperlukan sebagai query parameter' });
    }

    // Verifikasi user
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: 'User tidak ditemukan' });
    }

    let assignments;
    
    if (user.role === 'admin') {
      // Admin melihat semua tugas
      assignments = await Assignment.find();
    } else {
      // User biasa hanya melihat tugas yang ditugaskan kepada mereka
      assignments = await Assignment.find({ 
        assignedTo: id 
      });
    }

    res.json(assignments);
  } catch (err) {
    console.error('Get assignments error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update assignment (admin only)
exports.updateAssignment = async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      title, 
      description, 
      subject, 
      deadline, 
      assignedTo,
      day,
      startTime,
      endTime,
      userId // ID admin yang update
    } = req.body;

    // Validasi apakah pembuat adalah admin
    const admin = await User.findById(userId);
    if (!admin || admin.role !== 'admin') {
      return res.status(403).json({ message: 'Hanya admin yang dapat mengupdate tugas' });
    }

    // Validasi apakah semua user yang ditugaskan valid
    if (assignedTo && assignedTo.length > 0) {
      const validUsers = await User.find({ _id: { $in: assignedTo } });
      if (validUsers.length !== assignedTo.length) {
        return res.status(400).json({ message: 'Beberapa user ID tidak valid' });
      }
    }

    const assignment = await Assignment.findById(id);
    
    if (!assignment) {
      return res.status(404).json({ message: 'Tugas tidak ditemukan' });
    }

    // Update assignment
    assignment.title = title || assignment.title;
    assignment.description = description || assignment.description;
    assignment.subject = subject || assignment.subject;
    assignment.deadline = deadline || assignment.deadline;
    assignment.assignedTo = assignedTo || assignment.assignedTo;
    assignment.day = day || assignment.day;
    assignment.startTime = startTime || assignment.startTime;
    assignment.endTime = endTime || assignment.endTime;

    await assignment.save();
    res.json({
      message: 'Tugas berhasil diupdate',
      assignment
    });
  } catch (err) {
    console.error('Update assignment error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete assignment (admin only)
exports.deleteAssignment = async (req, res) => {
  try {
    const { id } = req.params;
    const { adminId } = req.query; // Ambil dari query parameter, bukan dari body

    if (!adminId) {
      return res.status(400).json({ message: 'Admin ID diperlukan sebagai query parameter' });
    }

    // Validasi apakah pembuat adalah admin
    const admin = await User.findById(adminId);
    if (!admin) {
      return res.status(404).json({ message: 'User tidak ditemukan' });
    }
    if (admin.role !== 'admin') {
      return res.status(403).json({ message: 'Hanya admin yang dapat menghapus tugas' });
    }

    const assignment = await Assignment.findById(id);
    
    if (!assignment) {
      return res.status(404).json({ message: 'Tugas tidak ditemukan' });
    }

    await assignment.deleteOne();
    res.json({ message: 'Tugas berhasil dihapus' });
  } catch (err) {
    console.error('Delete assignment error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Submit assignment (user)
exports.submitAssignment = async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      userId, 
      content, 
      attachments = [], 
      images = [] 
    } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User tidak ditemukan' });
    }

    const assignment = await Assignment.findById(id);
    
    if (!assignment) {
      return res.status(404).json({ message: 'Tugas tidak ditemukan' });
    }

    // Cek apakah user memiliki hak mengerjakan tugas ini
    if (!assignment.assignedTo.includes(userId)) {
      return res.status(403).json({ message: 'Anda tidak memiliki akses ke tugas ini' });
    }

    // Cek apakah sudah melewati deadline
    const now = new Date();
    const deadline = new Date(assignment.deadline);
    
    if (now > deadline) {
      return res.status(400).json({ message: 'Batas waktu pengumpulan sudah berakhir' });
    }

    // Buat submission baru
    const newSubmission = {
      user: userId,
      content,
      attachments,
      images,
      submittedAt: new Date(),
      status: "submitted"
    };

    // Cek apakah user sudah pernah mengumpulkan, jika sudah update submissionnya
    const existingSubmissionIndex = assignment.submissions.findIndex(
      submission => submission.user.toString() === userId
    );

    if (existingSubmissionIndex !== -1) {
      // Update submission yang sudah ada
      assignment.submissions[existingSubmissionIndex] = {
        ...assignment.submissions[existingSubmissionIndex],
        content,
        attachments,
        images,
        submittedAt: new Date(),
        status: "submitted"
      };
    } else {
      // Tambahkan submission baru
      assignment.submissions.push(newSubmission);
    }

    await assignment.save();
    
    res.json({
      message: 'Tugas berhasil dikumpulkan',
      submission: existingSubmissionIndex !== -1 
        ? assignment.submissions[existingSubmissionIndex]
        : assignment.submissions[assignment.submissions.length - 1]
    });
  } catch (err) {
    console.error('Submit assignment error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Submit assignment dengan form-data (user)
exports.submitAssignmentWithFiles = async (req, res) => {
  try {
    const { id } = req.params; // ID tugas
    const { userId, content } = req.body;
    
    // Validasi user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User tidak ditemukan' });
    }

    // Validasi tugas
    const assignment = await Assignment.findById(id);
    if (!assignment) {
      return res.status(404).json({ message: 'Tugas tidak ditemukan' });
    }

    // Cek apakah user memiliki hak mengerjakan tugas ini
    if (!assignment.assignedTo.includes(userId)) {
      return res.status(403).json({ message: 'Anda tidak memiliki akses ke tugas ini' });
    }

    // Cek apakah sudah melewati deadline
    const now = new Date();
    const deadline = new Date(assignment.deadline);
    
    if (now > deadline) {
      return res.status(400).json({ message: 'Batas waktu pengumpulan sudah berakhir' });
    }

    // Proses file jika ada
    let attachments = [];
    let images = [];
    
    // Upload file ke cloudinary
    if (req.files && req.files.length > 0) {
      const uploadPromises = req.files.map(async file => {
        try {
          // Deteksi jenis file (image atau dokumen)
          const isImage = file.mimetype.startsWith('image/');
          
          // Upload ke cloudinary
          const result = await cloudinary.uploader.upload(file.path, {
            resource_type: isImage ? 'image' : 'raw',
          });
          
          const fileInfo = {
            url: result.secure_url,
            publicId: result.public_id,
            format: result.format,
            resourceType: result.resource_type
          };
          
          // Masukkan ke array yang sesuai
          if (isImage) {
            images.push(fileInfo);
          } else {
            attachments.push(fileInfo);
          }
          
          // Hapus file lokal setelah upload ke cloudinary
          fs.unlinkSync(file.path);
        } catch (err) {
          console.error(`Error uploading file ${file.originalname}:`, err);
        }
      });
      
      // Tunggu semua proses upload selesai
      await Promise.all(uploadPromises);
    }
    
    // Buat atau update submission
    const existingSubmissionIndex = assignment.submissions.findIndex(
      submission => submission.user.toString() === userId
    );
    
    if (existingSubmissionIndex !== -1) {
      // Update submission yang sudah ada
      const currentSubmission = assignment.submissions[existingSubmissionIndex];
      
      assignment.submissions[existingSubmissionIndex] = {
        ...currentSubmission,
        content: content || currentSubmission.content,
        attachments: attachments.length > 0 ? [...currentSubmission.attachments, ...attachments] : currentSubmission.attachments,
        images: images.length > 0 ? [...currentSubmission.images, ...images] : currentSubmission.images,
        submittedAt: new Date(),
        status: "submitted"
      };
    } else {
      // Tambahkan submission baru
      assignment.submissions.push({
        user: userId,
        content: content || "",
        attachments,
        images,
        submittedAt: new Date(),
        status: "submitted"
      });
    }
    
    await assignment.save();
    
    res.json({
      message: 'Tugas berhasil dikumpulkan',
      submission: existingSubmissionIndex !== -1 
        ? assignment.submissions[existingSubmissionIndex]
        : assignment.submissions[assignment.submissions.length - 1]
    });
  } catch (err) {
    console.error('Submit assignment with files error:', err);
    res.status(500).json({ message: 'Server error: ' + err.message });
  }
};

// Grade submission (admin only)
exports.gradeSubmission = async (req, res) => {
  try {
    const { assignmentId, submissionId } = req.params;
    const { userId, grade, feedback } = req.body;

    console.log(`Grading submission: Assignment=${assignmentId}, Submission=${submissionId}, AdminID=${userId}`);

    // Validasi apakah pemberi nilai adalah admin
    const admin = await User.findById(userId);
    if (!admin) {
      return res.status(404).json({ message: 'User tidak ditemukan' });
    }
    if (admin.role !== 'admin') {
      return res.status(403).json({ message: 'Hanya admin yang dapat memberikan nilai' });
    }

    const assignment = await Assignment.findById(assignmentId);
    
    if (!assignment) {
      return res.status(404).json({ message: 'Tugas tidak ditemukan' });
    }

    // Cari submission yang akan dinilai - gunakan toString() untuk perbandingan ID
    const submissionIndex = assignment.submissions.findIndex(
      submission => submission._id.toString() === submissionId
    );

    console.log(`SubmissionIndex: ${submissionIndex}, Total submissions: ${assignment.submissions.length}`);

    if (submissionIndex === -1) {
      return res.status(404).json({ message: 'Submission tidak ditemukan' });
    }

    // Update nilai dan feedback
    assignment.submissions[submissionIndex].grade = grade;
    assignment.submissions[submissionIndex].feedback = feedback;
    assignment.submissions[submissionIndex].status = "graded";

    await assignment.save();
    
    res.json({
      message: 'Nilai berhasil diberikan',
      submission: assignment.submissions[submissionIndex]
    });
  } catch (err) {
    console.error('Grade submission error:', err);
    res.status(500).json({ message: 'Server error: ' + err.message });
  }
};

// Get all submissions for an assignment (admin only) - modifikasi untuk GET dengan query parameter
exports.getSubmissions = async (req, res) => {
  try {
    const { id } = req.params;
    const { adminId } = req.query;

    if (!adminId) {
      return res.status(400).json({ message: 'Admin ID diperlukan sebagai query parameter' });
    }

    // Validasi apakah pembuat adalah admin
    const admin = await User.findById(adminId);
    if (!admin || admin.role !== 'admin') {
      return res.status(403).json({ message: 'Hanya admin yang dapat melihat semua submission' });
    }

    const assignment = await Assignment.findById(id).populate('submissions.user', 'username email');
    
    if (!assignment) {
      return res.status(404).json({ message: 'Tugas tidak ditemukan' });
    }

    res.json(assignment.submissions);
  } catch (err) {
    console.error('Get submissions error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Middleware to get assignment by ID
exports.getAssignment = async (req, res, next) => {
  let assignment;
  try {
    assignment = await Assignment.findById(req.params.id);
    if (assignment == null) {
      return res.status(404).json({ message: 'Assignment not found' });
    }
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }

  res.assignment = assignment;
  next();
};

// ...existing code...

// Get specific submission details including files (admin only)
exports.getSubmissionDetails = async (req, res) => {
  try {
    const { assignmentId, submissionId } = req.params;
    const { adminId } = req.query;

    if (!adminId) {
      return res.status(400).json({ message: 'Admin ID diperlukan sebagai query parameter' });
    }

    // Validasi apakah pembuat adalah admin
    const admin = await User.findById(adminId);
    if (!admin || admin.role !== 'admin') {
      return res.status(403).json({ message: 'Hanya admin yang dapat melihat detail submission' });
    }

    const assignment = await Assignment.findById(assignmentId)
      .populate('submissions.user', 'username email');
    
    if (!assignment) {
      return res.status(404).json({ message: 'Tugas tidak ditemukan' });
    }

    // Cari submission yang ingin dilihat
    const submission = assignment.submissions.find(
      sub => sub._id.toString() === submissionId
    );

    if (!submission) {
      return res.status(404).json({ message: 'Submission tidak ditemukan' });
    }

    res.json({
      submission,
      assignmentTitle: assignment.title,
      assignmentDescription: assignment.description,
      deadline: assignment.deadline
    });
  } catch (err) {
    console.error('Get submission details error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};
// TAMBAHKAN: Get deadline assignments untuk user
exports.getDeadlineAssignments = async (req, res) => {
  try {
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({ message: 'User ID diperlukan sebagai query parameter' });
    }

    // Verifikasi user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User tidak ditemukan' });
    }

    // Hanya user yang bisa melihat deadline tugasnya
    if (user.role === 'admin') {
      return res.status(403).json({ message: 'Endpoint ini hanya untuk user biasa' });
    }

    const today = new Date();
    // Ambil semua tugas yang mendekati deadline (dalam 7 hari ke depan)
    const nextWeek = new Date();
    nextWeek.setDate(today.getDate() + 7);

    // Cari tugas dengan deadline antara hari ini dan 7 hari ke depan
    const upcomingDeadlines = await Assignment.find({ 
      assignedTo: userId,
      deadline: { $gte: today, $lte: nextWeek }
    }).sort({ deadline: 1 }); // Urutkan dari deadline terdekat

    res.json(upcomingDeadlines);
  } catch (err) {
    console.error('Get deadline assignments error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};