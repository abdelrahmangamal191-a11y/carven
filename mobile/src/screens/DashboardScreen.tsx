import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { useAuth } from '../context/AuthContext';
import api from '../api/config';

export default function DashboardScreen({ navigation }: any) {
  const { user, logout } = useAuth();
  const [stats, setStats] = useState<any>({});
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => { loadStats(); }, []);

  async function loadStats() {
    try {
      const res = await api.get('/payments/stats');
      setStats(res.data);
    } catch (e) {}
  }

  async function onRefresh() {
    setRefreshing(true);
    await loadStats();
    setRefreshing(false);
  }

  const cards = [
    { label: 'الطلاب', value: stats.total_students || 0, icon: '👨‍🎓', color: '#4CAF50', screen: 'Students' },
    { label: 'المدرسين', value: stats.total_teachers || 0, icon: '👨‍🏫', color: '#2196F3', screen: 'Teachers' },
    { label: 'الكورسات', value: stats.total_courses || 0, icon: '📖', color: '#FF9800', screen: 'Courses' },
    { label: 'إيرادات الشهر', value: `${stats.this_month || 0} ج`, icon: '💰', color: '#E91E63', screen: 'Payments' },
  ];

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <View style={styles.header}>
        <Text style={styles.welcome}>أهلاً، {user?.name} 👋</Text>
        <Text style={styles.role}>{user?.role === 'admin' ? 'مدير' : user?.role === 'teacher' ? 'مدرس' : 'طالب'}</Text>
        <TouchableOpacity onPress={logout} style={styles.logoutBtn}>
          <Text style={styles.logoutText}>خروج</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.sectionTitle}>الإحصائيات العامة</Text>
      <View style={styles.grid}>
        {cards.map((card, i) => (
          <TouchableOpacity
            key={i}
            style={[styles.card, { borderLeftColor: card.color }]}
            onPress={() => navigation.navigate(card.screen)}
          >
            <Text style={styles.cardIcon}>{card.icon}</Text>
            <Text style={styles.cardValue}>{card.value}</Text>
            <Text style={styles.cardLabel}>{card.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.sectionTitle}>الإجمالي الكلي للإيرادات</Text>
      <View style={styles.totalCard}>
        <Text style={styles.totalIcon}>💵</Text>
        <Text style={styles.totalValue}>{stats.total_revenue || 0} جنيه</Text>
      </View>

      <Text style={styles.sectionTitle}>الإجراءات السريعة</Text>
      <View style={styles.quickActions}>
        {user?.role !== 'student' && (
          <>
            <TouchableOpacity style={styles.actionBtn} onPress={() => navigation.navigate('AddStudent')}>
              <Text style={styles.actionText}>➕ طالب جديد</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionBtn} onPress={() => navigation.navigate('AddCourse')}>
              <Text style={styles.actionText}>📖 كورس جديد</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionBtn} onPress={() => navigation.navigate('AddPayment')}>
              <Text style={styles.actionText}>💳 دفعة جديدة</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  header: { backgroundColor: '#1a73e8', padding: 20, paddingTop: 50 },
  welcome: { color: '#fff', fontSize: 22, fontWeight: 'bold', textAlign: 'right' },
  role: { color: '#cce0ff', fontSize: 14, textAlign: 'right', marginTop: 4 },
  logoutBtn: { position: 'absolute', top: 50, left: 20, backgroundColor: 'rgba(255,255,255,0.2)', padding: 8, borderRadius: 8 },
  logoutText: { color: '#fff', fontSize: 13 },
  sectionTitle: { fontSize: 17, fontWeight: 'bold', color: '#333', margin: 16, marginBottom: 8, textAlign: 'right' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 12 },
  card: {
    width: '46%', margin: '2%', backgroundColor: '#fff', borderRadius: 12,
    padding: 16, alignItems: 'center', elevation: 3, borderLeftWidth: 4
  },
  cardIcon: { fontSize: 32 },
  cardValue: { fontSize: 24, fontWeight: 'bold', color: '#333', marginTop: 8 },
  cardLabel: { fontSize: 13, color: '#666', marginTop: 4 },
  totalCard: {
    backgroundColor: '#fff', margin: 16, borderRadius: 12, padding: 20,
    alignItems: 'center', elevation: 3, flexDirection: 'row', justifyContent: 'center', gap: 12
  },
  totalIcon: { fontSize: 36 },
  totalValue: { fontSize: 28, fontWeight: 'bold', color: '#1a73e8' },
  quickActions: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 12, marginBottom: 20 },
  actionBtn: {
    backgroundColor: '#fff', margin: 6, paddingVertical: 12, paddingHorizontal: 16,
    borderRadius: 10, elevation: 2, borderWidth: 1, borderColor: '#e0e0e0'
  },
  actionText: { fontSize: 14, color: '#333', textAlign: 'center' },
});
