import { put, list } from '@vercel/blob';
import { NextResponse } from 'next/server';

// POST - Save feedback from client form
export async function POST(request) {
  try {
    const data = await request.json();

    if (!data.clientName) {
      return NextResponse.json({ error: 'Client name required' }, { status: 400 });
    }

    // Add server timestamp
    data.submittedAt = new Date().toISOString();

    // Create a unique filename: feedback/Smith/2026-02-12T...json
    const lastName = data.clientName.trim().split(/\s+/).pop() || 'unknown';
    const timestamp = Date.now();
    const pathname = `feedback/${lastName}/${timestamp}.json`;

    const blob = await put(pathname, JSON.stringify(data, null, 2), {
      access: 'public',
      contentType: 'application/json',
      addRandomSuffix: false,
      allowOverwrite: true,
    });

    return NextResponse.json({ success: true, url: blob.url, pathname: blob.pathname });
  } catch (err) {
    console.error('Feedback save error:', err);
    return NextResponse.json({ error: 'Failed to save feedback' }, { status: 500 });
  }
}

// GET - Retrieve feedback for a client (used by the meal planning app)
// Usage: GET /api/feedback?client=Smith
// Or: GET /api/feedback (returns all)
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const clientFilter = searchParams.get('client');
    const prefix = clientFilter ? `feedback/${clientFilter}/` : 'feedback/';

    const { blobs } = await list({ prefix });

    // Fetch the actual JSON content of each blob
    const feedbackEntries = await Promise.all(
      blobs.map(async (blob) => {
        try {
          const res = await fetch(blob.url);
          const data = await res.json();
          return { ...data, _blobUrl: blob.url, _pathname: blob.pathname };
        } catch {
          return null;
        }
      })
    );

    const valid = feedbackEntries.filter(Boolean);

    // Add CORS headers so the Claude artifact can fetch this
    return NextResponse.json(valid, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  } catch (err) {
    console.error('Feedback list error:', err);
    return NextResponse.json({ error: 'Failed to retrieve feedback' }, { status: 500 });
  }
}

// OPTIONS - CORS preflight
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
