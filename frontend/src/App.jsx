import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AuthProvider } from './context/AuthContext';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import UserDashboard from './pages/UserDashboard';
import AdminDashboard from './pages/AdminDashboard';
import CreateAssignment from './pages/CreateAssignment';
import AssignmentDetails from './pages/AssignmentDetails';
import UserList from './pages/UserList';
import Submissions from './pages/Submissions';
import NotFound from './pages/NotFound';
import AssignmentStats from './pages/AssignmentStats';
import SubmissionDetails from './pages/SubmissionDetails'; // Import halaman SubmissionDetails

// Components
import PrivateRoute from './components/common/PrivateRoute';
import AdminRoute from './components/common/AdminRoute';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen w-full">
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Protected routes - User */}
            <Route 
              path="/dashboard" 
              element={
                <PrivateRoute>
                  <UserDashboard />
                </PrivateRoute>
              } 
            />
            <Route 
              path="/assignments/:id" 
              element={
                <PrivateRoute>
                  <AssignmentDetails />
                </PrivateRoute>
              } 
            />
            <Route 
              path="/submissions" 
              element={
                <PrivateRoute>
                  <Submissions />
                </PrivateRoute>
              } 
            />

            {/* Protected routes - Admin */}
            <Route 
              path="/admin" 
              element={
                <AdminRoute>
                  <AdminDashboard />
                </AdminRoute>
              } 
            />
            <Route 
              path="/assignments/create" 
              element={
                <AdminRoute>
                  <CreateAssignment />
                </AdminRoute>
              } 
            />
            <Route 
              path="/users" 
              element={
                <AdminRoute>
                  <UserList />
                </AdminRoute>
              } 
            />
            <Route 
              path="/admin/statistics" 
              element={
                <AdminRoute>
                  <AssignmentStats />
                </AdminRoute>
              } 
            />
            
            {/* Route untuk halaman detail submission (Admin) */}
            <Route 
              path="/admin/assignments/:assignmentId/submissions/:submissionId" 
              element={
                <AdminRoute>
                  <SubmissionDetails />
                </AdminRoute>
              } 
            />

            {/* Redirect and 404 */}
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="*" element={<NotFound />} />
          </Routes>

          <ToastContainer
            position="top-right"
            autoClose={3000}
            hideProgressBar={false}
            newestOnTop
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="colored"
          />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;