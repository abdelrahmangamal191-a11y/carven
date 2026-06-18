import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function AdminLayout() {
  const { user, logout } = useAuth();

  const links = [
    { to: '/admin', label: 'لوحة التحكم', end: true },
    { to: '/admin/students', label: 'الطلاب' },
    { to: '/admin/teachers', label: 'المدرسين' },
    { to: '/admin/courses', label: 'الكورسات' },
    { to: '/admin/sessions', label: 'المحاضرات' },
    { to: '/admin/payments', label: 'المدفوعات' },
    { to: '/admin/videos', label: 'الفيديوهات' },
  ];

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div className="sidebar-header">
          <h2>📚 سنتر الدروس</h2>
          <span className="user-name">{user?.name}</span>
          <span className="user-role">({user?.role === 'admin' ? 'مدير' : user?.role === 'teacher' ? 'مدرس' : 'طالب'})</span>
        </div>
        <nav className="sidebar-nav">
          {links.map((link) => (
            <NavLink key={link.to} to={link.to} end={link.end}>
              {link.label}
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-footer">
          <NavLink to="/">العودة للموقع</NavLink>
          <button onClick={logout} className="btn-logout">تسجيل خروج</button>
        </div>
      </aside>
      <main className="admin-content">
        <Outlet />
      </main>
    </div>
  );
}
