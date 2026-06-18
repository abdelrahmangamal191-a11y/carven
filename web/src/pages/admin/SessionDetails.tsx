import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../api/client';
import { useAuth } from '../../contexts/AuthContext';

interface Attendance {
  id: number;
  student_id: number;
  name: string;
  phone: string;
  status: string;
}

export default function SessionDetails() {
  const { id } = useParams();
  const { user } = useAuth();
  const [session, setSession] = useState<any>(null);
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const res = await api.get(`/sessions/${id}`);
      setSession(res.data);
      setAttendance(res.data.attendance || []);
    } catch {}
    setLoading(false);
  };

  useEffect(() => { load(); }, [id]);

  const updateStatus = async (studentId: number, status: string) => {
    try {
      await api.put(`/sessions/${id}/attendance`, { student_id: studentId, status });
      setAttendance(attendance.map((a) =>
        a.student_id === studentId ? { ...a, status } : a
      ));
    } catch {
      alert('فشل التحديث');
    }
  };

  const markAll = async (status: string) => {
    const records = attendance.map((a) => ({ student_id: a.student_id, status }));
    try {
      await api.put(`/sessions/${id}/attendance/bulk`, { records });
      setAttendance(attendance.map((a) => ({ ...a, status })));
    } catch {
      alert('فشل التحديث الجماعي');
    }
  };

  if (loading) return <div className="loading">جاري التحميل...</div>;
  if (!session) return <div className="error-screen">المحاضرة غير موجودة</div>;

  const stats = {
    present: attendance.filter((a) => a.status === 'present').length,
    absent: attendance.filter((a) => a.status === 'absent').length,
    late: attendance.filter((a) => a.status === 'late').length,
  };

  const canEdit = user?.role !== 'student';

  return (
    <div className="page-session-details">
      <Link to="/admin/sessions" className="back-link">← العودة للمحاضرات</Link>

      <div className="session-info">
        <h1>{session.title}</h1>
        <p>التاريخ: {new Date(session.date).toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
        <p>المدة: {session.duration_minutes} دقيقة</p>
        {session.notes && <p>ملاحظات: {session.notes}</p>}
      </div>

      <div className="attendance-stats">
        <div className="stat-card"><span className="stat-label">✅ حضور</span><span className="stat-value">{stats.present}</span></div>
        <div className="stat-card"><span className="stat-label">❌ غياب</span><span className="stat-value">{stats.absent}</span></div>
        <div className="stat-card"><span className="stat-label">⏰ متأخر</span><span className="stat-value">{stats.late}</span></div>
      </div>

      {canEdit && (
        <div className="bulk-actions" style={{ margin: '16px 0', display: 'flex', gap: 8 }}>
          <button onClick={() => markAll('present')} className="btn-small" style={{ background: 'var(--success)' }}>حضور الكل</button>
          <button onClick={() => markAll('absent')} className="btn-small btn-danger">غياب الكل</button>
          <button onClick={() => markAll('late')} className="btn-small" style={{ background: 'var(--accent)', color: '#000' }}>تأخير الكل</button>
        </div>
      )}

      <table className="data-table">
        <thead>
          <tr>
            <th>الطالب</th>
            <th>الهاتف</th>
            <th>الحالة</th>
            {canEdit && <th>تعديل</th>}
          </tr>
        </thead>
        <tbody>
          {attendance.map((a) => (
            <tr key={a.id}>
              <td>{a.name}</td>
              <td dir="ltr">{a.phone}</td>
              <td>
                <span style={{
                  color: a.status === 'present' ? 'var(--success)' : a.status === 'late' ? 'var(--accent)' : 'var(--danger)',
                  fontWeight: 600,
                }}>
                  {a.status === 'present' ? '✅ حاضر' : a.status === 'late' ? '⏰ متأخر' : '❌ غائب'}
                </span>
              </td>
              {canEdit && (
                <td>
                  <select
                    value={a.status}
                    onChange={(e) => updateStatus(a.student_id, e.target.value)}
                    style={{ padding: '4px 8px', borderRadius: 4, border: '1px solid var(--border)' }}
                  >
                    <option value="present">حاضر</option>
                    <option value="absent">غائب</option>
                    <option value="late">متأخر</option>
                  </select>
                </td>
              )}
            </tr>
          ))}
          {attendance.length === 0 && (
            <tr><td colSpan={canEdit ? 4 : 3} className="no-data">لا يوجد طلاب مسجلين في هذه المحاضرة</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
