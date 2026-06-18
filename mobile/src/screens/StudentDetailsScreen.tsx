import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  RefreshControl, Alert
} from 'react-native';
import api from '../api/config';
import { useAuth } from '../context/AuthContext';

export default function StudentDetailsScreen({ route, navigation }: any) {
  const { student } = route.params;
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [payments, setPayments] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [tab, setTab] = useState<'courses' | 'payments' | 'attendance'>('courses');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => { loadAll(); }, []);

  async function loadAll() {
    const [c, p, a] = await Promise.all([
      api.get(`/students/${student.id}/courses`).then(r => r.data).catch(() => []),
      api.get(`/students/${student.id}/payments`).then(r => r.data).catch(() => []),
      api.get(`/students/${student.id}/attendance`).then(r => r.data).catch(() => []),
    ]);
    setCourses(c);
    setPayments(p);
    setAttendance(a);
  }

  async function onRefresh() {
    setRefreshing(true);
    await loadAll();
    setRefreshing(false);
  }

  const totalPaid = payments.reduce((s: number, p: any) => s + p.amount, 0);
  const presentCount = attendance.filter((a: any) => a.status === 'present').length;

  return (
    <ScrollView style={styles.container} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
      {/* بطاقة الطالب */}
      <View style={styles.profileCard}>
        <View style={styles.avatar}><Text style={styles.avatarText}>{student.name[0]}</Text></View>
        <Text style={styles.name}>{student.name}</Text>
        <Text style={styles.detail}>📞 {student.phone}</Text>
        {student.grade ? <Text style={styles.detail}>🎓 الصف: {student.grade}</Text> : null}
        {student.parent_phone ? <Text style={styles.detail}>👨‍👧 ولي الأمر: {student.parent_phone}</Text> : null}
      </View>

      {/* إحصائيات سريعة */}
      <View style={styles.statsRow}>
        <View style={styles.statBox}>
          <Text style={styles.statValue}>{courses.length}</Text>
          <Text style={styles.statLabel}>كورس</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statValue}>{totalPaid}</Text>
          <Text style={styles.statLabel}>إجمالي مدفوع</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statValue}>{presentCount}/{attendance.length}</Text>
          <Text style={styles.statLabel}>الحضور</Text>
        </View>
      </View>

      {/* أزرار التبويب */}
      <View style={styles.tabs}>
        {['courses', 'payments', 'attendance'].map((t) => (
          <TouchableOpacity
            key={t}
            style={[styles.tab, tab === t && styles.activeTab]}
            onPress={() => setTab(t as any)}
          >
            <Text style={[styles.tabText, tab === t && styles.activeTabText]}>
              {t === 'courses' ? '📖 الكورسات' : t === 'payments' ? '💳 المدفوعات' : '✅ الحضور'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* محتوى التبويب */}
      <View style={styles.content}>
        {tab === 'courses' && courses.map((c: any) => (
          <TouchableOpacity key={c.id} style={styles.item} onPress={() => navigation.navigate('CourseDetails', { course: c })}>
            <Text style={styles.itemTitle}>{c.title}</Text>
            <Text style={styles.itemSub}>💰 السعر: {c.price} ج | تم دفع: {c.paid} ج</Text>
            <Text style={[styles.itemSub, { color: c.paid >= c.price ? '#4CAF50' : '#F44336' }]}>
              {c.paid >= c.price ? '✅ مسدد بالكامل' : `⚠️ متبقي: ${c.price - c.paid} ج`}
            </Text>
          </TouchableOpacity>
        ))}

        {tab === 'payments' && payments.map((p: any) => (
          <View key={p.id} style={styles.item}>
            <Text style={styles.itemTitle}>{p.course_title}</Text>
            <Text style={styles.itemSub}>💵 {p.amount} جنيه - {p.method}</Text>
            <Text style={styles.itemSub}>📅 {new Date(p.paid_at).toLocaleDateString('ar-EG')}</Text>
            {p.note ? <Text style={styles.itemSub}>📝 {p.note}</Text> : null}
          </View>
        ))}

        {tab === 'attendance' && attendance.map((a: any, i: number) => (
          <View key={i} style={styles.item}>
            <Text style={styles.itemTitle}>{a.course_title} - {a.title}</Text>
            <Text style={styles.itemSub}>📅 {new Date(a.date).toLocaleDateString('ar-EG')}</Text>
            <Text style={[styles.badge, { backgroundColor: a.status === 'present' ? '#4CAF50' : a.status === 'late' ? '#FF9800' : '#F44336' }]}>
              {a.status === 'present' ? '✅ حاضر' : a.status === 'late' ? '⏰ متأخر' : '❌ غائب'}
            </Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  profileCard: { backgroundColor: '#1a73e8', padding: 24, alignItems: 'center' },
  avatar: { width: 70, height: 70, borderRadius: 35, backgroundColor: 'rgba(255,255,255,0.3)', alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: '#fff', fontSize: 32, fontWeight: 'bold' },
  name: { color: '#fff', fontSize: 22, fontWeight: 'bold', marginTop: 10 },
  detail: { color: '#cce0ff', fontSize: 14, marginTop: 4 },
  statsRow: { flexDirection: 'row', backgroundColor: '#fff', margin: 12, borderRadius: 12, elevation: 2 },
  statBox: { flex: 1, padding: 16, alignItems: 'center' },
  statValue: { fontSize: 20, fontWeight: 'bold', color: '#1a73e8' },
  statLabel: { fontSize: 12, color: '#666', marginTop: 4 },
  tabs: { flexDirection: 'row', backgroundColor: '#fff', marginHorizontal: 12, borderRadius: 10, padding: 4, elevation: 1 },
  tab: { flex: 1, padding: 10, alignItems: 'center', borderRadius: 8 },
  activeTab: { backgroundColor: '#1a73e8' },
  tabText: { fontSize: 12, color: '#666' },
  activeTabText: { color: '#fff', fontWeight: 'bold' },
  content: { margin: 12 },
  item: { backgroundColor: '#fff', padding: 14, borderRadius: 10, marginBottom: 8, elevation: 1 },
  itemTitle: { fontSize: 15, fontWeight: 'bold', color: '#333', textAlign: 'right' },
  itemSub: { fontSize: 13, color: '#666', textAlign: 'right', marginTop: 4 },
  badge: { alignSelf: 'flex-start', color: '#fff', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, marginTop: 6, fontSize: 12, overflow: 'hidden' },
});
