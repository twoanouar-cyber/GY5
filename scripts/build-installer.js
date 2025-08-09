const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 بدء عملية بناء المثبت...');

try {
  // تنظيف المجلدات السابقة
  console.log('🧹 تنظيف المجلدات السابقة...');
  if (fs.existsSync('dist')) {
    execSync('rm -rf dist', { stdio: 'inherit' });
  }
  if (fs.existsSync('dist-electron')) {
    execSync('rm -rf dist-electron', { stdio: 'inherit' });
  }

  // التأكد من وجود مجلد build-resources
  if (!fs.existsSync('build-resources')) {
    fs.mkdirSync('build-resources', { recursive: true });
    console.log('📁 تم إنشاء مجلد build-resources');
  }

  // إنشاء أيقونة افتراضية إذا لم تكن موجودة
  const iconPath = path.join('build-resources', 'icon.ico');
  if (!fs.existsSync(iconPath)) {
    console.log('⚠️  لم يتم العثور على أيقونة، سيتم استخدام الأيقونة الافتراضية');
    // إنشاء ملف نائب للأيقونة
    fs.writeFileSync(iconPath + '.txt', 'ضع ملف icon.ico هنا');
  }

  // بناء التطبيق
  console.log('🔨 بناء التطبيق...');
  execSync('npm run build', { stdio: 'inherit' });

  // التحقق من وجود الملفات المطلوبة
  console.log('✅ التحقق من الملفات...');
  const requiredFiles = [
    'dist/index.html',
    'electron/main.cjs',
    'electron/preload.cjs',
    'electron/database.cjs'
  ];

  for (const file of requiredFiles) {
    if (!fs.existsSync(file)) {
      throw new Error(`الملف المطلوب غير موجود: ${file}`);
    }
  }

  // إنشاء المثبت
  console.log('📦 إنشاء المثبت...');
  execSync('npx electron-builder --config electron-builder.json --publish=never', { 
    stdio: 'inherit',
    env: { ...process.env, NODE_ENV: 'production' }
  });

  console.log('✅ تم إنشاء المثبت بنجاح!');
  console.log('📁 يمكنك العثور على ملف المثبت في مجلد: dist-electron/');
  
  // عرض معلومات الملفات المنشأة
  if (fs.existsSync('dist-electron')) {
    const files = fs.readdirSync('dist-electron');
    console.log('\n📋 الملفات المنشأة:');
    files.forEach(file => {
      const filePath = path.join('dist-electron', file);
      const stats = fs.statSync(filePath);
      const sizeInMB = (stats.size / (1024 * 1024)).toFixed(2);
      console.log(`   - ${file} (${sizeInMB} MB)`);
    });
  }

} catch (error) {
  console.error('❌ خطأ في عملية البناء:', error.message);
  
  // معلومات إضافية للمساعدة في التشخيص
  console.log('\n🔍 معلومات التشخيص:');
  console.log('- تأكد من وجود Node.js و npm');
  console.log('- تأكد من تثبيت جميع التبعيات: npm install');
  console.log('- تأكد من وجود ملف icon.ico في مجلد build-resources');
  
  process.exit(1);
}