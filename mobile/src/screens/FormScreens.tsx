import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, Alert, ScrollView, ActivityIndicator
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import api from '../api/config';

// ==================== إضافة كورس ====================
export function AddCourseScreen({ navigation }: any) {
  const [form, setForm] = useState({ title: '', subject: '', grade: '', price: '', description: '', teacher_id: '' });
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get('/teachers').then(r => setTeachers(r.data)).catch(() => {});
  }, []);

  function set(k: string, v: string) { setForm(p => ({ ...p, [k]: v })); }

  async function submit() {
    if (!form.title || !form.subject || !form.grade || !form.price || !form.teacher_id) {
      return Alert.alert('خطأ', 'كل الحقول مطلوبة');
    }
    setLoading(true);
    try {
      await api.post('/courses', { ...form, price: parseFloat(form.price) });
      Alert.alert('نجاح ✅', 'تم إضافة الكورس', [{ text: 'حسناً', onPress: () => navigation.goBack() }]);
    } catch (e: any) {
      Alert.alert('خطأ', e.response?.data?.error || 'فشل');
    } finally { setLoading(false); }
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>إضافة كورس جديد</Text>
      {[
        { k: 'title', l: 'عنوان الكورس *', p: 'مثال: رياضيات تانية ثانوي' },
        { k: 'subject', l: 'المادة *', p: 'مثال: رياضيات' },
        { k: 'grade', l: 'الصف *', p: 'مثال: الثاني الثانوي' },
        { k: 'price', l: 'السعر (جنيه) *', p: '500', num: true },
        { k: 'description', l: 'وصف', p: 'وصف اختياري...' },
      ].map(f => (
        <View key={f.k} style={styles.field}>
          <Text style={styles.label}>{f.l}</Text>
          <TextInput
            style={styles.input} placeholder={f.p} value={(form as any)[f.k]}
            onChangeText={v => set(f.k, v)} keyboardType={f.num ? 'numeric' : 'default'}
            textAlign="right" placeholderTextColor="#999"
          />
        </View>
      ))}
      <View style={styles.field}>
        <Text style={styles.label}>المدرس *</Text>
        <View style={styles.pickerWrap}>
          <Picker selectedValue={form.teacher_id} onValueChange={v => set('teacher_id', v)}>
            <Picker.Item label="اختر المدرس..." value="" />
            {teachers.map((t: any) => (
              <Picker.Item key={t.id} label={`${t.name} - ${t.subject}`} value={t.id.toString()} />
            ))}
          </Picker>
        </View>
      </View>
      <TouchableOpacity style={styles.btn} onPress={submit} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>حفظ الكورس</Text>}
      </TouchableOpacity>
    </ScrollView>
  );
}

// ==================== إضافة حصة ====================
export function AddSessionScreen({ route, navigation }: any) {
  const { course_id } = route.params;
  const [form, setForm] = useState({ title: '', date: new Date().toISOString().slice(0, 16), duration_minutes: '60', notes: '' });
  const [loading, setLoading] = useState(false);
  function set(k: string, v: string) { setForm(p => ({ ...p, [k]: v })); }

  async function submit() {
    if (!form.title || !form.date) return Alert.alert('خطأ', 'العنوان والتاريخ مطلوبان');
    setLoading(true);
    try {
      await api.post('/sessions', { ...form, course_id, duration_minutes: parseInt(form.duration_minutes) });
      Alert.alert('نجاح ✅', 'تمت إضافة الحصة', [{ text: 'حسناً', onPress: () => navigation.goBack() }]);
    } catch (e: any) {
      Alert.alert('خطأ', e.response?.data?.error || 'فشل');
    } finally { setLoading(false); }
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>إضافة حصة</Text>
      {[
        { k: 'title', l: 'عنوان الحصة *', p: 'مثال: الدرس الأول - المقدمة' },
        { k: 'date', l: 'التاريخ والوقت *', p: '2024-01-15T10:00' },
        { k: 'duration_minutes', l: 'المدة (دقيقة)', p: '60', num: true },
        { k: 'notes', l: 'ملاحظات', p: 'اختياري...' },
      ].map(f => (
        <View key={f.k} style={styles.field}>
          <Text style={styles.label}>{f.l}</Text>
          <TextInput
            style={styles.input} placeholder={f.p} value={(form as any)[f.k]}
            onChangeText={v => set(f.k, v)} keyboardType={f.num ? 'numeric' : 'default'}
            textAlign="right" placeholderTextColor="#999"
          />
        </View>
      ))}
      <TouchableOpacity style={styles.btn} onPress={submit} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>حفظ الحصة</Text>}
      </TouchableOpacity>
    </ScrollView>
  );
}

// ==================== إضافة دفعة ====================
export function AddPaymentScreen({ route, navigation }: any) {
  const course = route.params?.course;
  const [form, setForm] = useState({
    student_id: '', course_id: course?.id?.toString() || '', amount: '', method: 'cash', note: ''
  });
  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  function set(k: string, v: string) { setForm(p => ({ ...p, [k]: v })); }

  useEffect(() => {
    if (course?.id) {
      api.get(`/courses/${course.id}/students`).then(r => setStudents(r.data)).catch(() => {});
    } else {
      api.get('/students').then(r => setStudents(r.data)).catch(() => {});
      api.get('/courses').then(r => setCourses(r.data)).catch(() => {});
    }
  }, []);

  async function submit() {
    if (!form.student_id || !form.course_id || !form.amount) return Alert.alert('خطأ', 'كل الحقول مطلوبة');
    setLoading(true);
    try {
      await api.post('/payments', { ...form, amount: parseFloat(form.amount) });
      Alert.alert('نجاح ✅', 'تم تسجيل الدفعة', [{ text: 'حسناً', onPress: () => navigation.goBack() }]);
    } catch (e: any) {
      Alert.alert('خطأ', e.response?.data?.error || 'فشل');
    } finally { setLoading(false); }
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>تسجيل دفعة</Text>
      {course && <Text style={styles.subtitle}>الكورس: {course.title}</Text>}
      <View style={styles.field}>
        <Text style={styles.label}>الطالب *</Text>
        <View style={styles.pickerWrap}>
          <Picker selectedValue={form.student_id} onValueChange={v => set('student_id', v)}>
            <Picker.Item label="اختر الطالب..." value="" />
            {students.map((s: any) => (
              <Picker.Item key={s.id} label={`${s.name} - ${s.phone}`} value={s.id.toString()} />
            ))}
          </Picker>
        </View>
      </View>
      {!course && (
        <View style={styles.field}>
          <Text style={styles.label}>الكورس *</Text>
          <View style={styles.pickerWrap}>
            <Picker selectedValue={form.course_id} onValueChange={v => set('course_id', v)}>
              <Picker.Item label="اختر الكورس..." value="" />
              {courses.map((c: any) => (
                <Picker.Item key={c.id} label={c.title} value={c.id.toString()} />
              ))}
            </Picker>
          </View>
        </View>
      )}
      {[
        { k: 'amount', l: 'المبلغ (جنيه) *', p: '500', num: true },
        { k: 'note', l: 'ملاحظة', p: 'اختياري...' },
      ].map(f => (
        <View key={f.k} style={styles.field}>
          <Text style={styles.label}>{f.l}</Text>
          <TextInput
            style={styles.input} placeholder={f.p} value={(form as any)[f.k]}
            onChangeText={v => set(f.k, v)} keyboardType={f.num ? 'numeric' : 'default'}
            textAlign="right" placeholderTextColor="#999"
          />
        </View>
      ))}
      <View style={styles.field}>
        <Text style={styles.label}>طريقة الدفع</Text>
        <View style={styles.pickerWrap}>
          <Picker selectedValue={form.method} onValueChange={v => set('method', v)}>
            <Picker.Item label="كاش" value="cash" />
            <Picker.Item label="تحويل" value="transfer" />
            <Picker.Item label="فوري" value="fawry" />
          </Picker>
        </View>
      </View>
      <TouchableOpacity style={styles.btn} onPress={submit} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>تسجيل الدفعة</Text>}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5', padding: 16 },
  title: { fontSize: 22, fontWeight: 'bold', color: '#1a73e8', textAlign: 'center', marginBottom: 8 },
  subtitle: { fontSize: 15, color: '#555', textAlign: 'center', marginBottom: 16 },
  field: { marginBottom: 14 },
  label: { fontSize: 14, color: '#555', textAlign: 'right', marginBottom: 6 },
  input: {
    backgroundColor: '#fff', borderRadius: 10, padding: 14,
    fontSize: 15, borderWidth: 1, borderColor: '#e0e0e0', elevation: 1
  },
  pickerWrap: { backgroundColor: '#fff', borderRadius: 10, borderWidth: 1, borderColor: '#e0e0e0', overflow: 'hidden' },
  btn: { backgroundColor: '#1a73e8', padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 10, marginBottom: 30 },
  btnText: { color: '#fff', fontSize: 17, fontWeight: 'bold' },
});
