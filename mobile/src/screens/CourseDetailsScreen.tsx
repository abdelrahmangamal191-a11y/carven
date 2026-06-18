import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  RefreshControl, Alert, ActivityIndicator
} from 'react-native';
import api from '../api/config';
import { useAuth } from '../context/AuthContext';

export default function CourseDetailsScreen({ route, navigation }: any) {
  const { course } = route.params;
  const { user } = useAuth();
  const [students, setStudents] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [videos, setVideos] = useState([]);
  const [tab, setTab] = useState<'students' | 'sessions' | 'videos'>('students');
  const [refreshing, setRefreshing] = useState(false);
  const [summary, setSummary] = useState<any>({});

  useEffect(() => { loadAll(); }, []);

  async function loadAll() {
    const [st, se, v, sum] = await Promise.all([
      api.get(`/courses/${course.id}/students`).then(r => r.data).catch(() => []),
      api.get(`/courses/${course.id}/sessions`).then(r => r.data).catch(() => []),
      api.get(`/courses/${course.id}/videos`).then(r => r.data).catch(() => []),
      api.get(`/payments/course/${course.id}/summary`).then(r => r.data).catch(() => ({})),
    ]);
    setStudents(st);
    setSessions(se);
    setVideos(v);
    setSummary(sum);
  }

  async function onRefresh() {
    setRefreshing(true);
    await loadAll();
    setRefreshing(false);
  }

  return (
    <ScrollView style={styles.container} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
      <View style={styles.header}>
        <Text style={styles.courseTitle}>{course.title}</Text>
        <Text style={styles.meta}>📚 {course.subject} | 🎓 {course.grade}</Text>
        <Text style={styles.meta}>👨‍🏫 {course.teacher_name}</Text>
        <Text style={styles.price}>💰 {course.price} جنيه</Text>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.stat}>
          <Text style={styles.statV}>{students.length}</Text>
          <Text style={styles.statL}>طالب</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statV}>{sessions.length}</Text>
          <Text style={styles.statL}>حصة</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statV}>{summary.total_collected || 0}</Text>
          <Text style={styles.statL}>محصل</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statV}>{videos.length}</Text>
          <Text style={styles.statL}>فيديو</Text>
        </View>
      </View>

      {user?.role !== 'student' && (
        <View style={styles.actions}>
          <TouchableOpacity style={styles.actionBtn} onPress={() => navigation.navigate('AddSession', { course_id: course.id })}>
            <Text style={styles.actionText}>➕ حصة</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionBtn} onPress={() => navigation.navigate('AddPayment', { course })}>
            <Text style={styles.actionText}>💳 دفعة</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionBtn} onPress={() => navigation.navigate('EnrollStudent', { course })}>
            <Text style={styles.actionText}>👤 تسجيل طالب</Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.tabs}>
        {(['students', 'sessions', 'videos'] as const).map(t => (
          <TouchableOpacity key={t} style={[styles.tab, tab === t && styles.activeTab]} onPress={() => setTab(t)}>
            <Text style={[styles.tabText, tab === t && styles.activeTabText]}>
              {t === 'students' ? '👨‍🎓 الطلاب' : t === 'sessions' ? '📅 الحصص' : '🎬 الفيديوهات'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.content}>
        {tab === 'students' && students.map((s: any) => (
          <TouchableOpacity key={s.id} style={styles.item} onPress={() => navigation.navigate('StudentDetails', { student: s })}>
            <Text style={styles.itemTitle}>{s.name}</Text>
            <Text style={styles.itemSub}>📞 {s.phone}</Text>
            <Text style={[styles.itemSub, { color: s.paid >= course.price ? '#4CAF50' : '#F44336' }]}>
              💰 دفع: {s.paid} / {course.price} ج
            </Text>
          </TouchableOpacity>
        ))}

        {tab === 'sessions' && sessions.map((s: any) => (
          <TouchableOpacity key={s.id} style={styles.item} onPress={() => navigation.navigate('SessionDetails', { session: s })}>
            <Text style={styles.itemTitle}>{s.title}</Text>
            <Text style={styles.itemSub}>📅 {new Date(s.date).toLocaleDateString('ar-EG')}</Text>
            <Text style={styles.itemSub}>⏱ {s.duration_minutes} دقيقة</Text>
            {s.notes ? <Text style={styles.itemSub}>📝 {s.notes}</Text> : null}
          </TouchableOpacity>
        ))}

        {tab === 'videos' && videos.map((v: any) => (
          <TouchableOpacity key={v.id} style={styles.item} onPress={() => navigation.navigate('VideoPlayer', { video: v })}>
            <Text style={styles.videoIcon}>🎬</Text>
            <Text style={styles.itemTitle}>{v.title}</Text>
            <Text style={styles.itemSub}>📅 {new Date(v.uploaded_at).toLocaleDateString('ar-EG')}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  header: { backgroundColor: '#1a73e8', padding: 20 },
  courseTitle: { color: '#fff', fontSize: 22, fontWeight: 'bold', textAlign: 'right' },
  meta: { color: '#cce0ff', fontSize: 14, textAlign: 'right', marginTop: 4 },
  price: { color: '#fff', fontSize: 18, fontWeight: 'bold', textAlign: 'right', marginTop: 8 },
  statsRow: { flexDirection: 'row', backgroundColor: '#fff', margin: 12, borderRadius: 12, elevation: 2 },
  stat: { flex: 1, padding: 14, alignItems: 'center' },
  statV: { fontSize: 18, fontWeight: 'bold', color: '#1a73e8' },
  statL: { fontSize: 11, color: '#666', marginTop: 2 },
  actions: { flexDirection: 'row', paddingHorizontal: 12, gap: 8, marginBottom: 4 },
  actionBtn: { flex: 1, backgroundColor: '#1a73e8', padding: 10, borderRadius: 10, alignItems: 'center' },
  actionText: { color: '#fff', fontSize: 13, fontWeight: 'bold' },
  tabs: { flexDirection: 'row', backgroundColor: '#fff', marginHorizontal: 12, borderRadius: 10, padding: 4, elevation: 1, marginTop: 8 },
  tab: { flex: 1, padding: 10, alignItems: 'center', borderRadius: 8 },
  activeTab: { backgroundColor: '#1a73e8' },
  tabText: { fontSize: 12, color: '#666' },
  activeTabText: { color: '#fff', fontWeight: 'bold' },
  content: { margin: 12 },
  item: { backgroundColor: '#fff', padding: 14, borderRadius: 10, marginBottom: 8, elevation: 1 },
  itemTitle: { fontSize: 15, fontWeight: 'bold', color: '#333', textAlign: 'right' },
  itemSub: { fontSize: 13, color: '#666', textAlign: 'right', marginTop: 4 },
  videoIcon: { fontSize: 30, textAlign: 'center', marginBottom: 6 },
});
