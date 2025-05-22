import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { assignmentService } from '../services/api';
import { toast } from 'react-toastify';
import Header from '../components/common/Header';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { motion } from 'framer-motion';
import { Tooltip } from 'react-tooltip';

const AdminDashboard = () => {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('deadline');
  const { currentUser } = useAuth();
  const tableRef = useRef(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showSubmissions, setShowSubmissions] = useState({});
  
  const refreshData = async () => {
    setIsRefreshing(true);
    try {
      const data = await assignmentService.getAssignments(
        currentUser.userId,
        true
      );
      setAssignments(data);
      toast.success('Data berhasil diperbarui');
    } catch (error) {
      toast.error('Gagal memperbarui data');
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    const fetchAssignments = async () => {
      try {
        setLoading(true);
        const data = await assignmentService.getAssignments(
          currentUser.userId,
          true
        );
        setAssignments(data);
      } catch (error) {
        toast.error('Gagal memuat daftar tugas');
        console.error('Error fetching assignments:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAssignments();
  }, [currentUser]);

  const handleDeleteAssignment = async (assignmentId) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus tugas ini?')) return;

    try {
      await assignmentService.deleteAssignment(assignmentId, currentUser.userId);
      setAssignments(prev => prev.filter(a => a._id !== assignmentId));
      toast.success('Tugas berhasil dihapus');
    } catch (error) {
      toast.error(error.message || 'Gagal menghapus tugas');
      console.error('Error deleting assignment:', error);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Tanggal tidak tersedia";
    
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return "Format tanggal tidak valid";
      }
      return format(date, "dd MMMM yyyy 'pukul' HH:mm", { locale: id });
    } catch (error) {
      console.error("Error formatting date:", dateString, error);
      return "Error format tanggal";
    }
  };

  const filteredAssignments = assignments.filter(assignment => 
    assignment.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    assignment.subject.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const sortedAssignments = [...filteredAssignments].sort((a, b) => {
    if (sortBy === 'deadline') {
      return new Date(a.deadline) - new Date(b.deadline);
    } else if (sortBy === 'title') {
      return a.title.localeCompare(b.title);
    } else if (sortBy === 'subject') {
      return a.subject.localeCompare(b.subject);
    }
    return 0;
  });

  // Toggle submission details
  const toggleSubmissionDetails = (assignmentId) => {
    setShowSubmissions(prev => ({
      ...prev,
      [assignmentId]: !prev[assignmentId]
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <Header />
      
      <main className="container-fluid mx-auto px-4 py-8 max-w-full lg:max-w-7xl">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex justify-between items-center mb-8"
        >
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 mb-2 tracking-tight">
              Dashboard <span className="text-blue-600">Admin</span>
            </h1>
            <p className="text-gray-600 text-lg">
              Kelola semua tugas dan penugasan di sini.
            </p>
          </div>
          
          <div className="flex space-x-3">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`px-4 py-2 rounded-full flex items-center justify-center ${isRefreshing ? 'bg-blue-100 text-blue-600' : 'bg-white text-blue-600 shadow-sm hover:shadow-md'}`}
              onClick={refreshData}
              disabled={isRefreshing}
              data-tooltip-id="refresh-tooltip"
              data-tooltip-content="Perbarui data"
            >
              <svg 
                className={`w-5 h-5 ${isRefreshing ? 'animate-spin' : ''}`} 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24" 
                xmlns="http://www.w3.org/2000/svg"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </motion.button>
            
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link
                to="/assignments/create"
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-full shadow-md hover:shadow-lg transition-all flex items-center"
                data-tooltip-id="create-tooltip"
                data-tooltip-content="Buat tugas baru"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                </svg>
                Buat Tugas Baru
              </Link>
            </motion.div>
          </div>
        </motion.div>

        {/* Tambahkan tombol untuk pergi ke halaman statistik */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard Admin</h1>
          <div className="flex space-x-4">
            <Link
              to="/admin/statistics"
              className="flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-emerald-500 hover:bg-emerald-600 transition-colors"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
              </svg>
              Lihat Statistik
            </Link>
            <Link
              to="/assignments/create"
              className="flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-emerald-500 hover:bg-emerald-600 transition-colors"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
              </svg>
              Buat Tugas Baru
            </Link>
          </div>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="bg-white rounded-xl shadow-md overflow-hidden mb-8 p-6"
        >
          <div className="flex flex-col md:flex-row justify-between items-center mb-6 space-y-4 md:space-y-0">
            <div className="relative w-full md:w-64">
              <input
                type="text"
                placeholder="Cari tugas..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              />
              <svg 
                className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24" 
                xmlns="http://www.w3.org/2000/svg"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
              </svg>
            </div>

            <div className="flex items-center space-x-3 bg-gray-50 px-4 py-2 rounded-full">
              <span className="text-sm font-medium text-gray-700">Urutkan:</span>
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={e => setSortBy(e.target.value)}
                  className="py-2 pl-4 pr-10 appearance-none border-0 bg-transparent rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 text-sm font-medium text-gray-700"
                >
                  <option value="deadline">⏱️ Deadline Terdekat</option>
                  <option value="title">📝 Judul (A-Z)</option>
                  <option value="subject">📚 Mata Kuliah (A-Z)</option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {loading && (
            <div className="text-center py-20">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full mx-auto"
              ></motion.div>
              <p className="mt-4 text-lg font-medium text-gray-600">Memuat daftar tugas...</p>
            </div>
          )}

          {!loading && filteredAssignments.length === 0 && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="text-center py-20 px-4"
            >
              <motion.div 
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              >
                <svg className="w-24 h-24 mx-auto text-blue-200" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                </svg>
              </motion.div>
              <h3 className="mt-6 text-2xl font-bold text-gray-900">Belum ada tugas</h3>
              <p className="mt-2 text-gray-600 max-w-md mx-auto">
                {searchQuery 
                  ? `Tidak ditemukan tugas yang sesuai dengan pencarian "${searchQuery}"` 
                  : "Anda belum membuat tugas. Klik tombol 'Buat Tugas Baru' untuk mulai."}
              </p>
              {!searchQuery && (
                <motion.div 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="mt-8"
                >
                  <Link
                    to="/assignments/create"
                    className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-full shadow-sm text-white bg-blue-600 hover:bg-blue-700 transition-colors"
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                    </svg>
                    Buat Tugas Sekarang
                  </Link>
                </motion.div>
              )}
            </motion.div>
          )}

          {!loading && filteredAssignments.length > 0 && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="overflow-x-auto dashboard-content"
              ref={tableRef}
            >
              <table className="dashboard-table w-full border-collapse">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="py-3 px-4 text-left font-semibold text-gray-700">Tugas</th>
                    <th className="py-3 px-4 text-left font-semibold text-gray-700">Jadwal</th>
                    <th className="py-3 px-4 text-left font-semibold text-gray-700">Deadline</th>
                    <th className="py-3 px-4 text-left font-semibold text-gray-700">Status</th>
                    <th className="py-3 px-4 text-right font-semibold text-gray-700">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedAssignments.map((assignment, index) => {
                    const totalAssigned = assignment.assignedTo.length;
                    const totalSubmitted = assignment.submissions.length;
                    const isDeadlinePassed = assignment.deadline ? new Date() > new Date(assignment.deadline) : false;
                    
                    return (
                      <>
                        <motion.tr 
                          key={assignment._id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ 
                            duration: 0.3,
                            delay: index * 0.05
                          }}
                          className={`border-b border-gray-100 hover:bg-blue-50 transition-colors`}
                        >
                          <td className="py-4 px-4">
                            <div className="flex flex-col">
                              <span className="font-medium text-gray-900">{assignment.title}</span>
                              <span className="text-sm text-gray-500 mt-1">{assignment.subject}</span>
                            </div>
                          </td>
                          <td className="py-4 px-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <span className="bg-blue-100 text-blue-800 text-sm px-2 py-1 rounded-md">
                                {assignment.day}
                              </span>
                              <span className="text-sm text-gray-600 ml-2">
                                {assignment.startTime} - {assignment.endTime}
                              </span>
                            </div>
                          </td>
                          <td className="py-4 px-4 whitespace-nowrap">
                            <div className={`flex items-center ${isDeadlinePassed ? 'text-red-600' : 'text-gray-700'}`}>
                              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                              </svg>
                              <span className="text-sm">
                                {formatDate(assignment.deadline)}
                              </span>
                            </div>
                          </td>
                          <td className="py-4 px-4 whitespace-nowrap">
                            <div className="text-sm">
                              <div className="flex items-center">
                                <div className="w-16 bg-gray-200 rounded-full h-2.5 mr-2">
                                  <div 
                                    className="bg-blue-600 h-2.5 rounded-full" 
                                    style={{ width: `${totalAssigned > 0 ? (totalSubmitted / totalAssigned) * 100 : 0}%` }}
                                  ></div>
                                </div>
                                <span className="text-gray-700">
                                  {totalSubmitted}/{totalAssigned}
                                </span>
                                {/* Button to toggle submission details */}
                                {totalSubmitted > 0 && (
                                  <button
                                    onClick={() => toggleSubmissionDetails(assignment._id)}
                                    className="ml-2 text-blue-500 hover:text-blue-700"
                                  >
                                    <svg className={`w-5 h-5 transform transition-transform ${showSubmissions[assignment._id] ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                                    </svg>
                                  </button>
                                )}
                              </div>
                              {totalSubmitted > 0 && (
                                <div className="mt-1 flex items-center">
                                  <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-green-100 text-green-800">
                                    {assignment.submissions.filter(s => s.status === 'graded').length} dinilai
                                  </span>
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="py-4 px-4 whitespace-nowrap text-right">
                            <div className="flex justify-end space-x-2">
                              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                                <Link
                                  to={`/assignments/${assignment._id}`}
                                  className="text-blue-600 hover:text-blue-800 p-2 rounded-full hover:bg-blue-50 transition-colors"
                                  data-tooltip-id="view-tooltip"
                                  data-tooltip-content="Lihat detail"
                                >
                                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                                  </svg>
                                </Link>
                              </motion.div>
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => handleDeleteAssignment(assignment._id)}
                                className="text-red-500 hover:text-red-700 p-2 rounded-full hover:bg-red-50 transition-colors"
                                data-tooltip-id="delete-tooltip"
                                data-tooltip-content="Hapus tugas"
                              >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                                </svg>
                              </motion.button>
                            </div>
                          </td>
                        </motion.tr>

                        {/* Submission details section */}
                        {showSubmissions[assignment._id] && assignment.submissions.length > 0 && (
                          <tr>
                            <td colSpan="5" className="py-0">
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                                transition={{ duration: 0.3 }}
                                className="bg-gray-50 p-4 rounded-md"
                              >
                                <h4 className="text-lg font-medium text-gray-900 mb-3">Daftar Submission</h4>
                                <div className="grid grid-cols-1 gap-3">
                                  {assignment.submissions.map(submission => (
                                    <div key={submission._id} className="bg-white p-3 rounded-md shadow-sm flex justify-between items-center">
                                      <div>
                                        <p className="font-medium">{submission.user?.username || 'User'}</p>
                                        <p className="text-sm text-gray-500">
                                          Submitted: {new Date(submission.submittedAt).toLocaleString()}
                                        </p>
                                        <p className="text-sm text-gray-500">
                                          Status: {submission.status === 'graded' ? 
                                            <span className="text-green-600 font-medium">Dinilai ({submission.grade})</span> : 
                                            <span className="text-yellow-600 font-medium">Belum Dinilai</span>
                                          }
                                        </p>
                                      </div>
                                      <div className="space-x-2">
                                        {/* Link to view submission details */}
                                        <Link 
                                          to={`/admin/assignments/${assignment._id}/submissions/${submission._id}`}
                                          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                                        >
                                          Lihat Detail
                                        </Link>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </motion.div>
                            </td>
                          </tr>
                        )}
                      </>
                    );
                  })}
                </tbody>
              </table>
            </motion.div>
          )}
        </motion.div>

        {/* Stats Summary */}
        {!loading && filteredAssignments.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
          >
            <div className="bg-white rounded-xl shadow-md p-6 flex items-center">
              <div className="p-3 rounded-full bg-blue-100 text-blue-600 mr-4">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
                </svg>
              </div>
              <div>
                <div className="text-sm text-gray-500 font-medium">Total Tugas</div>
                <div className="text-2xl font-bold text-gray-900">{filteredAssignments.length}</div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6 flex items-center">
              <div className="p-3 rounded-full bg-green-100 text-green-600 mr-4">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
              <div>
                <div className="text-sm text-gray-500 font-medium">Tugas Selesai</div>
                <div className="text-2xl font-bold text-gray-900">
                  {filteredAssignments.filter(a => 
                    a.submissions.length > 0 && 
                    a.submissions.filter(s => s.status === 'graded').length > 0
                  ).length}
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6 flex items-center">
              <div className="p-3 rounded-full bg-yellow-100 text-yellow-600 mr-4">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
              <div>
                <div className="text-sm text-gray-500 font-medium">Menunggu Penilaian</div>
                <div className="text-2xl font-bold text-gray-900">
                  {filteredAssignments.filter(a => 
                    a.submissions.length > 0 && 
                    a.submissions.filter(s => s.status === 'submitted').length > 0
                  ).length}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </main>

      {/* Tooltips */}
      <Tooltip id="refresh-tooltip" place="top" />
      <Tooltip id="create-tooltip" place="top" />
      <Tooltip id="view-tooltip" place="top" />
      <Tooltip id="delete-tooltip" place="top" />
    </div>
  );
};

export default AdminDashboard;