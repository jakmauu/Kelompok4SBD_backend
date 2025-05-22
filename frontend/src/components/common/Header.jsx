import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { motion } from 'framer-motion';
import logo from '../../assets/logo.png'; // Import logo dari assets

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { currentUser, logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <header className="bg-gradient-to-r from-emerald-600 to-green-700 shadow-md">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <motion.div 
                whileHover={{ scale: 1.05 }}
                className="flex items-center"
              >
                <Link to={isAdmin ? '/admin' : '/dashboard'} className="flex items-center">
                  <div className="h-12 w-12 bg-white rounded-lg shadow-sm flex items-center justify-center mr-3">
                    <img src={logo} alt="Assignment Tracker Logo" className="h-8 w-8" />
                  </div>
                  <span className="text-white font-bold text-2xl">Assignment Tracker</span>
                </Link>
              </motion.div>
            </div>
            
            <div className="hidden sm:ml-6 sm:flex sm:space-x-4 items-center">
              {/* Navigation links - desktop */}
              {isAdmin ? (
                <>
                  <Link to="/admin" className="text-white hover:text-green-100 px-4 py-3 rounded-md text-xl font-medium">
                    Dashboard
                  </Link>
                  <Link to="/assignments/create" className="text-white hover:text-green-100 px-4 py-3 rounded-md text-xl font-medium">
                    Buat Tugas
                  </Link>
                  <Link to="/users" className="text-white hover:text-green-100 px-4 py-3 rounded-md text-xl font-medium">
                    Daftar User
                  </Link>
                </>
              ) : (
                <>
                  <Link to="/dashboard" className="text-white hover:text-green-100 px-4 py-3 rounded-md text-xl font-medium">
                    Dashboard
                  </Link>
                  <Link to="/submissions" className="text-white hover:text-green-100 px-4 py-3 rounded-md text-xl font-medium">
                    Submission
                  </Link>
                </>
              )}
            </div>
          </div>
          
          <div className="hidden sm:ml-6 sm:flex sm:items-center">
            {/* User dropdown - desktop */}
            <div className="ml-3 relative">
              <div>
                <button
                  type="button"
                  onClick={() => setIsOpen(!isOpen)}
                  className="bg-white p-1 rounded-full text-emerald-600 hover:text-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
                >
                  <span className="sr-only">Open user menu</span>
                  <div className="h-8 w-8 rounded-full bg-emerald-100 flex items-center justify-center">
                    <span className="font-medium text-emerald-700">
                      {currentUser?.username?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                </button>
              </div>
              
              {isOpen && (
                <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-lg shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
                  <div className="px-4 py-2 border-b border-gray-100">
                    <p className="text-sm font-medium text-gray-700">{currentUser?.username}</p>
                    <p className="text-xs text-gray-500 truncate">{currentUser?.email}</p>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Keluar
                  </button>
                </div>
              )}
            </div>
          </div>
          
          <div className="-mr-2 flex items-center sm:hidden">
            {/* Mobile menu button */}
            <button
              type="button"
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-white hover:text-green-100 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
              aria-expanded="false"
            >
              <span className="sr-only">Open main menu</span>
              {!isOpen ? (
                <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              ) : (
                <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile menu, show/hide based on menu state */}
      {isOpen && (
        <div className="sm:hidden">
          <div className="pt-2 pb-3 space-y-1">
            {isAdmin ? (
              <>
                <Link to="/admin" className="block px-3 py-2 text-base font-medium text-white hover:bg-emerald-700">
                  Dashboard
                </Link>
                <Link to="/assignments/create" className="block px-3 py-2 text-base font-medium text-white hover:bg-emerald-700">
                  Buat Tugas
                </Link>
                <Link to="/users" className="block px-3 py-2 text-base font-medium text-white hover:bg-emerald-700">
                  Daftar User
                </Link>
              </>
            ) : (
              <>
                <Link to="/dashboard" className="block px-3 py-2 text-base font-medium text-white hover:bg-emerald-700">
                  Dashboard
                </Link>
                <Link to="/submissions" className="block px-3 py-2 text-base font-medium text-white hover:bg-emerald-700">
                  Submission
                </Link>
              </>
            )}
          </div>
          
          <div className="pt-4 pb-3 border-t border-emerald-700">
            <div className="flex items-center px-4">
              <div className="flex-shrink-0">
                <div className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center">
                  <span className="font-medium text-emerald-700">
                    {currentUser?.username?.charAt(0).toUpperCase()}
                  </span>
                </div>
              </div>
              <div className="ml-3">
                <div className="text-base font-medium text-white">{currentUser?.username}</div>
                <div className="text-sm font-medium text-green-100">{currentUser?.email}</div>
              </div>
            </div>
            <div className="mt-3 space-y-1">
              <button
                onClick={handleLogout}
                className="block w-full text-left px-3 py-2 text-base font-medium text-white hover:bg-emerald-700"
              >
                Keluar
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;