import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  TextInput, RefreshControl, ActivityIndicator
} from 'react-native';
import api from '../api/config';
import { useAuth } from '../context/AuthContext';

export default function StudentsScreen({ navigation }: any) {
  const { user } = useAuth();
  const [students, setStudents] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => { loadStudents(); }, []);
  useEffect(() => {
    setFiltered(students.filter((s: any) =>
      s.name.includes(search) || s.phone.includes(search) || (s.grade || '').includes(search)
    ));
  }, [search, students]);

  async function loadStudents() {
    try {
      const res = await api.get('/students');
      setStudents(res.data);
      setFiltered(res.data);
    } catch (e) {}
    setLoading(false);
  }

  async function onRefresh() {
    setRefreshing(true);
    await loadStudents();
    setRefreshing(false);
  }

  if (loading) return <ActivityIndicator style={{ flex: 1 }} size="large" color="#1a73e8" />;

  return (
    <View style={styles.container}>
      <View style={styles.searchBar}>
        <TextInput
          style={styles.searchInput}
          placeholder="بحث بالاسم أو الهاتف أو الصف..."
          value={search}
          onChangeText={setSearch}
          textAlign="right"
          placeholderTextColor="#999"
        />
      </View>

      {user?.role !== 'student' && (
        <TouchableOpacity style={styles.addBtn} onPress={() => navigation.navigate('AddStudent')}>
          <Text style={styles.addBtnText}>➕ إضافة طالب</Text>
        </TouchableOpacity>
      )}

      <FlatList
        data={filtered}
        keyExtractor={(item: any) => item.id.toString()}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        renderItem={({ item }: any) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() => navigation.navigate('StudentDetails', { student: item })}
          >
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{item.name[0]}</Text>
            </View>
            <View style={styles.info}>
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.detail}>📞 {item.phone}</Text>
              {item.grade ? <Text style={styles.detail}>🎓 {item.grade}</Text> : null}
            </View>
            <Text style={styles.arrow}>◀</Text>
          </TouchableOpacity>
        )}
        ListEmptyComponent={<Text style={styles.empty}>لا يوجد طلاب</Text>}
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
  addBtn: {
    backgroundColor: '#1a73e8', margin: 12, padding: 12,
    borderRadius: 10, alignItems: 'center'
  },
  addBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 15 },
  card: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff',
    marginHorizontal: 12, marginVertical: 5, padding: 14, borderRadius: 12, elevation: 2
  },
  avatar: {
    width: 46, height: 46, borderRadius: 23, backgroundColor: '#1a73e8',
    alignItems: 'center', justifyContent: 'center'
  },
  avatarText: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
  info: { flex: 1, marginRight: 12 },
  name: { fontSize: 16, fontWeight: 'bold', color: '#333', textAlign: 'right' },
  detail: { fontSize: 13, color: '#666', textAlign: 'right', marginTop: 2 },
  arrow: { color: '#ccc', fontSize: 16 },
  empty: { textAlign: 'center', color: '#999', marginTop: 40, fontSize: 16 },
});
