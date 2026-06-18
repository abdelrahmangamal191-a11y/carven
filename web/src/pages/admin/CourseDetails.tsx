import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../api/client';

interface Course {
  id: number;
  title: string;
  subject: string;
  grade: string;
  price: number;
  teacher_name: string;
}

interface Student {
  id: number;
  name: string;
  phone: string;
}

interface Session {
  id: number;
  title: string;
  date: string;
  duration: number;
}

interface Video {
  id: number;
  filename: string;
}

export default function CourseDetails() {
  const { id } = useParams();
  const [course, setCourse] = useState<Course | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get(`/courses/${id}`),
      api.get(`/courses/${id}/students`),
      api.get(`/courses/${id}/sessions`),
      api.get(`/courses/${id}/videos`),
    ])
      .then(([c, s, sess, v]) => {
        setCourse(c.data);
        setStudents(s.data);
        setSessions(sess.data);
        setVideos(v.data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="loading">جاري التحميل...</div>;
  if (!course) return <div className="error-screen">الكورس غير موجود</div>;

  return (
    <div className="page-course-details">
      <Link to="/admin/courses" className="back-link">← العودة للكورسات</Link>
      <h1>{course.title}</h1>
      <div className="course-meta">
        <p>المادة: {course.subject}</p>
        <p>المرحلة: {course.grade}</p>
        <p>السعر: {course.price} ج.م</p>
        <p>المدرس: {course.teacher_name}</p>
      </div>

      <section>
        <h2>الطلاب المسجلين ({students.length})</h2>
        <table className="data-table">
          <thead><tr><th>الاسم</th><th>الهاتف</th></tr></thead>
          <tbody>
            {students.map((s) => (
              <tr key={s.id}><td>{s.name}</td><td dir="ltr">{s.phone}</td></tr>
            ))}
            {students.length === 0 && <tr><td colSpan={2} className="no-data">لا يوجد طلاب</td></tr>}
          </tbody>
        </table>
      </section>

      <section>
        <h2>الحصص ({sessions.length})</h2>
        <table className="data-table">
          <thead><tr><th>العنوان</th><th>التاريخ</th><th>المدة</th></tr></thead>
          <tbody>
            {sessions.map((s) => (
              <tr key={s.id}>
                <td>{s.title}</td>
                <td>{new Date(s.date).toLocaleDateString('ar-EG')}</td>
                <td>{s.duration} دقيقة</td>
              </tr>
            ))}
            {sessions.length === 0 && <tr><td colSpan={3} className="no-data">لا توجد حصص</td></tr>}
          </tbody>
        </table>
      </section>

      <section>
        <h2>الفيديوهات ({videos.length})</h2>
        <div className="videos-list">
          {videos.map((v) => (
            <div key={v.id} className="video-item">
              <span>🎬 {v.filename}</span>
              <a href={`/uploads/${v.filename}`} target="_blank" className="btn-small" rel="noreferrer">مشاهدة</a>
            </div>
          ))}
          {videos.length === 0 && <p className="no-data">لا توجد فيديوهات</p>}
        </div>
      </section>
    </div>
  );
}
