import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET() {
  try {
    // Get the token from cookies
    const token = cookies().get('authToken')?.value;
    
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