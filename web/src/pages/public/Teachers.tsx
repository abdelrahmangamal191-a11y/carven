import { useState, useEffect } from 'react';
import api from '../../api/client';

interface Teacher {
  id: number;
  name: string;
  phone: string;
  subject: string;
  bio: string;
}

export default function Teachers() {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/teachers')
      .then((res) => setTeachers(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading">جاري التحميل...</div>;

  return (
    <div className="page-teachers">
      <div className="container">
        <h1>المدرسين</h1>
        <div className="teachers-grid">
          {teachers.map((teacher) => (
            <div key={teacher.id} className="teacher-card">
              <div className="teacher-avatar">👨‍🏫</div>
              <h3>{teacher.name}</h3>
              <p className="teacher-subject">{teacher.subject}</p>
              <p className="teacher-bio">{teacher.bio || 'لا توجد سيرة ذاتية'}</p>
            </div>
          ))}
          {teachers.length === 0 && (
            <p className="no-data">لا يوجد مدرسين حالياً</p>
          )}
        </div>
      </div>
    </div>
  );
}
