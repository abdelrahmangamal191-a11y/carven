import { Link, Outlet } from 'react-router-dom';

export default function Layout() {
  return (
    <div className="public-layout">
      <header className="public-header">
        <div className="container">
          <Link to="/" className="logo">📚 سنتر الدروس</Link>
          <nav>
            <Link to="/">الرئيسية</Link>
            <Link to="/courses">الكورسات</Link>
            <Link to="/lectures">المحاضرات</Link>
            <Link to="/teachers">المدرسين</Link>
            <Link to="/about">عن المركز</Link>
            <Link to="/admin/login" className="btn-login">دخول المشرفين</Link>
          </nav>
        </div>
      </header>
      <main>
        <Outlet />
      </main>
      <footer className="public-footer">
        <div className="container">
          <p>© {new Date().getFullYear()} سنتر الدروس - جميع الحقوق محفوظة</p>
        </div>
      </footer>
    </div>
  );
}
