@echo off
title 📚 لوحة التحكم الشاملة - تطبيق سنتر الدروس
chcp 65001 > nul
setlocal enabledelayedexpansion

set "JAVA_HOME=C:\Program Files\Android\Android Studio\jbr"
set "ANDROID_HOME=C:\Users\boda_\AppData\Local\Android\Sdk"
set "ANDROID_SDK_ROOT=C:\Users\boda_\AppData\Local\Android\Sdk"
set "PATH=%JAVA_HOME%\bin;%PATH%"
set "PROJECT_ROOT=D:\app"

:menu
cls
echo ==========================================================
echo           📚 لوحة التحكم الشاملة - تطبيق سنتر الدروس     
echo ==========================================================
echo.
echo  [1] 🚀 تشغيل السيرفر وقاعدة البيانات (Backend)
echo  [2] 📱 بناء APK مستقل تماماً (Standalone Release APK)
echo  [3] 📡 تشغيل خادم Expo Metro (للتطوير المباشر)
echo  [4] 🌐 تشغيل موقع الويب (Vite Dev Mode)
echo  [5] 🏗️ بناء موقع الويب (Production Build)
echo  [6] 🔄 تحديث عنوان الـ IP تلقائياً في التطبيق
echo  [7] 🧼 تنظيف الذاكرة المؤقتة (Clean Cache)
echo  [8] 📥 تثبيت حزم Node (NPM Install)
echo  [9] ❌ خروج
echo.
echo ==========================================================
set /p choice="اختر رقم الإجراء (1-9): "

if "%choice%"=="1" goto start_backend
if "%choice%"=="2" goto build_release_apk
if "%choice%"=="3" goto start_expo
if "%choice%"=="4" goto start_web
if "%choice%"=="5" goto build_web
if "%choice%"=="6" goto update_ip
if "%choice%"=="7" goto clean_project
if "%choice%"=="8" goto install_dependencies
if "%choice%"=="9" exit
goto menu

:start_backend
cls
echo 🚀 جاري تشغيل السيرفر...
cd /d "%PROJECT_ROOT%\backend"
if not exist "node_modules" (
    echo 📥 تثبيت الحزم أولاً...
    call npm install
)
start "Center Backend Server" cmd /k "node src/index.js"
echo ✅ السيرفر شغال على: http://localhost:3000
echo.
echo بيانات الدخول الافتراضية:
echo الهاتف: 01000000000
echo كلمة المرور: admin123
pause
goto menu

:build_release_apk
cls
echo 📱 جاري بناء APK...
echo قد يستغرق 3-7 دقائق...
echo.
cd /d "%PROJECT_ROOT%\mobile\android"
call .\gradlew assembleRelease -x lint -x test
if %ERRORLEVEL% EQU 0 (
    echo.
    echo ✅ تم البناء بنجاح!
    echo.
echo مسار الـ APK:
echo D:\app\mobile\android\app\build\outputs\apk\release\app-release.apk
) else (
    echo ❌ فشل البناء، راجع الأخطاء أعلاه
)
pause
goto menu

:start_expo
cls
echo 📡 جاري تشغيل Expo Metro...
cd /d "%PROJECT_ROOT%\mobile"
start "Expo Metro Bundler" cmd /k "npx expo start"
echo ✅ Expo شغال! امسح QR من تطبيق Expo Go
pause
goto menu

:start_web
cls
echo 🌐 جاري تشغيل موقع الويب (Vite Dev Mode)...
cd /d "%PROJECT_ROOT%\web"
start "Center Website" cmd /k "npx vite --host 0.0.0.0"
echo ✅ موقع الويب قيد التشغيل على: http://localhost:5173
pause
goto menu

:build_web
cls
echo 🏗️ جاري بناء موقع الويب...
cd /d "%PROJECT_ROOT%\web"
call npm run build
echo ✅ تم البناء! الملفات في: web\dist
echo يمكنك الآن تشغيل السيرفر وسيخدم الموقع تلقائياً
pause
goto menu

:update_ip
cls
echo 🔄 جاري الكشف عن IP الجهاز...
for /f "tokens=4" %%a in ('route print ^| find " 0.0.0.0 "') do (
    set "MY_IP=%%a"
)
if "%MY_IP%"=="" (
    for /f "usebackq tokens=*" %%i in (`powershell -Command "Get-NetIPAddress -InterfaceAlias 'Wi-Fi' -AddressFamily IPv4 | Select-Object -ExpandProperty IPAddress"`) do (
        set "MY_IP=%%i"
    )
)
echo.
echo IP الجهاز: %MY_IP%
echo.
set /p confirm="تحديث ملف config.ts بهذا الـ IP؟ (y/n): "
if /i "%confirm%"=="y" (
    powershell -Command "(Get-Content '%PROJECT_ROOT%\mobile\src\api\config.ts') -replace '192\.168\.\d+\.\d+', '%MY_IP%' | Set-Content '%PROJECT_ROOT%\mobile\src\api\config.ts'"
    echo ✅ تم تحديث IP إلى %MY_IP%
)
pause
goto menu

:clean_project
cls
echo 🧼 تنظيف المشروع...
cd /d "%PROJECT_ROOT%\mobile\android"
call .\gradlew clean
cd /d "%PROJECT_ROOT%\mobile"
if exist ".expo" rmdir /s /q ".expo"
if exist "node_modules\.cache" rmdir /s /q "node_modules\.cache"
echo ✅ تم التنظيف بنجاح!
pause
goto menu

:install_dependencies
cls
echo 📥 تثبيت الحزم...
echo.
echo [1/2] Backend...
cd /d "%PROJECT_ROOT%\backend"
call npm install
echo.
echo [2/2] Mobile...
cd /d "%PROJECT_ROOT%\mobile"
call npm install
echo ✅ تم تثبيت كل الحزم!
pause
goto menu
