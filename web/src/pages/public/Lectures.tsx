import { useState, useEffect } from 'react';
import api from '../../api/client';

interface Lecture {
  id: number;
  title: string;
  course_title: string;
  course_subject: string;
  date: string;
  duration_minutes: number;
  teacher_name: string;
}

export default function Lectures() {
  const [lectures, setLectures] = useState<Lecture[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/courses')
      .then(async (res) => {
        const all: Lecture[] = [];
        for (const c of res.data) {
          const s = await api.get(`/courses/${c.id}/sessions`);
          all.push(...s.data.map((session: any) => ({
            id: session.id,
            title: session.title,
            course_title: c.title,
            course_subject: c.subject,
            date: session.date,
            duration_minutes: session.duration_minutes || 60,
            teacher_name: c.teacher_name,
          })));
        }
        all.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        setLectures(all);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading">جاري التحميل...</div>;

  return (
    <div className="page-lectures">
      <div className="container">
        <h1>المحاضرات</h1>
        <div className="lectures-list">
          {lectures.map((lec) => (
            <div key={lec.id} className="lecture-card">
              <div className="lecture-date">
                <span className="lecture-day">{new Date(lec.date).toLocaleDateString('ar-EG', { day: 'numeric' })}</span>
                <span className="lecture-month">{new Date(lec.date).toLocaleDateString('ar-EG', { month: 'long' })}</span>
              </div>
              <div className="lecture-info">
                <h3>{lec.title}</h3>
                <p className="lecture-course">{lec.course_title} — {lec.course_subject}</p>
                <p className="lecture-teacher">👨‍🏫 {lec.teacher_name}</p>
                <p className="lecture-duration">⏱ {lec.duration_minutes} دقيقة</p>
              </div>
            </div>
          ))}
          {lectures.length === 0 && (
            <p className="no-data">لا توجد محاضرات مسجلة حالياً</p>
          )}
        </div>
      </div>
    </div>
  );
}
