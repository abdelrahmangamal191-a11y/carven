import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  Alert, ActivityIndicator, RefreshControl
} from 'react-native';
import api from '../api/config';
import { useAuth } from '../context/AuthContext';

const STATUS_OPTIONS = [
  { value: 'present', label: '✅ حاضر', color: '#4CAF50' },
  { value: 'late', label: '⏰ متأخر', color: '#FF9800' },
  { value: 'absent', label: '❌ غائب', color: '#F44336' },
];

export default function SessionDetailsScreen({ route, navigation }: any) {
  const { session } = route.params;
  const { user } = useAuth();
  const [data, setData] = useState<any>(null);
  const [attendance, setAttendance] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => { load(); }, []);

  async function load() {
    try {
      const res = await api.get(`/sessions/${session.id}`);
      setData(res.data);
      setAttendance(res.data.attendance);
    } catch (e) {}
    setLoading(false);
  }

  async function onRefresh() {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }

  function toggleStatus(student_id: number) {
    if (user?.role === 'student') return;
    setAttendance(prev => prev.map(a => {
      if (a.student_id !== student_id) return a;
      const idx = STATUS_OPTIONS.findIndex(s => s.value === a.status);
      const next = STATUS_OPTIONS[(idx + 1) % STATUS_OPTIONS.length];
      return { ...a, status: next.value };
    }));
  }

  async function saveAttendance() {
    setSaving(true);
    try {
      const records = attendance.map(a => ({ student_id: a.student_id, status: a.status }));
      await api.put(`/sessions/${session.id}/attendance/bulk`, { records });
      Alert.alert('نجاح ✅', 'تم حفظ الحضور');
    } catch (e) {
      Alert.alert('خطأ', 'فشل حفظ الحضور');
    } finally { setSaving(false); }
  }

  if (loading) return <ActivityIndicator style={{ flex: 1 }} size="large" color="#1a73e8" />;

  const presentCount = attendance.filter(a => a.status === 'present').length;
  const lateCount = attendance.filter(a => a.status === 'late').length;
  const absentCount = attendance.filter(a => a.status === 'absent').length;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.sessionTitle}>{session.title}</Text>
        <Text style={styles.date}>📅 {new Date(session.date).toLocaleDateString('ar-EG')}</Text>
        {session.notes ? <Text style={styles.notes}>📝 {session.notes}</Text> : null}
      </View>

      <View style={styles.statsRow}>
        <View style={[styles.stat, { borderTopColor: '#4CAF50' }]}>
          <Text style={styles.statV}>{presentCount}</Text>
          <Text style={styles.statL}>حاضر</Text>
        </View>
        <View style={[styles.stat, { borderTopColor: '#FF9800' }]}>
          <Text style={styles.statV}>{lateCount}</Text>
          <Text style={styles.statL}>متأخر</Text>
        </View>
        <View style={[styles.stat, { borderTopColor: '#F44336' }]}>
          <Text style={styles.statV}>{absentCount}</Text>
          <Text style={styles.statL}>غائب</Text>
        </View>
      </View>

      {user?.role !== 'student' && (
        <Text style={styles.hint}>اضغط على الطالب لتغيير حالته</Text>
      )}

      <FlatList
        data={attendance}
        keyExtractor={(item: any) => item.student_id.toString()}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        renderItem={({ item }: any) => {
          const statusObj = STATUS_OPTIONS.find(s => s.value === item.status) || STATUS_OPTIONS[2];
          return (
            <TouchableOpacity
              style={[styles.row, { borderRightColor: statusObj.color }]}
              onPress={() => toggleStatus(item.student_id)}
              activeOpacity={user?.role !== 'student' ? 0.7 : 1}
            >
              <Text style={[styles.badge, { backgroundColor: statusObj.color }]}>{statusObj.label}</Text>
              <View style={styles.rowInfo}>
                <Text style={styles.rowName}>{item.name}</Text>
                <Text style={styles.rowPhone}>{item.phone}</Text>
              </View>
            </TouchableOpacity>
          );
        }}
        ListEmptyComponent={<Text style={styles.empty}>لا يوجد طلاب</Text>}
      />

      {user?.role !== 'student' && (
        <TouchableOpacity style={styles.saveBtn} onPress={saveAttendance} disabled={saving}>
          {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveBtnText}>💾 حفظ الحضور</Text>}
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  header: { backgroundColor: '#1a73e8', padding: 20 },
  sessionTitle: { color: '#fff', fontSize: 20, fontWeight: 'bold', textAlign: 'right' },
  date: { color: '#cce0ff', fontSize: 14, textAlign: 'right', marginTop: 4 },
  notes: { color: '#cce0ff', fontSize: 13, textAlign: 'right', marginTop: 4 },
  statsRow: { flexDirection: 'row', backgroundColor: '#fff', margin: 12, borderRadius: 12, elevation: 2 },
  stat: { flex: 1, padding: 14, alignItems: 'center', borderTopWidth: 3 },
  statV: { fontSize: 22, fontWeight: 'bold', color: '#333' },
  statL: { fontSize: 12, color: '#666', marginTop: 2 },
  hint: { textAlign: 'center', color: '#999', fontSize: 12, marginBottom: 8 },
  row: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff',
    marginHorizontal: 12, marginVertical: 4, padding: 14, borderRadius: 10,
    elevation: 1, borderRightWidth: 4
  },
  rowInfo: { flex: 1, marginRight: 10 },
  rowName: { fontSize: 15, fontWeight: 'bold', color: '#333', textAlign: 'right' },
  rowPhone: { fontSize: 12, color: '#999', textAlign: 'right' },
  badge: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8, color: '#fff', fontSize: 12, overflow: 'hidden' },
  empty: { textAlign: 'center', color: '#999', marginTop: 40 },
  saveBtn: { backgroundColor: '#4CAF50', margin: 12, padding: 16, borderRadius: 12, alignItems: 'center', elevation: 3 },
  saveBtnText: { color: '#fff', fontSize: 17, fontWeight: 'bold' },
});
