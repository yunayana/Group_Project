import { promises as fs } from 'fs';
import path from 'path';

export const runtime = 'nodejs';
export const contentType = 'image/png';

export default async function Icon() {
  try {
    const filepath = path.join(process.cwd(), 'public', 'images', 'logo.png');
    const imageBuffer = await fs.readFile(filepath);
    return new Response(imageBuffer, {
      headers: {
        'Content-Type': 'image/png',
      },
    });
  } catch (error) {
    console.error('Favicon load error:', error);
    return new Response('Not found', { status: 404 });
  }
}
