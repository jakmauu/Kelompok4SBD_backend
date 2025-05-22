import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const AdminRoute = ({ children }) => {
  const { currentUser, isAdmin, loading } = useAuth();
  const location = useLocation();

  // Jika masih loading, tampilkan loading screen
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-700">Memuat...</p>
        </div>
      </div>
    );
  }

  // Jika tidak ada user yang login, redirect ke halaman login
  if (!currentUser) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Jika user bukan admin, redirect ke dashboard user
  if (!isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  // Jika user adalah admin, tampilkan component children
  return children;
};

export default AdminRoute;