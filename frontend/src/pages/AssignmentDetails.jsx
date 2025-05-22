import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { assignmentService } from '../services/api';
import { toast } from 'react-toastify';
import Header from '../components/common/Header';

const AssignmentDetails = () => {
  const { id } = useParams();
  const { currentUser, isAdmin } = useAuth();
  const [assignment, setAssignment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState('');
  const [files, setFiles] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [submissions, setSubmissions] = useState([]);
  const [activeTab, setActiveTab] = useState('details'); // 'details' atau 'submissions'
  const navigate = useNavigate();
  
  // State untuk penilaian tugas (di luar loop map)
  const [gradesState, setGradesState] = useState({});
  const [feedbacksState, setFeedbacksState] = useState({});
  const [gradingState, setGradingState] = useState({});

  // Format tanggal
  const formatDate = (dateString) => {
    if (!dateString) return "Tanggal tidak tersedia";
    
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return "Format tanggal tidak valid";
      }
      
      // Gunakan toLocaleDateString sebagai pengganti format dari date-fns
      return date.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      console.error("Error formatting date:", error);
      return "Error format tanggal";
    }
  };

  // Inisialisasi state penilaian saat submissions berubah
  useEffect(() => {
    if (submissions.length > 0) {
      const initialGrades = {};
      const initialFeedbacks = {};
      const initialGrading = {};
      
      submissions.forEach(sub => {
        initialGrades[sub._id] = sub.grade || '';
        initialFeedbacks[sub._id] = sub.feedback || '';
        initialGrading[sub._id] = false;
      });
      
      setGradesState(initialGrades);
      setFeedbacksState(initialFeedbacks);
      setGradingState(initialGrading);
    }
  }, [submissions]);

  // Dapatkan detail tugas
  useEffect(() => {
    const fetchAssignment = async () => {
      try {
        setLoading(true);
        const data = await assignmentService.getAssignmentById(
          id, 
          currentUser.userId, 
          isAdmin
        );
        setAssignment(data);

        // Jika admin, dapatkan semua submission
        if (isAdmin) {
          const submissionData = await assignmentService.getSubmissions(id, currentUser.userId);
          setSubmissions(submissionData);
        }
      } catch (error) {
        toast.error('Gagal memuat detail tugas');
        console.error('Error fetching assignment:', error);
        navigate(isAdmin ? '/admin' : '/dashboard');
      } finally {
        setLoading(false);
      }
    };

    if (currentUser) {
      fetchAssignment();
    }
  }, [id, currentUser, isAdmin, navigate]);

  // Handle file input change
  const handleFileChange = (e) => {
    setFiles([...e.target.files]);
  };

  // Handler untuk perubahan grade dan feedback
  const handleGradeChange = (submissionId, value) => {
    setGradesState(prev => ({
      ...prev,
      [submissionId]: value
    }));
  };

  const handleFeedbackChange = (submissionId, value) => {
    setFeedbacksState(prev => ({
      ...prev,
      [submissionId]: value
    }));
  };

  // Submit tugas
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!content && files.length === 0) {
      toast.warn('Masukkan jawaban atau unggah file terlebih dahulu');
      return;
    }

    try {
      setSubmitting(true);
      await assignmentService.submitAssignmentWithFiles(
        id, 
        currentUser.userId, 
        content, 
        files
      );
      
      toast.success('Tugas berhasil dikumpulkan');
      
      // Reload assignment data untuk melihat submission terbaru
      const updatedAssignment = await assignmentService.getAssignmentById(
        id, 
        currentUser.userId, 
        isAdmin
      );
      
      setAssignment(updatedAssignment);
      setContent('');
      setFiles([]);
    } catch (error) {
      toast.error(error.message || 'Gagal mengumpulkan tugas');
      console.error('Error submitting assignment:', error);
    } finally {
      setSubmitting(false);
    }
  };

  // Grade submission
  const handleGradeSubmission = async (submissionId, grade, feedback) => {
    if (!grade || grade < 0 || grade > 100) {
      toast.error('Nilai harus antara 0-100');
      return;
    }

    try {
      await assignmentService.gradeSubmission(id, submissionId, currentUser.userId, grade, feedback);
      toast.success('Nilai berhasil diberikan');
      
      // Refresh submission data
      const updatedSubmissions = await assignmentService.getSubmissions(id, currentUser.userId);
      setSubmissions(updatedSubmissions);
    } catch (error) {
      toast.error('Gagal memberikan nilai');
      console.error('Error grading submission:', error);
    }
  };

  // Submit handler untuk form penilaian
  const handleSubmitGrade = async (submissionId, e) => {
    e.preventDefault();
    
    // Update grading state untuk submissionId ini
    setGradingState(prev => ({
      ...prev,
      [submissionId]: true
    }));
    
    try {
      await handleGradeSubmission(
        submissionId, 
        gradesState[submissionId], 
        feedbacksState[submissionId]
      );
    } finally {
      setGradingState(prev => ({
        ...prev,
        [submissionId]: false
      }));
    }
  };

  // Cek apakah student sudah submit
  const userSubmission = assignment?.submissions?.find(sub => 
    sub.user === currentUser.userId || (sub.user && sub.user._id === currentUser.userId)
  );

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="mt-2 text-gray-600">Memuat detail tugas...</p>
          </div>
        </div>
      </div>
    );
  }

  // Tugas tidak ditemukan
  if (!assignment && !loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
          <div className="text-center">
            <svg className="w-16 h-16 mx-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
            </svg>
            <p className="mt-2 text-xl font-medium text-gray-900">Tugas tidak ditemukan</p>
            <p className="mt-1 text-gray-500">Tugas mungkin telah dihapus atau Anda tidak memiliki akses.</p>
            <div className="mt-6">
              <Link to={isAdmin ? "/admin" : "/dashboard"} className="text-blue-600 hover:text-blue-800">
                Kembali ke Dashboard
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Tambahkan import useNavigate jika belum ada
  // import { useParams, Link, useNavigate } from 'react-router-dom';

  // Di dalam komponen, tambahkan handleDeleteAssignment
  const handleDeleteAssignment = async () => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus tugas ini?')) return;

    try {
      await assignmentService.deleteAssignment(id, currentUser.userId);
      toast.success('Tugas berhasil dihapus');
      navigate('/admin'); // Redirect ke dashboard admin setelah menghapus
    } catch (error) {
      toast.error(error.message || 'Gagal menghapus tugas');
      console.error('Error deleting assignment:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6">
        {/* Back button */}
        <div className="mb-6">
          <Link 
            to={isAdmin ? "/admin" : "/dashboard"} 
            className="text-blue-600 hover:text-blue-800 flex items-center"
          >
            <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
            </svg>
            Kembali ke Dashboard
          </Link>
        </div>

        {/* Assignment header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{assignment.title}</h1>
          <div className="flex flex-wrap gap-2 text-sm text-gray-500">
            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
              {assignment.subject}
            </span>
            <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded-full">
              {assignment.day}, {assignment.startTime} - {assignment.endTime}
            </span>
            <span className={`px-2 py-1 rounded-full ${
              new Date() > new Date(assignment.deadline) 
                ? 'bg-red-100 text-red-800' 
                : 'bg-green-100 text-green-800'
            }`}>
              Deadline: {formatDate(assignment.deadline)}
            </span>
          </div>
        </div>

        {/* Tab navigation - untuk admin */}
        {isAdmin && (
          <div className="border-b border-gray-200 mb-6">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('details')}
                className={`${
                  activeTab === 'details'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
              >
                Detail Tugas
              </button>
              <button
                onClick={() => setActiveTab('submissions')}
                className={`${
                  activeTab === 'submissions'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
              >
                Submissions ({submissions.length})
              </button>
            </nav>
          </div>
        )}

        {/* Detail tugas */}
        {(!isAdmin || activeTab === 'details') && (
          <div className="bg-white shadow overflow-hidden rounded-lg">
            <div className="px-6 py-5 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-800">Deskripsi Tugas</h2>
            </div>
            <div className="p-6">
              <div className="prose max-w-none">
                <p className="whitespace-pre-wrap">{assignment.description}</p>
              </div>
              
              <div className="mt-8">
                <h3 className="text-lg font-medium text-gray-800 mb-3">Informasi Jadwal</h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Hari</p>
                      <p className="font-medium">{assignment.day}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Waktu</p>
                      <p className="font-medium">{assignment.startTime} - {assignment.endTime}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Mata Kuliah</p>
                      <p className="font-medium">{assignment.subject}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Deadline</p>
                      <p className={`font-medium ${new Date() > new Date(assignment.deadline) ? 'text-red-600' : 'text-green-600'}`}>
                        {formatDate(assignment.deadline)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Untuk admin: tampilkan daftar user yang diberi tugas */}
              {isAdmin && assignment.assignedTo && assignment.assignedTo.length > 0 && (
                <div className="mt-8">
                  <h3 className="text-lg font-medium text-gray-800 mb-3">Ditugaskan Kepada</h3>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {assignment.assignedTo.map(user => (
                        <div key={typeof user === 'object' ? user._id : user} className="flex items-center p-2 border border-gray-200 rounded-md bg-white">
                          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold">
                            {(typeof user === 'object' ? user.username : user).charAt(0).toUpperCase()}
                          </div>
                          <span className="ml-2 text-gray-700">
                            {typeof user === 'object' ? user.username : user}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
              
              {/* Untuk user: tampilkan bagian submit tugas jika belum submit */}
              {!isAdmin && (
                <div className="mt-8 border-t border-gray-200 pt-8">
                  <h3 className="text-lg font-medium text-gray-800 mb-4">Status Pengerjaan</h3>
                  
                  {userSubmission ? (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <div className="flex items-center mb-2">
                        <svg className="w-6 h-6 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                        <span className="font-medium text-green-800">Tugas Sudah Dikumpulkan</span>
                      </div>
                      <p className="text-green-700 text-sm">
                        Anda telah mengumpulkan tugas ini pada {formatDate(userSubmission.submittedAt)}
                      </p>
                      
                      {userSubmission.status === 'graded' && (
                        <div className="mt-4 p-4 bg-white border border-green-200 rounded-md">
                          <div className="flex items-start justify-between">
                            <div>
                              <p className="font-medium text-gray-700">Nilai</p>
                              <p className="text-2xl font-bold text-gray-900">{userSubmission.grade}/100</p>
                            </div>
                            <div className="text-right">
                              <p className="font-medium text-gray-700">Feedback</p>
                              <p className="text-gray-600 text-sm">{userSubmission.feedback || '-'}</p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : new Date() > new Date(assignment.deadline) ? (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <div className="flex items-center mb-2">
                        <svg className="w-6 h-6 text-red-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                        <span className="font-medium text-red-800">Deadline Terlewat</span>
                      </div>
                      <p className="text-red-700 text-sm">
                        Anda tidak mengumpulkan tugas ini sebelum deadline. Deadline: {formatDate(assignment.deadline)}
                      </p>
                    </div>
                  ) : (
                    <>
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                        <div className="flex items-center mb-2">
                          <svg className="w-6 h-6 text-blue-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                          </svg>
                          <span className="font-medium text-blue-800">Tugas Belum Dikumpulkan</span>
                        </div>
                        <p className="text-blue-700 text-sm">
                          Deadline pengumpulan: {formatDate(assignment.deadline)}
                        </p>
                      </div>
                      
                      <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-lg p-5">
                        <h4 className="text-lg font-medium text-gray-800 mb-4">Kumpulkan Tugas</h4>
                        
                        <div className="mb-4">
                          <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">
                            Jawaban / Komentar
                          </label>
                          <textarea
                            id="content"
                            rows={4}
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Tulis jawaban atau keterangan untuk tugas Anda di sini..."
                          />
                        </div>
                        
                        <div className="mb-5">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Upload File
                          </label>
                          <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                            <div className="space-y-1 text-center">
                              <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                                <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                              </svg>
                              <div className="flex text-sm text-gray-600">
                                <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none">
                                  <span>Upload file</span>
                                  <input 
                                    id="file-upload" 
                                    name="file-upload" 
                                    type="file" 
                                    className="sr-only" 
                                    multiple 
                                    onChange={handleFileChange} 
                                  />
                                </label>
                                <p className="pl-1">atau drag and drop</p>
                              </div>
                              <p className="text-xs text-gray-500">
                                PDF, Word, PowerPoint, ZIP (Max 10MB)
                              </p>
                            </div>
                          </div>
                          
                          {files.length > 0 && (
                            <div className="mt-2">
                              <p className="text-sm font-medium text-gray-700 mb-1">File yang akan diunggah:</p>
                              <ul className="text-sm text-gray-600 list-disc pl-5">
                                {Array.from(files).map((file, index) => (
                                  <li key={index}>{file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                        
                        <div className="flex justify-end">
                          <button
                            type="submit"
                            disabled={submitting}
                            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-400"
                          >
                            {submitting ? (
                              <>
                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Mengumpulkan...
                              </>
                            ) : "Kumpulkan Tugas"}
                          </button>
                        </div>
                      </form>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Submissions list untuk admin */}
        {isAdmin && activeTab === 'submissions' && (
          <div className="bg-white shadow overflow-hidden rounded-lg divide-y divide-gray-200">
            {submissions.length === 0 ? (
              <div className="p-6 text-center">
                <svg className="w-12 h-12 mx-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                </svg>
                <p className="mt-2 text-lg font-medium text-gray-900">Belum ada yang mengumpulkan</p>
                <p className="mt-1 text-sm text-gray-500">Tugas ini belum memiliki submission.</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {submissions.map((submission) => {
                  // Gunakan state yang telah diindeks
                  const gradeValue = gradesState[submission._id] || '';
                  const feedbackValue = feedbacksState[submission._id] || '';
                  const isGrading = gradingState[submission._id] || false;
                
                  return (
                    <div key={submission._id} className="p-6">
                      <div className="flex flex-wrap justify-between items-start mb-4">
                        <div>
                          <h3 className="text-lg font-medium text-gray-900">
                            {submission.user?.username || "User"}
                          </h3>
                          <p className="text-sm text-gray-500">
                            Dikumpulkan pada {formatDate(submission.submittedAt)}
                          </p>
                        </div>
                        <div className="mt-2 sm:mt-0">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            submission.status === 'graded' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {submission.status === 'graded' ? 'Sudah dinilai' : 'Belum dinilai'}
                          </span>
                        </div>
                      </div>
                      
                      {/* Konten submission */}
                      {/* ...content submission tidak berubah... */}
                      
                      {/* Grading section */}
                      <div className="mt-4 p-4 border border-gray-200 rounded-lg bg-gray-50">
                        <h4 className="text-md font-medium text-gray-800 mb-3">
                          {submission.status === 'graded' ? 'Ubah Nilai' : 'Beri Nilai'}
                        </h4>
                        
                        <form onSubmit={(e) => handleSubmitGrade(submission._id, e)}>
                          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div>
                              <label htmlFor={`grade-${submission._id}`} className="block text-sm font-medium text-gray-700 mb-1">
                                Nilai (0-100)
                              </label>
                              <input
                                id={`grade-${submission._id}`}
                                type="number"
                                min="0"
                                max="100"
                                required
                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                value={gradeValue}
                                onChange={(e) => handleGradeChange(submission._id, e.target.value)}
                              />
                            </div>
                            
                            <div className="md:col-span-3">
                              <label htmlFor={`feedback-${submission._id}`} className="block text-sm font-medium text-gray-700 mb-1">
                                Feedback (Opsional)
                              </label>
                              <textarea
                                id={`feedback-${submission._id}`}
                                rows={2}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                value={feedbackValue}
                                onChange={(e) => handleFeedbackChange(submission._id, e.target.value)}
                                placeholder="Berikan feedback untuk mahasiswa..."
                              />
                            </div>
                          </div>
                          
                          <div className="mt-3 text-right">
                            <button
                              type="submit"
                              disabled={isGrading}
                              className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            >
                              {isGrading ? 'Memproses...' : 'Simpan Nilai'}
                            </button>
                          </div>
                        </form>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AssignmentDetails;