import { useState, useEffect } from 'react';
import api from '../../api/client';

interface Payment {
  id: number;
  student_name: string;
  course_name: string;
  amount: number;
  date: string;
  method: string;
  note: string;
}

export default function Payments() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/payments')
      .then((res) => setPayments(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading">جاري التحميل...</div>;

  return (
    <div className="page-payments">
      <h1>المدفوعات</h1>
      <table className="data-table">
        <thead>
          <tr>
            <th>الطالب</th>
            <th>الكورس</th>
            <th>المبلغ</th>
            <th>التاريخ</th>
            <th>طريقة الدفع</th>
            <th>ملاحظات</th>
          </tr>
        </thead>
        <tbody>
          {payments.map((p) => (
            <tr key={p.id}>
              <td>{p.student_name}</td>
              <td>{p.course_name}</td>
              <td>{p.amount} ج.م</td>
              <td>{new Date(p.date).toLocaleDateString('ar-EG')}</td>
              <td>{p.method}</td>
              <td>{p.note || '—'}</td>
            </tr>
          ))}
          {payments.length === 0 && <tr><td colSpan={6} className="no-data">لا توجد مدفوعات</td></tr>}
        </tbody>
      </table>
    </div>
  );
}
