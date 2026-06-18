import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  TextInput, RefreshControl, ActivityIndicator
} from 'react-native';
import api from '../api/config';
import { useAuth } from '../context/AuthContext';

export default function TeachersScreen({ navigation }: any) {
  const { user } = useAuth();
  const [teachers, setTeachers] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => { load(); }, []);
  useEffect(() => {
    setFiltered(teachers.filter((t: any) =>
      t.name.includes(search) || t.subject.includes(search) || t.phone.includes(search)
    ));
  }, [search, teachers]);

  async function load() {
    try {
      const res = await api.get('/teachers');
      setTeachers(res.data);
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
          placeholder="بحث بالاسم أو المادة..."
          value={search}
          onChangeText={setSearch}
          textAlign="right"
          placeholderTextColor="#999"
        />
      </View>

      {user?.role === 'admin' && (
        <TouchableOpacity style={styles.addBtn} onPress={() => navigation.navigate('AddTeacher')}>
          <Text style={styles.addBtnText}>➕ إضافة مدرس</Text>
        </TouchableOpacity>
      )}

      <FlatList
        data={filtered}
        keyExtractor={(item: any) => item.id.toString()}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        renderItem={({ item }: any) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() => navigation.navigate('TeacherDetails', { teacher: item })}
          >
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{item.name[0]}</Text>
            </View>
            <View style={styles.info}>
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.subject}>📚 {item.subject}</Text>
              <Text style={styles.detail}>📞 {item.phone}</Text>
              <Text style={styles.detail}>📖 {item.courses_count} كورس</Text>
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={<Text style={styles.empty}>لا يوجد مدرسين</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  searchBar: { padding: 12, backgroundColor: '#fff', elevation: 2 },
  searchInput: { backgroundColor: '#f0f0f0', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 10, fontSize: 14 },
  addBtn: { backgroundColor: '#1a73e8', margin: 12, padding: 12, borderRadius: 10, alignItems: 'center' },
  addBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 15 },
  card: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff',
    marginHorizontal: 12, marginVertical: 5, padding: 14, borderRadius: 12, elevation: 2
  },
  avatar: {
    width: 52, height: 52, borderRadius: 26, backgroundColor: '#FF9800',
    alignItems: 'center', justifyContent: 'center'
  },
  avatarText: { color: '#fff', fontSize: 22, fontWeight: 'bold' },
  info: { flex: 1, marginRight: 14 },
  name: { fontSize: 16, fontWeight: 'bold', color: '#333', textAlign: 'right' },
  subject: { fontSize: 14, color: '#1a73e8', textAlign: 'right', marginTop: 2 },
  detail: { fontSize: 13, color: '#666', textAlign: 'right', marginTop: 2 },
  empty: { textAlign: 'center', color: '#999', marginTop: 40, fontSize: 16 },
});
