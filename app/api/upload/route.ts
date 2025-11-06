import { NextRequest, NextResponse } from 'next/server';
import cloudinary from '@/lib/cloudinary';

export async function POST(request: NextRequest) {
  try {
    const data = await request.formData();
    const file: File | null = data.get('file') as unknown as File;

    if (!file) {
      return NextResponse.json({ success: false, error: 'No file uploaded' });
    }

    // Ambil folder path dari request (opsional)
    // Default: 'SOA/Post' jika tidak ada folder yang dispesifikkan
    const folderPath = (data.get('folder') as string) || 'SOA/Post';

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Upload ke Cloudinary
    const result = await new Promise<any>((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          folder: folderPath, // folder dinamis di Cloudinary
          resource_type: 'auto', // auto-detect tipe file
          // Optional: tambahkan transformasi untuk optimasi
          // transformation: [
          //   { quality: 'auto', fetch_format: 'auto' }
          // ]
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      ).end(buffer);
    });

    console.log(`File uploaded to Cloudinary (${folderPath}):`, result.secure_url);

    // Return URL yang sama formatnya dengan kode lama
    const imageUrl = result.secure_url;

    return NextResponse.json({ success: true, imageUrl });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { success: false, error: 'Upload failed' },
      { status: 500 }
    );
  }
}