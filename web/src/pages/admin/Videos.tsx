import { useState, useEffect } from 'react';
import api from '../../api/client';
import { useAuth } from '../../contexts/AuthContext';

interface Video {
  id: number;
  filename: string;
  course_name: string;
}

export default function Videos() {
  const { user } = useAuth();
  const [videos, setVideos] = useState<Video[]>([]);
  const [courses, setCourses] = useState<{ id: number; title: string }[]>([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadVideos = async () => {
    setLoading(true);
    try {
      const res = await api.get('/courses');
      const allVideos: Video[] = [];
      for (const course of res.data) {
        const v = await api.get(`/courses/${course.id}/videos`);
        allVideos.push(...v.data.map((vid: Video) => ({ ...vid, course_name: course.title })));
      }
      setVideos(allVideos);
    } catch {}
    setLoading(false);
  };

  useEffect(() => {
    api.get('/courses').then((res) => setCourses(res.data)).catch(() => {});
    loadVideos();
  }, []);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !selectedCourse) return;
    setUploading(true);
    const formData = new FormData();
    formData.append('video', file);
    formData.append('course_id', selectedCourse);
    try {
      await api.post('/videos/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setFile(null);
      setSelectedCourse('');
      loadVideos();
    } catch {
      alert('فشل رفع الفيديو');
    }
    setUploading(false);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('حذف الفيديو؟')) return;
    try {
      await api.delete(`/videos/${id}`);
      setVideos(videos.filter((v) => v.id !== id));
    } catch {
      alert('فشل الحذف');
    }
  };

  if (loading) return <div className="loading">جاري التحميل...</div>;

  return (
    <div className="page-videos">
      <h1>الفيديوهات</h1>

      {user?.role === 'admin' && (
        <form onSubmit={handleUpload} className="upload-form">
          <h2>رفع فيديو جديد</h2>
          <select value={selectedCourse} onChange={(e) => setSelectedCourse(e.target.value)} required>
            <option value="">اختر الكورس</option>
            {courses.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
          </select>
          <input type="file" accept="video/*" onChange={(e) => setFile(e.target.files?.[0] || null)} required />
          <button type="submit" className="btn btn-primary" disabled={uploading}>
            {uploading ? 'جاري الرفع...' : 'رفع'}
          </button>
        </form>
      )}

      <table className="data-table">
        <thead>
          <tr>
            <th>اسم الملف</th>
            <th>الكورس</th>
            <th>إجراءات</th>
          </tr>
        </thead>
        <tbody>
          {videos.map((v) => (
            <tr key={v.id}>
              <td>{v.filename}</td>
              <td>{v.course_name}</td>
              <td>
                <a href={`/uploads/${v.filename}`} target="_blank" className="btn-small" rel="noreferrer">مشاهدة</a>
                {user?.role === 'admin' && (
                  <button onClick={() => handleDelete(v.id)} className="btn-small btn-danger">حذف</button>
                )}
              </td>
            </tr>
          ))}
          {videos.length === 0 && <tr><td colSpan={3} className="no-data">لا توجد فيديوهات</td></tr>}
        </tbody>
      </table>
    </div>
  );
}
