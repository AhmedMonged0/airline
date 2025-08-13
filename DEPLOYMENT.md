# Vercel Deployment Guide

## التغييرات المطلوبة للـ Deployment على Vercel

### 1. ملفات تم تعديلها:
- `vercel.json` - إعداد Vercel configuration
- `package.json` - إضافة engines و vercel-build script
- `server.js` - تعديل app.listen للـ production
- `backend/config/database.js` - تعديل مسار database للـ production
- `api/index.js` - إنشاء entry point للـ serverless function

### 2. ملفات تم إنشاؤها:
- `.vercelignore` - تجاهل الملفات غير المطلوبة
- `api/index.js` - Serverless function entry point

### 3. خطوات الـ Deployment:

1. **رفع الكود على GitHub:**
   ```bash
   git add .
   git commit -m "Configure for Vercel deployment"
   git push origin main
   ```

2. **ربط المشروع بـ Vercel:**
   - اذهب إلى [vercel.com](https://vercel.com)
   - اربط حسابك بـ GitHub
   - اختر المشروع من GitHub
   - اضغط Deploy

3. **إعداد Environment Variables في Vercel:**
   - اذهب إلى Project Settings > Environment Variables
   - أضف المتغيرات التالية:
     ```
     NODE_ENV=production
     JWT_SECRET=your-super-secret-jwt-key-here
     EMAIL_HOST=smtp.gmail.com
     EMAIL_PORT=587
     EMAIL_USER=your-email@gmail.com
     EMAIL_PASS=your-app-password
     COMPANY_NAME=شركة الطيران العربية
     COMPANY_EMAIL=info@airline.com
     COMPANY_PHONE=+966-11-123-4567
     COMPANY_ADDRESS=الرياض، المملكة العربية السعودية
     ```

### 4. ملاحظات مهمة:

- **Database:** SQLite يعمل في `/tmp` على Vercel (مؤقت)
- **للـ Production الحقيقي:** استخدم database خارجي مثل:
  - PlanetScale (MySQL)
  - Supabase (PostgreSQL)
  - MongoDB Atlas

### 5. اختبار الـ Deployment:
بعد الـ deployment، تأكد من:
- الصفحة الرئيسية تعمل
- الـ API endpoints تعمل
- الـ static files (CSS, JS, Images) تحمل بشكل صحيح

### 6. إذا واجهت مشاكل:
- تحقق من Vercel Function Logs
- تأكد من أن جميع dependencies موجودة في package.json
- تأكد من أن Environment Variables مضبوطة صح