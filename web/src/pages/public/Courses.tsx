import { useState, useEffect } from 'react';
import api from '../../api/client';

interface Course {
  id: number;
  title: string;
  subject: string;
  grade: string;
  price: number;
  teacher_name: string;
}

export default function Courses() {
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
    <div className="page-courses">
      <div className="container">
        <h1>الكورسات المتاحة</h1>
        <div className="courses-grid">
          {courses.map((course) => (
            <div key={course.id} className="course-card">
              <div className="course-header">
                <span className="course-subject">{course.subject}</span>
                <span className="course-grade">{course.grade}</span>
              </div>
              <h3>{course.title}</h3>
              <p className="course-teacher">المدرس: {course.teacher_name}</p>
              <p className="course-price">{course.price} جنيه</p>
            </div>
          ))}
          {courses.length === 0 && (
            <p className="no-data">لا توجد كورسات متاحة حالياً</p>
          )}
        </div>
      </div>
    </div>
  );
}
