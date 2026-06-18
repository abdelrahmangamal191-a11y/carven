import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Layout from './components/Layout';
import AdminLayout from './components/AdminLayout';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/public/Home';
import Courses from './pages/public/Courses';
import Teachers from './pages/public/Teachers';
import Lectures from './pages/public/Lectures';
import About from './pages/public/About';
import Login from './pages/admin/Login';
import Dashboard from './pages/admin/Dashboard';
import Students from './pages/admin/Students';
import StudentDetails from './pages/admin/StudentDetails';
import AddStudent from './pages/admin/AddStudent';
import TeachersPage from './pages/admin/TeachersPage';
import CoursesPage from './pages/admin/CoursesPage';
import CourseDetails from './pages/admin/CourseDetails';
import Sessions from './pages/admin/Sessions';
import SessionDetails from './pages/admin/SessionDetails';
import Payments from './pages/admin/Payments';
import Videos from './pages/admin/Videos';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Home />} />
            <Route path="/courses" element={<Courses />} />
            <Route path="/teachers" element={<Teachers />} />
            <Route path="/lectures" element={<Lectures />} />
            <Route path="/about" element={<About />} />
          </Route>
          <Route path="/admin/login" element={<Login />} />
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="students" element={<Students />} />
            <Route path="students/add" element={<AddStudent />} />
            <Route path="students/:id" element={<StudentDetails />} />
            <Route path="teachers" element={<TeachersPage />} />
            <Route path="courses" element={<CoursesPage />} />
            <Route path="courses/:id" element={<CourseDetails />} />
            <Route path="sessions" element={<Sessions />} />
            <Route path="sessions/:id" element={<SessionDetails />} />
            <Route path="payments" element={<Payments />} />
            <Route path="videos" element={<Videos />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
