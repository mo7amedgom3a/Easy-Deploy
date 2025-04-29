import { NextApiRequest, NextApiResponse } from 'next';
import { API_URL } from "@/lib/constants";

// Using absolute URL to ensure it works from browser context
const LOGOUT_ENDPOINT = `${API_URL}/auth/logout`;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    try {
      // Get token from authorization header
      const token = req.headers.authorization?.split(' ')[1];
      
      if (!token) {
        // If no token provided, still return success as we're logging out anyway
        console.log('No token provided during logout');
        return res.status(200).json({ message: 'Client logout successful' });
      }
      
      console.log('Attempting backend logout to:', LOGOUT_ENDPOINT);
      
      // Clear token from server-side cookies if any
      const response = await fetch(`${LOGOUT_ENDPOINT}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      // Even if the backend logout fails, we'll still clear client-side storage
      // and return a 200 to ensure the user is logged out on the frontend
      if (response.ok) {
        console.log('Backend logout successful');
        res.status(200).json({ message: 'Logout successful' });
      } else {
        console.error('Backend logout failed:', response.status, response.statusText);
        // Still return 200 to the client, as we want the client to proceed with logout
        res.status(200).json({ message: 'Client logout successful, but backend logout failed' });
      }
    } catch (error) {
      console.error('Error during logout:', error);
      // Still return 200 to ensure client proceeds with logout
      res.status(200).json({ message: 'Client logout successful, but backend communication failed' });
    }
  } else {
    res.status(405).json({ message: 'Method Not Allowed' });
  }
}
