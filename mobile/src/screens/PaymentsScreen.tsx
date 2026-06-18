import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  RefreshControl, ActivityIndicator
} from 'react-native';
import api from '../api/config';
import { useAuth } from '../context/AuthContext';

export default function PaymentsScreen({ navigation }: any) {
  const { user } = useAuth();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [total, setTotal] = useState(0);

  useEffect(() => { load(); }, []);

  async function load() {
    try {
      const res = await api.get('/payments');
      setPayments(res.data);
      setTotal(res.data.reduce((s: number, p: any) => s + p.amount, 0));
    } catch (e) {}
    setLoading(false);
  }

  async function onRefresh() {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }

  if (loading) return <ActivityIndicator style={{ flex: 1 }} size="large" color="#1a73e8" />;

  return (
    <View style={styles.container}>
      <View style={styles.totalBanner}>
        <Text style={styles.totalLabel}>إجمالي المدفوعات</Text>
        <Text style={styles.totalValue}>{total.toLocaleString()} جنيه</Text>
      </View>

      {user?.role !== 'student' && (
        <TouchableOpacity style={styles.addBtn} onPress={() => navigation.navigate('AddPayment', {})}>
          <Text style={styles.addBtnText}>💳 تسجيل دفعة جديدة</Text>
        </TouchableOpacity>
      )}

      <FlatList
        data={payments}
        keyExtractor={(item: any) => item.id.toString()}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        renderItem={({ item }: any) => (
          <View style={styles.card}>
            <View style={styles.cardLeft}>
              <Text style={styles.amount}>+{item.amount} ج</Text>
              <Text style={styles.method}>{item.method}</Text>
            </View>
            <View style={styles.cardRight}>
              <Text style={styles.studentName}>{item.student_name}</Text>
              <Text style={styles.courseName}>{item.course_title}</Text>
              <Text style={styles.date}>📅 {new Date(item.paid_at).toLocaleDateString('ar-EG')}</Text>
              {item.note ? <Text style={styles.note}>📝 {item.note}</Text> : null}
            </View>
          </View>
        )}
        ListEmptyComponent={<Text style={styles.empty}>لا توجد مدفوعات</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  totalBanner: { backgroundColor: '#1a73e8', padding: 20, alignItems: 'center' },
  totalLabel: { color: '#cce0ff', fontSize: 14 },
  totalValue: { color: '#fff', fontSize: 28, fontWeight: 'bold', marginTop: 4 },
  addBtn: { backgroundColor: '#4CAF50', margin: 12, padding: 12, borderRadius: 10, alignItems: 'center' },
  addBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 15 },
  card: {
    flexDirection: 'row', backgroundColor: '#fff',
    marginHorizontal: 12, marginVertical: 5, padding: 14, borderRadius: 12, elevation: 2
  },
  cardLeft: { alignItems: 'center', marginLeft: 12, paddingLeft: 12, borderLeftWidth: 1, borderLeftColor: '#f0f0f0' },
  amount: { fontSize: 18, fontWeight: 'bold', color: '#4CAF50' },
  method: { fontSize: 11, color: '#999', marginTop: 4 },
  cardRight: { flex: 1 },
  studentName: { fontSize: 16, fontWeight: 'bold', color: '#333', textAlign: 'right' },
  courseName: { fontSize: 13, color: '#1a73e8', textAlign: 'right', marginTop: 2 },
  date: { fontSize: 12, color: '#999', textAlign: 'right', marginTop: 4 },
  note: { fontSize: 12, color: '#666', textAlign: 'right', marginTop: 2 },
  empty: { textAlign: 'center', color: '#999', marginTop: 40, fontSize: 16 },
});
