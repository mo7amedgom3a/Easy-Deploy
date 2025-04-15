import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    try {
      const response = await fetch('http://localhost:8000/auth/logout', { // Replace with your backend URL
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${req.headers.authorization?.split(' ')[1]}`, // Get the token from the request headers
        },
      });

      if (response.ok) {
        res.status(200).json({ message: 'Logout successful' });
      } else {
        console.error('Backend logout failed:', response.status, response.statusText);
        res.status(500).json({ message: 'Logout failed' });
      }
    } catch (error) {
      console.error('Error during logout:', error);
      res.status(500).json({ message: 'Logout failed' });
    }
  } else {
    res.status(405).json({ message: 'Method Not Allowed' });
  }
}
