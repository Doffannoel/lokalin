
import { NextRequest, NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import { join } from 'path';

export async function POST(request: NextRequest) {
  const data = await request.formData();
  const file: File | null = data.get('file') as unknown as File;

  if (!file) {
    return NextResponse.json({ success: false, error: 'No file uploaded' });
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  // Create uploads directory if it doesn't exist
  const uploadsDir = join(process.cwd(), 'public', 'uploads');
  try {
    await require('fs').promises.mkdir(uploadsDir, { recursive: true });
  } catch (e) {
    // ignore if it already exists
  }

  const filename = `${Date.now()}-${file.name}`;
  const path = join(uploadsDir, filename);
  await writeFile(path, buffer);
  console.log(`open ${path} to see the uploaded file`);

  const imageUrl = `/uploads/${filename}`;

  return NextResponse.json({ success: true, imageUrl });
}
