# 📚 تطبيق سنتر الدروس

## هيكل المشروع
```
D:\app\
├── backend\          ← السيرفر (Node.js + SQLite)
│   ├── src\
│   │   ├── index.js
│   │   ├── db\database.js
│   │   ├── middleware\auth.js
│   │   └── routes\
│   │       ├── auth.js
│   │       ├── students.js
│   │       ├── teachers.js
│   │       ├── courses.js
│   │       ├── sessions.js
│   │       ├── payments.js
│   │       └── videos.js
│   ├── package.json
│   └── .env
├── mobile\           ← التطبيق (React Native Expo)
│   ├── src\
│   │   ├── api\config.ts
│   │   ├── context\AuthContext.tsx
│   │   ├── navigation\AppNavigator.tsx
│   │   └── screens\
│   │       ├── LoginScreen.tsx
│   │       ├── DashboardScreen.tsx
│   │       ├── StudentsScreen.tsx
│   │       ├── StudentDetailsScreen.tsx
│   │       ├── AddStudentScreen.tsx
│   │       ├── TeachersScreen.tsx
│   │       ├── CoursesScreen.tsx
│   │       ├── CourseDetailsScreen.tsx
│   │       ├── SessionDetailsScreen.tsx
│   │       ├── PaymentsScreen.tsx
│   │       ├── VideoPlayerScreen.tsx
│   │       └── FormScreens.tsx
│   ├── App.tsx
│   ├── app.json
│   └── package.json
└── run.bat           ← لوحة التحكم
```

## 🚀 خطوات التشغيل

### أول مرة:
1. افتح `run.bat`
2. اختر **[6]** لتثبيت الحزم
3. اختر **[4]** لتحديث الـ IP
4. اختر **[1]** لتشغيل السيرفر

### للتطوير:
- اختر **[3]** لتشغيل Expo وامسح QR من هاتفك

### لبناء APK:
- اختر **[2]** وانتظر 5-7 دقايق

## 🔐 بيانات الدخول الافتراضية
- **الهاتف:** 01000000000
- **كلمة المرور:** admin123
- **الدور:** مدير

## 📋 الميزات
- ✅ إدارة الطلاب (إضافة، بيانات، حضور، مدفوعات)
- ✅ إدارة المدرسين والكورسات
- ✅ تسجيل الحضور للحصص
- ✅ نظام المدفوعات الكامل
- ✅ رفع ومشاهدة الفيديوهات
- ✅ Dashboard مع إحصائيات
- ✅ صلاحيات (مدير / مدرس / طالب)

## ⚙️ API Endpoints
- POST /api/auth/login
- POST /api/auth/register
- GET  /api/students
- GET  /api/teachers
- GET  /api/courses
- POST /api/sessions
- POST /api/payments
- POST /api/videos/upload
- GET  /api/payments/stats
