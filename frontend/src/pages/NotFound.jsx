import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const NotFound = () => {
  const { currentUser, isAdmin } = useAuth();
  
  const redirectPath = currentUser 
    ? (isAdmin ? '/admin' : '/dashboard')
    : '/login';

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 text-center">
        <div>
          <h2 className="mt-6 text-9xl font-extrabold text-blue-500">404</h2>
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            Halaman Tidak Ditemukan
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Maaf, halaman yang Anda cari tidak ditemukan atau telah dipindahkan.
          </p>
        </div>
        <div className="mt-8">
          <Link
            to={redirectPath}
            className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            {currentUser 
              ? 'Kembali ke Dashboard' 
              : 'Kembali ke Halaman Login'}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;