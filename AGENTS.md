# 📚 مشروع سنتر الدروس (Center App)

## ملخص المشروع
تطبيق **React Native (Expo bare workflow) APK** + **Node.js Express backend** مع **SQLite** لإدارة سنتر تعليمي (مدرسين، طلاب، كورسات، حصص، مدفوعات، فيديوهات، حضور).

---

## المسارات المهمة

| المسار | الوصف |
|--------|-------|
| `D:\app` | المجلد الرئيسي |
| `D:\app\backend` | الباكند (Express + sql.js) |
| `D:\app\mobile` | الموبايل (React Native Expo) |
| `D:\app\mobile\android` | مشروع Android الأصلي (مولّد) |
| `D:\app\run.bat` | لوحة التحكم (تشغيل/بناء) |
| `D:\app\AGENTS.md` | هذا الملف |

---

## التقنيات المستخدمة

### Backend (`D:\app\backend`)
- **Express** 4.18 - إطار العمل
- **sql.js** 1.10 - SQLite (JavaScript pure، مش محتاج Python/MSVC)
- **bcryptjs** - تشفير كلمات المرور
- **jsonwebtoken** - JWT authentication
- **multer** - رفع الملفات (فيديوهات)
- **cors** - Cross-Origin
- **dotenv** - إعدادات البيئة

### Mobile (`D:\app\mobile`)
- **React Native** 0.74.5
- **Expo** ~51.0
- **React Navigation** 6 (NativeStack + BottomTabs)
- **Expo AV** - تشغيل الفيديو
- **Axios** - HTTP client
- **AsyncStorage** - تخزين محلي
- **react-native-paper** - UI components
- **@react-native-picker/picker** - اختيار من قائمة

---

## قاعدة البيانات (SQLite)

### الجداول

| الجدول | الوصف |
|--------|-------|
| `users` | المستخدمون (admin/teacher/student) |
| `teachers` | بيانات المدرسين (subject, bio) |
| `students` | بيانات الطلاب (grade, parent_phone) |
| `courses` | الكورسات (teacher_id, title, subject, grade, price) |
| `sessions` | الحصص (course_id, title, date, duration) |
| `enrollments` | تسجيل الطلاب في الكورسات |
| `attendance` | سجل الحضور (present/absent/late) |
| `payments` | المدفوعات (amount, method, note) |
| `videos` | الفيديوهات المرفوعة (course_id, filename) |

### حسابات افتراضية

| الهاتف | كلمة المرور | الصلاحية |
|--------|-------------|----------|
| `01000000000` | `admin123` | admin |
| (يُضاف يدويًا) | (يُضاف يدويًا) | teacher |
| (يُضاف يدويًا) | (يُضاف يدويًا) | student |

---

## API Endpoints

### Auth
- `POST /api/auth/login` - تسجيل دخول (phone, password)
- `POST /api/auth/register` - إضافة مستخدم (admin فقط)
- `GET /api/auth/me` - بيانات المستخدم الحالي

### Students
- `GET /api/students` - كل الطلاب
- `GET /api/students/:id` - بيانات طالب
- `GET /api/students/:id/courses` - كورسات الطالب
- `GET /api/students/:id/payments` - مدفوعات الطالب
- `GET /api/students/:id/attendance` - حضور الطالب
- `POST /api/students/:id/enroll` - تسجيل طالب في كورس

### Teachers
- `GET /api/teachers` - كل المدرسين
- `GET /api/teachers/:id` - بيانات مدرس
- `GET /api/teachers/:id/courses` - كورسات المدرس
- `PUT /api/teachers/:id` - تعديل بيانات المدرس

### Courses
- `GET /api/courses` - كل الكورسات
- `GET /api/courses/:id` - تفاصيل كورس
- `GET /api/courses/:id/students` - طلاب الكورس
- `GET /api/courses/:id/sessions` - حصص الكورس
- `GET /api/courses/:id/videos` - فيديوهات الكورس
- `POST /api/courses` - إضافة كورس
- `PUT /api/courses/:id` - تعديل كورس
- `DELETE /api/courses/:id` - حذف كورس

### Sessions
- `POST /api/sessions` - إضافة حصة
- `GET /api/sessions/:id` - تفاصيل حصة مع الحضور
- `PUT /api/sessions/:id/attendance` - تحديث حضور طالب
- `PUT /api/sessions/:id/attendance/bulk` - تحديث حضور جماعي
- `DELETE /api/sessions/:id` - حذف حصة

### Payments
- `GET /api/payments` - كل المدفوعات (آخر 100)
- `POST /api/payments` - إضافة دفعة
- `GET /api/payments/course/:course_id/summary` - ملخص مدفوعات كورس
- `GET /api/payments/stats` - إحصائيات عامة (للداشبورد)
- `DELETE /api/payments/:id` - حذف دفعة

### Videos
- `POST /api/videos/upload` - رفع فيديو (multipart, حد أقصى 500MB)
- `DELETE /api/videos/:id` - حذف فيديو

---

## شاشات الموبايل

### شاشات رئيسية
1. **LoginScreen** - تسجيل الدخول (رقم هاتف + كلمة مرور)
2. **DashboardScreen** - لوحة التحكم الرئيسية (إحصائيات، إجراءات سريعة)
3. **StudentsScreen** - قائمة الطلاب (بحث، تصفية)
4. **StudentDetailsScreen** - بيانات طالب (كورساته، مدفوعاته، حضوره)
5. **AddStudentScreen** - إضافة طالب جديد
6. **TeachersScreen** - قائمة المدرسين
7. **CoursesScreen** - قائمة الكورسات
8. **CourseDetailsScreen** - تفاصيل كورس (الطلاب، الحصص، الفيديوهات)
9. **SessionDetailsScreen** - تفاصيل حصة مع نظام الحضور
10. **PaymentsScreen** - المدفوعات
11. **VideoPlayerScreen** - تشغيل الفيديو
12. **FormScreens** - نماذج الإضافة (كورس، حصة، دفعة)

### نظام صلاحيات
- **admin** - كل الصلاحيات (إدارة طلاب، مدرسين، كورسات، مدفوعات)
- **teacher** - إدارة الكورسات والحصص والطلاب
- **student** - عرض فقط (ما عدا بعض الشاشات مخفية)

---

## الملفات الأساسية

### Backend
| الملف | الوظيفة |
|-------|---------|
| `src/index.js` | نقطة البداية، تهيئة Express و DB |
| `src/db/database.js` | قاعدة البيانات (sql.js wrapper) |
| `src/middleware/auth.js` | JWT middleware (auth, adminOnly, teacherOrAdmin) |
| `src/routes/auth.js` | API المصادقة |
| `src/routes/students.js` | API الطلاب |
| `src/routes/teachers.js` | API المدرسين |
| `src/routes/courses.js` | API الكورسات |
| `src/routes/sessions.js` | API الحصص والحضور |
| `src/routes/payments.js` | API المدفوعات والإحصائيات |
| `src/routes/videos.js` | API رفع وعرض الفيديوهات |

### Mobile
| الملف | الوظيفة |
|-------|---------|
| `App.tsx` | نقطة البداية (AuthProvider + AppNavigator) |
| `src/api/config.ts` | إعدادات Axios (BASE_URL, interceptors) |
| `src/context/AuthContext.tsx` | سياق المصادقة (login, logout, token) |
| `src/navigation/AppNavigator.tsx` | التنقل (NativeStack + BottomTabs) |
| `src/screens/*.tsx` | كل شاشات التطبيق |

---

## الإعدادات البيئية

### Backend (`.env`)
```
PORT=3000
JWT_SECRET=center_super_secret_key_2024
```

### Mobile (`src/api/config.ts`)
```typescript
export const BASE_URL = 'http://192.168.1.10:3000'; // غيّر IP جهازك
```

### Android Network Security
`android/app/src/main/res/xml/network_security_config.xml` - يسمح بـ HTTP لـ:
- `192.168.1.10` (السيرفر المحلي)
- `10.0.2.2` (Android Emulator)
- `localhost`

---

## أوامر التشغيل

### استخدام `run.bat`
```
[1] تشغيل السيرفر
[2] بناء APK (Release)
[3] تشغيل Expo Metro
[4] تحديث IP تلقائيًا
[5] تنظيف الكاش
[6] تثبيت الحزم
```

### يدويًا
```powershell
# تشغيل الباكند
cd D:\app\backend
node src/index.js

# تشغيل Expo
cd D:\app\mobile
npx expo start

# بناء APK
$env:JAVA_HOME = "C:\Program Files\Android\Android Studio\jbr"
cd D:\app\mobile\android
.\gradlew assembleRelease -x lint -x test
```

---

## التعديلات المنجزة

1. **Sql.js بدل better-sqlite3** - عشان يشتغل من غير Python/MSVC build tools
2. **database.js wrapper** - يحاكي API بتاع better-sqlite3 (prepare/get/all/run) باستخدام sql.js
3. **async startup** - `index.js` يستخدم `async start()` عشان ينتظر تهيئة sql.js
4. **network_security_config.xml** - يسمح بـ HTTP على Android 9+
5. **AndroidManifest.xml** - إضافة `networkSecurityConfig` و `usesCleartextTraffic`
6. **local.properties** - sdk.dir = مسار Android SDK
7. **expo prebuild** - توليد مشروع Android الأصلي
8. **Asset placeholders** - icon.png, splash.png, adaptive-icon.png
9. **run.bat + README paths** - تحديث D:\app2 → D:\app
10. **app.json** - إزالة config plugin @react-native-async-storage

---

## ملاحظات للـ AI

- كل ملفات الـ routes في الباكند بتستخدم `db.prepare(sql).get/run/all(params)` - دا wrapper حوالين sql.js
- `api/config.ts` فيه `BASE_URL` - غيّره لـ IP السيرفر
- الـ APK release بيستخدم debug.keystore (مش production-ready)
- السيرفر يبدأ على `0.0.0.0:3000` عشان يكون accessible من الأجهزة على نفس الشبكة
- الموبايل يستخدم Expo bare workflow (مش Expo Go) - عشان الـ native modules
- FormScreens.tsx بيستخدم `@react-native-picker/picker` (اتركبه اثناء prebuild)
