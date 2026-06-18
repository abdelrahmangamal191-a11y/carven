import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../api/client';

interface Student {
  id: number;
  name: string;
  phone: string;
  grade: string;
  parent_phone: string;
}

interface Course {
  id: number;
  title: string;
  subject: string;
}

interface Payment {
  id: number;
  amount: number;
  date: string;
  method: string;
  note: string;
}

export default function StudentDetails() {
  const { id } = useParams();
  const [student, setStudent] = useState<Student | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get(`/students/${id}`),
      api.get(`/students/${id}/courses`),
      api.get(`/students/${id}/payments`),
    ])
      .then(([s, c, p]) => {
        setStudent(s.data);
        setCourses(c.data);
        setPayments(p.data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="loading">جاري التحميل...</div>;
  if (!student) return <div className="error-screen">الطالب غير موجود</div>;

  return (
    <div className="page-student-details">
      <Link to="/admin/students" className="back-link">← العودة للطلاب</Link>
      <div className="student-info">
        <h1>{student.name}</h1>
        <p>رقم الهاتف: {student.phone}</p>
        <p>المرحلة: {student.grade}</p>
        <p>هاتف ولي الأمر: {student.parent_phone || '—'}</p>
      </div>

      <section>
        <h2>الكورسات المسجل فيها</h2>
        <table className="data-table">
          <thead><tr><th>الكورس</th><th>المادة</th></tr></thead>
          <tbody>
            {courses.map((c) => (
              <tr key={c.id}><td>{c.title}</td><td>{c.subject}</td></tr>
            ))}
            {courses.length === 0 && <tr><td colSpan={2} className="no-data">غير مسجل في أي كورس</td></tr>}
          </tbody>
        </table>
      </section>

      <section>
        <h2>المدفوعات</h2>
        <table className="data-table">
          <thead><tr><th>المبلغ</th><th>التاريخ</th><th>طريقة الدفع</th><th>ملاحظات</th></tr></thead>
          <tbody>
            {payments.map((p) => (
              <tr key={p.id}>
                <td>{p.amount} ج.م</td>
                <td>{new Date(p.date).toLocaleDateString('ar-EG')}</td>
                <td>{p.method}</td>
                <td>{p.note || '—'}</td>
              </tr>
            ))}
            {payments.length === 0 && <tr><td colSpan={4} className="no-data">لا توجد مدفوعات</td></tr>}
          </tbody>
        </table>
      </section>
    </div>
  );
}
