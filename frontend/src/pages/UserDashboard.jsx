import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { assignmentService } from '../services/api';
import { toast } from 'react-toastify';
import Header from '../components/common/Header';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

const UserDashboard = () => {
  const [assignments, setAssignments] = useState([]);
  const [deadlineAssignments, setDeadlineAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const { currentUser } = useAuth();

  useEffect(() => {
    const fetchAssignments = async () => {
      try {
        setLoading(true);
        // Ambil semua tugas user
        const allAssignments = await assignmentService.getAssignments(
          currentUser.userId,
          false
        );
        setAssignments(allAssignments);

        // Ambil tugas dengan deadline mendekat
        const upcomingDeadlines = await assignmentService.getDeadlineAssignments(
          currentUser.userId
        );
        setDeadlineAssignments(upcomingDeadlines);
      } catch (error) {
        toast.error('Gagal memuat tugas. Silakan coba lagi.');
        console.error('Error fetching assignments:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAssignments();
  }, [currentUser]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return format(date, "dd MMMM yyyy 'pukul' HH:mm", { locale: id });
  };

  // Filter tugas berdasarkan hari aktif
  const getDayAssignments = (day) => {
    return assignments.filter(assignment => assignment.day === day);
  };

  // Fungsi renderAssignmentCard dengan font lebih besar
  const renderAssignmentCard = (assignment) => {
    // Cek apakah user telah submit tugas ini
    const hasSubmitted = assignment.submissions?.some(
      sub => sub.user === currentUser.userId
    );
    
    // Cek apakah deadline sudah lewat
    const isDeadlinePassed = new Date() > new Date(assignment.deadline);
    
    // Status card
    let statusColor = "bg-emerald-100 text-emerald-800"; // Diubah dari blue ke emerald (hijau)
    let statusText = "Belum dikerjakan";
    
    if (hasSubmitted) {
      statusColor = "bg-green-100 text-green-800";
      statusText = "Sudah dikumpulkan";
    } else if (isDeadlinePassed) {
      statusColor = "bg-red-100 text-red-800";
      statusText = "Deadline terlewat";
    }
    
    return (
      <div 
        key={assignment._id} 
        className="bg-white rounded-xl shadow-md p-6 transition-all hover:shadow-lg hover:translate-y-[-4px]"
      >
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-xl font-semibold text-gray-800">{assignment.title}</h3>
          <span className={`px-3 py-1.5 rounded-full text-sm font-medium ${statusColor}`}>
            {statusText}
          </span>
        </div>

        <p className="text-base text-gray-600 mb-5">{assignment.description}</p>
        
        <div className="space-y-3 text-base text-gray-500 mb-5">
          <div className="flex items-center">
            <svg className="w-5 h-5 mr-2 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
            </svg>
            <span>Hari: {assignment.day}</span>
          </div>
          <div className="flex items-center">
            <svg className="w-5 h-5 mr-2 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <span>Jam: {assignment.startTime} - {assignment.endTime}</span>
          </div>
          <div className="flex items-center">
            <svg className="w-5 h-5 mr-2 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <span>Deadline: {formatDate(assignment.deadline)}</span>
          </div>
          <div className="flex items-center">
            <svg className="w-5 h-5 mr-2 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
            </svg>
            <span>Mata kuliah: {assignment.subject}</span>
          </div>
        </div>
        
        <Link 
          to={`/assignments/${assignment._id}`} 
          className="block text-center w-full py-3 px-4 bg-gradient-to-r from-emerald-500 to-green-600 text-white rounded-md hover:from-emerald-600 hover:to-green-700 transition-colors text-base font-medium"
        >
          {hasSubmitted ? "Lihat Submission" : "Kerjakan Tugas"}
        </Link>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex flex-col">
      <Header />
      
      <main className="flex-grow w-full px-4 py-6 sm:px-6 lg:px-8">
        <div className="w-full">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-3">Selamat datang, {currentUser.username}!</h1>
            <p className="text-xl text-gray-600">Berikut adalah daftar tugas yang ditugaskan kepada Anda.</p>
          </div>

          {/* Tab selector - MODIFIKASI DI SINI */}
          <div className="border-b border-gray-200 mb-6">
            {/* Gunakan class full-width-tabs untuk membuat tab rata penuh */}
            <nav className="full-width-tabs -mb-px flex">
              <button
                onClick={() => setActiveTab('all')}
                className={`${
                  activeTab === 'all'
                    ? 'border-emerald-500 text-emerald-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-3 border-b-2 font-medium text-lg`}
              >
                Semua Tugas
              </button>
              <button
                onClick={() => setActiveTab('deadline')}
                className={`${
                  activeTab === 'deadline'
                    ? 'border-emerald-500 text-emerald-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-3 border-b-2 font-medium text-lg`}
              >
                Deadline
              </button>
              {/* Tampilkan semua tab hari dengan font lebih proporsional */}
              {['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'].map((day) => (
                <button
                  key={day}
                  onClick={() => setActiveTab(day)}
                  className={`${
                    activeTab === day
                      ? 'border-emerald-500 text-emerald-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  } whitespace-nowrap py-4 px-2 border-b-2 font-medium text-lg`}
                >
                  {day}
                </button>
              ))}
            </nav>
          </div>

          {/* Loading state dengan ukuran lebih proporsional */}
          {loading && (
            <div className="text-center py-16">
              <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p className="mt-4 text-xl text-gray-600">Memuat tugas...</p>
            </div>
          )}

          {/* Empty state dengan ukuran lebih proporsional */}
          {!loading && 
            ((activeTab === 'all' && assignments.length === 0) || 
            (activeTab === 'deadline' && deadlineAssignments.length === 0) ||
            (activeTab !== 'all' && activeTab !== 'deadline' && getDayAssignments(activeTab).length === 0)) && (
            <div className="text-center py-16 bg-white rounded-xl shadow-md">
              <svg className="w-24 h-24 mx-auto text-emerald-300 mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
              </svg>
              <p className="mt-3 text-2xl font-medium text-gray-900">Belum ada tugas</p>
              <p className="mt-2 text-xl text-gray-500">
                {activeTab === 'all' 
                  ? "Anda belum memiliki tugas yang ditugaskan." 
                  : activeTab === 'deadline'
                    ? "Tidak ada tugas dengan deadline mendekat."
                    : `Anda tidak memiliki tugas untuk hari ${activeTab}.`
                }
              </p>
            </div>
          )}

          {/* Assignment grid - ukuran yang lebih proporsional */}
          {!loading && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Show assignments based on active tab */}
              {activeTab === 'all' && assignments.map(renderAssignmentCard)}
              {activeTab === 'deadline' && deadlineAssignments.map(renderAssignmentCard)}
              {activeTab !== 'all' && activeTab !== 'deadline' && getDayAssignments(activeTab).map(renderAssignmentCard)}
            </div>
          )}
        </div>
      </main>
      
      {/* Footer */}
      <footer className="bg-white py-4 text-center text-sm text-gray-500 border-t border-gray-200">
        <p>© {new Date().getFullYear()} Assignment Tracker. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default UserDashboard;