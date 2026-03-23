import { NextResponse } from 'next/server';
import { readData } from '@/lib/db';

export async function GET() {
  try {
    const data = await readData();
    return NextResponse.json(data.clients);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch clients' }, { status: 500 });
  }
}
