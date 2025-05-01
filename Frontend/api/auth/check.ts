import { NextApiRequest, NextApiResponse } from 'next';
import { API_URL } from "@/lib/constants";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ message: `Method ${req.method} Not Allowed` });
  }

  // Get the token from cookies
  const token = req.cookies.authToken;
  
  if (!token) {
    return res.status(200).json({ isAuthenticated: false });
  }

  try {
    // Try to validate with backend by calling a user endpoint
    const response = await fetch(`${API_URL}/users/github/me/`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      signal: AbortSignal.timeout(3000) // 3 second timeout
    }).catch(() => null);

    if (response && response.ok) {
      return res.status(200).json({ isAuthenticated: true });
    }

    // If backend call fails, return not authenticated
    return res.status(200).json({ isAuthenticated: false });
  } catch (error) {
    console.error('Auth check error:', error);
    return res.status(200).json({ isAuthenticated: false });
  }
}