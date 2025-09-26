import { NextResponse } from 'next/server';
import { readFile } from 'node:fs/promises';

const BUNDLE_PATH =
  '/Users/aidenybai/Projects/toolbar/packages/toolbar/dist/index.global.js';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    const file = await readFile(BUNDLE_PATH);

    return new Response(file, {
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

    console.error('Failed to load toolbar bundle', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
