import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useAuth } from '../context/AuthContext';

import LoginScreen from '../screens/LoginScreen';
import DashboardScreen from '../screens/DashboardScreen';
import StudentsScreen from '../screens/StudentsScreen';
import StudentDetailsScreen from '../screens/StudentDetailsScreen';
import AddStudentScreen from '../screens/AddStudentScreen';
import TeachersScreen from '../screens/TeachersScreen';
import CoursesScreen from '../screens/CoursesScreen';
import CourseDetailsScreen from '../screens/CourseDetailsScreen';
import SessionDetailsScreen from '../screens/SessionDetailsScreen';
import PaymentsScreen from '../screens/PaymentsScreen';
import VideoPlayerScreen from '../screens/VideoPlayerScreen';
import { AddCourseScreen, AddSessionScreen, AddPaymentScreen } from '../screens/FormScreens';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function MainTabs() {
  const { user } = useAuth();
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: '#1a73e8',
        tabBarInactiveTintColor: '#999',
        tabBarStyle: { paddingBottom: 5 },
        headerShown: false,
      }}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen}
        options={{ title: 'الرئيسية', tabBarIcon: ({ color }) => <TabIcon icon="🏠" color={color} /> }} />
      <Tab.Screen name="Students" component={StudentsScreen}
        options={{ title: 'الطلاب', tabBarIcon: ({ color }) => <TabIcon icon="👨‍🎓" color={color} /> }} />
      {user?.role !== 'student' && (
        <Tab.Screen name="Teachers" component={TeachersScreen}
          options={{ title: 'المدرسين', tabBarIcon: ({ color }) => <TabIcon icon="👨‍🏫" color={color} /> }} />
      )}
      <Tab.Screen name="Courses" component={CoursesScreen}
        options={{ title: 'الكورسات', tabBarIcon: ({ color }) => <TabIcon icon="📖" color={color} /> }} />
      {user?.role !== 'student' && (
        <Tab.Screen name="Payments" component={PaymentsScreen}
          options={{ title: 'المدفوعات', tabBarIcon: ({ color }) => <TabIcon icon="💳" color={color} /> }} />
      )}
    </Tab.Navigator>
  );
}

function TabIcon({ icon, color }: { icon: string; color: string }) {
  const { Text } = require('react-native');
  return <Text style={{ fontSize: 20, opacity: color === '#1a73e8' ? 1 : 0.5 }}>{icon}</Text>;
}

export default function AppNavigator() {
  const { user, loading } = useAuth();

  if (loading) {
    const { ActivityIndicator, View } = require('react-native');
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#1a73e8" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerStyle: { backgroundColor: '#1a73e8' },
          headerTintColor: '#fff',
          headerTitleStyle: { fontWeight: 'bold' },
          contentStyle: { backgroundColor: '#f5f5f5' },
        }}
      >
        {!user ? (
          <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
        ) : (
          <>
            <Stack.Screen name="Main" component={MainTabs} options={{ headerShown: false }} />
            <Stack.Screen name="StudentDetails" component={StudentDetailsScreen} options={{ title: 'بيانات الطالب' }} />
            <Stack.Screen name="AddStudent" component={AddStudentScreen} options={{ title: 'طالب جديد' }} />
            <Stack.Screen name="TeacherDetails" component={TeachersScreen} options={{ title: 'بيانات المدرس' }} />
            <Stack.Screen name="CourseDetails" component={CourseDetailsScreen} options={{ title: 'تفاصيل الكورس' }} />
            <Stack.Screen name="AddCourse" component={AddCourseScreen} options={{ title: 'كورس جديد' }} />
            <Stack.Screen name="SessionDetails" component={SessionDetailsScreen} options={{ title: 'تفاصيل الحصة' }} />
            <Stack.Screen name="AddSession" component={AddSessionScreen} options={{ title: 'حصة جديدة' }} />
            <Stack.Screen name="AddPayment" component={AddPaymentScreen} options={{ title: 'تسجيل دفعة' }} />
            <Stack.Screen name="VideoPlayer" component={VideoPlayerScreen} options={{ title: 'مشاهدة الفيديو', headerStyle: { backgroundColor: '#000' } }} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
