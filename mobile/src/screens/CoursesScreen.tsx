import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  TextInput, RefreshControl, ActivityIndicator
} from 'react-native';
import api from '../api/config';
import { useAuth } from '../context/AuthContext';

export default function CoursesScreen({ navigation }: any) {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => { load(); }, []);
  useEffect(() => {
    setFiltered(courses.filter((c: any) =>
      c.title.includes(search) || c.subject.includes(search) || c.teacher_name.includes(search)
    ));
  }, [search, courses]);

  async function load() {
    try {
      const res = await api.get('/courses');
      setCourses(res.data);
      setFiltered(res.data);
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
      <View style={styles.searchBar}>
        <TextInput
          style={styles.searchInput}
          placeholder="بحث في الكورسات..."
          value={search}
          onChangeText={setSearch}
          textAlign="right"
          placeholderTextColor="#999"
        />
      </View>

      {user?.role !== 'student' && (
        <TouchableOpacity style={styles.addBtn} onPress={() => navigation.navigate('AddCourse')}>
          <Text style={styles.addBtnText}>➕ إضافة كورس</Text>
        </TouchableOpacity>
      )}

      <FlatList
        data={filtered}
        keyExtractor={(item: any) => item.id.toString()}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        renderItem={({ item }: any) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() => navigation.navigate('CourseDetails', { course: item })}
          >
            <View style={styles.cardHeader}>
              <Text style={styles.grade}>{item.grade}</Text>
              <Text style={styles.title}>{item.title}</Text>
            </View>
            <Text style={styles.teacher}>👨‍🏫 {item.teacher_name}</Text>
            <Text style={styles.subject}>📚 {item.subject}</Text>
            <View style={styles.footer}>
              <Text style={styles.price}>💰 {item.price} ج</Text>
              <Text style={styles.count}>👨‍🎓 {item.students_count} طالب</Text>
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={<Text style={styles.empty}>لا توجد كورسات</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  searchBar: { padding: 12, backgroundColor: '#fff', elevation: 2 },
  searchInput: {
    backgroundColor: '#f0f0f0', borderRadius: 10,
    paddingHorizontal: 14, paddingVertical: 10, fontSize: 14
  },
  addBtn: { backgroundColor: '#1a73e8', margin: 12, padding: 12, borderRadius: 10, alignItems: 'center' },
  addBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 15 },
  card: {
    backgroundColor: '#fff', marginHorizontal: 12, marginVertical: 6,
    borderRadius: 14, padding: 16, elevation: 3
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  title: { fontSize: 17, fontWeight: 'bold', color: '#333', flex: 1, textAlign: 'right' },
  grade: { backgroundColor: '#E3F2FD', color: '#1a73e8', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, fontSize: 12 },
  teacher: { fontSize: 14, color: '#555', textAlign: 'right', marginBottom: 4 },
  subject: { fontSize: 14, color: '#555', textAlign: 'right', marginBottom: 8 },
  footer: { flexDirection: 'row', justifyContent: 'space-between', borderTopWidth: 1, borderTopColor: '#f0f0f0', paddingTop: 8 },
  price: { fontSize: 15, fontWeight: 'bold', color: '#4CAF50' },
  count: { fontSize: 14, color: '#666' },
  empty: { textAlign: 'center', color: '#999', marginTop: 40, fontSize: 16 },
});
