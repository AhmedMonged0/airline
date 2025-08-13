@echo off
echo 🚀 Starting quick deployment...

echo 📦 Updating build version...
npm run deploy

echo 📤 Pushing to GitHub...
git add .
git commit -m "Quick deploy - %date% %time%"
git push origin main

echo ✅ Deployment triggered!
echo 🌐 Check your Vercel dashboard for deployment status
pause