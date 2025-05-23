const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  // Update CORS untuk mengizinkan frontend Vercel dan Docker local
  origin: [
    'http://localhost:5173',
    'http://localhost', // Tambahkan ini untuk frontend Docker
    'http://localhost:80', // Alternatif explicit port
    'https://tutam9-frontend-gray.vercel.app',
    'https://tutam9-frontend-ls9rd37hx-dzakys-projects-91c39113.vercel.app'
  ],
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'x-auth-token', 'Authorization'],
  credentials: true
}));
app.use(express.json());

// Connect to MongoDB (KelasSbd database)
mongoose.connect(process.env.MONGODB_URI, {
  dbName: 'KelasSbd' // Changed from Tutam9 to KelasSbd
})
  .then(() => console.log('Connected to KelasSbd database!'))
  .catch(err => console.error('Could not connect to MongoDB:', err));

// Import routes
const assignmentRoutes = require('./routes/assignmentroutes');
const userRoutes = require('./routes/userroutes');
const mediaRoutes = require('./routes/mediaroutes');

// Routes
app.get('/', (req, res) => {
  res.send('Assignment Tracker API is running');
});

// Use routes
app.use('/api/assignments', assignmentRoutes);
app.use('/api/users', userRoutes);
app.use('/api/media', mediaRoutes);

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});