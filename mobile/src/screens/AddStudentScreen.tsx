import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, Alert, ScrollView, ActivityIndicator
} from 'react-native';
import api from '../api/config';

export default function AddStudentScreen({ navigation }: any) {
  const [form, setForm] = useState({
    name: '', phone: '', password: '', grade: '', parent_phone: ''
  });
  const [loading, setLoading] = useState(false);

  function set(key: string, val: string) {
    setForm(prev => ({ ...prev, [key]: val }));
  }

  async function submit() {
    if (!form.name || !form.phone || !form.password) {
      Alert.alert('خطأ', 'الاسم ورقم الهاتف وكلمة المرور مطلوبة');
      return;
    }
    setLoading(true);
    try {
      await api.post('/auth/register', { ...form, role: 'student' });
      Alert.alert('نجاح ✅', 'تم إضافة الطالب بنجاح', [{ text: 'حسناً', onPress: () => navigation.goBack() }]);
    } catch (e: any) {
      Alert.alert('خطأ', e.response?.data?.error || 'فشل الإضافة');
    } finally {
      setLoading(false);
    }
  }

  const fields = [
    { key: 'name', label: 'اسم الطالب *', placeholder: 'أحمد محمد', keyboard: 'default' },
    { key: 'phone', label: 'رقم الهاتف *', placeholder: '01000000000', keyboard: 'phone-pad' },
    { key: 'password', label: 'كلمة المرور *', placeholder: '123456', keyboard: 'default', secure: true },
    { key: 'grade', label: 'الصف الدراسي', placeholder: 'الثالث الثانوي', keyboard: 'default' },
    { key: 'parent_phone', label: 'هاتف ولي الأمر', placeholder: '01111111111', keyboard: 'phone-pad' },
  ];

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>إضافة طالب جديد</Text>
      {fields.map(f => (
        <View key={f.key} style={styles.field}>
          <Text style={styles.label}>{f.label}</Text>
          <TextInput
            style={styles.input}
            placeholder={f.placeholder}
            value={(form as any)[f.key]}
            onChangeText={v => set(f.key, v)}
            keyboardType={f.keyboard as any}
            secureTextEntry={f.secure}
            textAlign="right"
            placeholderTextColor="#999"
          />
        </View>
      ))}
      <TouchableOpacity style={styles.btn} onPress={submit} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>حفظ الطالب</Text>}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5', padding: 16 },
  title: { fontSize: 22, fontWeight: 'bold', color: '#1a73e8', textAlign: 'center', marginBottom: 20 },
  field: { marginBottom: 14 },
  label: { fontSize: 14, color: '#555', textAlign: 'right', marginBottom: 6 },
  input: {
    backgroundColor: '#fff', borderRadius: 10, padding: 14,
    fontSize: 15, borderWidth: 1, borderColor: '#e0e0e0', elevation: 1
  },
  btn: { backgroundColor: '#1a73e8', padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 10, marginBottom: 30 },
  btnText: { color: '#fff', fontSize: 17, fontWeight: 'bold' },
});
