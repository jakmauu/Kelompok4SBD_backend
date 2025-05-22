import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { useAuth } from '../context/AuthContext';
import Header from '../components/common/Header';

const SubmissionDetails = () => {
  const [submissionDetails, setSubmissionDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { assignmentId, submissionId } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  
  useEffect(() => {
    // Cek jika user bukan admin, redirect ke halaman lain
    if (currentUser?.role !== 'admin') {
      navigate('/dashboard');
      return;
    }
    
    const fetchSubmissionDetails = async () => {
      try {
        setLoading(true);
        // Gunakan base URL dari environment variable
        const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
        const response = await axios.get(
          `${baseURL}/api/assignments/${assignmentId}/submissions/${submissionId}`, 
          { params: { adminId: currentUser?.userId } }
        );
        setSubmissionDetails(response.data);
      } catch (error) {
        console.error('Error fetching submission details:', error);
        setError('Gagal mengambil detail submission');
      } finally {
        setLoading(false);
      }
    };
    
    fetchSubmissionDetails();
  }, [assignmentId, submissionId, currentUser, navigate]);
  
  if (loading) return <div className="text-center py-10">Loading...</div>;
  if (error) return <div className="text-red-500 text-center py-10">{error}</div>;
  if (!submissionDetails) return <div className="text-center py-10">Tidak ada data submission</div>;
  
  const { submission, assignmentTitle, assignmentDescription, deadline } = submissionDetails;
  
  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">Detail Pengumpulan Tugas</h2>
      
      <div className="mb-6">
        <h3 className="text-xl font-semibold">Informasi Tugas</h3>
        <div className="mt-2 p-4 bg-gray-50 rounded-md">
          <p className="font-medium">Judul: {assignmentTitle}</p>
          <p className="mt-1">Deskripsi: {assignmentDescription}</p>
          <p className="mt-1">Deadline: {format(new Date(deadline), 'dd MMMM yyyy, HH:mm', { locale: id })}</p>
        </div>
      </div>
      
      <div className="mb-6">
        <h3 className="text-xl font-semibold">Informasi Pengumpul</h3>
        <div className="mt-2 p-4 bg-gray-50 rounded-md">
          <p className="font-medium">Nama: {submission.user.username}</p>
          <p className="mt-1">Email: {submission.user.email}</p>
          <p className="mt-1">Waktu Pengumpulan: {format(new Date(submission.submittedAt), 'dd MMMM yyyy, HH:mm', { locale: id })}</p>
          {submission.grade && <p className="mt-1">Nilai: {submission.grade}</p>}
          {submission.feedback && <p className="mt-1">Feedback: {submission.feedback}</p>}
        </div>
      </div>
      
      <div className="mb-6">
        <h3 className="text-xl font-semibold">Konten</h3>
        <div className="mt-2 p-4 bg-gray-50 rounded-md">
          <p>{submission.content || '(Tidak ada konten teks)'}</p>
        </div>
      </div>
      
      {submission.attachments && submission.attachments.length > 0 && (
        <div className="mb-6">
          <h3 className="text-xl font-semibold">File Terlampir</h3>
          <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {submission.attachments.map((file, index) => (
              <div key={index} className="p-4 border rounded-md flex items-center justify-between">
                <div>
                  <p className="font-medium">File {index + 1}</p>
                  <p className="text-sm text-gray-500">{file.format || 'Document'}</p>
                </div>
                <div>
                  <a 
                    href={file.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
                  >
                    Lihat File
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {submission.images && submission.images.length > 0 && (
        <div className="mb-6">
          <h3 className="text-xl font-semibold">Gambar Terlampir</h3>
          <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {submission.images.map((image, index) => (
              <div key={index} className="border rounded-md overflow-hidden">
                <img 
                  src={image.url} 
                  alt={`Image ${index + 1}`} 
                  className="w-full h-48 object-cover"
                />
                <div className="p-2 bg-gray-50 text-center">
                  <a 
                    href={image.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:underline"
                  >
                    Lihat Full Size
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      <div className="mt-8">
        <button
          onClick={() => navigate(-1)}
          className="px-6 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition"
        >
          Kembali
        </button>
      </div>
    </div>
  );
};

export default SubmissionDetails;