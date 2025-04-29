import { NextApiRequest, NextApiResponse } from 'next';
import { HOST, PORT, API_URL } from "@/lib/constants";

const LOGOUT_ENDPOINT = `${API_URL}/auth/logout`;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    try {
      // Clear token from server-side cookies if any
      const response = await fetch(`${LOGOUT_ENDPOINT}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${req.headers.authorization?.split(' ')[1]}`, // Get the token from the request headers
        },
      });

      // Even if the backend logout fails, we'll still clear client-side storage
      // and return a 200 to ensure the user is logged out on the frontend
      if (response.ok) {
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
