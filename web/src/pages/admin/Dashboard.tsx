import { useState, useEffect } from 'react';
import api from '../../api/client';
import { useAuth } from '../../contexts/AuthContext';

interface Stats {
  totalStudents: number;
  totalTeachers: number;
  totalCourses: number;
  totalPayments: number;
  monthlyRevenue: number;
}

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    api.get('/payments/stats')
      .then((res) => setStats(res.data))
      .catch(() => {});
  }, []);

  return (
    <div className="page-dashboard">
      <h1>مرحباً، {user?.name}</h1>
      <div className="stats-grid">
        <div className="stat-card">
          <span className="stat-icon">👨‍🎓</span>
          <span className="stat-value">{stats?.totalStudents ?? '...'}</span>
          <span className="stat-label">الطلاب</span>
        </div>
        <div className="stat-card">
          <span className="stat-icon">👨‍🏫</span>
          <span className="stat-value">{stats?.totalTeachers ?? '...'}</span>
          <span className="stat-label">المدرسين</span>
        </div>
        <div className="stat-card">
          <span className="stat-icon">📚</span>
          <span className="stat-value">{stats?.totalCourses ?? '...'}</span>
          <span className="stat-label">الكورسات</span>
        </div>
        <div className="stat-card">
          <span className="stat-icon">💰</span>
          <span className="stat-value">{stats?.monthlyRevenue ?? 0} ج.م</span>
          <span className="stat-label">إيرادات الشهر</span>
        </div>
      </div>
    </div>
  );
}
