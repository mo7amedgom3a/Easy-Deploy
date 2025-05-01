import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { API_URL } from '@/lib/constants';

export async function POST() {
  const cookieStore = await cookies(); // Await the cookie store
  try {
    const token = cookieStore.get('authToken')?.value;

    // Notify backend about logout if we have a token
    if (token) {
      try {
        await fetch(`${API_URL}/auth/logout`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          cache: 'no-store',
        });
      } catch (error) {
        // Continue with local logout even if backend call fails
        console.error('Backend logout failed:', error);
      }
    }

    // Delete the cookie regardless of backend response
    cookieStore.delete('authToken'); // Use the store variable
    
    return NextResponse.json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout error:', error);
    
    // Still delete the cookie even if there was an error
    // Still delete the cookie even if there was an error
    // Fetching cookieStore again is not needed as it's declared outside the try block now.
    cookieStore.delete('authToken'); 
    
    // Return a generic success message even on error, as the cookie is cleared.
    // Consider returning an error status code if more specific error handling is needed.
    return NextResponse.json({ message: 'Logout processed, cookie cleared' });
  }
}
