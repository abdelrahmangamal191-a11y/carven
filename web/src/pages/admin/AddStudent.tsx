import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../api/client';

export default function AddStudent() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', phone: '', grade: '', parent_phone: '', password: '' });
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await api.post('/auth/register', { ...form, role: 'student' });
      navigate('/admin/students');
    } catch {
      setError('حدث خطأ أثناء إضافة الطالب');
    }
  };

  return (
    <div className="page-add-student">
      <Link to="/admin/students" className="back-link">← العودة للطلاب</Link>
      <h1>إضافة طالب جديد</h1>
      <form onSubmit={handleSubmit} className="form">
        <div className="form-group">
          <label>الاسم</label>
          <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
        </div>
        <div className="form-group">
          <label>رقم الهاتف</label>
          <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} required dir="ltr" />
        </div>
        <div className="form-group">
          <label>المرحلة الدراسية</label>
          <select value={form.grade} onChange={(e) => setForm({ ...form, grade: e.target.value })} required>
            <option value="">اختر المرحلة</option>
            <option value="ابتدائي">ابتدائي</option>
            <option value="إعدادي">إعدادي</option>
            <option value="ثانوي">ثانوي</option>
          </select>
        </div>
        <div className="form-group">
          <label>هاتف ولي الأمر</label>
          <input value={form.parent_phone} onChange={(e) => setForm({ ...form, parent_phone: e.target.value })} dir="ltr" />
        </div>
        <div className="form-group">
          <label>كلمة المرور</label>
          <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
        </div>
        {error && <p className="error-message">{error}</p>}
        <button type="submit" className="btn btn-primary">حفظ</button>
      </form>
    </div>
  );
}
