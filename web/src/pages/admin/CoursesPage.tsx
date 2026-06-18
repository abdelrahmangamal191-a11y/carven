import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/client';

interface Course {
  id: number;
  title: string;
  subject: string;
  grade: string;
  price: number;
  teacher_name: string;
}

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/courses')
      .then((res) => setCourses(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading">جاري التحميل...</div>;

  return (
    <div className="page-courses-admin">
      <h1>الكورسات</h1>
      <table className="data-table">
        <thead>
          <tr>
            <th>العنوان</th>
            <th>المادة</th>
            <th>المرحلة</th>
            <th>السعر</th>
            <th>المدرس</th>
            <th>إجراءات</th>
          </tr>
        </thead>
        <tbody>
          {courses.map((course) => (
            <tr key={course.id}>
              <td>{course.title}</td>
              <td>{course.subject}</td>
              <td>{course.grade}</td>
              <td>{course.price} ج.م</td>
              <td>{course.teacher_name}</td>
              <td>
                <Link to={`/admin/courses/${course.id}`} className="btn-small">عرض</Link>
              </td>
            </tr>
          ))}
          {courses.length === 0 && <tr><td colSpan={6} className="no-data">لا توجد كورسات</td></tr>}
        </tbody>
      </table>
    </div>
  );
}
