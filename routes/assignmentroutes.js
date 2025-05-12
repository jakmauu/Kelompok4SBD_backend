const express = require('express');
const router = express.Router();
const assignmentController = require('../controllers/assignmentcontroller');
const upload = require('../middleware/upload');
const cloudinary = require('cloudinary').v2;

// Create assignment (admin only)
router.post('/', assignmentController.createAssignment);

// Get all assignments (admin) or user's assignments
router.get('/', assignmentController.getAssignments);

// Get deadline assignments for user
router.get('/deadline', assignmentController.getDeadlineAssignments);

// Get specific assignment by id
router.get('/:id', assignmentController.getAssignmentById);

// Update assignment (admin only)
router.put('/:id', assignmentController.updateAssignment);

// Delete assignment (admin only)
router.delete('/:id', assignmentController.deleteAssignment);

// Submit assignment dengan JSON (metode lama)
router.post('/:id/submit', assignmentController.submitAssignment);

// Submit assignment dengan form-data (metode baru)
router.post('/:id/submit-form', upload.array('files', 5), assignmentController.submitAssignmentWithFiles);

// Grade submission (admin only)
router.put('/:assignmentId/submissions/:submissionId/grade', assignmentController.gradeSubmission);

// Get all submissions for an assignment (admin only)
router.get('/:id/submissions', assignmentController.getSubmissions);

module.exports = router;