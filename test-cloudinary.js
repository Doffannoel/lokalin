const cloudinary = require('cloudinary').v2;
require('dotenv').config({ path: '.env.local' });

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

async function testConnection() {
  try {
    // Cek apakah env variables terbaca
    console.log('🔍 Checking credentials...');
    console.log('Cloud Name:', process.env.CLOUDINARY_CLOUD_NAME ? '✅ Set' : '❌ Not set');
    console.log('API Key:', process.env.CLOUDINARY_API_KEY ? '✅ Set' : '❌ Not set');
    console.log('API Secret:', process.env.CLOUDINARY_API_SECRET ? '✅ Set' : '❌ Not set');
    console.log('');
    
    console.log('🔌 Testing connection...');
    const result = await cloudinary.api.ping();
    console.log('✅ Cloudinary terhubung!');
    console.log('Status:', result.status);
    console.log('');
    
    // Test upload
    console.log('📤 Testing upload...');
    const upload = await cloudinary.uploader.upload(
      'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
      { folder: 'test' }
    );
    console.log('✅ Upload berhasil!');
    console.log('URL:', upload.secure_url);
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Full error:', error);
  }
}

testConnection();