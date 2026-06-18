import { useState, useEffect } from 'react';
import api from '../../api/client';
import { useAuth } from '../../contexts/AuthContext';

interface Teacher {
  id: number;
  name: string;
  phone: string;
  subject: string;
  bio: string;
}

export default function TeachersPage() {
  const { user } = useAuth();
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/teachers')
      .then((res) => setTeachers(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id: number) => {
    if (!confirm('هل أنت متأكد من حذف هذا المدرس؟')) return;
    try {
      await api.delete(`/teachers/${id}`);
      setTeachers(teachers.filter((t) => t.id !== id));
    } catch {
      alert('فشل الحذف');
    }
  };

  if (loading) return <div className="loading">جاري التحميل...</div>;

  return (
    <div className="page-teachers-admin">
      <h1>المدرسين</h1>
      <table className="data-table">
        <thead>
          <tr>
            <th>الاسم</th>
            <th>رقم الهاتف</th>
            <th>المادة</th>
            <th>السيرة الذاتية</th>
            {user?.role === 'admin' && <th>إجراءات</th>}
          </tr>
        </thead>
        <tbody>
          {teachers.map((teacher) => (
            <tr key={teacher.id}>
              <td>{teacher.name}</td>
              <td dir="ltr">{teacher.phone}</td>
              <td>{teacher.subject}</td>
              <td>{teacher.bio || '—'}</td>
              {user?.role === 'admin' && (
                <td>
                  <button onClick={() => handleDelete(teacher.id)} className="btn-small btn-danger">حذف</button>
                </td>
              )}
            </tr>
          ))}
          {teachers.length === 0 && <tr><td colSpan={5} className="no-data">لا يوجد مدرسين</td></tr>}
        </tbody>
      </table>
    </div>
  );
}
