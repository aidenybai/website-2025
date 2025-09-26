import { readFile } from 'node:fs/promises';

const BUNDLE_PATH = process.env.BUNDLE_PATH as string;

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    const file = await readFile(BUNDLE_PATH);

    return new Response(file.toString('utf8'), {
      headers: {
        'Content-Type': 'application/javascript',
        'Cache-Control': 'no-store, no-cache, must-revalidate',
        Pragma: 'no-cache',
        Expires: '0',
      },
    });
  } catch (error) {
    if (
      error instanceof Error &&
      (error as NodeJS.ErrnoException).code === 'ENOENT'
    ) {
      return new Response('Not Found', { status: 404 });
    }

    console.error('Failed to load library bundle', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}
