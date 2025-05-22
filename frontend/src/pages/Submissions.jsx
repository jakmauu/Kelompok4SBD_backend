import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { assignmentService } from '../services/api';
import { toast } from 'react-toastify';
import Header from '../components/common/Header';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

const Submissions = () => {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'submitted', 'graded'
  const { currentUser } = useAuth();

  useEffect(() => {
    const fetchSubmissions = async () => {
      try {
        setLoading(true);
        // Ambil semua tugas user
        const assignments = await assignmentService.getAssignments(
          currentUser.userId,
          false
        );
        
        // Filter tugas yang sudah disubmit oleh user
        const userSubmissions = assignments.filter(assignment => 
          assignment.submissions?.some(sub => 
            sub.user === currentUser.userId || 
            (typeof sub.user === 'object' && sub.user._id === currentUser.userId)
          )
        );
        
        setSubmissions(userSubmissions);
      } catch (error) {
        toast.error('Gagal memuat submission tugas');
        console.error('Error fetching submissions:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSubmissions();
  }, [currentUser]);

  // Format tanggal
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return format(date, "dd MMMM yyyy 'pukul' HH:mm", { locale: id });
  };

  // Filter submissions berdasarkan status
  const getFilteredSubmissions = () => {
    if (activeTab === 'all') {
      return submissions;
    } else if (activeTab === 'submitted') {
      return submissions.filter(assignment => {
        const userSubmission = assignment.submissions?.find(sub => 
          sub.user === currentUser.userId || 
          (typeof sub.user === 'object' && sub.user._id === currentUser.userId)
        );
        return userSubmission && userSubmission.status === 'submitted';
      });
    } else if (activeTab === 'graded') {
      return submissions.filter(assignment => {
        const userSubmission = assignment.submissions?.find(sub => 
          sub.user === currentUser.userId || 
          (typeof sub.user === 'object' && sub.user._id === currentUser.userId)
        );
        return userSubmission && userSubmission.status === 'graded';
      });
    }
    return submissions;
  };

  const filteredSubmissions = getFilteredSubmissions();

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex flex-col">
      <Header />
      
      <main className="flex-grow w-full px-4 py-6 sm:px-6 lg:px-8">
        <div className="w-full">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-3">Tugas Saya</h1>
            <p className="text-xl text-gray-600">Daftar semua tugas yang telah Anda kumpulkan</p>
          </div>

          {/* Tab selector - menggunakan css full-width-tabs dan warna emerald */}
          <div className="border-b border-gray-200 mb-6">
            <nav className="full-width-tabs -mb-px flex">
              <button
                onClick={() => setActiveTab('all')}
                className={`${
                  activeTab === 'all'
                    ? 'border-emerald-500 text-emerald-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-3 border-b-2 font-medium text-lg flex-1`}
              >
                Semua
              </button>
              <button
                onClick={() => setActiveTab('submitted')}
                className={`${
                  activeTab === 'submitted'
                    ? 'border-emerald-500 text-emerald-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-3 border-b-2 font-medium text-lg flex-1`}
              >
                Belum Dinilai
              </button>
              <button
                onClick={() => setActiveTab('graded')}
                className={`${
                  activeTab === 'graded'
                    ? 'border-emerald-500 text-emerald-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-3 border-b-2 font-medium text-lg flex-1`}
              >
                Sudah Dinilai
              </button>
            </nav>
          </div>

          {/* Loading state */}
          {loading && (
            <div className="text-center py-16">
              <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p className="mt-4 text-xl text-gray-600">Memuat daftar tugas...</p>
            </div>
          )}

          {/* Empty state */}
          {!loading && filteredSubmissions.length === 0 && (
            <div className="text-center py-16 bg-white rounded-xl shadow-md">
              <svg className="w-24 h-24 mx-auto text-emerald-300 mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
              </svg>
              <p className="mt-3 text-2xl font-medium text-gray-900">Belum ada submission</p>
              <p className="mt-2 text-xl text-gray-500">
                {activeTab === 'all' 
                  ? "Anda belum mengumpulkan tugas apapun." 
                  : activeTab === 'submitted'
                    ? "Anda tidak memiliki tugas yang belum dinilai."
                    : "Anda tidak memiliki tugas yang sudah dinilai."
                }
              </p>
            </div>
          )}

          {/* Submissions list */}
          {!loading && filteredSubmissions.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredSubmissions.map((assignment) => {
                const userSubmission = assignment.submissions?.find(sub => 
                  sub.user === currentUser.userId || 
                  (typeof sub.user === 'object' && sub.user._id === currentUser.userId)
                );
                
                return (
                  <div key={assignment._id} className="bg-white rounded-xl shadow-md overflow-hidden">
                    <div className="p-6">
                      <div className="flex justify-between items-start mb-3">
                        <h3 className="text-xl font-semibold text-gray-900">{assignment.title}</h3>
                        <span className={`px-3 py-1.5 rounded-full text-xs font-medium ${
                          userSubmission?.status === 'graded' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {userSubmission?.status === 'graded' ? 'Sudah dinilai' : 'Belum dinilai'}
                        </span>
                      </div>
                      
                      <p className="text-base text-gray-600 mb-3">{assignment.subject}</p>
                      
                      <div className="space-y-2 text-sm text-gray-500 mb-4">
                        <div>Dikumpulkan pada: {formatDate(userSubmission?.submittedAt)}</div>
                        <div>Deadline: {formatDate(assignment.deadline)}</div>
                      </div>
                      
                      {userSubmission?.status === 'graded' && (
                        <div className="mt-3 p-3 bg-green-50 rounded-md border border-green-100">
                          <div className="flex items-center mb-2">
                            <div className="text-xl font-bold text-green-600 bg-green-100 h-10 w-10 flex items-center justify-center rounded-full mr-2">
                              {userSubmission.grade}
                            </div>
                            <p className="text-sm text-gray-600">dari 100</p>
                          </div>
                          {userSubmission.feedback && (
                            <div className="mt-2">
                              <p className="text-xs text-gray-500">Feedback:</p>
                              <p className="text-sm text-gray-700">{userSubmission.feedback}</p>
                            </div>
                          )}
                        </div>
                      )}
                      
                      <div className="mt-4">
                        <Link 
                          to={`/assignments/${assignment._id}`} 
                          className="block text-center w-full py-3 px-4 bg-gradient-to-r from-emerald-500 to-green-600 text-white rounded-md hover:from-emerald-600 hover:to-green-700 transition-colors text-sm font-medium"
                        >
                          Lihat Detail
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
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

export default Submissions;