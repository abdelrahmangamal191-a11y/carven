import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/client';

interface Student {
  id: number;
  name: string;
  phone: string;
  grade: string;
  parent_phone: string;
}

export default function Students() {
  const [students, setStudents] = useState<Student[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/students')
      .then((res) => setStudents(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = students.filter((s) =>
    s.name.includes(search) || s.phone.includes(search)
  );

  if (loading) return <div className="loading">جاري التحميل...</div>;

  return (
    <div className="page-students">
      <div className="page-header">
        <h1>الطلاب</h1>
        <Link to="/admin/students/add" className="btn btn-primary">إضافة طالب</Link>
      </div>
      <input
        type="text"
        placeholder="بحث باسم الطالب أو رقم الهاتف..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="search-input"
      />
      <table className="data-table">
        <thead>
          <tr>
            <th>الاسم</th>
            <th>رقم الهاتف</th>
            <th>المرحلة</th>
            <th>هاتف ولي الأمر</th>
            <th>إجراءات</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((student) => (
            <tr key={student.id}>
              <td>{student.name}</td>
              <td dir="ltr">{student.phone}</td>
              <td>{student.grade}</td>
              <td dir="ltr">{student.parent_phone || '—'}</td>
              <td>
                <Link to={`/admin/students/${student.id}`} className="btn-small">عرض</Link>
              </td>
            </tr>
          ))}
          {filtered.length === 0 && (
            <tr><td colSpan={5} className="no-data">لا يوجد طلاب</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
