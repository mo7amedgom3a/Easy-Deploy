import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET() {
  try {
    // Get the token from cookies - properly awaiting cookies()
    const cookieStore = await cookies();
    const token = cookieStore.get('authToken')?.value;
    
    if (!token) {
      return NextResponse.json({ token: null });
    }

    // Return the token only for internal API calls
    return NextResponse.json({ token });
  } catch (error) {
    console.error('Token retrieval error:', error);
    return NextResponse.json({ token: null });
  }
}