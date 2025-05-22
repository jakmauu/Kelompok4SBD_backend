import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { assignmentService, userService } from '../services/api';
import { toast } from 'react-toastify';
import Header from '../components/common/Header';

const CreateAssignment = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    subject: '',
    day: 'Senin',
    startTime: '',
    endTime: '',
    deadline: '',
    assignedTo: []
  });

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  // Dapatkan daftar semua user untuk dipilih
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const data = await userService.getAllUsers(currentUser.userId);
        // Filter hanya user role (bukan admin)
        const filteredUsers = data.filter(user => user.role === 'user');
        setUsers(filteredUsers);
      } catch (error) {
        toast.error('Gagal memuat daftar user');
        console.error('Error fetching users:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [currentUser]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleCheckboxChange = (userId) => {
    const updatedAssignedTo = [...formData.assignedTo];
    
    if (updatedAssignedTo.includes(userId)) {
      // Jika user sudah dipilih, hapus dari daftar
      setFormData({
        ...formData,
        assignedTo: updatedAssignedTo.filter(id => id !== userId)
      });
    } else {
      // Jika user belum dipilih, tambahkan ke daftar
      setFormData({
        ...formData,
        assignedTo: [...updatedAssignedTo, userId]
      });
    }
  };

  const handleSelectAllUsers = () => {
    if (formData.assignedTo.length === users.length) {
      // Jika semua user sudah dipilih, hapus semua
      setFormData({
        ...formData,
        assignedTo: []
      });
    } else {
      // Jika belum semua dipilih, pilih semua
      setFormData({
        ...formData,
        assignedTo: users.map(user => user._id)
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validasi form
    if (!formData.title.trim()) {
      toast.error('Judul tugas tidak boleh kosong');
      return;
    }
    
    if (!formData.description.trim()) {
      toast.error('Deskripsi tugas tidak boleh kosong');
      return;
    }
    
    if (!formData.subject.trim()) {
      toast.error('Mata kuliah tidak boleh kosong');
      return;
    }
    
    if (!formData.startTime || !formData.endTime) {
      toast.error('Waktu mulai dan selesai harus diisi');
      return;
    }
    
    if (formData.startTime >= formData.endTime) {
      toast.error('Waktu selesai harus lebih besar dari waktu mulai');
      return;
    }
    
    if (!formData.deadline) {
      toast.error('Deadline harus diisi');
      return;
    }
    
    const deadlineDate = new Date(formData.deadline);
    if (deadlineDate < new Date()) {
      toast.error('Deadline tidak boleh di masa lalu');
      return;
    }
    
    if (formData.assignedTo.length === 0) {
      toast.error('Pilih minimal satu user untuk ditugaskan');
      return;
    }
    
    try {
      setSubmitLoading(true);
      
      // Format data untuk API
      const assignmentData = {
        ...formData,
        userId: currentUser.userId // admin ID
      };
      
      await assignmentService.createAssignment(assignmentData);
      toast.success('Tugas berhasil dibuat');
      navigate('/admin');
    } catch (error) {
      toast.error(error.message || 'Gagal membuat tugas');
      console.error('Error creating assignment:', error);
    } finally {
      setSubmitLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Buat Tugas Baru</h1>
          <p className="text-gray-600">Isi formulir berikut untuk membuat tugas baru</p>
        </div>
        
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <form onSubmit={handleSubmit} className="p-6">
            <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
              {/* Judul tugas */}
              <div className="sm:col-span-4">
                <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                  Judul Tugas *
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    name="title"
                    id="title"
                    required
                    value={formData.title}
                    onChange={handleChange}
                    className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    placeholder="Masukkan judul tugas"
                  />
                </div>
              </div>
              
              {/* Mata kuliah */}
              <div className="sm:col-span-2">
                <label htmlFor="subject" className="block text-sm font-medium text-gray-700">
                  Mata Kuliah *
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    name="subject"
                    id="subject"
                    required
                    value={formData.subject}
                    onChange={handleChange}
                    className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    placeholder="Nama mata kuliah"
                  />
                </div>
              </div>

              {/* Deskripsi tugas */}
              <div className="sm:col-span-6">
                <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                  Deskripsi Tugas *
                </label>
                <div className="mt-1">
                  <textarea
                    id="description"
                    name="description"
                    rows={4}
                    required
                    value={formData.description}
                    onChange={handleChange}
                    className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    placeholder="Tulis deskripsi lengkap tugas di sini"
                  />
                </div>
              </div>

              {/* Jadwal: Hari */}
              <div className="sm:col-span-2">
                <label htmlFor="day" className="block text-sm font-medium text-gray-700">
                  Hari *
                </label>
                <div className="mt-1">
                  <select
                    id="day"
                    name="day"
                    required
                    value={formData.day}
                    onChange={handleChange}
                    className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  >
                    <option value="Senin">Senin</option>
                    <option value="Selasa">Selasa</option>
                    <option value="Rabu">Rabu</option>
                    <option value="Kamis">Kamis</option>
                    <option value="Jumat">Jumat</option>
                    <option value="Sabtu">Sabtu</option>
                    <option value="Minggu">Minggu</option>
                  </select>
                </div>
              </div>
              
              {/* Jadwal: Jam mulai */}
              <div className="sm:col-span-2">
                <label htmlFor="startTime" className="block text-sm font-medium text-gray-700">
                  Jam Mulai *
                </label>
                <div className="mt-1">
                  <input
                    type="time"
                    name="startTime"
                    id="startTime"
                    required
                    value={formData.startTime}
                    onChange={handleChange}
                    className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  />
                </div>
              </div>
              
              {/* Jadwal: Jam selesai */}
              <div className="sm:col-span-2">
                <label htmlFor="endTime" className="block text-sm font-medium text-gray-700">
                  Jam Selesai *
                </label>
                <div className="mt-1">
                  <input
                    type="time"
                    name="endTime"
                    id="endTime"
                    required
                    value={formData.endTime}
                    onChange={handleChange}
                    className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  />
                </div>
              </div>
              
              {/* Deadline */}
              <div className="sm:col-span-3">
                <label htmlFor="deadline" className="block text-sm font-medium text-gray-700">
                  Deadline *
                </label>
                <div className="mt-1">
                  <input
                    type="datetime-local"
                    name="deadline"
                    id="deadline"
                    required
                    value={formData.deadline}
                    onChange={handleChange}
                    className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  />
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  Tanggal dan waktu batas pengumpulan tugas
                </p>
              </div>
            </div>

            {/* Pilih user yang ditugaskan */}
            <div className="mt-6">
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  Ditugaskan Kepada *
                </label>
                <button
                  type="button"
                  onClick={handleSelectAllUsers}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  {formData.assignedTo.length === users.length ? "Batalkan Semua" : "Pilih Semua"}
                </button>
              </div>

              {loading ? (
                <div className="flex justify-center py-4">
                  <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : users.length === 0 ? (
                <p className="text-gray-500 py-2">Tidak ada user yang tersedia</p>
              ) : (
                <div className="mt-1 border border-gray-300 rounded-md p-2 max-h-60 overflow-y-auto">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                    {users.map((user) => (
                      <div key={user._id} className="relative flex items-start p-2 hover:bg-gray-50 rounded">
                        <div className="flex items-center h-5">
                          <input
                            id={`user-${user._id}`}
                            type="checkbox"
                            className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                            checked={formData.assignedTo.includes(user._id)}
                            onChange={() => handleCheckboxChange(user._id)}
                          />
                        </div>
                        <div className="ml-3 text-sm">
                          <label htmlFor={`user-${user._id}`} className="font-medium text-gray-700">
                            {user.username}
                          </label>
                          <p className="text-gray-500">{user.email}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {users.length > 0 && (
                <p className="mt-1 text-xs text-gray-500">
                  {formData.assignedTo.length} dari {users.length} user dipilih
                </p>
              )}
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => navigate('/admin')}
                className="py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={submitLoading}
                className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-400"
              >
                {submitLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Membuat...
                  </>
                ) : "Buat Tugas"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateAssignment;