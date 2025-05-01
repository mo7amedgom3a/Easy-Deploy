import { NextApiRequest, NextApiResponse } from 'next';
import { serialize } from 'cookie';
import { API_URL } from "@/lib/constants";

// Using absolute URL to ensure it works from browser context
const LOGOUT_ENDPOINT = `${API_URL}/auth/logout`;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ message: `Method ${req.method} Not Allowed` });
  }

  // Get token from secure cookie
  const token = req.cookies.authToken;

  try {
    // Notify backend about logout if we have a token
    if (token) {
      try {
        await fetch(LOGOUT_ENDPOINT, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          signal: AbortSignal.timeout(5000) // 5 second timeout
        });
      } catch (error) {
        // Continue with local logout even if backend call fails
        console.error('Backend logout failed:', error);
      }
    }

    // Clear the cookie regardless of backend response
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV !== 'development',
      sameSite: 'strict' as const,
      maxAge: 0, // Expire immediately
      path: '/',
    };

    res.setHeader('Set-Cookie', serialize('authToken', '', cookieOptions));
    
    return res.status(200).json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout error:', error);
    
    // Still clear the cookie even if there was an error
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV !== 'development',
      sameSite: 'strict' as const,
      maxAge: 0,
      path: '/',
    };
    
    res.setHeader('Set-Cookie', serialize('authToken', '', cookieOptions));
    
    return res.status(200).json({ message: 'Logged out successfully' });
  }
}