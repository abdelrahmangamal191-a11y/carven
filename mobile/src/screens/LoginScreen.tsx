import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, Alert, ActivityIndicator, KeyboardAvoidingView, Platform
} from 'react-native';
import { useAuth } from '../context/AuthContext';

export default function LoginScreen() {
  const { login } = useAuth();
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    if (!phone || !password) {
      Alert.alert('خطأ', 'أدخل رقم الهاتف وكلمة المرور');
      return;
    }
    setLoading(true);
    try {
      await login(phone, password);
    } catch (e: any) {
      Alert.alert('خطأ', e.response?.data?.error || 'فشل تسجيل الدخول');
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.card}>
        <Text style={styles.logo}>📚</Text>
        <Text style={styles.title}>سنتر الدروس</Text>
        <Text style={styles.subtitle}>تسجيل الدخول</Text>

        <TextInput
          style={styles.input}
          placeholder="رقم الهاتف"
          value={phone}
          onChangeText={setPhone}
          keyboardType="phone-pad"
          textAlign="right"
          placeholderTextColor="#999"
        />
        <TextInput
          style={styles.input}
          placeholder="كلمة المرور"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          textAlign="right"
          placeholderTextColor="#999"
        />

        <TouchableOpacity style={styles.btn} onPress={handleLogin} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>دخول</Text>}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1a73e8', justifyContent: 'center', padding: 20 },
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 30, elevation: 5 },
  logo: { textAlign: 'center', fontSize: 60 },
  title: { textAlign: 'center', fontSize: 26, fontWeight: 'bold', color: '#1a73e8', marginTop: 8 },
  subtitle: { textAlign: 'center', color: '#666', marginBottom: 24, fontSize: 16 },
  input: {
    borderWidth: 1, borderColor: '#ddd', borderRadius: 10,
    padding: 14, marginBottom: 14, fontSize: 15, backgroundColor: '#f9f9f9'
  },
  btn: {
    backgroundColor: '#1a73e8', padding: 16, borderRadius: 10,
    alignItems: 'center', marginTop: 6
  },
  btnText: { color: '#fff', fontSize: 17, fontWeight: 'bold' },
});
