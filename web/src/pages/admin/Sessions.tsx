import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/client';
import { useAuth } from '../../contexts/AuthContext';

interface Session {
  id: number;
  title: string;
  course_id: number;
  course_title: string;
  date: string;
  duration_minutes: number;
  notes: string;
}

interface Course { id: number; title: string; }

export default function Sessions() {
  const { user } = useAuth();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ course_id: '', title: '', date: '', duration_minutes: '60', notes: '' });

  const loadSessions = async () => {
    setLoading(true);
    try {
      const res = await api.get('/courses');
      setCourses(res.data);
      const all: Session[] = [];
      for (const c of res.data) {
        const s = await api.get(`/courses/${c.id}/sessions`);
        all.push(...s.data.map((session: any) => ({
          ...session,
          course_id: c.id,
          course_title: c.title,
        })));
      }
      all.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      setSessions(all);
    } catch {}
    setLoading(false);
  };

  useEffect(() => { loadSessions(); }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/sessions', {
        course_id: Number(form.course_id),
        title: form.title,
        date: form.date,
        duration_minutes: Number(form.duration_minutes),
        notes: form.notes,
      });
      setShowForm(false);
      setForm({ course_id: '', title: '', date: '', duration_minutes: '60', notes: '' });
      loadSessions();
    } catch {
      alert('فشلت إضافة المحاضرة');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('حذف المحاضرة؟')) return;
    try {
      await api.delete(`/sessions/${id}`);
      setSessions(sessions.filter((s) => s.id !== id));
    } catch {
      alert('فشل الحذف');
    }
  };

  if (loading) return <div className="loading">جاري التحميل...</div>;

  return (
    <div className="page-sessions">
      <div className="page-header">
        <h1>المحاضرات</h1>
        {user?.role !== 'student' && (
          <button onClick={() => setShowForm(!showForm)} className="btn btn-primary">
            {showForm ? 'إلغاء' : 'إضافة محاضرة'}
          </button>
        )}
      </div>

      {showForm && (
        <form onSubmit={handleAdd} className="form" style={{ marginBottom: 20 }}>
          <div className="form-group">
            <label>الكورس</label>
            <select value={form.course_id} onChange={(e) => setForm({ ...form, course_id: e.target.value })} required>
              <option value="">اختر الكورس</option>
              {courses.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label>عنوان المحاضرة</label>
            <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
          </div>
          <div className="form-group">
            <label>التاريخ والوقت</label>
            <input type="datetime-local" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} required />
          </div>
          <div className="form-group">
            <label>المدة (دقائق)</label>
            <input type="number" value={form.duration_minutes} onChange={(e) => setForm({ ...form, duration_minutes: e.target.value })} />
          </div>
          <div className="form-group">
            <label>ملاحظات</label>
            <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={3} />
          </div>
          <button type="submit" className="btn btn-primary">حفظ</button>
        </form>
      )}

      <table className="data-table">
        <thead>
          <tr>
            <th>العنوان</th>
            <th>الكورس</th>
            <th>التاريخ</th>
            <th>المدة</th>
            <th>إجراءات</th>
          </tr>
        </thead>
        <tbody>
          {sessions.map((s) => (
            <tr key={s.id}>
              <td>{s.title}</td>
              <td>{s.course_title}</td>
              <td>{new Date(s.date).toLocaleDateString('ar-EG', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</td>
              <td>{s.duration_minutes} د</td>
              <td>
                <Link to={`/admin/sessions/${s.id}`} className="btn-small">الحضور</Link>
                {user?.role !== 'student' && (
                  <button onClick={() => handleDelete(s.id)} className="btn-small btn-danger" style={{ marginRight: 4 }}>حذف</button>
                )}
              </td>
            </tr>
          ))}
          {sessions.length === 0 && <tr><td colSpan={5} className="no-data">لا توجد محاضرات</td></tr>}
        </tbody>
      </table>
    </div>
  );
}
