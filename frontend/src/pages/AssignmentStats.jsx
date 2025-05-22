import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { assignmentService } from '../services/api';
import { toast } from 'react-toastify';
import Header from '../components/common/Header';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { Bar, Pie } from 'react-chartjs-2';
import { Chart, registerables } from 'chart.js';
import { Link } from 'react-router-dom';

// Register ChartJS components
Chart.register(...registerables);

const AssignmentStats = () => {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const { currentUser } = useAuth();
  
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
        toast.error('Gagal memuat data statistik');
        console.error('Error fetching assignments for stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAssignments();
  }, [currentUser]);

  // Format tanggal
  const formatDate = (dateString) => {
    if (!dateString) return "Tanggal tidak tersedia";
    
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return "Format tanggal tidak valid";
      }
      return format(date, "dd MMM yyyy", { locale: id });
    } catch (error) {
      return "Error format tanggal";
    }
  };

  // Data untuk Bar Chart - tingkat pengumpulan per tugas
  const submissionRateData = {
    labels: assignments.map(a => a.title.length > 20 ? a.title.substring(0, 20) + '...' : a.title),
    datasets: [
      {
        label: 'Sudah Mengumpulkan',
        data: assignments.map(a => a.submissions.length),
        backgroundColor: 'rgba(16, 185, 129, 0.7)',
        borderColor: 'rgba(16, 185, 129, 1)',
        borderWidth: 1,
      },
      {
        label: 'Belum Mengumpulkan',
        data: assignments.map(a => a.assignedTo.length - a.submissions.length),
        backgroundColor: 'rgba(239, 68, 68, 0.7)',
        borderColor: 'rgba(239, 68, 68, 1)',
        borderWidth: 1,
      }
    ]
  };

  // Data untuk Pie Chart - proporsi status pengumpulan
  const totalAssigned = assignments.reduce((sum, a) => sum + a.assignedTo.length, 0);
  const totalSubmitted = assignments.reduce((sum, a) => sum + a.submissions.length, 0);
  const totalGraded = assignments.reduce((sum, a) => 
    sum + a.submissions.filter(s => s.status === 'graded').length, 0);
  
  const submissionStatusData = {
    labels: ['Sudah Dinilai', 'Sudah Dikumpulkan (Belum Dinilai)', 'Belum Dikumpulkan'],
    datasets: [
      {
        data: [
          totalGraded, 
          totalSubmitted - totalGraded, 
          totalAssigned - totalSubmitted
        ],
        backgroundColor: [
          'rgba(16, 185, 129, 0.7)',  // hijau
          'rgba(245, 158, 11, 0.7)',  // kuning
          'rgba(239, 68, 68, 0.7)',   // merah
        ],
        borderColor: [
          'rgba(16, 185, 129, 1)',
          'rgba(245, 158, 11, 1)',
          'rgba(239, 68, 68, 1)',
        ],
        borderWidth: 1,
      }
    ]
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex flex-col">
      <Header />
      
      <main className="flex-grow w-full px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-6">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-gray-900">Statistik Pengumpulan Tugas</h1>
            <Link 
              to="/admin"
              className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors"
            >
              Kembali ke Dashboard
            </Link>
          </div>
          <p className="text-xl text-gray-600 mt-2">Monitoring status pengumpulan tugas mahasiswa</p>
        </div>

        {loading ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="mt-4 text-xl text-gray-600">Memuat data statistik...</p>
          </div>
        ) : (
          <>
            {/* Summary Card */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white p-6 rounded-xl shadow-md">
                <h3 className="text-lg font-medium text-gray-700 mb-2">Total Ditugaskan</h3>
                <p className="text-4xl font-bold text-emerald-600">{totalAssigned}</p>
                <p className="text-sm text-gray-500 mt-1">Jumlah total penugasan kepada mahasiswa</p>
              </div>
              
              <div className="bg-white p-6 rounded-xl shadow-md">
                <h3 className="text-lg font-medium text-gray-700 mb-2">Sudah Dikumpulkan</h3>
                <p className="text-4xl font-bold text-emerald-600">{totalSubmitted}</p>
                <p className="text-sm text-gray-500 mt-1">
                  {Math.round((totalSubmitted / totalAssigned) * 100)}% dari total penugasan
                </p>
              </div>
              
              <div className="bg-white p-6 rounded-xl shadow-md">
                <h3 className="text-lg font-medium text-gray-700 mb-2">Sudah Dinilai</h3>
                <p className="text-4xl font-bold text-emerald-600">{totalGraded}</p>
                <p className="text-sm text-gray-500 mt-1">
                  {Math.round((totalGraded / totalSubmitted) * 100)}% dari total submission
                </p>
              </div>
            </div>
            
            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              <div className="bg-white p-6 rounded-xl shadow-md">
                <h3 className="text-xl font-medium text-gray-800 mb-6">Tingkat Pengumpulan Per Tugas</h3>
                <div className="h-80">
                  <Bar 
                    data={submissionRateData} 
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      scales: {
                        x: {
                          stacked: true,
                        },
                        y: {
                          stacked: true,
                          beginAtZero: true
                        }
                      }
                    }}
                  />
                </div>
              </div>
              
              <div className="bg-white p-6 rounded-xl shadow-md">
                <h3 className="text-xl font-medium text-gray-800 mb-6">Status Pengumpulan Tugas</h3>
                <div className="h-80">
                  <Pie 
                    data={submissionStatusData}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          position: 'bottom'
                        }
                      }
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Detailed Table */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              <h3 className="text-xl font-medium text-gray-800 p-6 border-b border-gray-200">
                Detail Pengumpulan Per Tugas
              </h3>
              
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Tugas
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Mata Kuliah
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Deadline
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Sudah Mengumpulkan
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Belum Mengumpulkan
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Tingkat Pengumpulan
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {assignments.map((assignment) => {
                      const totalAssigned = assignment.assignedTo.length;
                      const totalSubmitted = assignment.submissions.length;
                      const percentage = totalAssigned > 0 ? Math.round((totalSubmitted / totalAssigned) * 100) : 0;
                      
                      return (
                        <tr key={assignment._id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Link to={`/assignments/${assignment._id}`} className="text-emerald-600 hover:text-emerald-800 font-medium">
                              {assignment.title}
                            </Link>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                            {assignment.subject}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                            {formatDate(assignment.deadline)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-gray-900 font-medium">
                            {totalSubmitted}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-gray-900 font-medium">
                            {totalAssigned - totalSubmitted}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="w-full bg-gray-200 rounded-full h-2.5 mr-2 max-w-xs">
                                <div 
                                  className={`h-2.5 rounded-full ${
                                    percentage >= 75 ? 'bg-emerald-500' :
                                    percentage >= 50 ? 'bg-yellow-500' :
                                    percentage >= 25 ? 'bg-orange-500' : 'bg-red-500'
                                  }`}
                                  style={{ width: `${percentage}%` }}
                                ></div>
                              </div>
                              <span>{percentage}%</span>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </main>
      
      <footer className="bg-white py-4 text-center text-sm text-gray-500 border-t border-gray-200">
        <p>© {new Date().getFullYear()} Assignment Tracker. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default AssignmentStats;